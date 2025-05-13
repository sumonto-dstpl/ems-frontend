import React, { useState, useEffect } from 'react';
import { Calendar, Plus, FileUp, Download, Upload, Trash2, CheckCircle, XCircle } from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';
import attendanceService from '../../services/attendanceService';
import { HolidayEntry } from '../../types/attendance';
import ErrorMessage from '../ErrorMessage';

/**
 * Component to manage holidays
 */
const HolidayManagement: React.FC = () => {
  const [holidays, setHolidays] = useState<HolidayEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [newHoliday, setNewHoliday] = useState({ 
    date: '', 
    name: '', 
    isRecurringYearly: false 
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [uploadMode, setUploadMode] = useState(false);
  const [holidayFile, setHolidayFile] = useState<File | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<{ 
    processed: number; 
    errors: any[] 
  } | null>(null);

  // Load holidays for the selected year
  useEffect(() => {
    loadHolidays();
  }, [selectedYear]);

  // Load holidays from API
  const loadHolidays = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await attendanceService.getHolidays(selectedYear);
      setHolidays(data);
    } catch (err) {
      console.error('Error loading holidays:', err);
      setError('Failed to load holidays. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle adding a new holiday
  const handleAddHoliday = async () => {
    // Validate form
    if (!newHoliday.date) {
      setError('Please select a date');
      return;
    }
    
    if (!newHoliday.name) {
      setError('Please enter a holiday name');
      return;
    }
    
    setIsAdding(true);
    setError(null);
    
    try {
      await attendanceService.addHoliday(newHoliday);
      // Reset form
      setNewHoliday({ date: '', name: '', isRecurringYearly: false });
      setShowAddForm(false);
      // Reload holidays
      loadHolidays();
    } catch (err) {
      console.error('Error adding holiday:', err);
      setError('Failed to add holiday. Please try again.');
    } finally {
      setIsAdding(false);
    }
  };

  // Handle deleting a holiday
  const handleDeleteHoliday = async (id: number) => {
      // eslint-disable-next-line no-restricted-globals
    if (!confirm('Are you sure you want to delete this holiday?')) {
      return;
    }
    
    try {
      await attendanceService.deleteHoliday(id);
      // Reload holidays
      loadHolidays();
    } catch (err) {
      console.error('Error deleting holiday:', err);
      setError('Failed to delete holiday. Please try again.');
    }
  };

  // Handle file selection for upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setHolidayFile(e.target.files[0]);
      setError(null);
      setUploadResult(null);
    }
  };

  // Handle uploading holidays Excel file
  const handleUploadHolidays = async () => {
    if (!holidayFile) {
      setError('Please select a file to upload');
      return;
    }
    
    setIsUploading(true);
    setError(null);
    
    try {
      const result = await attendanceService.uploadHolidayList(holidayFile);
      setUploadResult(result);
      setHolidayFile(null);
      
      // If successful, reload holidays
      if (result.processed > 0) {
        loadHolidays();
      }
    } catch (err) {
      console.error('Error uploading holidays:', err);
      setError('Failed to upload holidays. Please check your file format and try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Download holiday template
  const downloadTemplate = async () => {
    try {
      const templateBlob = await attendanceService.downloadHolidayTemplate();
      
      // Create download link
      const url = window.URL.createObjectURL(templateBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'holiday_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error downloading template:', err);
      setError('Failed to download template. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center">
          <h2 className="text-lg font-medium">Holiday Management</h2>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="ml-4 border-gray-300 rounded-md text-sm"
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setShowAddForm(true);
              setUploadMode(false);
              setError(null);
            }}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Holiday
          </button>
          <button
            onClick={() => {
              setUploadMode(true);
              setShowAddForm(false);
              setError(null);
            }}
            className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Calendar className="w-4 h-4 mr-1" />
            Upload List
          </button>
        </div>
      </div>
      
      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <ErrorMessage message={error} />
        </div>
      )}
      
      {/* Add Holiday Form */}
      {showAddForm && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-md font-medium mb-3">Add New Holiday</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={newHoliday.date}
                onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Holiday Name
              </label>
              <input
                type="text"
                value={newHoliday.name}
                onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="e.g. New Year's Day"
              />
            </div>
            <div className="flex items-end">
              <div className="flex items-center h-10">
                <input
                  id="recurring"
                  type="checkbox"
                  checked={newHoliday.isRecurringYearly}
                  onChange={(e) => setNewHoliday({ ...newHoliday, isRecurringYearly: e.target.checked })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="recurring" className="ml-2 block text-sm text-gray-700">
                  Recurring Yearly
                </label>
              </div>
              <button
                onClick={handleAddHoliday}
                disabled={isAdding}
                className={`ml-auto px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                  isAdding
                    ? 'bg-indigo-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {isAdding ? (
                  <>
                    <LoadingSpinner size="small" />
                    <span className="ml-2">Adding...</span>
                  </>
                ) : (
                  'Add Holiday'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Upload Holidays Form */}
      {uploadMode && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-md font-medium mb-3">Upload Holiday List</h3>
          
          <div className="mb-3">
            <p className="text-sm text-gray-600">
              Upload an Excel file containing holidays. The file should include dates and holiday names.
            </p>
            <button
              onClick={downloadTemplate}
              className="mt-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium inline-flex items-center"
            >
              <Download className="w-4 h-4 mr-1" />
              Download Template
            </button>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Holiday List (Excel)
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".xlsx,.xls"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>
            <button
              onClick={handleUploadHolidays}
              disabled={!holidayFile || isUploading}
              className={`px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                !holidayFile || isUploading
                  ? 'bg-indigo-300 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isUploading ? (
                <>
                  <LoadingSpinner size="small" />
                  <span className="ml-2">Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </>
              )}
            </button>
          </div>
          
          {uploadResult && (
            <div className="mt-4 p-3 bg-gray-100 rounded-md">
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-2" />
                <div>
                  <p className="text-gray-900">
                    Successfully processed {uploadResult.processed} holidays.
                  </p>
                  
                  {uploadResult.errors.length > 0 && (
                    <div className="mt-2">
                      <p className="text-red-600">{uploadResult.errors.length} errors:</p>
                      <ul className="list-disc pl-5 mt-1 text-sm text-red-600">
                        {uploadResult.errors.slice(0, 3).map((err, index) => (
                          <li key={index}>{err.message || JSON.stringify(err)}</li>
                        ))}
                        {uploadResult.errors.length > 3 && (
                          <li>...and {uploadResult.errors.length - 3} more</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Holiday List */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex justify-center p-10">
            <LoadingSpinner size="medium" />
            <span className="ml-2">Loading holidays...</span>
          </div>
        ) : holidays.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Holiday
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recurring
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {holidays.map(holiday => (
                <tr key={holiday.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(holiday.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {holiday.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {holiday.isRecurringYearly ? 'Yes' : 'No'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    <button 
                      className="text-red-600 hover:text-red-900 inline-flex items-center"
                      onClick={() => handleDeleteHoliday(holiday.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-10 text-gray-500">
            <Calendar className="w-10 h-10 mx-auto text-gray-400 mb-2" />
            <p className="mb-1">No holidays defined for {selectedYear}.</p>
            <p className="text-sm">
              Click "Add Holiday" to add individual holidays or "Upload List" to import multiple holidays.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HolidayManagement;