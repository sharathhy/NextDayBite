import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { FoodDomeIcon } from '../components/icons';

export default function Contact() {
  return (
    <>
      <div className="bg-gray-50 min-h-screen font-sans flex flex-col" style={{
  backgroundImage: "url('/office.jpg')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
}}>
        <Head>
          <title>Contact Us - NextDayBite</title>
            <link rel="icon" href="https://www.c5i.ai/wp-content/uploads/Asset-1@2x.png" />
        </Head>

        {/* HEADER */}
       <header className="bg-white shadow-sm sticky top-0 z-10 border-b-black">
  <nav className="container px-2 w-full h-full mx-auto">
    <div className="flex flex-wrap items-center py-2">

      {/* Left Logo */}
      <div className="flex flex-1 justify-center md:justify-start items-center">
        <img
          src="/logo.png"
          alt="MealPlanner Logo"
          className="h-12 sm:h-16 md:h-18 w-24 sm:w-28 md:w-32 object-contain"
        />
      </div>

      {/* Middle Logo + Title */}
      <div className="flex flex-1 flex-col md:flex-row justify-center items-center gap-1 sm:gap-2 text-center">
        <img
          src="/nxtdaybite2.png"
          alt="Next Day Bite Logo"
          className="h-8 sm:h-10 md:h-12 w-8 sm:w-10 md:w-10 object-contain"
        />
        <h1 className="text-xl sm:text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-[linear-gradient(to_right,#6939a8_0%,#6939a8_45%,#397bad_50%,#397bad_100%)]">
          Next Day Bite
        </h1>
      </div>

      {/* Right Logo */}
      <div className="flex flex-1 justify-center md:justify-end items-center">
        <img
          src="/AE_C5i_Logo.png"
          alt="MealPlanner Logo"
          className="h-12 sm:h-16 md:h-20 w-24 sm:w-28 md:w-32 object-contain"
        />
      </div>

    </div>
  </nav>
</header>


        {/* BACK BUTTON */}
        <div className="container mx-auto px-4 pt-4">
          <div className="flex justify-end">
            <Link
              href="/"
              className="flex items-center gap-2 bg-white text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-gray-100 transition-colors duration-200 border"
            >
              Back to Home
            </Link>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <main className="container mx-auto px-4 py-8 max-w-4xl">
           <h1 className="text-3xl font-bold text-black text-center mb-6">
  <span className="bg-white px-3 py-2 rounded-md inline-block">
    Contact Us
  </span>
</h1>

          <div className="bg-white p-8 rounded-2xl shadow-sm text-gray-700">
            <p className="mb-6">
              Have questions or facing issues with the Meal Planner application? Reach out to us.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
                <h3 className="font-bold text-indigo-900 text-lg mb-2">Admin Support</h3>
                <p className="text-sm text-indigo-700 mb-4">
                  For issues regarding points, bookings, or system errors.
                </p>
                <a href="mailto:admin@company.com" className="text-indigo-600 font-semibold hover:underline">
                  admin@company.com
                </a>
              </div>

              <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
                <h3 className="font-bold text-purple-900 text-lg mb-2">Cafeteria Manager</h3>
                <p className="text-sm text-purple-700 mb-4">
                  For food quality feedback or dietary concerns.
                </p>
                <a href="mailto:cafeteria@company.com" className="text-purple-600 font-semibold hover:underline">
                  cafeteria@company.com
                </a>
              </div>
            </div>
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
    </>
  );
}
