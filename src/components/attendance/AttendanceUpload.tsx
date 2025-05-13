import React, { useState } from 'react';
import { Upload, FileUp, Download, CheckCircle, XCircle } from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';
import attendanceService from '../../services/attendanceService';

/**
 * Component to handle bulk upload of attendance data via Excel
 */
const AttendanceUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ processed: number; errors: any[] } | null>(null);
  const [templateDownloading, setTemplateDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validate file type
      if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
        setError('Please select an Excel file (.xlsx or .xls)');
        return;
      }
      
      setFile(selectedFile);
      setError(null);
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    
    setUploading(true);
    setError(null);
    
    try {
      const result = await attendanceService.uploadAttendanceExcel(file);
      setResult(result);
    } catch (err) {
      console.error('Error uploading attendance data:', err);
      setError('Failed to upload attendance data. Please check your file format and try again.');
    } finally {
      setUploading(false);
    }
  };

  // Download Excel template
  const downloadTemplate = async () => {
    setTemplateDownloading(true);
    
    try {
      const templateBlob = await attendanceService.downloadAttendanceTemplate();
      
      // Create download link
      const url = window.URL.createObjectURL(templateBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'attendance_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error downloading template:', err);
      setError('Failed to download template. Please try again.');
    } finally {
      setTemplateDownloading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-medium mb-4">Bulk Attendance Upload</h2>
      
      <div className="mb-6">
        <p className="text-gray-600 mb-3">
          Upload an Excel file to update attendance records for multiple employees at once.
          The file should include employee IDs, dates, and attendance statuses.
        </p>
        
        <button
          onClick={downloadTemplate}
          disabled={templateDownloading}
          className="inline-flex items-center text-indigo-600 hover:text-indigo-800 text-sm font-medium"
        >
          <Download className="w-4 h-4 mr-1" />
          {templateDownloading ? 'Downloading...' : 'Download Template'}
        </button>
      </div>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6">
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
        />
        
        <div className="flex flex-col items-center justify-center">
          <Upload className="w-10 h-10 text-gray-400 mb-3" />
          <label
            htmlFor="file-upload"
            className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <FileUp className="w-4 h-4 mr-2" />
            Select Excel File
          </label>
          
          {file && (
            <p className="mt-4 text-sm text-gray-600">
              Selected: <span className="font-medium">{file.name}</span> ({(file.size / 1024).toFixed(1)} KB)
            </p>
          )}
          
          {error && (
            <p className="mt-2 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>
      </div>
      
      <div className="flex justify-center">
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            !file || uploading
              ? 'bg-indigo-300 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
          }`}
        >
          {uploading ? (
            <>
              <LoadingSpinner size="small" />
              <span className="ml-2">Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Upload Attendance Data
            </>
          )}
        </button>
      </div>
      
      {result && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-start">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-2" />
            <div>
              <h3 className="text-green-800 font-medium">Upload Complete</h3>
              <p className="text-green-700 text-sm">
                Successfully processed {result.processed} attendance records.
              </p>
              
              {result.errors.length > 0 && (
                <div className="mt-4 p-3 bg-red-50 rounded-md">
                  <div className="flex items-start">
                    <XCircle className="w-5 h-5 text-red-500 mt-0.5 mr-2" />
                    <div>
                      <p className="text-red-700 font-medium">{result.errors.length} errors encountered:</p>
                      <ul className="list-disc pl-5 mt-1 text-sm text-red-600">
                        {result.errors.slice(0, 5).map((err, index) => (
                          <li key={index}>{err.message || JSON.stringify(err)}</li>
                        ))}
                        {result.errors.length > 5 && (
                          <li>...and {result.errors.length - 5} more errors</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceUpload;