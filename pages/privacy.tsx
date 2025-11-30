import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { FoodDomeIcon } from '../components/icons';

export default function Privacy() {
  return (
    <div className="bg-gray-50 min-h-screen font-sans flex flex-col">
      <Head>
        <title>Privacy Policy - Meal Planner AI</title>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
        
        <div className="bg-white p-8 rounded-2xl shadow-sm space-y-6 text-gray-700">
            <p className="text-sm text-gray-500">Last Updated: {new Date().toLocaleDateString()}</p>
            
            <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">1. Information We Collect</h2>
                <p>We collect information necessary to facilitate meal planning, including:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Employee ID and Name</li>
                    <li>Department/Vertical information</li>
                    <li>Meal preferences (Veg/Non-Veg)</li>
                    <li>Booking dates and times</li>
                </ul>
            </section>

            <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">2. How We Use Your Information</h2>
                <p>Your data is used exclusively for:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Estimating daily food production requirements to reduce waste.</li>
                    <li>Verifying meal redemption at the cafeteria.</li>
                    <li>Allocating reward points for cancellations.</li>
                </ul>
            </section>

            <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">3. Data Security</h2>
                <p>We implement appropriate technical measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.</p>
            </section>

            <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">4. Contact Us</h2>
                <p>If you have any questions about this Privacy Policy, please contact the HR or IT department.</p>
            </section>
        </div>
      </main>
    </div>
  );
}