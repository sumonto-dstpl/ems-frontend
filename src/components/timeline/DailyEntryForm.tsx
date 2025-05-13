import { useState, useRef, useEffect } from 'react';
import { format, isToday } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { 
  createActivityLog, 
  updateActivityLog, 
  submitActivityLog 
} from '../../store/slices/activityLogSlice';
import { 
  FaSave, 
  FaTrashAlt, 
  FaBold, 
  FaItalic, 
  FaListUl, 
  FaListOl, 
  FaLink, 
  FaLightbulb,
  FaCheck,
  FaExclamationTriangle,
  FaTimes,
  FaEye,
  FaLock
} from 'react-icons/fa';
import { ActivityLog, ActivityLogRequest, ActivityLogType } from '../../types/activityLog';
import { Calendar, Palmtree, Home } from 'lucide-react';
import SpecialActivityIndicator from './SpecialActivityIndicator';
import timelineIntegrationService from '../../services/timelineIntegrationService';

interface FormError {
  field: string;
  message: string;
}

interface PreviewData {
  show: boolean;
  tasks: string;
  blockers: string;
  accomplishments: string;
  hoursSpent: number;
}

interface DailyEntryFormProps {
  selectedDate: Date;
  entry?: ActivityLog | null;
  isEditable: boolean;
  onDateSelect?: (date: Date) => void;
}

const emptyForm = {
  tasks: '',
  hoursSpent: 0,
  blockers: '',
  accomplishments: '',
  status: 'DRAFT' as const,
  date: ''
};

const DailyEntryForm = ({ selectedDate, entry, isEditable, onDateSelect }: DailyEntryFormProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error: reduxError } = useSelector((state: RootState) => state.activityLog);
  
  const [formData, setFormData] = useState<ActivityLogRequest>(
    entry ? {
      tasks: entry.tasks,
      hoursSpent: entry.hoursSpent,
      blockers: entry.blockers,
      accomplishments: entry.accomplishments,
      status: entry.status,
      date: entry.date
    } : { ...emptyForm, date: format(selectedDate, 'yyyy-MM-dd') }
  );
  
  // Get user ID for special day checking
  const userId = useSelector((state: RootState) => state.auth.user?.id);
  
  // Check for special days (holidays, leave) and create auto entries
  useEffect(() => {
    const checkSpecialDays = async () => {
      // Only check if there's no existing entry
      if (!entry) {
        try {
          // Check if this day requires a timeline submission
          const formattedDate = format(selectedDate, 'yyyy-MM-dd');
          const requiresSubmission = await timelineIntegrationService.requiresTimelineSubmission(
            selectedDate,
            userId ?? undefined
          );
          
          if (!requiresSubmission) {
            // Try to auto-create a special entry (holiday or leave)
            const specialEntry = await timelineIntegrationService.getOrCreateActivityLog(
              selectedDate,
              userId ?? undefined
            );
            
            // If we created a special entry, dispatch to update state
            if (specialEntry) {
              dispatch({ 
                type: 'activityLog/setCurrentActivityLog',
                payload: specialEntry 
              });
            }
          }
        } catch (error) {
          console.error('Error checking for special days:', error);
        }
      }
    };
    
    checkSpecialDays();
  }, [selectedDate, entry, dispatch, userId]);

  // Update form data when entry changes
  useEffect(() => {
    if (entry) {
      setFormData({
        tasks: entry.tasks,
        hoursSpent: entry.hoursSpent || 0,
        blockers: entry.blockers || '',
        accomplishments: entry.accomplishments || '',
        status: entry.status,
        date: entry.date
      });
    } else {
      setFormData({ ...emptyForm, date: format(selectedDate, 'yyyy-MM-dd') });
    }
  }, [entry, selectedDate]);
  
  const [errors, setErrors] = useState<FormError[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [preview, setPreview] = useState<PreviewData>({
    show: false,
    tasks: '',
    blockers: '',
    accomplishments: '',
    hoursSpent: 0
  });
  
  // Refs for text areas to apply formatting
  const tasksRef = useRef<HTMLTextAreaElement>(null);
  const blockersRef = useRef<HTMLTextAreaElement>(null);
  const accomplishmentsRef = useRef<HTMLTextAreaElement>(null);
  
  // Set last saved time from entry when it changes
  useEffect(() => {
    if (entry) {
      setLastSaved(format(new Date(entry.updatedAt), 'h:mm a'));
    }
  }, [entry]);

  // Add Redux error to local errors if present
  useEffect(() => {
    if (reduxError) {
      setErrors([{ field: 'form', message: reduxError }]);
    }
  }, [reduxError]);
  
  const applyFormatting = (type: 'bold' | 'italic' | 'ul' | 'ol' | 'link', textareaRef: React.RefObject<HTMLTextAreaElement>) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    let formattedText = '';
    
    // Get name of the textarea to update the right state
    const name = textarea.name;
    
    switch (type) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'ul':
        // Format each line with bullet
        formattedText = selectedText
          .split('\n')
          .map(line => line.trim() ? `- ${line}` : line)
          .join('\n');
        break;
      case 'ol':
        // Format each line with numbers
        formattedText = selectedText
          .split('\n')
          .map((line, index) => line.trim() ? `${index + 1}. ${line}` : line)
          .join('\n');
        break;
      case 'link':
        // Insert markdown link
        formattedText = `[${selectedText || 'Link text'}](https://example.com)`;
        break;
    }
    
    const newValue = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
    
    // Update state
    setFormData(prev => ({ ...prev, [name]: newValue }));
    
    // After state update, set focus and selection ranges
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + formattedText.length);
    }, 0);
  };
  
  const validateForm = () => {
    const newErrors: FormError[] = [];
    
    // Skip validation for auto-generated special entries
    if (entry?.type && entry.type !== ActivityLogType.REGULAR) {
      return true;
    }
    
    if (!formData.tasks || (typeof formData.tasks === 'string' && !formData.tasks.trim())) {
      newErrors.push({ field: 'tasks', message: 'Please describe your tasks' });
    }
    
    if (!formData.hoursSpent || formData.hoursSpent <= 0) {
      newErrors.push({ field: 'hoursSpent', message: 'Hours must be greater than 0' });
    } else if (formData.hoursSpent > 24) {
      newErrors.push({ field: 'hoursSpent', message: 'Hours cannot exceed 24' });
    }
    
    if (!formData.accomplishments || (typeof formData.accomplishments === 'string' && !formData.accomplishments.trim())) {
      newErrors.push({ field: 'accomplishments', message: 'Please describe your accomplishments' });
    }
    
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    setErrors(prev => prev.filter(error => error.field !== name));
  };

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    const validValue = isNaN(value) ? 0 : Math.max(0, Math.min(24, value));
    setFormData(prev => ({ ...prev, hoursSpent: validValue }));
    
    // Clear error for this field
    setErrors(prev => prev.filter(error => error.field !== 'hoursSpent'));
  };

  const handleSaveDraft = async () => {
    if (!validateForm()) return;
    
    setIsSaving(true);
    
    try {
      if (entry?.id) {
        // Update existing entry
        await dispatch(updateActivityLog({ 
          id: entry.id, 
          data: { ...formData, status: 'DRAFT' }
        }));
      } else {
        // Create new entry
        await dispatch(createActivityLog({ ...formData, status: 'DRAFT' }));
      }
      
      setLastSaved(format(new Date(), 'h:mm a'));
      
    } catch (error) {
      console.error('Error saving draft:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
      // eslint-disable-next-line no-restricted-globals
    if (confirm('Are you sure you want to discard all changes?')) {
      console.log('Discard changes');
      setFormData({
        tasks: '',
        hoursSpent: 0,
        blockers: '',
        accomplishments: '',
        status: 'DRAFT',
        date: format(selectedDate, 'yyyy-MM-dd')
      });
      setErrors([]);
    }
  };

  const handlePreview = () => {
    // If called from the read-only overlay with a past entry, don't validate
    if (!isEditable && entry) {
      // For past entries, use entry data directly
      setPreview({
        show: true,
        tasks: entry.tasks,
        blockers: entry.blockers ?? '',
        accomplishments: entry.accomplishments ?? '',
        hoursSpent: entry.hoursSpent ?? 0
      });
      return;
    }
    
    // For editable entries, validate first
    if (validateForm()) {
      console.log('Preview entry', formData);
      
      // Show the preview with form data
      setPreview({
        show: true,
        tasks: formData.tasks,
        blockers: formData.blockers?? '',
        accomplishments: formData.accomplishments ?? '',
        hoursSpent: formData.hoursSpent ?? 0,
      });
    }
  };
  
  const closePreview = () => {
    setPreview(prev => ({ ...prev, show: false }));
  };

  const handleSubmit = async () => {
    // Skip validation for special types (holidays/leave)
    const isSpecialDay = entry?.type && entry.type !== ActivityLogType.REGULAR;
    
    if (isSpecialDay || validateForm()) {
      setIsSubmitting(true);
      
      try {
        if (entry?.id) {
          // For special days, keep the same status and data
          if (isSpecialDay) {
            await dispatch(updateActivityLog({ 
              id: entry.id, 
              data: { 
                ...formData, 
                status: 'auto-submitted',
                type: entry.type  // Preserve the entry type
              }
            }));
          } else {
            // Regular day - update then submit
            await dispatch(updateActivityLog({ 
              id: entry.id, 
              data: { ...formData, status: 'SUBMITTED' }
            }));
            
            // Then change status to submitted
            await dispatch(submitActivityLog(entry.id));
          }
        } else {
          // Create a new entry
          await dispatch(createActivityLog({ 
            ...formData, 
            status: isSpecialDay ? 'auto-submitted' : 'SUBMITTED',
            ...(isSpecialDay && { type: entry?.type })  // Add type if it's a special day
          }));
        }
        
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
        }, 3000);
        
        // If there's a date selection callback, move to next date
        if (onDateSelect) {
          const nextDate = new Date(selectedDate);
          nextDate.setDate(nextDate.getDate() + 1);
          setTimeout(() => onDateSelect(nextDate), 800);
        }
      } catch (error) {
        console.error('Error submitting entry:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Render the preview modal
  const renderPreview = () => {
    if (!preview.show) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold dark:text-white">Entry Preview</h3>
            <button 
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              onClick={closePreview}
            >
              <FaTimes className="text-lg" />
            </button>
          </div>
          
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Tasks Worked On</h4>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg dark:text-white">
                {preview.tasks.split('\n').map((line, i) => <p key={i}>{line || <br />}</p>)}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Hours Spent</h4>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg dark:text-white">
                {preview.hoursSpent} hours
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Blockers & Challenges</h4>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg dark:text-white">
                {preview.blockers ? 
                  preview.blockers.split('\n').map((line, i) => <p key={i}>{line || <br />}</p>) : 
                  <p>No blockers reported</p>
                }
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Accomplishments</h4>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg dark:text-white">
                {preview.accomplishments.split('\n').map((line, i) => <p key={i}>{line || <br />}</p>)}
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button 
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg"
              onClick={closePreview}
            >
              Close Preview
            </button>
            {isEditable && (
              <button 
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                onClick={() => {
                  closePreview();
                  handleSubmit();
                }}
              >
                Submit Entry
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="lg:col-span-2">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 relative">
        {!isEditable && (
          <div className="absolute inset-0 bg-gray-100/50 dark:bg-gray-900/50 flex items-center justify-center rounded-xl z-10">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg flex flex-col items-center max-w-md">
              <FaLock className="text-3xl text-gray-500 dark:text-gray-400 mb-2" />
              <h4 className="text-lg font-medium dark:text-white mb-1">Past Entry - Read Only</h4>
              <p className="text-center text-gray-600 dark:text-gray-300 mb-4">
                This entry is from a past date and cannot be edited. Only today's entry can be modified.
              </p>
              <div className="flex space-x-2">
                <button 
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg"
                  onClick={() => entry && handlePreview()}
                  disabled={!entry}
                >
                  <FaEye className="inline mr-1" />
                  Preview Entry
                </button>
                <button 
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                  onClick={() => onDateSelect && onDateSelect(new Date())}
                >
                  Go to Today's Entry
                </button>
              </div>
            </div>
          </div>
        )}
      
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold dark:text-white">
                {isToday(selectedDate) ? "Today's Entry" : `Entry for ${format(selectedDate, 'MMM d')}`}
              </h3>
              
              {/* Show special activity indicator for holiday/leave/WFH */}
              {entry && entry.type && entry.type !== ActivityLogType.REGULAR && (
                <SpecialActivityIndicator type={entry.type} />
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{format(selectedDate, 'MMMM d, yyyy')}</p>
          </div>
          <div className="flex items-center space-x-2">
            {entry && (
              <>
                <span className="text-sm text-gray-500 dark:text-gray-400">Last updated: {lastSaved}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  entry.status === 'APPROVED' 
                    ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400' 
                    : entry.status === 'SUBMITTED' || entry.status === 'auto-submitted'
                      ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400'
                      : 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400'
                }`}>
                  {entry.status === 'APPROVED' 
                    ? 'Approved' 
                    : entry.status === 'SUBMITTED' 
                      ? 'Submitted'
                      : entry.status === 'auto-submitted'
                        ? 'Auto-Submitted'
                      : 'Draft'}
                </span>
              </>
            )}
            {!entry && isEditable && (
              <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 text-xs px-2 py-1 rounded-full">
                New Entry
              </span>
            )}
          </div>
        </div>
        
        {/* Success message */}
        {showSuccess && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 flex items-center">
            <FaCheck className="mr-2" />
            Entry submitted successfully!
          </div>
        )}
        
        {/* Error display */}
        {errors.length > 0 && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
            <div className="flex items-center mb-2">
              <FaExclamationTriangle className="mr-2" />
              <span className="font-medium">Please fix the following errors:</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {errors.map((error, index) => (
                <li key={index}>{error.message}</li>
              ))}
            </ul>
          </div>
        )}
            
        {/* Special day notification */}
        {entry?.type && entry.type !== ActivityLogType.REGULAR && (
          <div className="mb-6 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center mb-2">
              {entry.type === ActivityLogType.HOLIDAY && (
                <>
                  <Calendar className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white">Holiday</h3>
                </>
              )}
              {entry.type === ActivityLogType.LEAVE && (
                <>
                  <Palmtree className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white">Leave Day</h3>
                </>
              )}
              {entry.type === ActivityLogType.WFH && (
                <>
                  <Home className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white">Working From Home</h3>
                </>
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              {entry.type === ActivityLogType.HOLIDAY && 'This is a holiday. No timeline submission is required.'}
              {entry.type === ActivityLogType.LEAVE && 'You are on leave today. No timeline submission is required.'}
              {entry.type === ActivityLogType.WFH && 'You are working from home today. This entry has been automatically created.'}
            </p>
          </div>
        )}
      
        {/* Tasks Worked On - Only show when not a special day or is WFH */}
        {(!entry?.type || entry.type === ActivityLogType.REGULAR || entry.type === ActivityLogType.WFH) && (
          <div className="mb-6">
            <label htmlFor="tasks" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tasks Worked On</label>
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-1 bg-white dark:bg-gray-700">
              <div className="flex border-b border-gray-200 dark:border-gray-600 p-1">
                <button 
                  type="button"
                  onClick={() => applyFormatting('bold', tasksRef)}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded disabled:opacity-50"
                  title="Bold"
                  disabled={!isEditable}
                >
                  <FaBold />
                </button>
              <button 
                type="button"
                onClick={() => applyFormatting('italic', tasksRef)}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded disabled:opacity-50"
                title="Italic"
                disabled={!isEditable}
              >
                <FaItalic />
              </button>
              <button 
                type="button"
                onClick={() => applyFormatting('ul', tasksRef)}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded disabled:opacity-50"
                title="Bullet List"
                disabled={!isEditable}
              >
                <FaListUl />
              </button>
              <button 
                type="button"
                onClick={() => applyFormatting('ol', tasksRef)}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded disabled:opacity-50"
                title="Numbered List"
                disabled={!isEditable}
              >
                <FaListOl />
              </button>
              <button 
                type="button"
                onClick={() => applyFormatting('link', tasksRef)}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded disabled:opacity-50"
                title="Add Link"
                disabled={!isEditable}
              >
                <FaLink />
              </button>
            </div>
            <textarea 
              ref={tasksRef}
              name="tasks"
              id="tasks"
              className="w-full p-3 focus:outline-none dark:bg-gray-700 dark:text-white" 
              rows={4} 
              placeholder="Describe the tasks you worked on today..."
              value={formData.tasks}
              onChange={handleInputChange}
              disabled={!isEditable}
            />
          </div>
        </div>
        )}
        {/* Hours Spent */}
        
        <div className="mb-6">
          <label htmlFor="hoursSpent" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Hours Spent</label>
          <div className="flex items-center">
            <input 
              type="number" 
              id="hoursSpent"
              name="hoursSpent"
              className="block w-24 rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white" 
              min="0" 
              max="24" 
              step="0.25"
              value={formData.hoursSpent}
              onChange={handleHoursChange}
              disabled={!isEditable}
            />
            <span className="ml-2 text-gray-700 dark:text-gray-300">hours</span>
          </div>
        </div>
            
        {/* Blockers & Challenges */}
        <div className="mb-6">
          <label htmlFor="blockers" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Blockers & Challenges (Optional)</label>
          <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-1 bg-white dark:bg-gray-700">
            <div className="flex border-b border-gray-200 dark:border-gray-600 p-1">
              <button 
                type="button"
                onClick={() => applyFormatting('bold', blockersRef)}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded disabled:opacity-50"
                disabled={!isEditable}
              >
                <FaBold />
              </button>
              <button 
                type="button"
                onClick={() => applyFormatting('italic', blockersRef)}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded disabled:opacity-50"
                disabled={!isEditable}
              >
                <FaItalic />
              </button>
              <button 
                type="button"
                onClick={() => applyFormatting('ul', blockersRef)}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded disabled:opacity-50"
                disabled={!isEditable}
              >
                <FaListUl />
              </button>
              <button 
                type="button"
                onClick={() => applyFormatting('ol', blockersRef)}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded disabled:opacity-50"
                disabled={!isEditable}
              >
                <FaListOl />
              </button>
            </div>
            <textarea 
              ref={blockersRef}
              name="blockers"
              id="blockers"
              className="w-full p-3 focus:outline-none dark:bg-gray-700 dark:text-white" 
              rows={3} 
              placeholder="Describe any challenges or blockers you encountered..."
              value={formData.blockers}
              onChange={handleInputChange}
              disabled={!isEditable}
            />
          </div>
        </div>
            
        {/* Accomplishments */}
        <div className="mb-6">
          <label htmlFor="accomplishments" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Accomplishments</label>
          <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-1 bg-white dark:bg-gray-700">
            <div className="flex border-b border-gray-200 dark:border-gray-600 p-1">
              <button 
                type="button"
                onClick={() => applyFormatting('bold', accomplishmentsRef)}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded disabled:opacity-50"
                disabled={!isEditable}
              >
                <FaBold />
              </button>
              <button 
                type="button"
                onClick={() => applyFormatting('italic', accomplishmentsRef)}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded disabled:opacity-50"
                disabled={!isEditable}
              >
                <FaItalic />
              </button>
              <button 
                type="button"
                onClick={() => applyFormatting('ul', accomplishmentsRef)}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded disabled:opacity-50"
                disabled={!isEditable}
              >
                <FaListUl />
              </button>
              <button 
                type="button"
                onClick={() => applyFormatting('ol', accomplishmentsRef)}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded disabled:opacity-50"
                disabled={!isEditable}
              >
                <FaListOl />
              </button>
            </div>
            <textarea 
              ref={accomplishmentsRef}
              name="accomplishments"
              id="accomplishments"
              className="w-full p-3 focus:outline-none dark:bg-gray-700 dark:text-white" 
              rows={3} 
              placeholder="Describe what you accomplished today..."
              value={formData.accomplishments}
              onChange={handleInputChange}
              disabled={!isEditable}
            />
          </div>
          <div className="mt-1 flex items-center text-sm text-yellow-500 dark:text-yellow-400">
            <FaLightbulb className="mr-1" />
            <span>Be specific about your achievements and outcomes</span>
          </div>
        </div>
            
        {/* Action Buttons */}
        {isEditable && (
          <div className="flex justify-between">
            <div>
              {/* Only show discard for non-special days or WFH days */}
              {(!entry?.type || entry.type === ActivityLogType.REGULAR || entry.type === ActivityLogType.WFH) && (
                <button 
                  type="button" 
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg mr-2"
                  onClick={handleDiscard}
                >
                  <FaTrashAlt className="inline mr-1" />
                  Discard
                </button>
              )}
            </div>
            <div className="space-x-2">
              {/* Preview for all types of entries */}
              <button 
                type="button" 
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg"
                onClick={handlePreview}
              >
                <FaEye className="inline mr-1" />
                Preview
              </button>
              
              {/* Only show save draft for regular or WFH entries */}
              {(!entry?.type || entry.type === ActivityLogType.REGULAR || entry.type === ActivityLogType.WFH) && (
                <button 
                  type="button" 
                  className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg"
                  onClick={handleSaveDraft}
                  disabled={isSaving || loading}
                >
                  <FaSave className="inline mr-1" />
                  {isSaving ? 'Saving...' : 'Save Draft'}
                </button>
              )}
              
              {/* Submit button - different for different types */}
              {entry?.type && (entry.type === ActivityLogType.HOLIDAY || entry.type === ActivityLogType.LEAVE) ? (
                <button 
                  type="button" 
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                  onClick={handleSubmit}
                  disabled={isSubmitting || loading}
                >
                  <FaCheck className="inline mr-1" />
                  {isSubmitting ? 'Processing...' : 'Confirm Day Off'}
                </button>
              ) : (
                <button 
                  type="button" 
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                  onClick={handleSubmit}
                  disabled={isSubmitting || loading}
                >
                  <FaCheck className="inline mr-1" />
                  {isSubmitting ? 'Submitting...' : 'Submit Entry'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Render the preview modal */}
      {renderPreview()}
    </div>
  );
};

export default DailyEntryForm;