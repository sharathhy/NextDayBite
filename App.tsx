
import React, { useState, useEffect, useCallback } from 'react';
import { MealEntry } from './types';
import { useCurrentTime } from './hooks/useCurrentTime';
import { MealForm } from './components/MealForm';
import { DataTable } from './components/DataTable';
import { LoginModal } from './components/LoginModal';
import { AdminDashboard } from './components/AdminDashboard';
import { UserCircleIcon, LogoutIcon, FoodDomeIcon } from './components/icons';
import Image from 'next/image';
import Aelogo from '../AE_C5i_Logo.png'
import c5ilogo from '../c5i-logo.png'

const App: React.FC = () => {
  const [mealEntries, setMealEntries] = useState<MealEntry[]>([]);
  const [userPoints, setUserPoints] = useState<Record<string, number>>({});
  const currentTime = useCurrentTime();
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    try {
      const storedEntries = localStorage.getItem('mealEntries');
      if (storedEntries) {
        setMealEntries(JSON.parse(storedEntries));
      }
      const storedPoints = localStorage.getItem('userPoints');
      if (storedPoints) {
        setUserPoints(JSON.parse(storedPoints));
      }
    } catch (error) {
      console.error("Failed to parse local storage data", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('mealEntries', JSON.stringify(mealEntries));
      localStorage.setItem('userPoints', JSON.stringify(userPoints));
    } catch (error) {
      console.error("Failed to save to local storage", error);
    }
  }, [mealEntries, userPoints]);

  const handleAddEntries = useCallback(async (newEntriesData: Omit<MealEntry, 'id'>[], redeemPoints: number = 0) => {
    const employeeId = newEntriesData[0]?.employeeId;
    
    // Validate points if redeeming (Client side simulation)
    if (redeemPoints > 0 && employeeId) {
        const currentPoints = userPoints[employeeId] || 0;
        if (currentPoints < redeemPoints) {
            return { success: false, message: `Insufficient points. You have ${currentPoints}.` };
        }
        // Deduct points
        setUserPoints(prev => ({ ...prev, [employeeId]: prev[employeeId] - redeemPoints }));
    }

    const newEntries: MealEntry[] = newEntriesData.map((entryData, index) => ({
      ...entryData,
      id: `${entryData.date}-${entryData.employeeId}-${Date.now()}-${Math.random()}`,
      paymentMethod: index < redeemPoints ? 'Points' : 'Standard'
    }));
    
    setMealEntries(prevEntries => 
        [...prevEntries, ...newEntries].sort((a, b) => 
            a.date.localeCompare(b.date) || a.employeeName.localeCompare(b.employeeName)
        )
    );
    return { success: true, message: 'Entries added successfully' };
  }, [userPoints]);
  
  const handleAddSingleEntry = useCallback(async (entryData: Omit<MealEntry, 'id'>) => {
    const newEntry: MealEntry = {
      ...entryData,
      id: `${entryData.date}-${entryData.employeeId}-${Date.now()}-${Math.random()}`,
      paymentMethod: 'Standard'
    };
    setMealEntries(prevEntries => 
        [...prevEntries, newEntry].sort((a, b) => 
            a.date.localeCompare(b.date) || a.employeeName.localeCompare(b.employeeName)
        )
    );
    return { success: true, message: 'Entry added successfully' };
  }, []);

  const handleCancelEntry = useCallback(async (id: string) => {
    // 1. Use a functional update to find and remove the entry atomically.
    let employeeIdToReward: string | null = null;

    setMealEntries(prevEntries => {
        const entry = prevEntries.find(e => e.id === id);
        if (entry) {
            employeeIdToReward = entry.employeeId;
            return prevEntries.filter(e => e.id !== id);
        }
        return prevEntries;
    });

    // 2. If we found and removed an entry, add points
    if (employeeIdToReward) {
        setUserPoints(prev => ({
            ...prev,
            [employeeIdToReward!]: (prev[employeeIdToReward!] || 0) + 1
        }));
    }

    // 3. ALWAYS return true for idempotency
    return true;
  }, []);

  const handleRedeemEntry = useCallback(async (id: string): Promise<{ success: boolean; message: string; entry?: MealEntry }> => {
      let foundEntry: MealEntry | null = null;
      let alreadyRedeemed = false;
      
      setMealEntries(prev => prev.map(e => {
          if (e.id === id) {
              if (e.isRedeemed) {
                  alreadyRedeemed = true;
                  foundEntry = e;
                  return e;
              }
              foundEntry = { ...e, isRedeemed: true };
              return foundEntry;
          }
          return e;
      }));

      if (alreadyRedeemed) {
          return { success: false, message: 'This QR Code has already been used.', entry: foundEntry! };
      }

      if (foundEntry) {
          return { success: true, message: 'Meal redeemed successfully!', entry: foundEntry };
      }
      
      return { success: false, message: 'Invalid QR Code: Entry not found.' };
  }, []);
  
  const existingEntryForDate = useCallback((date: string, employeeId: string): boolean => {
    return mealEntries.some(entry => entry.date === date && entry.employeeId === employeeId);
  }, [mealEntries]);

  const handleRefresh = useCallback((id?: string) => {
     if (id) {
         setMealEntries(prev => prev.map(entry => 
             entry.id === id ? { ...entry, isRedeemed: true } : entry
         ));
     }
  }, []);

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

  return (
    <div className="bg-gray-50 min-h-screen font-sans flex flex-col">
      {showLoginModal && <LoginModal onLoginAttempt={handleLoginAttempt} onClose={() => setShowLoginModal(false)} />}
      
       <header className="bg-white shadow-sm sticky top-0 z-10">
        <nav className="container mx-auto px-4">
            <div className="flex justify-between items-center py-3">
                <div className="flex items-center gap-2">
                 
                <Image src={c5ilogo} alt="C5i Logo" width={40} height={40} />
                </div>
                <div className="flex items-center">
                    {/* <FoodDomeIcon className="h-8 w-8 text-indigo-600" /> */}
                </div>
            </div>
        </nav>
      </header>
      

      <div className="container mx-auto px-4 pt-4">
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
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-500">
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

      <footer className="bg-black text-white py-12 mt-12">
        <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Contact Section */}
                <div>
                    <h3 className="text-lg font-bold mb-4 uppercase tracking-wider text-gray-200">Support</h3>
                    <ul className="space-y-3 text-sm text-gray-400">
                        <li><a href="/feedback" className="hover:text-white transition-colors duration-200">Feedback</a></li>
                        <li><a href="/contact" className="hover:text-white transition-colors duration-200">Contact Us</a></li>
                    </ul>
                </div>

                {/* Policies Section */}
                <div>
                    <h3 className="text-lg font-bold mb-4 uppercase tracking-wider text-gray-200">Policies</h3>
                    <ul className="space-y-3 text-sm text-gray-400">
                        <li><a href="/terms" className="hover:text-white transition-colors duration-200">Terms and Conditions</a></li>
                        <li><a href="/privacy" className="hover:text-white transition-colors duration-200">Privacy Policy</a></li>
                        <li><a href="/shipping" className="hover:text-white transition-colors duration-200">Shipping Policy</a></li>
                        <li><a href="/cancellation" className="hover:text-white transition-colors duration-200">Cancellation and Refunds</a></li>
                    </ul>
                </div>

                {/* Brand / Copyright Section */}
                <div className="flex flex-col justify-start md:items-end">
                     <div className="flex items-center gap-2 mb-4">
                        <FoodDomeIcon className="h-6 w-6 text-gray-200" />
                        <span className="font-bold text-lg text-white">MealPlanner</span>
                    </div>
                    <p className="text-sm text-gray-500 text-left md:text-right">
                        &copy; {new Date().getFullYear()} Meal Planner AI.<br/>All rights reserved.
                    </p>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
