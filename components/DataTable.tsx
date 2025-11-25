import React from 'react';
import { MealEntry, MealType } from '../types';
import { TrashIcon, CalendarIcon, InfoIcon, DownloadIcon } from './icons';

interface DataTableProps {
    entries: MealEntry[];
    onCancelEntry: (id: string) => void;
    currentTime: Date;
    isAdmin?: boolean;
    onDownloadDate?: (date: string) => void;
}

const formatDateToYYYYMMDD = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const DataDayTable: React.FC<{
    date: string;
    entries: MealEntry[];
    onCancelEntry: (id: string) => void;
    currentTime: Date;
    isAdmin?: boolean;
    onDownload?: () => void;
}> = ({ date, entries, onCancelEntry, currentTime, isAdmin = false, onDownload }) => {

    const todayYYYYMMDD = formatDateToYYYYMMDD(currentTime);
    const isToday = date === todayYYYYMMDD;
    const isPast = date < todayYYYYMMDD;
    const isCancellationDisabled = !isAdmin && ((isToday && currentTime.getHours() >= 9) || isPast);

    const vegCount = entries.filter(e => e.mealType === MealType.VEG).length;
    const nonVegCount = entries.filter(e => e.mealType === MealType.NON_VEG).length;
    const totalCount = entries.length;

    const formattedDate = new Date(`${date}T12:00:00`).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

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

            {isCancellationDisabled && 
                <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-800 p-3 mb-4 rounded-md text-sm flex items-start">
                    <InfoIcon className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5"/>
                    <p>Cancellation is disabled for past dates and after 9 AM on the current day.</p>
                </div>
            }

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Vertical</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Manager</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meal Type</th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {entries.map((entry) => (
                            <tr key={entry.id}>
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
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        entry.mealType === MealType.VEG ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {entry.mealType.replace('_', '-')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                    <button
                                        onClick={() => onCancelEntry(entry.id)}
                                        disabled={isCancellationDisabled && !isAdmin}
                                        className="text-red-600 hover:text-red-900 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                                        aria-label={`Cancel meal for ${entry.employeeName}`}
                                    >
                                        <TrashIcon />
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

export const DataTable: React.FC<DataTableProps> = ({ entries, onCancelEntry, currentTime, isAdmin = false, onDownloadDate }) => {
    const groupedEntries = entries.reduce((acc, entry) => {
        const date = entry.date;
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(entry);
        return acc;
    }, {} as Record<string, MealEntry[]>);

    const sortedDates = Object.keys(groupedEntries).sort();

    if (entries.length === 0) {
        return (
            <div className="text-center py-10 bg-white rounded-2xl shadow-lg mt-12">
                <h3 className="text-lg font-medium text-gray-800">No Meal Entries Yet</h3>
                <p className="text-sm text-gray-500 mt-1">{isAdmin ? 'Add an entry using the form above.' : 'Submit the form to book your first meal.'}</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto mt-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">{isAdmin ? 'All Meal Entries' : 'Your Meal Bookings'}</h2>
            {sortedDates.map(date => (
                <DataDayTable
                    key={date}
                    date={date}
                    entries={groupedEntries[date]}
                    onCancelEntry={onCancelEntry}
                    currentTime={currentTime}
                    isAdmin={isAdmin}
                    onDownload={onDownloadDate ? () => onDownloadDate(date) : undefined}
                />
            ))}
        </div>
    );
};
