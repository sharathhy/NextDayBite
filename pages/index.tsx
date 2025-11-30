
import React, { useState, useCallback } from 'react';
import Head from 'next/head';
import useSWR from 'swr';
import { MealEntry } from '../types';
import { useCurrentTime } from '../hooks/useCurrentTime';
import { MealForm } from '../components/MealForm';
import { AdminDashboard } from '../components/AdminDashboard';
import { LoginModal } from '../components/LoginModal';
import { UserCircleIcon, LogoutIcon, FoodDomeIcon } from '../components/icons';
import bg from '../public/office.jpg'

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const Home: React.FC = () => {
  const { data: mealEntries = [], error, mutate } = useSWR<MealEntry[]>('/api/meals', fetcher);
  const currentTime = useCurrentTime();
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleRefresh = useCallback(async (id?: string) => {
    if (id) {
        // Optimistic update: Update the local cache immediately so UI turns green instantly
        // We use a robust functional update to ensure we don't lose data
        await mutate(
            (currentEntries) => {
                if (!currentEntries) return [];
                // Return a new array reference with the specific entry updated
                return currentEntries.map(entry => 
                    // Use equality check matching strings
                    entry.id === id ? { ...entry, isRedeemed: true } : entry
                );
            },
            { revalidate: false } // Update local cache without re-fetching immediately
        );
    }
    // Trigger actual server re-fetch to ensure data consistency
    mutate();
  }, [mutate]);

  const handleAddEntries = useCallback(async (newEntriesData: Omit<MealEntry, 'id'>[], redeemPoints: number = 0): Promise<{ success: boolean, message?: string }> => {
    try {
      const response = await fetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            entries: newEntriesData,
            redeemPoints: redeemPoints
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add entries');
      }

      await mutate(); // Re-fetch data
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  }, [mutate]);

  const handleAddSingleEntry = useCallback(async (entryData: Omit<MealEntry, 'id'>): Promise<{ success: boolean, message?: string }> => {
    return handleAddEntries([entryData]);
  }, [handleAddEntries]);

  const handleCancelEntry = useCallback(async (id: string): Promise<boolean> => {
      try {
        const response = await fetch(`/api/meals/${encodeURIComponent(id)}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to cancel entry.');
        }
        
        // Success: Re-fetch data from server to update the UI
        await mutate();
        return true;
      } catch (err: any) {
        console.error("Cancel Error:", err.message);
        alert(err.message || "Failed to cancel entry");
        return false;
      }
  }, [mutate]);

  const handleRedeemEntry = useCallback(async (id: string): Promise<{ success: boolean; message: string; entry?: MealEntry }> => {
      try {
        const res = await fetch('/api/meals/redeem', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        const data = await res.json();
        return data;
      } catch (e) {
          return { success: false, message: 'Network connection failed.' };
      }
  }, []);

  const existingEntryForDate = useCallback((date: string, employeeId: string): boolean => {
    if (!mealEntries) return false;
    return mealEntries.some(entry => entry.date === date && entry.employeeId === employeeId);
  }, [mealEntries]);

  const handleLoginAttempt = (user: string, pass: string): boolean => {
    if (user === 'admin' && pass === 'admin') {
      setIsAdmin(true);
      setShowLoginModal(false);
      return true;
    }
    return false;
  };
  
  const handleLogout = () => {
    setIsAdmin(false);
  };

  if (error) return <div className="text-center text-red-500">Failed to load meal entries. Please try again later.</div>

  return (
    <div className="bg-gray-50 min-h-screen font-sans flex flex-col" style={{
  backgroundImage: "url('/office.jpg')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
}}
>
      <Head>
        <title>Meal Planner AI Agent</title>
        <meta name="description" content="An AI-powered agent to manage daily meal requests for employees." />
       <link rel="icon" href="https://www.c5i.ai/wp-content/uploads/Asset-1@2x.png" />
      </Head>

      {showLoginModal && <LoginModal onLoginAttempt={handleLoginAttempt} onClose={() => setShowLoginModal(false)} />}
      
    <header className="bg-white shadow-sm sticky top-0 z-10 border-b-black">
        <nav className="container px-2 w-full h-full mx-auto">
          <div className="flex justify-between items-center py-2">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="MealPlanner Logo" className="h-18 w-32 object-contain" />
            </div>
          <div className="flex items-center gap-3">
  <img
    src="/nxtdaybite2.png"
    alt="Next Day Bite Logo"
    className="h-12 w-10 object-contain"
  />

  <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-[linear-gradient(to_right,#6939a8_0%,#6939a8_45%,#397bad_50%,#397bad_100%)]">
    Next Day Bite
  </h1>
</div>


            <div className="flex items-center gap-2">
              <img src="/AE_C5i_Logo.png" alt="MealPlanner Logo" className="h-20 w-32 object-contain" />
            </div>
          </div>
        </nav>
      </header>

      <div className="container mx-auto px-4 pt-4"  >
        <div className="flex justify-end">
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
        </div>
      </div>

      <main className="container mx-auto px-4 py-6 md:py-8 flex-grow">
        {/* <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-500">
            Meal Planner AI Agent
          </h1>
          <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
             {isAdmin ? 'Welcome, Administrator. Manage all meal entries below.' : 'Your intelligent assistant for seamless daily meal management.'}
          </p>
        </header> */}

        {isAdmin ? (
            <AdminDashboard 
                entries={mealEntries}
                onAddSingleEntry={handleAddSingleEntry}
                existingEntryForDate={existingEntryForDate}
                onCancelEntry={handleCancelEntry}
                currentTime={currentTime}
                onRefresh={handleRefresh}
                onRedeemEntry={handleRedeemEntry}
             />
        ) : (
            <MealForm 
                onAddEntries={handleAddEntries} 
                existingEntryForDate={existingEntryForDate}
                currentTime={currentTime}
                entries={mealEntries}
                onCancelEntry={handleCancelEntry}
            />
        )}
      </main>

     <footer className="bg-slate-800 text-white py-2 mt-2">
  <div className="container mx-auto px-4">

    {/* Row 1 — Support & Policies */}
    <div className="flex flex-col md:flex-row justify-between gap-8 text-left">
      {/* Support Section */}
      <div>
        <h3 className="text-lg font-bold mb-4 uppercase tracking-wider text-gray-200">Support</h3>
        <ul className="space-y-3 text-sm text-gray-400">
          <li><a href="/feedback" className="hover:text-white">Feedback</a></li>
          <li><a href="/contact" className="hover:text-white">Contact Us</a></li>
        </ul>
      </div>

      {/* Policies Section */}
      <div>
        <h3 className="text-lg font-bold mb-4 uppercase tracking-wider text-gray-200">Policies</h3>
        <ul className="space-y-3 text-sm text-gray-400">
          <li><a href="/terms" className="hover:text-white">Terms and Conditions</a></li>
          <li><a href="/cancellation" className="hover:text-white">Cancellation and Refunds</a></li>
        </ul>
      </div>
    </div>

    {/* Row 2 — Centered Brand Section */}
    <div className="flex flex-col items-center  text-center">
      {/* <div className="flex items-center gap-2 mb-3">
        <FoodDomeIcon className="h-6 w-6 text-gray-200" />
        <span className="font-bold text-lg text-white">MealPlanner</span>
      </div> */}
      <p className="text-sm text-gray-500 mt-2">
        &copy; {new Date().getFullYear()} Next Day Bite by c5i  All rights reserved.
      </p>
    </div>

  </div>
</footer>

    </div>
  );
};

export default Home;
