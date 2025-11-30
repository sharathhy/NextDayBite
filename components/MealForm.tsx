
import React, { useState, useMemo, useEffect } from 'react';
import { MealType, MealEntry } from '../types';
import { UserIcon, IdCardIcon, BriefcaseIcon, LocationMarkerIcon, ClockIcon, TrashIcon } from './icons';

// Declare Razorpay on window
declare global {
    interface Window {
        Razorpay: any;
    }
}

interface MealFormProps {
  onAddEntries: (entries: Omit<MealEntry, 'id'>[], redeemPoints?: number) => Promise<{ success: boolean; message?: string }>;
  existingEntryForDate: (date: string, employeeId: string) => boolean;
  currentTime: Date;
  entries: MealEntry[];
  onCancelEntry: (id: string) => Promise<boolean>;
}


const VEG_PRICE_PAISE = 45;     // ₹50
const NONVEG_PRICE_PAISE = 70;  // ₹70


// getMon-Fri for the weekOffset (0 = this week, 1 = next week)
const getWeekdays = (now: Date, weekOffset = 0) => {
  const monday = new Date(now);
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  monday.setDate(diff + weekOffset * 7);
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
};
const formatDateToYYYYMMDD = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const formatDateForDisplay = (date: Date): string => {
    return date.toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
};

// Simple Modal for QR Code
const QrModal: React.FC<{ id: string; onClose: () => void }> = ({ id, onClose }) => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(id)}`;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl text-center transform transition-all scale-100" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Scan for Meal</h3>
                <p className="text-sm text-gray-500 mb-4">Show this to the canteen staff.</p>
                <div className="flex justify-center bg-gray-50 p-4 rounded-lg border border-gray-100 mb-4">
                    <img src={qrUrl} alt="Meal QR Code" className="w-48 h-48 object-contain" />
                </div>
                <p className="text-xs text-gray-400 font-mono mb-6 break-all">ID: {id}</p>
                <button 
                    onClick={onClose}
                    className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export const MealForm: React.FC<MealFormProps> = ({ onAddEntries, existingEntryForDate, currentTime, entries, onCancelEntry }) => {
  const [activeTab, setActiveTab] = useState<'book' | 'manage'>('book');

  const initialFormState = {
    employeeId: '',
    employeeName: '',
    vertical: '',
    reportingManager: '',
    location: '',
    shiftTimings: '',
    mealType: MealType.VEG,
  };

  const [formData, setFormData] = useState(initialFormState);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Reward Points State
  const [availablePoints, setAvailablePoints] = useState<number>(0);
  const [usePoints, setUsePoints] = useState<boolean>(false);
    // const [userPoints, setUserPoints] = useState<boolean>(false);
  const [pointsLoading, setPointsLoading] = useState<boolean>(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  
  // QR State
  const [qrEntryId, setQrEntryId] = useState<string | null>(null);

    const [showNextWeek, setShowNextWeek] = useState(false);

  const isThursdayToSunday = [4, 5, 6, 0].includes(currentTime.getDay());

  const weekdays = useMemo(() => getWeekdays(currentTime, showNextWeek ? 1 : 0), [currentTime, showNextWeek]);

  
  const fetchPoints = async (empId: string) => {
    if (!empId) {
        setAvailablePoints(0);
        return;
    }
    setPointsLoading(true);
    try {
        const res = await fetch(`/api/points?employeeId=${empId}`);
        if (res.ok) {
            const data = await res.json();
            setAvailablePoints(data.points);
        } else {
             // Fallback for client-side demo
             const storedPoints = localStorage.getItem('userPoints');
             if (storedPoints) {
                const parsed = JSON.parse(storedPoints);
                setAvailablePoints(parsed[empId] || 0);
             } else {
                setAvailablePoints(0);
             }
        }
    } catch (e) {
        const storedPoints = localStorage.getItem('userPoints');
        if (storedPoints) {
            const parsed = JSON.parse(storedPoints);
            setAvailablePoints(parsed[empId] || 0);
        } else {
            setAvailablePoints(0);
        }
    } finally {
        setPointsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
        if(formData.employeeId) fetchPoints(formData.employeeId);
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.employeeId]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // Trim employee ID to avoid mismatches
    const val = name === 'employeeId' ? value.trim() : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setSelectedDates(prev =>
        checked ? [...prev, value].sort() : prev.filter(date => date !== value)
    );
  };

//   const handleRazorpayPayment = async (amount: number, entriesToAdd: any[], pointsToRedeem: number) => {
//       // 1. Create Order
//       const res = await fetch('/api/razorpay/order', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ amount, currency: 'INR' })
//       });
      
//       if (!res.ok) throw new Error("Failed to initiate payment order");
//       const order = await res.json();

//       // 2. Open Razorpay
//       const options = {
//           key: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder', 
//           amount: order.amount,
//           currency: order.currency,
//           name: "Meal Planner AI",
//           description: "Meal Booking Payment",
//           order_id: order.id,
//           handler: async function (response: any) {
//               setIsSubmitting(true);
//               // 3. Verify Payment & Add Entries
//               const verifyRes = await fetch('/api/razorpay/verify', {
//                   method: 'POST',
//                   headers: { 'Content-Type': 'application/json' },
//                   body: JSON.stringify({
//                       razorpay_order_id: response.razorpay_order_id,
//                       razorpay_payment_id: response.razorpay_payment_id,
//                       razorpay_signature: response.razorpay_signature,
//                       entries: entriesToAdd,
//                       amount: amount,
//                       redeemPoints: pointsToRedeem
//                   })
//               });

//               const verifyData = await verifyRes.json();

//               if (verifyRes.ok) {
//                   setSuccess(`Payment Successful! Meals Booked. Payment ID: ${response.razorpay_payment_id}`);
//                   setFormData(initialFormState); 
//                   setSelectedDates([]);
//                   setUsePoints(false);
//                   setTimeout(() => fetchPoints(formData.employeeId), 500);
                  
//                   // Trigger parent refresh if possible via onAddEntries (which triggers mutate in parent)
//                   // Since onAddEntries is skipped here, we might need to manually trigger a refresh
//                   // or just allow the SWR re-validation to handle it on focus.
//                   // Ideally pass a refresh callback, but for now relying on parent re-fetch.
//                   // Hack: Call onAddEntries with empty to trigger mutate? 
//                   // Better: window.location.reload() or just update local state if complex.
//                   // Let's assume onAddEntries prop can be used for "refresh" or modify it later.
//                   // For now, reload the page to be safe or rely on parent polling.
//                   window.location.reload(); 
//               } else {
//                   setError(verifyData.message || "Payment verification failed.");
//               }
//               setIsSubmitting(false);
//           },
//           prefill: {
//               name: formData.employeeName,
//               email: `${formData.employeeId}@company.com`,
//               contact: "9999999999"
//           },
//           theme: {
//               color: "#4F46E5"
//           }
//       };

//       const rzp1 = new window.Razorpay(options);
//       rzp1.on('payment.failed', function (response: any){
//           setError(`Payment Failed: ${response.error.description}`);
//           setIsSubmitting(false);
//       });
//       rzp1.open();
//   }


useEffect(() => {
  const script = document.createElement("script");
  script.src = "https://checkout.razorpay.com/v1/checkout.js";
  script.async = true;
  document.body.appendChild(script);

  // cleanup (MUST return void)
  return () => {
    if (script.parentNode) {
      script.parentNode.removeChild(script); // return value ignored
    }
  };
}, []);


// useEffect(() => {
//   if (formData.employeeId) {
//     fetch(`/api/userPoints?employeeId=${formData.employeeId}`)
//       .then(res => res.json())
//       .then(data => setAvailablePoints(data.points));
//   }
// }, [formData.employeeId]);



// const handleRazorpayPayment = async (amount: number, entriesToAdd: any[], pointsToRedeem: number) => {
//     const res = await fetch('/api/razorpay/order', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ amount, currency: 'INR' })
//     });

//     if (!res.ok) throw new Error("Failed to initiate payment order");
//     const order = await res.json();

//     const options = {
//         key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
//         amount: order.amount,
//         currency: order.currency,
//         name: "Meal Planner AI",
//         description: "Meal Booking Payment",
//         order_id: order.id,
//         handler: async function (response: any) {
//             setIsSubmitting(true);
            
//             const verifyRes = await fetch('/api/razorpay/verify', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({
//                     razorpay_order_id: response.razorpay_order_id,
//                     razorpay_payment_id: response.razorpay_payment_id,
//                     razorpay_signature: response.razorpay_signature,
//                     entries: entriesToAdd,
//                     amount,
//                     redeemPoints: pointsToRedeem
//                 })
//             });

//             const verifyData = await verifyRes.json();
//             if (verifyRes.ok) {
//                 setSuccess("Payment Successful! Meals Booked.");
//                 window.location.reload();
//             } else {
//                 setError(verifyData.message || "Payment verification failed.");
//             }
//             setIsSubmitting(false);
//         },
//         prefill: {
//             name: formData.employeeName,
//             email: `${formData.employeeName}@c5i.com`,
//             contact: "8310083237"
//         },
//         theme: { color: "#4F46E5" }
//     };

//     if (!window.Razorpay) {
//         alert("Razorpay SDK is not loaded, please try again.");
//         return;
//     }

//     const rzp1 = new window.Razorpay(options);
//     rzp1.open();
// };


const handleRazorpayPayment = async (amount: number, entriesToAdd: any[], pointsToRedeem: number) => {
      // 1. Create Order
      const res = await fetch('/api/razorpay/order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount, currency: 'INR' })
      });
      
      if (!res.ok) throw new Error("Failed to initiate payment order");
      const order = await res.json();

      if (typeof window.Razorpay === 'undefined') {
          throw new Error("Razorpay SDK not loaded. Please check your internet connection.");
      }

      // 2. Open Razorpay
      const options = {
          key: order.key, // Use the key returned from the backend API
          amount: order.amount,
          currency: order.currency,
          name: "Meal Planner",
          description: "Meal Booking Payment",
          order_id: order.id,
          handler: async function (response: any) {
              setIsSubmitting(true);
              // 3. Verify Payment & Add Entries
              const verifyRes = await fetch('/api/razorpay/verify', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                      razorpay_order_id: response.razorpay_order_id,
                      razorpay_payment_id: response.razorpay_payment_id,
                      razorpay_signature: response.razorpay_signature,
                      entries: entriesToAdd,
                      amount: amount,
                      redeemPoints: pointsToRedeem
                  })
              });

              const verifyData = await verifyRes.json();

              if (verifyRes.ok) {
                  setSuccess(`Payment Successful! Meals Booked. Payment ID: ${response.razorpay_payment_id}`);
                  setFormData(initialFormState); 
                  setSelectedDates([]);
                  setUsePoints(false);
                  setTimeout(() => fetchPoints(formData.employeeId), 500);
                  window.location.reload(); 
              } else {
                  setError(verifyData.message || "Payment verification failed.");
              }
              setIsSubmitting(false);
          },
          prefill: {
              name: formData.employeeName,
              email: `${formData.employeeId}@c5i.com`,
              contact: "8310083237"
          },
          theme: {
              color: "#4F46E5"
          }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (response: any){
          setError(`Payment Failed: ${response.error.description}`);
          setIsSubmitting(false);
      });
      rzp1.open();
  }


function calculateMealPrice(mealType: MealType | string) {
  const type =
    mealType === MealType.NON_VEG || mealType === "Non_Veg"
      ? MealType.NON_VEG
      : MealType.VEG;

  return type === MealType.NON_VEG ? NONVEG_PRICE_PAISE : VEG_PRICE_PAISE;
}



  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    if (selectedDates.length === 0) {
        setError('Please select at least one date.');
        setIsSubmitting(false);
        return;
    }

    for (const key in formData) {
      if (key !== 'mealType' && formData[key as keyof typeof formData] === '') {
        setError('All fields must be filled out.');
        setIsSubmitting(false);
        return;
    }
    }
    
    const existingEntries = selectedDates.filter(date => existingEntryForDate(date, formData.employeeId));
    if (existingEntries.length > 0) {
      setError(`An entry for Employee ID ${formData.employeeId} already exists for: ${existingEntries.join(', ')}.`);
      setIsSubmitting(false);
      return;
    }
    
const entriesToAdd = selectedDates.map(date => {
  const dayOfWeek = new Date(`${date}T12:00:00`).getDay();
  const isNonVegDay = dayOfWeek === 3 || dayOfWeek === 5; // Wed & Fri

  return {
    date,
    employeeId: formData.employeeId,
    employeeName: formData.employeeName,
    vertical: formData.vertical,
    reportingManager: formData.reportingManager,
    location: formData.location,
    shiftTimings: formData.shiftTimings,
    mealType: (formData.mealType === MealType.NON_VEG && isNonVegDay)
      ? MealType.NON_VEG
      : MealType.VEG,
  };
});





// // Reward points deduction
// const pointsToRedeem = usePoints ? availablePoints : 0;
// console.log("Points to Redeem:", pointsToRedeem);

// // Final bill calculation (veg price for redeemed points)
// const totalAmountToPay =
//   entriesToAdd.reduce((total, entry) => {
//     return total + calculateMealPrice(entry.mealType);
//   }, 0) - (pointsToRedeem);

// 1. Total meal price
const totalMealCost = entriesToAdd.reduce((total, entry) => {
  return total + calculateMealPrice(entry.mealType);
}, 0);

// 2. User can redeem points only if enabled and only up to total cost
const pointsToRedeem = usePoints ? Math.min(availablePoints, totalMealCost) : 0;

// 3. Final bill
const totalAmountToPay = Math.max(0, totalMealCost - pointsToRedeem);

// 4. Remaining points after redemption
const remainingPoints = availablePoints - pointsToRedeem;

  

    
    

    // IF PAYMENT REQUIRED
    if (totalAmountToPay > 0) {
        try {
            await handleRazorpayPayment(totalAmountToPay, entriesToAdd, pointsToRedeem);
            // handleRazorpayPayment handles the rest (verify -> db)
            // We return here to let the modal handle the flow
            return; 
        } catch (err: any) {
            setError(err.message || "Payment initialization failed.");
            setIsSubmitting(false);
            return;
        }
    }

    // IF FULLY COVERED BY POINTS OR FREE
    const result = await onAddEntries(entriesToAdd, pointsToRedeem);

    if (result.success) {
      setSuccess(`Meal(s) successfully booked for ${selectedDates.length} day(s)! ${pointsToRedeem > 0 ? `Redeemed ${pointsToRedeem} point(s).` : ''}`);
      setTimeout(() => {
  setSuccess('');
}, 5000);
      setFormData(initialFormState); 
      setSelectedDates([]);
      setUsePoints(false);
      setTimeout(() => fetchPoints(formData.employeeId), 500);
    } else {
      setError(result.message || 'An unknown error occurred.');
    }
    setIsSubmitting(false);
  };

  const handleCancelClick = async (e: React.MouseEvent, id: string ,entry : MealEntry) => {
      e.preventDefault();
      e.stopPropagation();

      if (!window.confirm(`Are you sure you want to cancel this meal entry? You will receive ${calculateMealPrice(entry.mealType)} reward point.`)) return;

      setCancellingId(id);
      
      try {
        const success = await onCancelEntry(id);
        
        if (success) {
            // Re-fetch points to confirm balance update
            setTimeout(() => {
                fetchPoints(formData.employeeId);
            }, 1000);
        }
      } catch (e) {
          console.error("Cancel failed", e);
          alert("Failed to cancel entry.");
      } finally {
        setCancellingId(null);
      }
  }

  const handleViewQR = (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      setQrEntryId(id);
  }
  
  const userEntries = useMemo(() => {
    if (!formData.employeeId) return [];
    return entries
        .filter(e => e.employeeId === formData.employeeId)
        .sort((a, b) => a.date.localeCompare(b.date));
  }, [entries, formData.employeeId]);

  const isSubmissionDisabled = isSubmitting;

// Calculate pricing for display
const priceList = selectedDates.map(date => {
  const dayOfWeek = new Date(`${date}T12:00:00`).getDay();
  const isNonVegDay = dayOfWeek === 3 || dayOfWeek === 5; // Wed & Fri

  const pricePaise =
    formData.mealType === MealType.NON_VEG && isNonVegDay
      ? NONVEG_PRICE_PAISE
      : VEG_PRICE_PAISE;

  return pricePaise;
});

const totalMealCost = priceList.reduce((sum, price) => sum + price, 0);

  
// const pendingPointsUsage = usePoints ? availablePoints: 0;
// // const discountPaise = pendingPointsUsage * VEG_PRICE_PAISE;

// const pendingTotalCost = Math.max(0, totalMealCost - pendingPointsUsage);

// Points user wants to use must not exceed available points
const pendingPointsUsage = usePoints ? Math.min(availablePoints, totalMealCost) : 0;


// Final cost after deduction
const pendingTotalCost = Math.max(0, totalMealCost - pendingPointsUsage);

// Remaining points after payment
const remainingPoints = usePoints ? availablePoints - pendingPointsUsage : availablePoints;

  return (
    <>
    {qrEntryId && <QrModal id={qrEntryId} onClose={() => setQrEntryId(null)} />}
    
    <div className="bg-white p-1 rounded-2xl shadow-lg w-full max-w-3xl mx-auto overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
            <button
                type="button"
                className={`flex-1 py-4 text-center font-medium transition-colors duration-200 ${activeTab === 'book' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setActiveTab('book')}
            >
                Book Meal
            </button>
            <button
                type="button"
                className={`flex-1 py-4 text-center font-medium transition-colors duration-200 ${activeTab === 'manage' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setActiveTab('manage')}
            >
                My Bookings / Cancel
            </button>
        </div>

        <div className="p-6 md:p-8">
            {activeTab === 'book' ? (
                <>
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Book Weekly Meals</h2>
                {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-md" role="alert"><p>{error}</p></div>}
                {success && <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded-md" role="alert"><p>{success}</p></div>}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="md:col-span-2">

                         {isThursdayToSunday && (
            <button
              type="button"
              onClick={() => setShowNextWeek(prev => !prev)}
              className="mb-4 px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700"
            >
              {showNextWeek ? 'Show This Week' : 'Next Week'}
            </button>
          )}

                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Dates</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {weekdays.map(day => {
                                const dateStr = formatDateToYYYYMMDD(day);
                                const isChecked = selectedDates.includes(dateStr);
                                
                                const todayStart = new Date(currentTime);
                                todayStart.setHours(0, 0, 0, 0);

                                const isPast = day < todayStart;
                                const isToday = day.getTime() === todayStart.getTime();
                                const isPastDeadline = isToday && currentTime.getHours() >= 9;
                                const isDisabled = isPast || isPastDeadline;

                                return (
                                    <label key={dateStr} htmlFor={`date-${dateStr}`} className={`flex items-center p-3 rounded-lg border transition-all duration-200 ${
                                        isChecked ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-200' : 'bg-white border-gray-300'
                                    } ${isDisabled ? 'bg-gray-100 cursor-not-allowed text-gray-400' : 'hover:border-indigo-400 cursor-pointer'}`}>
                                        <input
                                            type="checkbox"
                                            id={`date-${dateStr}`}
                                            name="dates"
                                            value={dateStr}
                                            checked={isChecked}
                                            onChange={handleDateChange}
                                            disabled={isDisabled}
                                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 disabled:text-gray-400"
                                        />
                                        <span className="ml-3 text-sm font-medium">
                                            {formatDateForDisplay(day)}
                                            {isPastDeadline && <span className="text-xs ml-1">(Closed)</span>}
                                            {isPast && <span className="text-xs ml-1">(Past)</span>}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                        {weekdays.some(d => d.toDateString() === currentTime.toDateString() && currentTime.getHours() >= 9) &&
                            <p className="text-xs text-orange-600 mt-2">Note: Submissions for today are closed after 9 AM.</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200 text-gray-400 group-focus-within:text-indigo-600">
                                    <IdCardIcon className="h-5 w-5" />
                                </div>
                                <input type="text" name="employeeId" id="employeeId" value={formData.employeeId} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pl-10 py-2.5 transition-colors duration-200" placeholder="e.g., 12345"/>
                            </div>
                            {/* Points Display Below ID */}
                            {formData.employeeId && (
                                <div className="mt-1 flex items-center gap-1 text-xs text-indigo-600 font-medium">
                                    <span>🏆 Rewards: {pointsLoading ? '...' : availablePoints} Points</span>
                                </div>
                            )}
                        </div>
                        <div>
                            <label htmlFor="employeeName" className="block text-sm font-medium text-gray-700 mb-1">Employee Name</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200 text-gray-400 group-focus-within:text-indigo-600">
                                    <UserIcon className="h-5 w-5" />
                                </div>
                                <input type="text" name="employeeName" id="employeeName" value={formData.employeeName} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pl-10 py-2.5 transition-colors duration-200" placeholder="e.g., Kabir Singh"/>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="vertical" className="block text-sm font-medium text-gray-700 mb-1">Vertical</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200 text-gray-400 group-focus-within:text-indigo-600">
                                    <BriefcaseIcon className="h-5 w-5" />
                                </div>
                                <input type="text" name="vertical" id="vertical" value={formData.vertical} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pl-10 py-2.5 transition-colors duration-200" placeholder="e.g., Tech"/>
                            </div>
                        </div>
                         <div>
                            <label htmlFor="reportingManager" className="block text-sm font-medium text-gray-700 mb-1">Reporting Manager</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200 text-gray-400 group-focus-within:text-indigo-600">
                                    <UserIcon className="h-5 w-5" />
                                </div>
                                <input type="text" name="reportingManager" id="reportingManager" value={formData.reportingManager} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pl-10 py-2.5 transition-colors duration-200" placeholder="e.g., Rocky"/>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200 text-gray-400 group-focus-within:text-indigo-600">
                                    <LocationMarkerIcon className="h-5 w-5" />
                                </div>
                                <input type="text" name="location" id="location" value={formData.location} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pl-10 py-2.5 transition-colors duration-200" placeholder="e.g., 5th Floor"/>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="shiftTimings" className="block text-sm font-medium text-gray-700 mb-1">Shift Timings</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200 text-gray-400 group-focus-within:text-indigo-600">
                                    <ClockIcon className="h-5 w-5" />
                                </div>
                                <input type="text" name="shiftTimings" id="shiftTimings" value={formData.shiftTimings} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pl-10 py-2.5 transition-colors duration-200" placeholder="e.g., 9:00 AM - 6:00 PM"/>
                            </div>
                        </div>
                        <div className="md:col-span-2">
                             <label className="block text-sm font-medium text-gray-700 mb-2">Meal Type</label>
                             <div className="flex items-center space-x-6">
                                <label className="flex items-center cursor-pointer group">
                                    <input type="radio" name="mealType" value={MealType.VEG} checked={formData.mealType === MealType.VEG} onChange={handleChange} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300" />
                                    <span className="ml-2 text-gray-700 group-hover:text-indigo-600 transition-colors">Veg</span>
                                </label>
                                <label className="flex items-center cursor-pointer group">
                                    <input type="radio" name="mealType" value={MealType.NON_VEG} checked={formData.mealType === MealType.NON_VEG} onChange={handleChange} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300" />
                                    <span className="ml-2 text-gray-700 group-hover:text-indigo-600 transition-colors">Non-Veg</span>
                                </label>
                             </div>
                             <p className="text-xs text-gray-500 mt-1">Non-Veg is automatically selected on Wednesdays & Fridays if chosen.</p>
                        </div>
                        
                        {/* Reward Points Section - Only show if points > 0 */}
                        {availablePoints > 0 && (
                            <div className="md:col-span-2 bg-indigo-50 rounded-lg p-4 border border-indigo-100 flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="bg-indigo-100 p-2 rounded-full mr-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-indigo-900">Reward Points Available: {remainingPoints}</h4>
                                        <p className="text-xs text-indigo-700">Use points to pay for your meal.</p>
                                    </div>
                                </div>
                                <label className="flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={usePoints} 
                                        onChange={(e) => setUsePoints(e.target.checked)}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    />
                                    <span className="ml-2 text-sm font-medium text-indigo-800">Redeem Points</span>
                                </label>
                            </div>
                        )}

                        {/* Payment Summary */}
                        {selectedDates.length > 0 && (
                            <div className="md:col-span-2 border-t pt-4 mt-2">
                                <div className="flex justify-between items-center text-sm mb-1">
                                    <span className="text-gray-600">Total Meals:</span>
                                    <span className="font-semibold">{selectedDates.length}</span>
                                </div>
                                { usePoints && (
                                    <div className="flex justify-between items-center text-sm mb-1">
                                        <span className="text-gray-600">Meal Cost:</span>
                                        <span className="font-semibold">₹{totalMealCost}</span>
                                    </div>
                                )}
                                {pendingPointsUsage > 0 && (
                                    <>
                                    <div className="flex justify-between items-center text-sm mb-1 text-green-600">
                                        <span>Points Redeemed:</span>
                                        <span className="font-semibold">-{pendingPointsUsage}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm mb-1 text-gray-600">
                                        <span>Remaining Points:</span>
                                        <span className="font-semibold">{remainingPoints}</span>
                                    </div>
                                    </>
                                )}
                                <div className="flex justify-between items-center text-lg mt-2">
                                    <span className="font-bold text-gray-800">Total Payable:</span>
                                    <span className="font-bold text-indigo-600">₹{pendingTotalCost}</span>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <button
                        type="submit"
                        disabled={isSubmissionDisabled}
                        className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-[1.01] ${isSubmissionDisabled ? 'opacity-50 cursor-not-allowed hover:scale-100' : ''}`}
                    >
                        {isSubmitting ? (
                             <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {pendingTotalCost > 0 ? 'Processing Payment...' : 'Booking...'}
                            </span>
                        ) : (
                            <span>{pendingTotalCost > 0 ? `Pay ₹${pendingTotalCost} & Book` : 'Book Meal'}</span>
                        )}
                    </button>
                </form>
                </>
            ) : (
                <div className="space-y-6">
                    <div className="text-center mb-6">
                         <h2 className="text-xl font-bold text-gray-800">My Bookings & Cancellations</h2>
                         <p className="text-sm text-gray-500 mt-1">Enter your Employee ID to view and manage your booked meals.</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <label htmlFor="manageEmployeeId" className="block text-sm font-medium text-gray-700 mb-1">Enter Employee ID</label>
                        <div className="relative">
                            <input
                                type="text"
                                id="manageEmployeeId"
                                name="employeeId"
                                value={formData.employeeId}
                                onChange={handleChange}
                                placeholder="e.g., 12345"
                                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pl-4 py-2"
                            />
                            {pointsLoading && <span className="absolute right-3 top-2.5 text-xs text-gray-400">Loading...</span>}
                        </div>
                    </div>

                    {/* Always show points here if ID entered */}
                    {formData.employeeId && (
                         <div className="bg-green-50 text-green-800 p-3 rounded-md text-sm font-medium flex items-center justify-center border border-green-100">
                            <span>🏆 You have <span className="font-bold text-lg mx-1">{availablePoints}</span> Reward Points!</span>
                         </div>
                    )}

                    {formData.employeeId && (
                        <div className="mt-4">
                            <h3 className="font-semibold text-gray-700 mb-3 border-b pb-2">Upcoming Meals</h3>
                            {userEntries.length === 0 ? (
                                <p className="text-gray-500 text-sm italic text-center py-4">No meals found for this Employee ID.</p>
                            ) : (
                                <ul className="space-y-3">
                                    {userEntries.map(entry => (
                                        <li key={entry.id} className={`bg-white border rounded-lg p-3 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow ${entry.isRedeemed ? 'opacity-60 bg-gray-50 border-gray-200' : 'border-gray-200'}`}>
                                            <div>
                                                <p className="font-medium text-indigo-700">{formatDateForDisplay(new Date(entry.date))}</p>
                                                <p className="text-xs text-gray-500">{entry.mealType} • {entry.location}</p>
                                                {entry.isRedeemed && <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded mt-1 inline-block">Redeemed</span>}
                                                {entry.paymentMethod === 'Online' && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded mt-1 ml-1 inline-block">Paid Online</span>}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {!entry.isRedeemed && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => handleViewQR(e, entry.id)}
                                                        className="text-xs px-3 py-1.5 rounded text-indigo-700 bg-indigo-50 border border-indigo-200 font-medium hover:bg-indigo-100 transition-colors flex items-center gap-1"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4h2v-4zM6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        QR
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleCancelClick(e, entry.id,entry)}
                                                    disabled={cancellingId === entry.id || entry.isRedeemed}
                                                    className={`text-xs px-3 py-1.5 rounded text-white font-medium transition-colors ${cancellingId === entry.id || entry.isRedeemed ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'}`}
                                                >
                                                    {cancellingId === entry.id ? '...' : 'Cancel'}
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    </div>
    </>
  );
};
