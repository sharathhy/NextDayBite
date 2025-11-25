import React, { useState, useMemo } from 'react';
import { MealEntry, MealType } from '../types';
import { DownloadIcon } from './icons';
import { DataTable } from './DataTable';

// Declare the XLSX global variable provided by the script tag
declare const XLSX: any;

interface AdminDashboardProps {
  entries: MealEntry[];
  onAddSingleEntry: (entryData: Omit<MealEntry, 'id'>) => Promise<{ success: boolean; message?: string }>;
  existingEntryForDate: (date: string, employeeId: string) => boolean;
  onCancelEntry: (id: string) => void;
  currentTime: Date;
}

const formatDateToYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 🔹 Excel Worksheet Generator
const createStyledWorksheet = (dailyEntries: MealEntry[]) => {
  const header = [
    'Date', 'Employee ID', 'Employee Name', 'Vertical',
    'Reporting Manager', 'Location', 'Shift Timings', 'Meal Type'
  ];

  const dataRows = dailyEntries.map(entry => [
    entry.date, entry.employeeId, entry.employeeName, entry.vertical,
    entry.reportingManager, entry.location, entry.shiftTimings, entry.mealType.replace('_', '-')
  ]);

  const vegCount = dailyEntries.filter(e => e.mealType === MealType.VEG).length;
  const nonVegCount = dailyEntries.filter(e => e.mealType === MealType.NON_VEG).length;
  const totalCount = dailyEntries.length;

  const summaryRows = [
    [],
    ['', '', '', '', '', '', 'Total Veg:', vegCount],
    ['', '', '', '', '', '', 'Total Non-Veg:', nonVegCount],
    ['', '', '', '', '', '', 'Total Meals:', totalCount]
  ];

  const finalSheetData = [header, ...dataRows, ...summaryRows];
  const worksheet = XLSX.utils.aoa_to_sheet(finalSheetData);

  const headerStyle = {
    font: { color: { rgb: 'FFFFFF' }, bold: true },
    fill: { patternType: 'solid', fgColor: { rgb: '4F46E5' } }
  };
  const headerRange = XLSX.utils.decode_range(worksheet['!ref'] as string);
  for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
    const address = XLSX.utils.encode_cell({ c: C, r: 0 });
    if (worksheet[address]) worksheet[address].s = headerStyle;
  }

  const boldStyle = { font: { bold: true } };
  const summaryRowStartIndex = 1 + dataRows.length + 1;
  for (let i = 0; i < 3; i++) {
    const labelAddress = XLSX.utils.encode_cell({ c: 6, r: summaryRowStartIndex + i });
    const valueAddress = XLSX.utils.encode_cell({ c: 7, r: summaryRowStartIndex + i });
    if (worksheet[labelAddress]) worksheet[labelAddress].s = boldStyle;
    if (worksheet[valueAddress]) worksheet[valueAddress].s = boldStyle;
  }

  const colWidths = finalSheetData[0].map((_, i) => ({
    wch: Math.max(...finalSheetData.map(row => (row[i] ? String(row[i]).length : 0))) + 2
  }));
  worksheet['!cols'] = colWidths;

  return worksheet;
};

// 🔹 Add Form
const AdminAddForm: React.FC<
  Pick<AdminDashboardProps, 'onAddSingleEntry' | 'existingEntryForDate'>
> = ({ onAddSingleEntry, existingEntryForDate }) => {
  const initialFormState = {
    date: formatDateToYYYYMMDD(new Date()),
    employeeId: '',
    employeeName: '',
    vertical: '',
    reportingManager: '',
    location: '',
    shiftTimings: '',
    mealType: MealType.VEG,
  };
  const [formData, setFormData] = useState<Omit<MealEntry, 'id'>>(initialFormState);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value as any }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    if (Object.values(formData).some(val => val === '')) {
      setError('All fields are required.');
      setIsSubmitting(false);
      return;
    }

    if (existingEntryForDate(formData.date, formData.employeeId)) {
      setError(`An entry for Employee ID ${formData.employeeId} already exists for ${formData.date}.`);
      setIsSubmitting(false);
      return;
    }

    const result = await onAddSingleEntry(formData);
    if (result.success) {
      setSuccess(`Entry for ${formData.employeeName} on ${formData.date} added successfully.`);
      setFormData(initialFormState);
    } else {
      setError(result.message || 'An unknown error occurred.');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg w-full max-w-4xl mx-auto border border-indigo-100">
      <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">Add New Meal Entry</h3>
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-md">
          <p>{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded-md">
          <p>{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* form fields same as before */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
            <input type="date" name="date" id="date" value={formData.date} onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2" />
          </div>
          <div>
            <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700">Employee ID</label>
            <input type="text" name="employeeId" id="employeeId" value={formData.employeeId} onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2" />
          </div>
          <div>
            <label htmlFor="employeeName" className="block text-sm font-medium text-gray-700">Employee Name</label>
            <input type="text" name="employeeName" id="employeeName" value={formData.employeeName} onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2" />
          </div>
          <div>
            <label htmlFor="vertical" className="block text-sm font-medium text-gray-700">Vertical</label>
            <input type="text" name="vertical" id="vertical" value={formData.vertical} onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2" />
          </div>
          <div>
            <label htmlFor="reportingManager" className="block text-sm font-medium text-gray-700">Reporting Manager</label>
            <input type="text" name="reportingManager" id="reportingManager" value={formData.reportingManager} onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2" />
          </div>
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
            <input type="text" name="location" id="location" value={formData.location} onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2" />
          </div>
          <div>
            <label htmlFor="shiftTimings" className="block text-sm font-medium text-gray-700">Shift Timings</label>
            <input type="text" name="shiftTimings" id="shiftTimings" value={formData.shiftTimings} onChange={handleChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2" />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="mealType" className="block text-sm font-medium text-gray-700">Meal Type</label>
            <select id="mealType" name="mealType" value={formData.mealType} onChange={handleChange}
              className="mt-1 block w-full p-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm">
              <option value={MealType.VEG}>{MealType.VEG}</option>
              <option value={MealType.NON_VEG}>{MealType.NON_VEG.replace('_', '-')}</option>
            </select>
          </div>
        </div>

        <button type="submit" disabled={isSubmitting}
          className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400">
          {isSubmitting ? 'Adding...' : 'Add Entry'}
        </button>
      </form>
    </div>
  );
};

// 🔹 Admin Dashboard Component
export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  entries,
  onAddSingleEntry,
  existingEntryForDate,
  onCancelEntry,
  currentTime
}) => {

  // 🧠 Week Filtering Logic
  const getWeekRange = (offset: number) => {
    const today = new Date();
    const currentDay = today.getDay();
    const monday = new Date(today);
    const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    monday.setDate(today.getDate() + diffToMonday + offset * 7);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return { start: monday, end: sunday };
  };

  const currentWeek = getWeekRange(0);
  const nextWeek = getWeekRange(1);

  // ✅ Show only current + next week
  const visibleEntries = useMemo(() => {
    return entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return (
        (entryDate >= currentWeek.start && entryDate <= currentWeek.end) ||
        (entryDate >= nextWeek.start && entryDate <= nextWeek.end)
      );
    });
  }, [entries]);

  // 🔹 Excel Download Functions
  const downloadAllXLSX = () => {
    if (typeof XLSX === 'undefined') {
      alert('Excel library is not loaded yet. Please try again in a moment.');
      return;
    }

    const groupedEntries = visibleEntries.reduce((acc, entry) => {
      const date = entry.date;
      if (!acc[date]) acc[date] = [];
      acc[date].push(entry);
      return acc;
    }, {} as Record<string, MealEntry[]>);

    const workbook = XLSX.utils.book_new();
    const sortedDates = Object.keys(groupedEntries).sort();

    for (const date of sortedDates) {
      const worksheet = createStyledWorksheet(groupedEntries[date]);
      XLSX.utils.book_append_sheet(workbook, worksheet, date);
    }

    XLSX.writeFile(workbook, 'meal_entries_by_week.xlsx');
  };

  const handleDownloadSingleDate = (dateToDownload: string) => {
    const dailyEntries = visibleEntries.filter(e => e.date === dateToDownload);
    if (dailyEntries.length === 0) {
      alert('No entries to download for this date.');
      return;
    }

    const workbook = XLSX.utils.book_new();
    const worksheet = createStyledWorksheet(dailyEntries);
    XLSX.utils.book_append_sheet(workbook, worksheet, dateToDownload);
    XLSX.writeFile(workbook, `meal_entries_${dateToDownload}.xlsx`);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-center">
        <button
          onClick={downloadAllXLSX}
          className="inline-flex items-center gap-2 bg-green-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-green-700 transition-colors duration-200"
          disabled={visibleEntries.length === 0}
        >
          <DownloadIcon />
          Download Current + Next Week (XLSX)
        </button>
      </div>

      <AdminAddForm
        onAddSingleEntry={onAddSingleEntry}
        existingEntryForDate={existingEntryForDate}
      />

      <DataTable
        entries={visibleEntries}
        onCancelEntry={onCancelEntry}
        currentTime={currentTime}
        isAdmin={true}
        onDownloadDate={handleDownloadSingleDate}
      />
    </div>
  );
};
