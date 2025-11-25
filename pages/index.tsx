// pages/index.tsx
import React, { useState, useCallback } from 'react';
import Head from 'next/head';
import useSWR from 'swr';
import { MealEntry } from '../types';
import { useCurrentTime } from '../hooks/useCurrentTime';
import { MealForm } from '../components/MealForm';
import { AdminDashboard } from '../components/AdminDashboard';
import { LoginModal } from '../components/LoginModal';
import { UserCircleIcon, LogoutIcon } from '../components/icons';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// price per meal in paise (e.g. 5000 = ₹50)
/** --------------------------
 *  PRICES FOR VEG & NON-VEG
 * -------------------------- */
const VEG_PRICE_PAISE = 4500;     // ₹50
const NONVEG_PRICE_PAISE = 7000;  // ₹70

const Home: React.FC = () => {
  const { data: mealEntries = [], error, mutate } = useSWR<MealEntry[]>('/api/meals', fetcher);
  const currentTime = useCurrentTime();
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // low-level function that calls your /api/meals to actually store entries
  const postEntriesToServer = useCallback(async (newEntriesData: Omit<MealEntry, 'id'>[], paymentMeta?: any) => {
    try {
      const response = await fetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries: newEntriesData, payment: paymentMeta }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add entries');
      }

      await mutate(); // Re-fetch data
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message || String(err) };
    }
  }, [mutate]);

  /**
   * Full payment flow:
   * - create order on backend
   * - open Razorpay Checkout
   * - on checkout success, verify signature on backend
   * - if verified, post entries + payment metadata to /api/meals
   *
   * This function returns only after the entire flow finishes (or fails).
   */

  /** --------------------------------------------------------------
 *  FUNCTION TO CALCULATE PRICE BASED ON USER'S SELECTED TYPE
 * -------------------------------------------------------------- */
function calculateMealPrice(entry: Omit<MealEntry, 'id'>) {
  if (entry.mealType === "Veg") {
    return VEG_PRICE_PAISE;
  }
  if (entry.mealType === "Non_Veg") {
    return NONVEG_PRICE_PAISE;
  }
  return 0;
}

  const handleAddEntriesWithPayment = useCallback(
    async (newEntriesData: Omit<MealEntry, 'id'>[]) : Promise<{ success: boolean; message?: string }> => {
      if (!newEntriesData || newEntriesData.length === 0) {
        return { success: false, message: 'No entries provided.' };
      }

        const amountInPaise = newEntriesData.reduce((total, entry) => {
        return total + calculateMealPrice(entry);
      }, 0);

      if (isNaN(amountInPaise) || amountInPaise < 100) {
        return { success: false, message: 'Invalid amount. Must be at least ₹1.' };
      }

      // Create order on server
      try {
        const createRes = await fetch('/api/razorpay/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: amountInPaise,
            entriesCount: newEntriesData.length
          })
        });

        const createData = await createRes.json();
        if (!createRes.ok || !createData?.success) {
          const msg = createData?.message || 'Failed to create order';
          return { success: false, message: msg };
        }

        const { order, key } = createData;
        if (!order || !order.id) {
          return { success: false, message: 'Invalid order response from server.' };
        }

        // Ensure script loaded
        try {
          await loadRazorpayScriptOnce();
        } catch (err: any) {
          return { success: false, message: 'Failed to load Razorpay SDK: ' + (err.message || String(err)) };
        }

        // Wrap checkout flow in a promise so we can await verification + server write
        const paymentFlowResult = await new Promise<{ success: boolean; message?: string }>(async (resolve) => {
          const options: any = {
            key: key, // from server
            amount: order.amount,
            currency: order.currency || 'INR',
            name: "Meal Planner AI",
            description: `Meal bookings (${newEntriesData.length})`,
            order_id: order.id,
            handler: async function (response: any) {
              try {
                // response includes razorpay_payment_id, razorpay_order_id, razorpay_signature
                if (!response || !response.razorpay_payment_id) {
                  resolve({ success: false, message: 'Payment response missing payment id.' });
                  return;
                }

                const paymentMeta = {
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                  amount: order.amount,
                  currency: order.currency
                };

                // 1) Verify signature on backend
                const verifyRes = await fetch('/api/razorpay/verify', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(paymentMeta)
                });

                const verifyData = await verifyRes.json();
                if (!verifyRes.ok || !verifyData?.success) {
                  const msg = verifyData?.message || 'Payment verification failed';
                  resolve({ success: false, message: msg });
                  return;
                }

                // 2) Persist entries with payment metadata
                const storeResult = await postEntriesToServer(newEntriesData, paymentMeta);
                if (!storeResult.success) {
                  resolve({ success: false, message: storeResult.message || 'Failed to save entries after payment.' });
                  return;
                }

                // All done
                resolve({ success: true });
              } catch (err: any) {
                console.error('Error in payment handler:', err);
                resolve({ success: false, message: err?.message || String(err) });
              }
            },
            modal: {
              ondismiss: function () {
                // User closed checkout - treat as cancellation
                resolve({ success: false, message: 'Payment cancelled by user.' });
              }
            },
            // optional: prefill etc
            prefill: {},
            notes: { entriesCount: newEntriesData.length },
          };

          // open checkout
          try {
            const rzp = new (window as any).Razorpay(options);
            rzp.on('payment.failed', function (response: any) {
              console.error('razorpay payment.failed', response);
              // If payment failed, resolve with failure
              resolve({ success: false, message: 'Payment failed.' });
            });
            rzp.open();
          } catch (err: any) {
            console.error('Failed to open Razorpay checkout:', err);
            resolve({ success: false, message: 'Failed to open payment widget.' });
          }
        });

        return paymentFlowResult;
      } catch (err: any) {
        console.error('handleAddEntriesWithPayment error', err);
        return { success: false, message: err?.message || String(err) };
      }
    },
    [postEntriesToServer]
  );

  // helper wrappers and other handlers
  const handleAddSingleEntry = useCallback(async (entryData: Omit<MealEntry, 'id'>) => {
    return handleAddEntriesWithPayment([entryData]);
  }, [handleAddEntriesWithPayment]);

  const handleCancelEntry = useCallback(async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this meal entry?')) return;
    try {
      const optimisticData = mealEntries.filter(entry => entry.id !== id);
      mutate(optimisticData, false);

      const response = await fetch(`/api/meals/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('Failed to cancel entry. Reverting.');
      }
      mutate();
    } catch (err: any) {
      console.error(err);
      mutate();
      alert(err?.message || 'Failed to cancel entry');
    }
  }, [mealEntries, mutate]);

  const existingEntryForDate = useCallback((date: string, employeeId: string) => {
    if (!mealEntries) return false;
    return mealEntries.some(entry => entry.date === date && entry.employeeId === employeeId);
  }, [mealEntries]);

  const handleLoginAttempt = (user: string, pass: string) => {
    if (user === 'admin' && pass === 'admin') {
      setIsAdmin(true);
      setShowLoginModal(false);
      return true;
    }
    return false;
  };

  const handleLogout = () => setIsAdmin(false);

  if (error) return <div className="text-center text-red-500">Failed to load meal entries. Please try again later.</div>;

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Head>
        <title>Meal Planner AI Agent</title>
        <meta name="description" content="An AI-powered agent to manage daily meal requests for employees." />
        <link rel="icon" href="https://www.c5i.ai/wp-content/uploads/Asset-1@2x.png" />
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
      </Head>

      {showLoginModal && <LoginModal onLoginAttempt={handleLoginAttempt} onClose={() => setShowLoginModal(false)} />}

      <header className="bg-white shadow-sm sticky top-0 z-10">
        <nav className="container px-2 w-full h-full mx-auto">
          <div className="flex justify-between items-center py-2">
            <div className="flex items-center gap-2">
              <img src="/c5ilogo.png" alt="MealPlanner Logo" className="h-18 w-32 object-contain" />
            </div>
            <div className="flex items-center gap-2">
              <img src="/AE_C5i_Logo.png" alt="MealPlanner Logo" className="h-20 w-32 object-contain" />
            </div>
          </div>
        </nav>
      </header>

      <div className="px-4 pt-2">
        <span className="flex items-end justify-end">
          {isAdmin ? (
            <button onClick={handleLogout} className="flex items-center gap-2 bg-red-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-red-600 transition-colors duration-200">
              <LogoutIcon />
              Logout
            </button>
          ) : (
            <button onClick={() => setShowLoginModal(true)} className="flex items-center gap-2 bg-white text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-gray-100 transition-colors duration-200 border">
              <UserCircleIcon />
              Admin Login
            </button>
          )}
        </span>
      </div>

      <main className="container mx-auto px-4">
        <header className="text-center mb-2">
          <h1 className="text-4xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-500">
            Meal Planner AI Agent
          </h1>
          <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
            {isAdmin ? 'Welcome, Administrator. Manage all meal entries below.' : 'Your intelligent assistant for seamless daily meal management. Bookings close at 9 AM daily.'}
          </p>
        </header>

        {isAdmin ? (
          <AdminDashboard
            entries={mealEntries}
            onAddSingleEntry={handleAddSingleEntry}
            existingEntryForDate={existingEntryForDate}
            onCancelEntry={handleCancelEntry}
            currentTime={currentTime}
          />
        ) : (
          <MealForm
            onAddEntries={handleAddEntriesWithPayment}
            existingEntryForDate={existingEntryForDate}
            currentTime={currentTime}
          />
        )}
      </main>

      <footer className="text-center py-6 text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} Meal Planner AI. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;

/** Utility: load razorpay script once  */
async function loadRazorpayScriptOnce(): Promise<void> {
  if (typeof window === 'undefined') return;
  if ((window as any).Razorpay) return;
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
    document.body.appendChild(script);
  });
}
