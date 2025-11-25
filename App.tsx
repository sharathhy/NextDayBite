import React, { useState, useEffect, useCallback } from 'react';
import { MealEntry } from './types';
import { useCurrentTime } from './hooks/useCurrentTime';
import { MealForm } from './components/MealForm';
import { DataTable } from './components/DataTable';
import { LoginModal } from './components/LoginModal';
import { AdminDashboard } from './components/AdminDashboard';
import { UserCircleIcon, LogoutIcon, FoodDomeIcon } from './components/icons';
import Aelogo from '../AE_C5i_Logo.png'
import c5ilogo from '../c5i-logo.png'
import Image from 'next/image';


const App: React.FC = () => {
  const [mealEntries, setMealEntries] = useState<MealEntry[]>([]);
  const currentTime = useCurrentTime();
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    try {
      const storedEntries = localStorage.getItem('mealEntries');
      if (storedEntries) {
        setMealEntries(JSON.parse(storedEntries));
      }
    } catch (error) {
      console.error("Failed to parse meal entries from localStorage", error);
      setMealEntries([]);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('mealEntries', JSON.stringify(mealEntries));
    } catch (error) {
      console.error("Failed to save meal entries to localStorage", error);
    }
  }, [mealEntries]);

  // const handleAddEntries = useCallback((newEntriesData: Omit<MealEntry, 'id'>[]) => {
  //   const newEntries: MealEntry[] = newEntriesData.map(entryData => ({
  //     ...entryData,
  //     id: `${entryData.date}-${entryData.employeeId}-${Date.now()}-${Math.random()}`,
  //   }));
    
  //   setMealEntries(prevEntries => 
  //       [...prevEntries, ...newEntries].sort((a, b) => 
  //           a.date.localeCompare(b.date) || a.employeeName.localeCompare(b.employeeName)
  //       )
  //   );
  // }, []);

  const handleAddEntries = useCallback(
  async (newEntriesData: Omit<MealEntry, 'id'>[]) => {
    const newEntries: MealEntry[] = newEntriesData.map(entryData => ({
      ...entryData,
      id: `${entryData.date}-${entryData.employeeId}-${Date.now()}-${Math.random()}`,
    }));

    setMealEntries(prevEntries =>
      [...prevEntries, ...newEntries].sort(
        (a, b) =>
          a.date.localeCompare(b.date) ||
          a.employeeName.localeCompare(b.employeeName)
      )
    );

    return { success: true };
  },
  []
);

  
  // const handleAddSingleEntry = useCallback((entryData: Omit<MealEntry, 'id'>) => {
  //   const newEntry: MealEntry = {
  //     ...entryData,
  //     id: `${entryData.date}-${entryData.employeeId}-${Date.now()}-${Math.random()}`,
  //   };
  //   setMealEntries(prevEntries => 
  //       [...prevEntries, newEntry].sort((a, b) => 
  //           a.date.localeCompare(b.date) || a.employeeName.localeCompare(b.employeeName)
  //       )
  //   );
  // }, []);

  const handleAddSingleEntry = useCallback(
  async (entryData: Omit<MealEntry, 'id'>) => {
    const newEntry: MealEntry = {
      ...entryData,
      id: `${entryData.date}-${entryData.employeeId}-${Date.now()}-${Math.random()}`,
    };

    setMealEntries(prevEntries =>
      [...prevEntries, newEntry].sort(
        (a, b) =>
          a.date.localeCompare(b.date) ||
          a.employeeName.localeCompare(b.employeeName)
      )
    );

    return { success: true };
  },
  []
);


  const handleCancelEntry = useCallback((id: string) => {
    if (window.confirm("Are you sure you want to cancel this meal entry?")) {
        setMealEntries(prevEntries => prevEntries.filter(entry => entry.id !== id));
    }
  }, []);
  
  const existingEntryForDate = useCallback((date: string, employeeId: string): boolean => {
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

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
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

      <main className="container mx-auto px-4 py-6 md:py-8">
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
             />
        ) : (
            <MealForm 
                onAddEntries={handleAddEntries} 
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

export default App;