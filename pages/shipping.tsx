import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { FoodDomeIcon } from '../components/icons';

export default function Shipping() {
  return (
    <div className="bg-gray-50 min-h-screen font-sans flex flex-col">
      <Head>
        <title>Shipping Policy - Meal Planner AI</title>
      </Head>
      
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <nav className="container mx-auto px-4">
            <div className="flex justify-between items-center py-3">
                <Link href="/" className="flex items-center gap-2">
                    <FoodDomeIcon className="h-8 w-8 text-indigo-600" />
                    <span className="font-bold text-xl text-gray-800 tracking-tight">MealPlanner</span>
                </Link>
                <Link href="/" className="text-indigo-600 hover:text-indigo-800 font-medium">Back to Home</Link>
            </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Shipping Policy</h1>
        
        <div className="bg-white p-8 rounded-2xl shadow-sm space-y-6 text-gray-700">
            <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">Digital Fulfillment</h2>
                <p>The Meal Planner AI Agent is a digital booking platform. No physical products are shipped to your address.</p>
            </section>

            <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">Meal Availability</h2>
                <p>Meals booked through this system are to be collected physically at the designated office cafeteria locations. Please refer to your booking confirmation for specific floor or building details.</p>
            </section>

            <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">Timings</h2>
                <p>Meals are available for pickup during standard lunch hours (12:30 PM - 2:30 PM). Please ensure you redeem your QR code within this window.</p>
            </section>
        </div>
      </main>
    </div>
  );
}