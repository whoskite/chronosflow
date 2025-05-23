"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, X, Edit, Calendar as CalendarIcon, Clock, Save, Lightbulb, StickyNote, Trash2, ChevronDown, ChevronRight, Power, ChevronLeft } from 'lucide-react';
import { useStore } from '@/lib/store/use-store';
import { TimeBlock, Task } from '@/lib/store/use-store';
import { format, addDays, subDays, isSameDay } from 'date-fns';

// Define interfaces for time block tasks and notes
interface TimeBlockTask {
  id: string;
  text: string;
  completed: boolean;
}

interface TimeBlockNote {
  id: string;
  content: string;
}

export function DailyView() {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newIdeaContent, setNewIdeaContent] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isAddingIdea, setIsAddingIdea] = useState(false);
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [editedNoteContent, setEditedNoteContent] = useState('');
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isAssignTimeBlockDialogOpen, setIsAssignTimeBlockDialogOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editedTaskTitle, setEditedTaskTitle] = useState('');
  const [selectedTimeBlockId, setSelectedTimeBlockId] = useState<string | null>(null);
  const [newTimeBlockTitle, setNewTimeBlockTitle] = useState('');
  const [newTimeBlockStartDate, setNewTimeBlockStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [newTimeBlockStartTime, setNewTimeBlockStartTime] = useState('09:00');
  const [newTimeBlockEndDate, setNewTimeBlockEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [newTimeBlockEndTime, setNewTimeBlockEndTime] = useState('10:00');
  const [newTimeBlockDescription, setNewTimeBlockDescription] = useState('');
  const [isTimeBlockDialogOpen, setIsTimeBlockDialogOpen] = useState(false);
  const [editingTimeBlockId, setEditingTimeBlockId] = useState<string | null>(null);
  const [timeBlockTasks, setTimeBlockTasks] = useState<Record<string, TimeBlockTask[]>>({});
  const [timeBlockNotes, setTimeBlockNotes] = useState<Record<string, TimeBlockNote[]>>({});
  const [newTimeBlockTask, setNewTimeBlockTask] = useState('');
  const [newTimeBlockNote, setNewTimeBlockNote] = useState('');
  const [activeTimeBlockTab, setActiveTimeBlockTab] = useState<'details' | 'tasks' | 'notes'>('details');
  const [viewingTimeBlockId, setViewingTimeBlockId] = useState<string | null>(null);
  const [isTimeBlockDetailsOpen, setIsTimeBlockDetailsOpen] = useState(false);
  const [pendingTimeBlockTasks, setPendingTimeBlockTasks] = useState<TimeBlockTask[]>([]);
  const [newPendingTask, setNewPendingTask] = useState('');
  const [isCompletedTasksVisible, setIsCompletedTasksVisible] = useState(true);
  const [isShutdownDialogOpen, setIsShutdownDialogOpen] = useState(false);
  const [shutdownReflection, setShutdownReflection] = useState('');
  const [shutdownChecklist, setShutdownChecklist] = useState({
    reviewedTasks: false,
    capturedLooseEnds: false,
    plannedTomorrow: false,
    clearMind: false
  });
  
  // Add a state variable for the selected date
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const { 
    tasks, 
    notes, 
    timeBlocks,
    addTask, 
    updateTask, 
    addNote,
    updateNote,
    addTimeBlock,
    updateTimeBlock,
    deleteTimeBlock,
    deleteTask,
    deleteNote
  } = useStore();

  // Add functions to navigate between dates
  const goToPreviousDay = () => {
    setSelectedDate(prevDate => subDays(prevDate, 1));
  };

  const goToNextDay = () => {
    setSelectedDate(prevDate => addDays(prevDate, 1));
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  // Filter time blocks for the selected date
  const timeBlocksForSelectedDate = Object.values(timeBlocks)
    .filter(timeBlock => {
      const blockDate = new Date(timeBlock.startTime);
      return isSameDay(blockDate, selectedDate);
    })
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  // Format the selected date for display
  const formattedDate = format(selectedDate, 'EEEE, MMMM d, yyyy');

  const handleAddTimeBlock = () => {
    if (newTimeBlockTitle.trim()) {
      // Parse the date strings and combine with the selected date
      const startDateTime = new Date(`${newTimeBlockStartDate}T${newTimeBlockStartTime}`);
      const endDateTime = new Date(`${newTimeBlockEndDate}T${newTimeBlockEndTime}`);
      
      // Only add if end time is after start time or if end time is midnight (00:00)
      // Special case for midnight: if end time is 00:00, it should be interpreted as end of day
      const isEndTimeMidnight = newTimeBlockEndTime === '00:00';
      
      if (endDateTime > startDateTime || isEndTimeMidnight) {
        let timeBlockId: string = editingTimeBlockId || '';
        
        // If end time is midnight, set it to 23:59:59 of the same day to avoid date change
        let adjustedEndDateTime = endDateTime;
        if (isEndTimeMidnight) {
          adjustedEndDateTime = new Date(endDateTime);
          adjustedEndDateTime.setHours(23, 59, 59);
        }
        
        if (editingTimeBlockId) {
          // Update existing time block
          updateTimeBlock(editingTimeBlockId, {
            title: newTimeBlockTitle.trim(),
            startTime: startDateTime,
            endTime: isEndTimeMidnight ? adjustedEndDateTime : endDateTime,
            description: newTimeBlockDescription.trim() || undefined
          });
        } else {
          // Add new time block
          timeBlockId = addTimeBlock({
            title: newTimeBlockTitle.trim(),
            startTime: startDateTime,
            endTime: isEndTimeMidnight ? adjustedEndDateTime : endDateTime,
            description: newTimeBlockDescription.trim() || undefined,
            status: 'planned'
          });
          
          // Initialize empty tasks and notes arrays for the new time block
          setTimeBlockTasks(prev => ({
            ...prev,
            [timeBlockId]: []
          }));
          
          setTimeBlockNotes(prev => ({
            ...prev,
            [timeBlockId]: []
          }));
          
          // Add any pending tasks to the time block
          if (pendingTimeBlockTasks.length > 0) {
            setTimeBlockTasks(prev => ({
              ...prev,
              [timeBlockId]: pendingTimeBlockTasks
            }));
            
            // Also add tasks to Today's Tasks
            pendingTimeBlockTasks.forEach(task => {
              addTask({ 
                title: task.text, 
                completed: task.completed,
                description: `From time block: ${newTimeBlockTitle.trim()}`
              });
            });
          }
        }
        
        // Reset form
        resetTimeBlockForm();
      }
    }
  };

  const handleSaveTimeBlockDetails = () => {
    if (viewingTimeBlockId && newTimeBlockTitle.trim()) {
      const startDateTime = new Date(`${newTimeBlockStartDate}T${newTimeBlockStartTime}`);
      const endDateTime = new Date(`${newTimeBlockEndDate}T${newTimeBlockEndTime}`);
      
      // Special case for midnight: if end time is 00:00, it should be interpreted as end of day
      const isEndTimeMidnight = newTimeBlockEndTime === '00:00';
      
      // Only update if end time is after start time or if end time is midnight
      if (endDateTime > startDateTime || isEndTimeMidnight) {
        // If end time is midnight, set it to 23:59:59 of the same day to avoid date change
        let adjustedEndDateTime = endDateTime;
        if (isEndTimeMidnight) {
          adjustedEndDateTime = new Date(endDateTime);
          adjustedEndDateTime.setHours(23, 59, 59);
        }
        
        const updates: Partial<TimeBlock> = {
          title: newTimeBlockTitle.trim(),
          startTime: startDateTime,
          endTime: isEndTimeMidnight ? adjustedEndDateTime : endDateTime,
          description: newTimeBlockDescription.trim() || undefined
        };
        
        updateTimeBlock(viewingTimeBlockId, updates);
      }
    }
  };

  // Handle shutdown completion
  const handleCompleteShutdown = () => {
    // Save the shutdown reflection as a note
    if (shutdownReflection.trim()) {
      addNote({ 
        content: `📝 Daily Shutdown Reflection (${format(selectedDate, 'MMM d, yyyy')}):\n\n${shutdownReflection.trim()}` 
      });
    }
    
    // Reset the shutdown dialog state
    setShutdownReflection('');
    setShutdownChecklist({
      reviewedTasks: false,
      capturedLooseEnds: false,
      plannedTomorrow: false,
      clearMind: false
    });
    
    // Close the dialog
    setIsShutdownDialogOpen(false);
  };

  // Reset the time block form
  const resetTimeBlockForm = () => {
    setNewTimeBlockTitle('');
    setNewTimeBlockStartDate(format(new Date(), 'yyyy-MM-dd'));
    setNewTimeBlockStartTime('09:00');
    setNewTimeBlockEndDate(format(new Date(), 'yyyy-MM-dd'));
    setNewTimeBlockEndTime('10:00');
    setNewTimeBlockDescription('');
    setEditingTimeBlockId(null);
    setIsTimeBlockDialogOpen(false);
    setPendingTimeBlockTasks([]);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-bold tracking-tight">{formattedDate}</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={goToPreviousDay}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={goToNextDay}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => setIsShutdownDialogOpen(true)}
          >
            <Power className="h-4 w-4" />
            <span>Shutdown</span>
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>

      <div className="flex flex-1 gap-6 h-full">
        {/* Tasks and Ideas Column */}
        <div className="w-2/3 flex flex-col gap-6">
          {/* Tasks Section */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Today&apos;s Tasks</CardTitle>
                <Button variant="ghost" size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Tasks will appear here.</p>
            </CardContent>
          </Card>

          {/* Ideas Section */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Ideas & Notes</CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm">
                    <Lightbulb className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <StickyNote className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Ideas and notes will appear here.</p>
            </CardContent>
          </Card>
        </div>

        {/* Time Blocks Column */}
        <div className="w-1/3 flex flex-col">
          <Card className="flex-1">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Time Blocks</CardTitle>
                <Button variant="ghost" size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {timeBlocksForSelectedDate.length === 0 ? (
                <p className="text-sm text-muted-foreground">No time blocks for this day. Add one to get started.</p>
              ) : (
                <div className="space-y-3">
                  {/* Time blocks will appear here */}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
