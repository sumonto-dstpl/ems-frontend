import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { ChevronDown, ChevronUp, Lock, Clock } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { fetchAllActivityLogs } from '../../store/slices/activityLogSlice';
import { ActivityLog, PastEntryDisplay } from '../../types/activityLog';
import LoadingState from '../LoadingState';

interface PastEntriesProps {
  onEntrySelect?: (date: Date) => void;
}

const PastEntries: React.FC<PastEntriesProps> = ({ onEntrySelect }) => {
  const dispatch = useDispatch();
  const { activityLogs, loading } = useSelector((state: RootState) => state.activityLog);
  
  const [viewingAll, setViewingAll] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<PastEntryDisplay | null>(null);
  const [displayEntries, setDisplayEntries] = useState<PastEntryDisplay[]>([]);

  // Transform API entries to display format
  useEffect(() => {
    if (activityLogs.length > 0) {
      const transformedEntries: PastEntryDisplay[] = activityLogs
        .filter(entry => entry.status === 'SUBMITTED' || entry.status === 'APPROVED')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Sort newest first
        .map((entry) => {
          // Calculate description based on entry content
          let description = '';
          const taskLines = entry.tasks.split('\n').filter(line => line.trim().length > 0);
          
          if (taskLines.length > 0) {
            description = `${taskLines.length} task${taskLines.length > 1 ? 's' : ''} completed`;
          }
          
          if (entry.blockers && entry.blockers.trim().length > 0) {
            const blockerCount = entry.blockers
              .split('\n')
              .filter(line => line.trim().length > 0).length;
            
            if (description) {
              description += ', ';
            }
            
            description += `${blockerCount} blocker${blockerCount > 1 ? 's' : ''} reported`;
          }
          
          if (!description) {
            description = 'Entry completed';
          }
          
          return {
            id: entry.id,
            date: format(new Date(entry.date), 'MMMM d, yyyy'),
            status: (entry.hoursSpent ?? 0) >= 8 ? 'Complete' : 'Partial',
            hours: entry.hoursSpent ?? 0 ,
            description,
            originalEntry: entry
          };
        });
        
      setDisplayEntries(transformedEntries);
    }
  }, [activityLogs]);

  // Handle view toggle for showing more/less entries
  const handleViewToggle = () => {
    setViewingAll(!viewingAll);
  };
  
  // Handle entry click to view details
  const handleEntryClick = (entry: PastEntryDisplay) => {
    setSelectedEntry(entry);
    
    if (onEntrySelect) {
      // Parse the date from the original entry and pass it to the parent component
      const entryDate = parseISO(entry.originalEntry.date);
      onEntrySelect(entryDate);
    }
  };

  // Determine how many entries to show
  const visibleEntries = viewingAll 
    ? displayEntries 
    : displayEntries.slice(0, Math.min(4, displayEntries.length));

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-gray-800">Past Entries</h3>
        {displayEntries.length > 0 && (
          <span className="text-xs text-gray-500">{displayEntries.length} entries</span>
        )}
      </div>
      
      <LoadingState loading={loading} spinnerSize="small" message="Loading past entries...">
        {displayEntries.length === 0 ? (
          <div className="text-center py-6 text-gray-500 border border-dashed border-gray-200 rounded-lg">
            <Clock className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p>No past entries available.</p>
            <p className="text-sm mt-1">Submit your daily reports to see them here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {visibleEntries.map((entry) => (
              <button 
                key={entry.id} 
                className={`w-full p-3 bg-white border border-gray-200 rounded-lg text-left transition hover:border-indigo-200 hover:bg-indigo-50 ${
                  selectedEntry?.id === entry.id ? 'ring-2 ring-indigo-500 bg-indigo-50' : ''
                }`}
                onClick={() => handleEntryClick(entry)}
                aria-label={`View entry from ${entry.date}`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-800">{entry.date}</span>
                  <div className="flex items-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      entry.status === 'Complete' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {entry.status}
                    </span>
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-600 flex items-center">
                  <Clock className="w-3 h-3 mr-1 text-gray-400" />
                  <span>{entry.hours} hours</span>
                  <span className="mx-2">·</span>
                  <span className="truncate">{entry.description}</span>
                </div>
              </button>
            ))}
          </div>
        )}
        
        {displayEntries.length > 4 && (
          <button 
            className="w-full mt-4 text-indigo-600 text-sm font-medium hover:text-indigo-800 flex items-center justify-center py-2 border border-transparent hover:border-indigo-200 rounded-md transition"
            onClick={handleViewToggle}
            aria-label={viewingAll ? 'View fewer past entries' : 'View more past entries'}
          >
            {viewingAll ? 'View Less' : 'View More'}
            {viewingAll ? 
              <ChevronUp className="ml-1 h-4 w-4" /> : 
              <ChevronDown className="ml-1 h-4 w-4" />
            }
          </button>
        )}
      </LoadingState>
    </div>
  );
};

export default PastEntries;