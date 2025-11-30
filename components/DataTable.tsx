
import React, { useState } from 'react';
import { MealEntry, MealType } from '../types';
import { TrashIcon, CalendarIcon, DownloadIcon } from './icons';

interface DataTableProps {
    entries: MealEntry[];
    onCancelEntry: (id: string) => Promise<boolean> | void;
    currentTime: Date;
    isAdmin?: boolean;
    onDownloadDate?: (date: string) => void;
}

const DataDayTable: React.FC<{
    date: string;
    entries: MealEntry[];
    onCancelEntry: (id: string) => Promise<boolean> | void;
    currentTime: Date;
    isAdmin?: boolean;
    onDownload?: () => void;
}> = ({ date, entries, onCancelEntry, currentTime, isAdmin = false, onDownload }) => {
    // No local hiding state - rely on props
    const [cancellingId, setCancellingId] = useState<string | null>(null);

    const vegCount = entries.filter(e => e.mealType === MealType.VEG).length;
    const nonVegCount = entries.filter(e => e.mealType === MealType.NON_VEG).length;
    const totalCount = entries.length;

    const formattedDate = new Date(`${date}T12:00:00`).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const handleCancelClick = async (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (window.confirm("Are you sure you want to cancel this entry?")) {
            setCancellingId(id);
            try {
                const result = onCancelEntry(id);
                if (result instanceof Promise) {
                    await result;
                }
            } catch (error) {
                console.error("Cancel failed", error);
                alert("An error occurred while cancelling.");
            } finally {
                setCancellingId(null);
            }
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 border-b pb-4 border-gray-200">
                <div className="flex items-center mb-3 sm:mb-0">
                    <CalendarIcon className="h-6 w-6 text-indigo-500 mr-3"/>
                    <h3 className="text-xl font-bold text-gray-800">{formattedDate}</h3>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm mt-3 sm:mt-0">
                    <span className="font-semibold text-gray-700">Total: <span className="text-indigo-600">{totalCount}</span></span>
                    <span className="font-semibold text-green-700">Veg: <span className="text-green-600">{vegCount}</span></span>
                    <span className="font-semibold text-red-700">Non-Veg: <span className="text-red-600">{nonVegCount}</span></span>
                     {isAdmin && onDownload && (
                         <button 
                            type="button"
                            onClick={onDownload} 
                            className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 font-semibold py-1.5 px-3 rounded-md shadow-sm hover:bg-gray-200 transition-colors duration-200 text-xs"
                            aria-label={`Download entries for ${formattedDate}`}
                        >
                            <DownloadIcon className="h-4 w-4"/>
                            Download
                        </button>
                    )}
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scanner ID</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Vertical</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Manager</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meal Type</th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {entries.map((entry) => (
                            <tr key={entry.id} className={entry.isRedeemed ? 'bg-gray-50' : ''}>
                                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-mono select-all">
                                    {entry.id}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{entry.employeeName}</div>
                                    <div className="text-sm text-gray-500">{entry.employeeId}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                                    <div className="text-sm text-gray-900">{entry.vertical}</div>
                                    <div className="text-sm text-gray-500">{entry.location}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">{entry.reportingManager}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-col gap-1">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full w-min ${
                                            entry.mealType === MealType.VEG ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {entry.mealType}
                                        </span>
                                        {entry.paymentMethod === 'Points' && (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800 w-min">
                                                Paid w/ Points
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    {entry.isRedeemed ? (
                                        <span className="px-2 inline-flex text-xs leading-5 font-bold rounded-full bg-green-200 text-green-900 border border-green-300">
                                            Completed
                                        </span>
                                    ) : (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
                                            Pending
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                    <button
                                        type="button"
                                        onClick={(e) => handleCancelClick(e, entry.id)}
                                        disabled={cancellingId === entry.id || entry.isRedeemed}
                                        className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 ${cancellingId === entry.id || entry.isRedeemed ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
                                        title={entry.isRedeemed ? "Already Redeemed" : "Cancel and earn 1 point"}
                                        aria-label={`Cancel meal for ${entry.employeeName}`}
                                    >
                                        <TrashIcon className="h-4 w-4 mr-1.5" />
                                        {cancellingId === entry.id ? '...' : 'Cancel'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const DataTable: React.FC<DataTableProps> = ({
  entries,
  onCancelEntry,
  currentTime,
  isAdmin = false,
  onDownloadDate,
}) => {
  // Grouping logic
  const groupedEntries = entries.reduce((acc, entry) => {
    const date = entry.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(entry);
    return acc;
  }, {} as Record<string, MealEntry[]>);

  const sortedDates = Object.keys(groupedEntries).sort();
  const [currentIndex, setCurrentIndex] = useState(0);

  if (entries.length === 0) {
    return (
      <div className="text-center py-10 bg-white rounded-2xl shadow-lg mt-12">
        <h3 className="text-lg font-medium text-gray-800">No Meal Entries Yet</h3>
        <p className="text-sm text-gray-500 mt-1">
          {isAdmin ? "Add an entry using the form above." : "Submit the form to book your first meal."}
        </p>
      </div>
    );
  }

  const goPrev = () => setCurrentIndex((i) => Math.max(i - 1, 0));
  const goNext = () => setCurrentIndex((i) => Math.min(i + 1, sortedDates.length - 1));

  const currentDate = sortedDates[currentIndex];
  const currentEntries = groupedEntries[currentDate];

  return (
    <div className="w-full max-w-7xl mx-auto mt-12">
      <h2 className="text-3xl font-bold text-black text-center mb-6">
        <span className="bg-white px-3 py-2 rounded-md inline-block">
          {isAdmin ? "All Meal Entries" : "Your Meal Bookings"}
        </span>
      </h2>

   {/* Date Navigation */}
<div className="flex justify-center items-center gap-6 mb-6">
  <button
    onClick={goPrev}
    disabled={currentIndex === 0}
    className={`px-4 py-2 rounded-xl border font-semibold transition-all duration-300
      ${currentIndex === 0
        ? "border-gray-400 text-gray-400 cursor-not-allowed"
        : "border-indigo-500  bg-indigo-500 text-white hover:bg-indigo-500 hover:text-white hover:shadow-lg"
      }`}
  >
    Previous
  </button>



  <button
    onClick={goNext}
    disabled={currentIndex === sortedDates.length - 1}
    className={`px-4 py-2 rounded-xl border font-semibold transition-all duration-300
      ${currentIndex === sortedDates.length - 1
        ? "border-gray-400 text-gray-400 cursor-not-allowed"
        : "border-indigo-500 bg-indigo-500 text-white hover:bg-indigo-500 hover:text-white hover:shadow-lg"
      }`}
  >
    Next
  </button>
</div>


      {/* Show only selected date */}
      <DataDayTable
        date={currentDate}
        entries={currentEntries}
        onCancelEntry={onCancelEntry}
        currentTime={currentTime}
        isAdmin={isAdmin}
        onDownload={onDownloadDate ? () => onDownloadDate(currentDate) : undefined}
      />
    </div>
  );
};

