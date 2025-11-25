// components/MealForm.tsx
import React, { useState, useMemo } from 'react';
import { MealType, MealEntry } from '../types';
import { UserIcon, IdCardIcon, BriefcaseIcon, LocationMarkerIcon, ClockIcon } from './icons';

interface MealFormProps {
  onAddEntries: (entries: Omit<MealEntry, 'id'>[]) => Promise<{ success: boolean; message?: string }>;
  existingEntryForDate: (date: string, employeeId: string) => boolean;
  currentTime: Date;
}

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
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const formatDateForDisplay = (date: Date) =>
  date.toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

export const MealForm: React.FC<MealFormProps> = ({ onAddEntries, existingEntryForDate, currentTime }) => {
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
  const [showNextWeek, setShowNextWeek] = useState(false);

  const isThursdayToSunday = [4, 5, 6, 0].includes(currentTime.getDay());

  const weekdays = useMemo(() => getWeekdays(currentTime, showNextWeek ? 1 : 0), [currentTime, showNextWeek]);

  const isSubmissionDisabled = selectedDates.length === 0 || isSubmitting;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setSelectedDates(prev => (checked ? [...prev, value].sort() : prev.filter(d => d !== value)));
  };

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

    // validate required fields (except mealType)
    for (const key in formData) {
      if (key !== 'mealType' && (formData as any)[key] === '') {
        setError('All fields must be filled out.');
        setIsSubmitting(false);
        return;
      }
    }

    // check duplicates
    const existingEntries = selectedDates.filter(date => existingEntryForDate(date, formData.employeeId));
    if (existingEntries.length > 0) {
      setError(`An entry for Employee ID ${formData.employeeId} already exists for: ${existingEntries.join(', ')}`);
      setIsSubmitting(false);
      return;
    }

    // build entries
    const entriesToAdd: Omit<MealEntry, 'id'>[] = selectedDates.map(date => {
      const dayOfWeek = new Date(`${date}T12:00:00`).getDay();
      const isNonVegDay = dayOfWeek === 3 || dayOfWeek === 5; // Wed/Fri
      return {
        date,
        employeeId: formData.employeeId,
        employeeName: formData.employeeName,
        vertical: formData.vertical,
        reportingManager: formData.reportingManager,
        location: formData.location,
        shiftTimings: formData.shiftTimings,
        mealType: formData.mealType === MealType.NON_VEG && isNonVegDay ? MealType.NON_VEG : MealType.VEG,
      };
    });

    // Call payment-aware onAddEntries (returns only after verification & server store)
    try {
      const result = await onAddEntries(entriesToAdd);

      if (result.success) {
        setSuccess(`Meal(s) successfully booked for ${selectedDates.length} day(s)! Payment verified.`);
        setFormData(initialFormState);
        setSelectedDates([]);
      } else {
        setError(result.message || 'An unknown error occurred during payment or booking.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error while booking meals.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg w-full max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Book Your Weekly Meals</h2>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-md" role="alert">
          <p>{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded-md" role="alert">
          <p>{success}</p>
        </div>
      )}

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
              const isToday =
                day.getFullYear() === currentTime.getFullYear() &&
                day.getMonth() === currentTime.getMonth() &&
                day.getDate() === currentTime.getDate();

              const isPastDeadline = isToday && currentTime.getHours() >= 9;
              const isDisabled = isPast || isPastDeadline;

              return (
                <label
                  key={dateStr}
                  htmlFor={`date-${dateStr}`}
                  className={`flex items-center p-3 rounded-lg border transition-all duration-200 ${
                    isChecked ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-200' : 'bg-white border-gray-300'
                  } ${isDisabled ? 'bg-gray-100 cursor-not-allowed text-gray-400' : 'hover:border-indigo-400 cursor-pointer'}`}
                >
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

          {weekdays.some(d => d.toDateString() === currentTime.toDateString() && currentTime.getHours() >= 9) && (
            <p className="text-xs text-orange-600 mt-2">Note: Submissions for today are closed after 9 AM.</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 group-focus-within:text-indigo-600">
                <IdCardIcon className="h-5 w-5" />
              </div>
              <input
                type="text"
                name="employeeId"
                id="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pl-10 py-2.5"
                placeholder="e.g., 12345"
              />
            </div>
          </div>

          <div>
            <label htmlFor="employeeName" className="block text-sm font-medium text-gray-700 mb-1">Employee Name</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 group-focus-within:text-indigo-600">
                <UserIcon className="h-5 w-5" />
              </div>
              <input
                type="text"
                name="employeeName"
                id="employeeName"
                value={formData.employeeName}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pl-10 py-2.5"
                placeholder="e.g., Kabir Singh"
              />
            </div>
          </div>

          <div>
            <label htmlFor="vertical" className="block text-sm font-medium text-gray-700 mb-1">Vertical</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 group-focus-within:text-indigo-600">
                <BriefcaseIcon className="h-5 w-5" />
              </div>
              <input
                type="text"
                name="vertical"
                id="vertical"
                value={formData.vertical}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pl-10 py-2.5"
                placeholder="e.g., TMT"
              />
            </div>
          </div>

          <div>
            <label htmlFor="reportingManager" className="block text-sm font-medium text-gray-700 mb-1">Reporting Manager</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 group-focus-within:text-indigo-600">
                <UserIcon className="h-5 w-5" />
              </div>
              <input
                type="text"
                name="reportingManager"
                id="reportingManager"
                value={formData.reportingManager}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pl-10 py-2.5"
                placeholder="e.g., Rocky"
              />
            </div>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 group-focus-within:text-indigo-600">
                <LocationMarkerIcon className="h-5 w-5" />
              </div>
              <input
                type="text"
                name="location"
                id="location"
                value={formData.location}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pl-10 py-2.5"
                placeholder="e.g., Bangalore"
              />
            </div>
          </div>

          <div>
            <label htmlFor="shiftTimings" className="block text-sm font-medium text-gray-700 mb-1">Shift Timings</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 group-focus-within:text-indigo-600">
                <ClockIcon className="h-5 w-5" />
              </div>
              <input
                type="text"
                name="shiftTimings"
                id="shiftTimings"
                value={formData.shiftTimings}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pl-10 py-2.5"
                placeholder="e.g., 9 AM - 5 PM"
              />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="mealType" className="block text-sm font-medium text-gray-700 mb-1">Meal Preference</label>
          <p className="text-xs text-gray-500 mb-2">Note:Non-Veg meals are only available on Wednesdays and Fridays. If you select Non-Veg, the system will automatically apply the correct Veg/Non-Veg meal types for all relevant dates in your multiple entries.</p>
          <select
            id="mealType"
            name="mealType"
            value={formData.mealType}
            onChange={handleChange}
            className="mt-1 block w-full pl-3 pr-10 py-2.5 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
          >
            <option value={MealType.VEG}>{MealType.VEG}</option>
            <option value={MealType.NON_VEG}>{MealType.NON_VEG.replace('_', '-')}</option>
          </select>
        </div>

        <div>
          <button
            type="submit"
            disabled={isSubmissionDisabled}
            className="w-full inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Meal Request(s)'}
          </button>
        </div>
      </form>
    </div>
  );
};
