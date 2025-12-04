import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Feedback() {
  const [submitted, setSubmitted] = useState(false);
  const [category, setCategory] = useState('Food Quality');
  const [rating, setRating] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emojiOptions = [
    { value: 1, emoji: "😡", label: "Very Bad" },
    { value: 2, emoji: "😕", label: "Bad" },
    { value: 3, emoji: "😐", label: "Okay" },
    { value: 4, emoji: "😊", label: "Good" },
    { value: 5, emoji: "🤩", label: "Excellent" }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
        const res = await fetch('/api/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                category,
                rating,
                message
            })
        });

        if (res.ok) {
            setSubmitted(true);
        } else {
            alert("Something went wrong. Please try again.");
        }
    } catch (error) {
        console.error("Error submitting feedback:", error);
        alert("Failed to submit feedback.");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans flex flex-col" style={{
  backgroundImage: "url('/office.jpg')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
}}>
      <Head>
        <title>Feedback - NextDayBite</title>
          <link rel="icon" href="https://www.c5i.ai/wp-content/uploads/Asset-1@2x.png" />
      </Head>

      {/* HEADER UNCUT AS REQUESTED */}
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
          <Link href="/" className="flex items-center gap-2 bg-white text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-gray-100 transition-colors duration-200 border">
            Back to Home
          </Link>
        </div>
      </div>

      {/* FEEDBACK CARD CENTERED */}
      <main className="flex-grow flex items-center justify-center px-4 py-6" >
        <div className="bg-white p-10 rounded-3xl shadow-xl max-w-xl w-full border border-gray-100">

          <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">We Value Your Feedback 💬</h1>

          {submitted ? (
            <div className="text-center py-10">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Thank you! 🎉</h3>
              <p className="mt-2 text-sm text-gray-500">Your feedback has been recorded.</p>
              <div className="mt-6">
                <Link href="/" className="text-indigo-600 hover:text-indigo-500 font-medium">Return to Home</Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                <select
                  id="category"
                  name="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option>Food Quality</option>
                  <option>Cleanliness</option>
                  <option>App Functionality</option>
                  <option>Other</option>
                </select>
              </div>

              {/* Emoji Rating (Shown only for Quality & Cleanliness) */}
              {(category === "Food Quality" || category === "Cleanliness") && (
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Rate Your Experience</p>
                  <div className="flex justify-center gap-5 mt-2">
                    {emojiOptions.map((item) => (
                      <button
                        type="button"
                        key={item.value}
                        onClick={() => setRating(item.value)}
                        className={`text-4xl transition-transform hover:scale-125 ${
                          rating === item.value ? "scale-125 drop-shadow-md" : ""
                        }`}
                      >
                        {item.emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-1">Your Feedback</label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md p-3"
                  placeholder="Tell us what you think..."
                  required
                ></textarea>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>
          )}
        </div>
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
}