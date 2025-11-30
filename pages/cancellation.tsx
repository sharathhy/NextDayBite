import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { FoodDomeIcon } from '../components/icons';

export default function Cancellation() {
  return (
    <div className="bg-gray-50 min-h-screen font-sans flex flex-col" style={{
  backgroundImage: "url('/office.jpg')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
}}>
      <Head>
        <title>Cancellation & Refunds - Meal Planner AI</title>
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
    Cancellation and Refunds
  </span>
</h1>
        
        <div className="bg-white p-8 rounded-2xl shadow-sm space-y-6 text-gray-700">
            <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">Cancellation Policy</h2>
                <p>We understand plans change. You can cancel your meal booking through the "My Bookings" tab on the homepage.</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li><strong>Deadline:</strong> Cancellations must be made one day before redemption.</li>
                    <li><strong>Late Cancellations:</strong> While discouraged to prevent food waste, late cancellations are not currently permitted to allow for accurate tracking.</li>
                </ul>
            </section>

            <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">Reward Points & Refunds</h2>
                <p>This service operates on a corporate subsidy model; therefore, no monetary refunds are processed.</p>
                <p className="mt-2">However, to encourage responsible booking:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li><strong>Points:</strong> For every meal you successfully cancel, you earn <strong>45 Reward Points for Veg Meal and 70 Reward Points for Non Veg Meal </strong>.</li>
                    <li><strong>Redemption:</strong> Reward points can be used to "pay" for future meal bookings.</li>
                </ul>
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