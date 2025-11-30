import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { FoodDomeIcon } from '../components/icons';

export default function Terms() {
  return (
    <div className="bg-gray-50 min-h-screen font-sans flex flex-col" style={{
  backgroundImage: "url('/office.jpg')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
}}>
      <Head>
        <title>Terms and Conditions - Meal Planner AI</title>
                <link rel="icon" href="https://www.c5i.ai/wp-content/uploads/Asset-1@2x.png" />
      </Head>
      
       <header className="bg-white shadow-sm sticky top-0 z-10 border-b-black">
          <nav className="container px-2 w-full h-full mx-auto">
            <div className="flex justify-between items-center py-2">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="MealPlanner Logo" className="h-18 w-32 object-contain" />
              </div>

              <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-[linear-gradient(to_right,#6939a8_0%,#6939a8_45%,#397bad_50%,#397bad_100%)]">
                Next Day Bite
              </h1>

              <div className="flex items-center gap-2">
                <img src="/AE_C5i_Logo.png" alt="MealPlanner Logo" className="h-20 w-32 object-contain" />
              </div>
            </div>
          </nav>
        </header>

 {/* BACK BUTTON */}
      <div className="container mx-auto px-4 pt-4">
        <div className="flex justify-end">
          <Link href="/" className="flex items-center gap-2 bg-white text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-gray-100 transition-colors duration-200 border">
            Back to Home
          </Link>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
  <h1 className="text-3xl font-bold text-black text-center mb-6">
  <span className="bg-white px-3 py-2 rounded-md inline-block">
    Terms and Conditions
  </span>
</h1>

        
        <div className="bg-white p-8 rounded-2xl shadow-sm space-y-6 text-gray-700">
            <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">1. Introduction</h2>
                <p>Welcome to Next Day Bite meal website. By accessing this internal meal booking system, you agree to comply with and be bound by the following terms and conditions of use.</p>
            </section>

            <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">2. Use of Service</h2>
                <p>This service is intended solely for active employees. You agree to use this application only for booking your own meals or meals for your team if authorized. Misuse of the booking system or redeeming meals not allocated to you may result in disciplinary action.</p>
            </section>

            <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">3. Booking Rules</h2>
                <ul className="list-disc pl-5 space-y-2">
                    <li>Meals must be booked before the daily cutoff time (9:00 AM IST).</li>
                    <li>Meals can only be canceled one day before.</li>
                    <li>Meals can't be canceled on the meal day and no reward points would be credited for that.</li>
                    <li>Duplicate bookings for the same day are not permitted.</li>
                    <li>QR codes generated are for single-use only.</li>
                  
                </ul>
            </section>

            <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">4. Intellectual Property</h2>
                <p>The design, layout, and code of this application are the property of the company. Unauthorized reproduction is prohibited.</p>
            </section>

            <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">5. Changes to Terms</h2>
                <p>We reserve the right to modify these terms at any time. Continued use of the application signifies your acceptance of any adjustments to these terms.</p>
            </section>
        </div>
      </main>

       {/* FOOTER (Now stays at bottom) */}
        <footer className="bg-slate-800 text-white py-2 mt-auto">
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
            <div className="flex flex-col items-center text-center">
              <p className="text-sm text-gray-500 mt-2">
                &copy; {new Date().getFullYear()} Next Day Bite by C5i — All rights reserved.
              </p>
            </div>
          </div>
        </footer>
    </div>
  );
}