
import React, { useState } from 'react';
import { MealEntry, MealType } from '../types';
import { TrashIcon, CalendarIcon, DownloadIcon } from './icons';

interface DataTableProps {
    entries: MealEntry[];
    onCancelEntry: (id: string) => Promise<boolean> | void;
    currentTime: Date;
    isAdmin?: boolean;
    onDownloadDate?: (date: string , activeTab:string) => void;
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
// const activeEntries = entries.filter(e => !e.isCancelled);

// const vegCount = activeEntries.filter(e => e.mealType === MealType.VEG).length;
// const nonVegCount = activeEntries.filter(e => e.mealType === MealType.NON_VEG).length;
// const totalCount = activeEntries.length;

// Count ALL entries passed (active or cancelled)
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
                              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Redeem Status</th>
                            {/* <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th> */}
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

            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                {entry.reportingManager}
            </td>

            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col gap-1">
                    <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full w-min ${
                            entry.mealType === MealType.VEG
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                        }`}
                    >
                        {entry.mealType}
                    </span>
                </div>
            </td>

            <td className="px-6 py-4 whitespace-nowrap text-center">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800 w-min">
                    {entry.paymentMethod}
                </span>
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
  
  // 🔥 Add tab state
  const [activeTab, setActiveTab] = useState<"active" | "cancelled">("active");

  // Group entries by date
  const groupedEntries = entries.reduce((acc, entry) => {
    const date = entry.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(entry);
    return acc;
  }, {} as Record<string, MealEntry[]>);

  const sortedDates = Object.keys(groupedEntries).sort();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter based on tab
  const filteredGroupedEntries = Object.fromEntries(
    Object.entries(groupedEntries).map(([date, ent]) => [
      date,
      activeTab === "active"
        ? ent.filter(e => !e.isCancelled)
        : ent.filter(e => e.isCancelled)
    ])
  );

  const filteredSortedDates = Object.keys(filteredGroupedEntries).filter(
    date => filteredGroupedEntries[date].length > 0
  );

  if (filteredSortedDates.length === 0) {
    return (
      <div className="text-center py-10 bg-white rounded-2xl shadow-lg mt-12">
        <h3 className="text-lg font-medium text-gray-800">
          {activeTab === "active" ? "No Active Entries" : "No Cancelled Entries"}
        </h3>
      </div>
    );
  }

  const currentDate = filteredSortedDates[currentIndex];
  const currentEntries = filteredGroupedEntries[currentDate];

  const goPrev = () => setCurrentIndex(i => Math.max(i - 1, 0));
  const goNext = () => setCurrentIndex(i => Math.min(i + 1, filteredSortedDates.length - 1));

  const today = new Date().toISOString().slice(0, 10);
  const goToday = () => {
    const idx = filteredSortedDates.indexOf(today);
    if (idx !== -1) setCurrentIndex(idx);
  };

  return (
    <div className="w-full max-w-7xl mx-auto mt-12">

      {/* 🔥 Tabs */}
 <div className="flex justify-center mb-6 gap-4">
  <button
    onClick={() => {
      setActiveTab("active");
      setCurrentIndex(0);
    }}
    className={`px-2 py-2 rounded-lg font-semibold ${
      activeTab === "active"
        ? "bg-indigo-600 text-white"
        : "bg-gray-200 text-gray-700"
    }`}
  >
    Active Entries
  </button>

  <button
    onClick={() => {
      setActiveTab("cancelled");
      setCurrentIndex(0);
    }}
    className={`px-2 py-2 rounded-lg font-semibold ${
      activeTab === "cancelled"
        ? "bg-red-600 text-white"
        : "bg-gray-200 text-gray-700"
    }`}
  >
    Cancelled Entries
  </button>
</div>


      {/* Date Navigation */}
      <div className="flex justify-center items-center gap-6 mb-6">
        <button
          onClick={goPrev}
          disabled={currentIndex === 0}
          className={`px-4 py-2 rounded-xl border font-semibold transition-all duration-300
            ${currentIndex === 0
              ? "border-gray-400 text-gray-400 cursor-not-allowed"
              : "border-indigo-500 bg-indigo-500 text-white hover:shadow-lg"
            }`}
        >
          Previous
        </button>

        <button
          onClick={goToday}
          disabled={!filteredSortedDates.includes(today)}
          className={`px-4 py-2 rounded-xl border font-semibold transition-all duration-300
            ${!filteredSortedDates.includes(today)
              ? "border-gray-400 text-gray-400 cursor-not-allowed"
              : "border-indigo-500 bg-indigo-500 text-white hover:shadow-lg"
            }`}
        >
          Today
        </button>

        <button
          onClick={goNext}
          disabled={currentIndex === filteredSortedDates.length - 1}
          className={`px-4 py-2 rounded-xl border font-semibold transition-all duration-300
            ${currentIndex === filteredSortedDates.length - 1
              ? "border-gray-400 text-gray-400 cursor-not-allowed"
              : "border-indigo-500 bg-indigo-500 text-white hover:shadow-lg"
            }`}
        >
          Next
        </button>
      </div>

      {/* DATA TABLE */}
      <DataDayTable
        date={currentDate}
        entries={currentEntries}
        onCancelEntry={onCancelEntry}
        currentTime={currentTime}
        isAdmin={isAdmin}
        onDownload={onDownloadDate ? () => onDownloadDate(currentDate , activeTab) : undefined}
      
      />
    </div>
  );
};


