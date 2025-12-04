
import React, { useState, useEffect, useRef } from 'react';
import { MealEntry, MealType, Payment, Feedback } from '../types';
import { DownloadIcon } from './icons';
import { DataTable } from './DataTable';

// Declare the XLSX global variable provided by the script tag
declare const XLSX: any;
// Declare Html5Qrcode global variable provided by the script tag
declare const Html5Qrcode: any;

interface AdminDashboardProps {
    entries: MealEntry[];
    onAddSingleEntry: (entryData: Omit<MealEntry, 'id'>) => Promise<{ success: boolean; message?: string }>;
    existingEntryForDate: (date: string, employeeId: string) => boolean;
    onCancelEntry: (id: string) => Promise<boolean> | void;
    currentTime: Date;
    onRefresh?: (id?: string) => void;
    onRedeemEntry: (id: string) => Promise<{ success: boolean; message: string; entry?: MealEntry }>;
}

const formatDateToYYYYMMDD = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const createStyledWorksheet = (data: any[][], headerRowIndex: number = 0) => {
    const worksheet = XLSX.utils.aoa_to_sheet(data);

    const headerStyle = {
        font: { color: { rgb: "FFFFFF" }, bold: true },
        fill: { patternType: "solid", fgColor: { rgb: "4F46E5" } } // Indigo-600
    };
    
    // Apply style to header row
    const range = XLSX.utils.decode_range(worksheet['!ref'] as string);
    for (let C = range.s.c; C <= range.e.c; ++C) {
        const address = XLSX.utils.encode_cell({ c: C, r: headerRowIndex });
        if (worksheet[address]) worksheet[address].s = headerStyle;
    }

    // Auto-width columns
    const colWidths = data[0].map((_, i) => ({
        wch: Math.max(...data.map(row => (row[i] ? String(row[i]).length : 0))) + 5
    }));
    worksheet['!cols'] = colWidths;

    return worksheet;
}

const AdminAddForm: React.FC<Pick<AdminDashboardProps, 'onAddSingleEntry' | 'existingEntryForDate'>> = ({ onAddSingleEntry, existingEntryForDate }) => {
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
        setFormData(prev => ({...prev, [name]: value as any }));
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
            setError(result.message || "An unknown error occurred.");
        }
        setIsSubmitting(false);
    };

    return (
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg w-full max-w-4xl mx-auto border border-indigo-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">Add New Meal Entry</h3>
            {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-md" role="alert"><p>{error}</p></div>}
            {success && <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded-md" role="alert"><p>{success}</p></div>}
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                        <input type="date" name="date" id="date" value={formData.date} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2" />
                    </div>
                     <div>
                        <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700">Employee ID</label>
                        <input type="text" name="employeeId" id="employeeId" value={formData.employeeId} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2" />
                    </div>
                    <div>
                        <label htmlFor="employeeName" className="block text-sm font-medium text-gray-700">Employee Name</label>
                        <input type="text" name="employeeName" id="employeeName" value={formData.employeeName} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2" />
                    </div>
                    <div>
                        <label htmlFor="vertical" className="block text-sm font-medium text-gray-700">Vertical</label>
                        <input type="text" name="vertical" id="vertical" value={formData.vertical} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2" />
                    </div>
                     <div>
                        <label htmlFor="reportingManager" className="block text-sm font-medium text-gray-700">Reporting Manager</label>
                        <input type="text" name="reportingManager" id="reportingManager" value={formData.reportingManager} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2" placeholder="e.g., Rocky" />
                    </div>
                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                        <input type="text" name="location" id="location" value={formData.location} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2" />
                    </div>
                     <div>
                        <label htmlFor="shiftTimings" className="block text-sm font-medium text-gray-700">Shift Timings</label>
                        <input type="text" name="shiftTimings" id="shiftTimings" value={formData.shiftTimings} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2" />
                    </div>
                     <div className="md:col-span-2">
                        <label htmlFor="mealType" className="block text-sm font-medium text-gray-700">Meal Type</label>
                        <select id="mealType" name="mealType" value={formData.mealType} onChange={handleChange} className="mt-1 block w-full p-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm">
                            <option value={MealType.VEG}>{MealType.VEG}</option>
                            <option value={MealType.NON_VEG}>{MealType.NON_VEG}</option>
                        </select>
                    </div>
                </div>
                 <button type="submit" disabled={isSubmitting} className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400">
                    {isSubmitting ? 'Adding...' : 'Add Entry'}
                </button>
            </form>
        </div>
    );
};

const ScannerInterface = ({ onRefresh, onRedeemEntry }: { onRefresh?: (id?: string) => void, onRedeemEntry: (id: string) => Promise<{ success: boolean; message: string; entry?: MealEntry }> }) => {
    const [scanId, setScanId] = useState('');
    const [pendingScan, setPendingScan] = useState<string | null>(null);
    const [result, setResult] = useState<{success: boolean; message: string, entry?: MealEntry} | null>(null);
    const [loading, setLoading] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [cameraError, setCameraError] = useState('');
    
    const isMountedRef = useRef(true);
    const html5QrCodeRef = useRef<any>(null);

    useEffect(() => {
        isMountedRef.current = true;
        return () => { isMountedRef.current = false; };
    }, []);

    const handleRedeem = async (id: string) => {
        if (!id.trim()) return;
        setLoading(true);
        
        try {
            const data = await onRedeemEntry(id.trim());
            
            if (isMountedRef.current) {
                setResult(data);
                if (data.success) {
                    setScanId('');
                    setPendingScan(null); 
                    setShowCamera(false); 
                    
                    const redeemedId = data.entry?.id || id.trim();
                    if (onRefresh) {
                        onRefresh(redeemedId);
                    }
                } else {
                    setPendingScan(null);
                }
            }
        } catch (err) {
            if (isMountedRef.current) {
                setResult({ success: false, message: 'Processing failed. Please try again.' });
                setPendingScan(null);
            }
        } finally {
            if (isMountedRef.current) setLoading(false);
        }
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleRedeem(scanId);
    };

    const handleConfirmScan = () => {
        if (pendingScan) handleRedeem(pendingScan);
    };

    const handleCancelScan = () => {
        setPendingScan(null);
        setResult(null);
    };

    const isPermissionError = (err: any) => {
        const errName = err?.name || '';
        const errMsg = typeof err === 'string' ? err : (err?.message || JSON.stringify(err));
        return (
            errName === 'NotAllowedError' || 
            errName === 'PermissionDeniedError' || 
            errMsg.toLowerCase().includes('permission denied') ||
            errMsg.toLowerCase().includes('not allowed') ||
            errMsg.toLowerCase().includes('permission dismissed')
        );
    };

    const handleRequestPermission = async () => {
        setCameraError('');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach(track => track.stop());
            setTimeout(() => {
                 if (isMountedRef.current) setShowCamera(true);
            }, 500);
        } catch (err: any) {
            console.error("Permission request failed", err);
            if (isPermissionError(err)) {
                 setCameraError("Permission denied. Please allow camera access in your browser settings.");
            } else {
                 setCameraError("Could not access camera: " + (err.message || "Unknown error"));
            }
        }
    };

    useEffect(() => {
        if (!showCamera) return;

        setCameraError('');
        const scannerId = "reader";
        
        if (typeof Html5Qrcode === 'undefined') {
            setCameraError("Scanner library not loaded. Please refresh the page.");
            return;
        }

        let isCancelled = false;
        
        const startScanner = async () => {
            await new Promise(resolve => setTimeout(resolve, 300));
            if (isCancelled || !document.getElementById(scannerId)) return;

            try {
                html5QrCodeRef.current = new Html5Qrcode(scannerId, { verbose: false });
                
                const qrCodeSuccessCallback = (decodedText: string) => {
                    if (isCancelled || !isMountedRef.current) return;
                    const cleanText = decodedText.trim();
                    setPendingScan((prev) => {
                        if (prev) return prev; 
                        return cleanText; 
                    });
                };

                const config = { 
                    fps: 25, 
                    qrbox: { width: 250, height: 250 },
                };
                
                try {
                    await html5QrCodeRef.current.start({ facingMode: "environment" }, config, qrCodeSuccessCallback, undefined);
                } catch (envError: any) {
                    if (isCancelled) return;
                    if (isPermissionError(envError)) {
                         setCameraError("Permission denied. Please allow camera access in your browser settings.");
                         return;
                    }
                    try {
                        await html5QrCodeRef.current.start({ facingMode: "user" }, config, qrCodeSuccessCallback, undefined);
                    } catch (userError: any) {
                         if (isPermissionError(userError)) {
                            setCameraError("Permission denied. Please allow camera access in your browser settings.");
                         } else {
                            setCameraError("Failed to start camera. Please check your device.");
                         }
                    }
                }

            } catch (err: any) {
                 if (isCancelled) return;
                 setCameraError("Failed to initialize scanner: " + (err?.message || "Unknown error"));
            }
        };

        startScanner();

        return () => {
            isCancelled = true;
            if (html5QrCodeRef.current) {
                const stopScanner = async () => {
                    try {
                        if (html5QrCodeRef.current.isScanning) {
                           await html5QrCodeRef.current.stop();
                        }
                    } catch (e) {
                    } finally {
                        try {
                            html5QrCodeRef.current.clear();
                        } catch (e) {}
                    }
                };
                stopScanner();
            }
        };
    }, [showCamera]);


    return (
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg w-full max-w-4xl mx-auto border-2 border-dashed border-gray-300 mb-8">
             <h3 className="text-xl font-bold text-gray-800 mb-4 text-center flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4h2v-4zM6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2-2h-2v4a2 2 0 002 2z" />
                </svg>
                Meal Scanner
             </h3>
             <p className="text-center text-gray-500 text-sm mb-6">Scan the employee's QR code using the camera or a handheld scanner.</p>
             
             <div className="flex justify-center mb-6">
                {!showCamera && (
                    <button 
                        type="button" 
                        onClick={handleRequestPermission}
                        className="inline-flex items-center px-4 py-2 border border-indigo-300 rounded-md shadow-sm text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none transition-colors"
                    >
                        Start Camera Scan
                    </button>
                )}
             </div>

             {showCamera && (
                 <div className="mb-6 mx-auto overflow-hidden rounded-lg border-2 border-gray-800 bg-black h-72 w-full max-w-sm relative shadow-inner flex flex-col items-center justify-center">
                     <div id="reader" className="w-full h-full absolute inset-0"></div>
                     
                     {!pendingScan && !cameraError && (
                        <div className="absolute inset-0 pointer-events-none border-2 border-indigo-500/30 flex items-center justify-center">
                            <div className="w-64 h-64 border-2 border-indigo-400 rounded-lg animate-pulse"></div>
                            <div className="absolute top-4 bg-black/40 text-white text-xs px-2 py-1 rounded">Scanning...</div>
                        </div>
                     )}

                     {pendingScan && (
                         <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80 p-4 animate-in fade-in duration-200">
                             <div className="bg-white rounded-lg p-4 w-full text-center shadow-2xl">
                                 <h4 className="font-bold text-gray-900 text-lg mb-1">Meal ID Detected</h4>
                                 <p className="font-mono text-sm bg-gray-100 p-2 rounded mb-4 break-all text-gray-700 select-all">{pendingScan}</p>
                                 
                                 <div className="flex gap-2 justify-center">
                                     <button 
                                        onClick={handleConfirmScan}
                                        disabled={loading}
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
                                     >
                                         {loading ? 'Processing...' : 'Complete'}
                                     </button>
                                     <button 
                                        onClick={handleCancelScan}
                                        disabled={loading}
                                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded transition-colors"
                                     >
                                         Cancel
                                     </button>
                                 </div>
                             </div>
                         </div>
                     )}

                     <button 
                        onClick={() => setShowCamera(false)}
                        className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-red-600 hover:text-white transition-colors z-40"
                        title="Close Camera"
                     >
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                     </button>
                     
                     {cameraError && (
                         <div className="absolute inset-0 flex items-center justify-center p-4 bg-gray-900 bg-opacity-90 text-white text-center z-50">
                             <p>{cameraError}</p>
                         </div>
                     )}
                 </div>
             )}

             <form onSubmit={handleManualSubmit} className="max-w-md mx-auto flex gap-2">
                 <input 
                    type="text" 
                    value={scanId} 
                    onChange={(e) => setScanId(e.target.value)} 
                    placeholder="Or type Meal ID manually..." 
                    className="flex-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-3"
                    autoFocus={!showCamera}
                 />
                 <button 
                    type="submit" 
                    disabled={loading || !scanId}
                    className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                 >
                    {loading ? '...' : 'Redeem'}
                 </button>
             </form>

             {result && (
                 <div className={`mt-6 p-4 rounded-md text-center transition-all duration-300 ${result.success ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                     <p className="font-bold text-lg">{result.message}</p>
                     {result.entry && (
                         <div className="mt-2 text-sm text-gray-600">
                             <p className="font-semibold">{result.entry.employeeName} ({result.entry.employeeId})</p>
                             <p>{result.entry.mealType} - {result.entry.date}</p>
                         </div>
                     )}
                 </div>
             )}
        </div>
    )
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ entries, onAddSingleEntry, existingEntryForDate, onCancelEntry, currentTime, onRefresh, onRedeemEntry }) => {
    const [activeTab, setActiveTab] = useState<'entries' | 'scanner' | 'transactions' | 'redemptions' | 'feedback'>('entries');
    const [transactions, setTransactions] = useState<Payment[]>([]);
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

    useEffect(() => {
        if (activeTab === 'transactions') {
            fetch('/api/admin/transactions')
                .then(res => res.json())
                .then(data => Array.isArray(data) ? setTransactions(data) : setTransactions([]))
                .catch(err => console.error("Transactions fetch error", err));
        }
        if (activeTab === 'feedback') {
            fetch('/api/admin/feedback')
                .then(res => res.json())
                .then(data => Array.isArray(data) ? setFeedbacks(data) : setFeedbacks([]))
                .catch(err => console.error("Feedback fetch error", err));
        }
    }, [activeTab]);

    const downloadTransactionsXLSX = () => {
        if (typeof XLSX === 'undefined') return;
        const header = ['Date', 'Payment ID', 'Order ID', 'Employee ID', 'Amount (INR)', 'Created At'];
        const dataRows = transactions.map(p => [
            p.date,
            p.razorpay_payment_id,
            p.razorpay_order_id,
            p.employeeId,
            (p.amount / 100).toFixed(2),
            new Date(p.createdAt).toLocaleString()
        ]);
        const worksheet = createStyledWorksheet([header, ...dataRows]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
        XLSX.writeFile(workbook, "Transactions.xlsx");
    }

    const downloadFeedbackXLSX = () => {
        if (typeof XLSX === 'undefined') return;
        const header = ['Date', 'Category', 'Rating', 'Message'];
        const dataRows = feedbacks.map(f => [
            new Date(f.createdAt).toLocaleString(),
            f.category,
            f.rating || 'N/A',
            f.message
        ]);
        const worksheet = createStyledWorksheet([header, ...dataRows]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Feedback');
        XLSX.writeFile(workbook, "Feedback.xlsx");
    }

    const redeemedEntries = entries.filter(e => e.isRedeemed);
    const downloadRedemptionsXLSX = () => {
        if (typeof XLSX === 'undefined') return;
        const header = ['Date', 'Meal ID', 'Employee ID', 'Name', 'Meal Type', 'Redeemed At'];
        const dataRows = redeemedEntries.map(e => [
            e.date,
            e.id,
            e.employeeId,
            e.employeeName,
            e.mealType,
            e.redeemedAt ? new Date(e.redeemedAt).toLocaleString() : 'N/A'
        ]);
        const worksheet = createStyledWorksheet([header, ...dataRows]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Redemptions');
        XLSX.writeFile(workbook, "Redemptions.xlsx");
    }

    const downloadAllXLSX = () => {
        if (typeof XLSX === 'undefined') {
            alert('Excel library is not loaded yet.');
            return;
        }

        const groupedEntries = entries.reduce((acc, entry) => {
            const date = entry.date;
            if (!acc[date]) acc[date] = [];
            acc[date].push(entry);
            return acc;
        }, {} as Record<string, MealEntry[]>);

        const workbook = XLSX.utils.book_new();
        const sortedDates = Object.keys(groupedEntries).sort();

        for (const date of sortedDates) {
            const dailyEntries = groupedEntries[date];
             const header = [
                'Date', 'Scanner ID', 'Employee ID', 'Employee Name', 'Vertical',
                'Reporting Manager', 'Location', 'Shift Timings', 'Meal Type', 'Status'
            ];
            const dataRows = dailyEntries.map(entry => [
                entry.date, entry.id, entry.employeeId, entry.employeeName, entry.vertical,
                entry.reportingManager, entry.location, entry.shiftTimings, entry.mealType, entry.isRedeemed ? 'Completed' : 'Pending'
            ]);
            const vegCount = dailyEntries.filter(e => e.mealType === MealType.VEG).length;
            const nonVegCount = dailyEntries.filter(e => e.mealType === MealType.NON_VEG).length;
            const totalCount = dailyEntries.length;
            const summaryRows = [
                [], 
                ['', '', '', '', '', '', '', 'Total Veg:', vegCount],
                ['', '', '', '', '', '', '', 'Total Non-Veg:', nonVegCount],
                ['', '', '', '', '', '', '', 'Total Meals:', totalCount]
            ];

            const worksheet = createStyledWorksheet([header, ...dataRows, ...summaryRows]);
            XLSX.utils.book_append_sheet(workbook, worksheet, date);
        }

        XLSX.writeFile(workbook, "meal_entries_by_date.xlsx");
    };

    const handleDownloadSingleDate = (dateToDownload: string) => {
        if (typeof XLSX === 'undefined') return;
        const dailyEntries = entries.filter(e => e.date === dateToDownload);
        if (dailyEntries.length === 0) {
            alert("No entries to download for this date.");
            return;
        }
        
         const header = [
            'Date', 'Scanner ID', 'Employee ID', 'Employee Name', 'Vertical',
            'Reporting Manager', 'Location', 'Shift Timings', 'Meal Type', 'Status'
        ];
        const dataRows = dailyEntries.map(entry => [
            entry.date, entry.id, entry.employeeId, entry.employeeName, entry.vertical,
            entry.reportingManager, entry.location, entry.shiftTimings, entry.mealType, entry.isRedeemed ? 'Completed' : 'Pending'
        ]);

        const worksheet = createStyledWorksheet([header, ...dataRows]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, dateToDownload);
        XLSX.writeFile(workbook, `meal_entries_${dateToDownload}.xlsx`);
    };

    return (
        <div className="space-y-8">
          <div className="flex flex-wrap justify-center mb-6 gap-2">
  <div className="flex flex-wrap rounded-md shadow-sm" role="group">
    <button
      type="button"
      onClick={() => setActiveTab('entries')}
      className={`px-4 py-2 text-sm font-medium border border-gray-200 rounded-l-lg ${activeTab === 'entries' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-900 hover:bg-gray-100'}`}
    >
      Manage Entries
    </button>

    <button
      type="button"
      onClick={() => setActiveTab('scanner')}
      className={`px-4 py-2 text-sm font-medium border-t border-b border-r border-gray-200 ${activeTab === 'scanner' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-900 hover:bg-gray-100'}`}
    >
      Scanner
    </button>

    <button
      type="button"
      onClick={() => setActiveTab('transactions')}
      className={`px-4 py-2 text-sm font-medium border-t border-b border-r border-gray-200 ${activeTab === 'transactions' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-900 hover:bg-gray-100'}`}
    >
      Transactions
    </button>

    <button
      type="button"
      onClick={() => setActiveTab('redemptions')}
      className={`px-4 py-2 text-sm font-medium border-t border-b border-r border-gray-200 ${activeTab === 'redemptions' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-900 hover:bg-gray-100'}`}
    >
      Redemptions
    </button>

    <button
      type="button"
      onClick={() => setActiveTab('feedback')}
      className={`px-4 py-2 text-sm font-medium border border-gray-200 rounded-r-lg ${activeTab === 'feedback' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-900 hover:bg-gray-100'}`}
    >
      Feedback
    </button>
  </div>
</div>

            {activeTab === 'entries' && (
                <>
                <div className="flex justify-center">
                    <button onClick={downloadAllXLSX} className="inline-flex items-center gap-2 bg-green-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-green-700 transition-colors duration-200" disabled={entries.length === 0}>
                        <DownloadIcon />
                        Download All Entries
                    </button>
                </div>
                <AdminAddForm onAddSingleEntry={onAddSingleEntry} existingEntryForDate={existingEntryForDate} />
                <DataTable 
                entries={entries} 
                onCancelEntry={onCancelEntry} 
                currentTime={currentTime} 
                isAdmin={true}
                onDownloadDate={handleDownloadSingleDate}
                />
                </>
            )}

            {activeTab === 'scanner' && (
                <ScannerInterface onRefresh={onRefresh} onRedeemEntry={onRedeemEntry} />
            )}

            {activeTab === 'transactions' && (
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-800">Payment Transactions</h3>
                         <button onClick={downloadTransactionsXLSX} className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 font-semibold py-1.5 px-3 rounded-md hover:bg-gray-200 text-sm">
                            <DownloadIcon className="h-4 w-4"/> Download
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {transactions.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">No transactions found.</td></tr>
                                ) : (
                                    transactions.map(t => (
                                        <tr key={t.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{t.date}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">{t.razorpay_payment_id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{t.employeeId}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">₹{(t.amount / 100).toFixed(2)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(t.createdAt).toLocaleString()}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'redemptions' && (
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-800">Redemption Log</h3>
                        <button onClick={downloadRedemptionsXLSX} className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 font-semibold py-1.5 px-3 rounded-md hover:bg-gray-200 text-sm">
                            <DownloadIcon className="h-4 w-4"/> Download
                        </button>
                    </div>
                     <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Meal Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Redeemed At</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {redeemedEntries.length === 0 ? (
                                    <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500">No redemptions found.</td></tr>
                                ) : (
                                    redeemedEntries.map(e => (
                                        <tr key={e.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{e.date}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{e.employeeName} ({e.employeeId})</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{e.mealType}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{e.redeemedAt ? new Date(e.redeemedAt).toLocaleString() : '-'}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'feedback' && (
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-800">User Feedback</h3>
                        <button onClick={downloadFeedbackXLSX} className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 font-semibold py-1.5 px-3 rounded-md hover:bg-gray-200 text-sm">
                            <DownloadIcon className="h-4 w-4"/> Download
                        </button>
                    </div>
                    <div className="grid gap-4">
                        {feedbacks.length === 0 ? (
                            <p className="text-center text-gray-500 py-4">No feedback received yet.</p>
                        ) : (
                            feedbacks.map(f => (
                                <div key={f.id} className="border border-gray-100 rounded-lg p-4 hover:shadow-sm transition-shadow">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-gray-800">{f.category}</span>
                                            {f.rating && <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-0.5 rounded">Rating: {f.rating}/5</span>}
                                        </div>
                                        <span className="text-xs text-gray-400">{new Date(f.createdAt).toLocaleString()}</span>
                                    </div>
                                    <p className="text-gray-600 text-sm">{f.message}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
