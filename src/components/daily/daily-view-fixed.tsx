"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ChevronLeft, ChevronRight, Power, Lightbulb, StickyNote } from 'lucide-react';
import { useStore } from '@/lib/store/use-store';
import { TimeBlock } from '@/lib/store/use-store';
import { format, addDays, subDays, isSameDay } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

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

  // Add state for pending notes
  const [pendingTimeBlockNotes, setPendingTimeBlockNotes] = useState<TimeBlockNote[]>([]);

  // Add state for note selection
  const [isSelectingNote, setIsSelectingNote] = useState(false);
  const [selectedNotesForTimeBlock, setSelectedNotesForTimeBlock] = useState<string[]>([]);
  const [noteSearchQuery, setNoteSearchQuery] = useState('');

  const { 
    timeBlocks,
    addTask, 
    addNote,
    addTimeBlock,
    updateTimeBlock,
    deleteTimeBlock,
    tasks,
    updateTask,
    deleteTask,
    notes
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

  // Filter tasks for the selected date
  const tasksForSelectedDate = Object.values(tasks)
    .filter(task => {
      // If the task has a dueDate, check if it matches the selected date
      if (task.dueDate) {
        return isSameDay(new Date(task.dueDate), selectedDate);
      }
      // Otherwise, include tasks without a due date on today's view
      return isSameDay(new Date(), selectedDate);
    })
    .sort((a, b) => {
      // Sort by completion status first
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      // Then sort by creation date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  // Get notes sorted by creation date (newest first)
  const sortedNotes = Object.values(notes)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Format the selected date for display
  const formattedDate = format(selectedDate, 'EEEE, MMMM d, yyyy');

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
    setPendingTimeBlockNotes([]);
  };

  // Handle adding a task
  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      addTask({ title: newTaskTitle.trim(), completed: false });
      setNewTaskTitle('');
      // Don't close the dialog automatically to allow for multiple task additions
      // Only close if explicitly called from the dialog
      if (isAddingTask) {
        setIsAddingTask(false);
      }
    }
  };

  // Handle adding a note
  const handleAddNote = () => {
    if (newNoteContent.trim()) {
      addNote({ content: newNoteContent.trim() });
      setNewNoteContent('');
      setIsAddingNote(false);
    }
  };

  // Handle adding an idea
  const handleAddIdea = () => {
    if (newIdeaContent.trim()) {
      addNote({ content: `💡 ${newIdeaContent.trim()}` });
      setNewIdeaContent('');
      setIsAddingIdea(false);
    }
  };

  const handleAddTimeBlock = () => {
    if (newTimeBlockTitle.trim()) {
      const startDateTime = new Date(`${newTimeBlockStartDate}T${newTimeBlockStartTime}`);
      const endDateTime = new Date(`${newTimeBlockEndDate}T${newTimeBlockEndTime}`);
      
      // Check if end time is midnight (00:00)
      const isEndTimeMidnight = newTimeBlockEndTime === '00:00';
      
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
      }
      
      // Add task if provided
      if (newTimeBlockTask.trim()) {
        // Create a new task for the time block
        const newTask: TimeBlockTask = {
          id: Math.random().toString(36).substring(2, 9),
          text: newTimeBlockTask.trim(),
          completed: false
        };
        
        // Add to time block tasks
        setTimeBlockTasks(prev => ({
          ...prev,
          [timeBlockId]: [...(prev[timeBlockId] || []), newTask]
        }));
        
        // Also add to Today's Tasks
        addTask({ 
          title: newTimeBlockTask.trim(), 
          completed: false,
          description: `From time block: ${newTimeBlockTitle.trim()}`
        });
        
        // Reset the task field
        setNewTimeBlockTask('');
      }
      
      // Add all pending tasks
      if (pendingTimeBlockTasks.length > 0) {
        // Add each pending task to time block tasks and Today's Tasks
        pendingTimeBlockTasks.forEach(task => {
          // Add to time block tasks
          setTimeBlockTasks(prev => ({
            ...prev,
            [timeBlockId]: [...(prev[timeBlockId] || []), task]
          }));
          
          // Also add to Today's Tasks
          addTask({ 
            title: task.text, 
            completed: false,
            description: `From time block: ${newTimeBlockTitle.trim()}`
          });
        });
        
        // Clear pending tasks
        setPendingTimeBlockTasks([]);
      }
      
      // Reset form and close dialog
      setNewTimeBlockTitle('');
      setNewTimeBlockStartDate(format(new Date(), 'yyyy-MM-dd'));
      setNewTimeBlockStartTime('09:00');
      setNewTimeBlockEndDate(format(new Date(), 'yyyy-MM-dd'));
      setNewTimeBlockEndTime('10:00');
      setNewTimeBlockDescription('');
      setEditingTimeBlockId(null);
      setIsTimeBlockDialogOpen(false);
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

  // Function to handle editing a time block
  const handleEditTimeBlock = (timeBlockId: string) => {
    const timeBlock = timeBlocks[timeBlockId];
    if (timeBlock) {
      setNewTimeBlockTitle(timeBlock.title);
      setNewTimeBlockStartDate(format(new Date(timeBlock.startTime), 'yyyy-MM-dd'));
      setNewTimeBlockStartTime(format(new Date(timeBlock.startTime), 'HH:mm'));
      setNewTimeBlockEndDate(format(new Date(timeBlock.endTime), 'yyyy-MM-dd'));
      setNewTimeBlockEndTime(format(new Date(timeBlock.endTime), 'HH:mm'));
      setNewTimeBlockDescription(timeBlock.description || '');
      setEditingTimeBlockId(timeBlockId);
      
      // Find any tasks associated with this time block in the main tasks list
      const associatedTasks = Object.values(tasks).filter(task => 
        task.description === `From time block: ${timeBlock.title}`
      );
      
      // If found, set them as pending tasks for editing
      if (associatedTasks.length > 0) {
        setPendingTimeBlockTasks(
          associatedTasks.map(task => ({
            id: task.id,
            text: task.title,
            completed: task.completed
          }))
        );
        setNewTimeBlockTask('');
      } else {
        setPendingTimeBlockTasks([]);
        setNewTimeBlockTask('');
      }
      
      // Find any notes associated with this time block
      const blockNotes = timeBlockNotes[timeBlockId] || [];
      if (blockNotes.length > 0) {
        setPendingTimeBlockNotes(blockNotes);
      } else {
        setPendingTimeBlockNotes([]);
      }
      setNewTimeBlockNote('');
      
      setIsTimeBlockDialogOpen(true);
    }
  };

  // Handle deleting a time block and all its associated tasks
  const handleDeleteTimeBlock = (timeBlockId: string) => {
    // Get the time block before deleting it
    const timeBlock = timeBlocks[timeBlockId];
    
    if (timeBlock) {
      // Find all tasks in the main tasks list that are associated with this time block
      const associatedTasks = Object.values(tasks).filter(task => 
        task.description === `From time block: ${timeBlock.title}`
      );
      
      // Delete each associated task from the main tasks list
      associatedTasks.forEach(task => {
        deleteTask(task.id);
      });
      
      // Delete the time block
      deleteTimeBlock(timeBlockId);
      
      // Clean up the time block tasks state
      setTimeBlockTasks(prev => {
        const newState = { ...prev };
        delete newState[timeBlockId];
        return newState;
      });
      
      // Clean up the time block notes state
      setTimeBlockNotes(prev => {
        const newState = { ...prev };
        delete newState[timeBlockId];
        return newState;
      });
      
      // Close the time block dialog
      setIsTimeBlockDialogOpen(false);
    }
  };

  // Add the newTaskCompleted state
  const [newTaskCompleted, setNewTaskCompleted] = useState(false);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6 sticky top-0 bg-background z-30 py-4 border-b">
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
              <Button onClick={() => setIsAddingTask(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Item
                </Button>
        </div>
      </div>

      <div className="flex flex-1 gap-6 h-full overflow-y-auto">
        {/* Tasks and Ideas Column */}
        <div className="w-2/3 flex flex-col gap-6">
          {/* Tasks Section */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Today&apos;s Tasks</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setIsAddingTask(true)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {tasksForSelectedDate.length === 0 ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">No tasks for today. Add one to get started.</p>
                  
                  {/* Inline task input field */}
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <div className="flex items-center w-full relative">
                      <input
                        className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Type a task and press Enter to add..."
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newTaskTitle.trim()) {
                            handleAddTask();
                          }
                        }}
                      />
                      <Plus className="h-4 w-4 absolute left-3 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    {/* Active (uncompleted) tasks */}
                    {tasksForSelectedDate
                      .filter(task => !task.completed)
                      .map((task) => (
                        <div key={task.id} className="flex items-start gap-2 py-1 group">
                          <Checkbox 
                            id={`task-${task.id}`} 
                            checked={task.completed}
                            onCheckedChange={(checked) => {
                              // Add animation class before updating state
                              const taskElement = document.getElementById(`task-${task.id}`);
                              if (taskElement && taskElement.parentElement) {
                                if (checked) {
                                  taskElement.parentElement.classList.add('task-complete-animation');
                                  // Wait for animation to complete before updating state
                                  setTimeout(() => {
                                    updateTask(task.id, { completed: !!checked });
                                  }, 300);
                                } else {
                                  updateTask(task.id, { completed: !!checked });
                                }
                              } else {
                                updateTask(task.id, { completed: !!checked });
                              }
                            }}
                          />
                          <label 
                            htmlFor={`task-${task.id}`}
                            className="text-sm flex-1"
                          >
                            {task.title}
                          </label>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => {
                              // Add delete animation
                              const taskElement = document.getElementById(`task-${task.id}`);
                              if (taskElement && taskElement.parentElement) {
                                taskElement.parentElement.classList.add('task-delete-animation');
                                // Wait for animation to complete before removing
                                setTimeout(() => {
                                  // Remove the task
                                  const updatedTasks = { ...tasks };
                                  delete updatedTasks[task.id];
                                  useStore.setState({ tasks: updatedTasks });
                                }, 300);
                              } else {
                                // Remove immediately if animation fails
                                const updatedTasks = { ...tasks };
                                delete updatedTasks[task.id];
                                useStore.setState({ tasks: updatedTasks });
                              }
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                          </Button>
                        </div>
                      ))}
                  </div>
                  
                  {/* Completed tasks section */}
                  {tasksForSelectedDate.some(task => task.completed) && (
                    <div className="pt-2 border-t">
                      <div 
                        className="flex items-center gap-2 cursor-pointer py-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => setIsCompletedTasksVisible(!isCompletedTasksVisible)}
                      >
                        <div className={`transform transition-transform duration-200 ${isCompletedTasksVisible ? 'rotate-90' : ''}`}>
                          <ChevronRight className="h-4 w-4" />
                        </div>
                        <span>Completed</span>
                        <span className="text-xs bg-muted rounded-full px-2 py-0.5">
                          {tasksForSelectedDate.filter(task => task.completed).length}
                        </span>
                      </div>
                      
                      <div 
                        className={`space-y-2 overflow-hidden transition-all duration-300 ease-in-out ${
                          isCompletedTasksVisible 
                            ? 'max-h-[500px] opacity-100 mt-2' 
                            : 'max-h-0 opacity-0'
                        }`}
                      >
                        {tasksForSelectedDate
                          .filter(task => task.completed)
                          .map((task) => (
                            <div key={task.id} className="flex items-start gap-2 py-1 pl-6 group">
                              <Checkbox 
                                id={`task-${task.id}`} 
                                checked={task.completed}
                                onCheckedChange={(checked) => {
                                  // Add animation class before updating state
                                  const taskElement = document.getElementById(`task-${task.id}`);
                                  if (taskElement && taskElement.parentElement) {
                                    if (!checked) {
                                      taskElement.parentElement.classList.add('task-uncomplete-animation');
                                      // Wait for animation to complete before updating state
                                      setTimeout(() => {
                                        updateTask(task.id, { completed: !!checked });
                                      }, 300);
                                    } else {
                                      updateTask(task.id, { completed: !!checked });
                                    }
                                  } else {
                                    updateTask(task.id, { completed: !!checked });
                                  }
                                }}
                              />
                              <label 
                                htmlFor={`task-${task.id}`}
                                className="text-sm flex-1 line-through text-muted-foreground"
                              >
                                {task.title}
                              </label>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => {
                                  // Add delete animation
                                  const taskElement = document.getElementById(`task-${task.id}`);
                                  if (taskElement && taskElement.parentElement) {
                                    taskElement.parentElement.classList.add('task-delete-animation');
                                    // Wait for animation to complete before removing
                                    setTimeout(() => {
                                      // Remove the task
                                      const updatedTasks = { ...tasks };
                                      delete updatedTasks[task.id];
                                      useStore.setState({ tasks: updatedTasks });
                                    }, 300);
                                  } else {
                                    // Remove immediately if animation fails
                                    const updatedTasks = { ...tasks };
                                    delete updatedTasks[task.id];
                                    useStore.setState({ tasks: updatedTasks });
                                  }
                                }}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                              </Button>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Inline task input field */}
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <div className="flex items-center w-full relative">
                      <input
                        className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Type a task and press Enter to add..."
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newTaskTitle.trim()) {
                            handleAddTask();
                          }
                        }}
                      />
                      <Plus className="h-4 w-4 absolute left-3 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ideas Section */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Ideas & Notes</CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setIsAddingIdea(true)}>
                    <Lightbulb className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setIsAddingNote(true)}>
                    <StickyNote className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {sortedNotes.length === 0 ? (
                <p className="text-sm text-muted-foreground">Ideas and notes will appear here.</p>
              ) : (
                <div className="space-y-4">
                  {sortedNotes.map((note) => (
                    <div 
                      key={note.id} 
                      className="p-3 rounded-md border border-border bg-card hover:bg-accent/10"
                    >
                      <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {format(new Date(note.createdAt), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Time Blocks Column */}
        <div className="w-1/3 flex flex-col">
          <Card className="flex-1 overflow-hidden">
            <CardHeader className="pb-2 sticky top-0 bg-card z-20 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Time Blocks</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setIsTimeBlockDialogOpen(true)}>
                      <Plus className="h-4 w-4" />
                    </Button>
              </div>
            </CardHeader>
            <CardContent 
              className="space-y-2 overflow-y-auto pr-1 custom-scrollbar" 
              style={{ 
                maxHeight: 'calc(100vh - 12rem)',
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(155, 155, 155, 0.5) transparent'
              }}
            >
              {timeBlocksForSelectedDate.length === 0 && (
                <p className="text-sm text-muted-foreground mb-4">No time blocks for this day. Add one to get started.</p>
              )}
              <div className="relative pb-16">
                {/* Time markers */}
                <div className="absolute left-0 top-0 bottom-0 w-16 flex flex-col text-xs text-muted-foreground" style={{ height: '960px' }}>
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div key={i} className="h-10 flex items-start pt-0.5">
                      {i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`}
                    </div>
                  ))}
                </div>
                
                {/* Time grid */}
                <div 
                  className="ml-16 border-l border-border relative" 
                  style={{ height: '960px' }}
                >
                  {/* Clickable overlay for the entire grid */}
                  <div 
                    className="absolute inset-0 z-5 time-grid-overlay"
                    onClick={(e) => {
                      // Skip if clicking on an existing time block
                      if ((e.target as HTMLElement).closest('.time-block-item')) {
                        return;
                      }
                      
                      // Get position relative to the grid
                      const rect = e.currentTarget.getBoundingClientRect();
                      const y = e.clientY - rect.top;
                      
                      // Convert y position to time (24 hours = 960px, so 1px = 1.5 minutes)
                      const minutesSinceMidnight = Math.floor((y / 960) * 24 * 60);
                      const hours = Math.floor(minutesSinceMidnight / 60);
                      const minutes = Math.floor(minutesSinceMidnight % 60);
                      
                      // Round to nearest 15 minutes for better UX
                      const roundedMinutes = Math.round(minutes / 15) * 15;
                      const roundedHours = hours + (roundedMinutes === 60 ? 1 : 0);
                      let finalMinutes = roundedMinutes === 60 ? 0 : roundedMinutes;
                      
                      // Format the time for the form
                      const formattedHours = String(roundedHours).padStart(2, '0');
                      const formattedMinutes = String(finalMinutes).padStart(2, '0');
                      const startTime = `${formattedHours}:${formattedMinutes}`;
                      
                      // Calculate end time (1 hour later by default)
                      let endHours = roundedHours + 1;
                      if (endHours >= 24) {
                        endHours = 23;
                        finalMinutes = 59;
                      }
                      const formattedEndHours = String(endHours).padStart(2, '0');
                      const endTime = `${formattedEndHours}:${formattedMinutes}`;
                      
                      // Set form values and open dialog
                      setNewTimeBlockTitle('');
                      setNewTimeBlockStartDate(format(selectedDate, 'yyyy-MM-dd'));
                      setNewTimeBlockStartTime(startTime);
                      setNewTimeBlockEndDate(format(selectedDate, 'yyyy-MM-dd'));
                      setNewTimeBlockEndTime(endTime);
                      setNewTimeBlockDescription('');
                      setEditingTimeBlockId(null);
                      setIsTimeBlockDialogOpen(true);
                    }}
                  >
                    {/* 30-minute block grid overlay for hover effects */}
                    {Array.from({ length: 48 }).map((_, i) => {
                      const hour = Math.floor(i / 2);
                      const minute = (i % 2) * 30;
                      const timeLabel = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                      
                      return (
                        <div 
                          key={`block-${i}`} 
                          className="absolute left-0 right-0 time-block-hover-target"
                          style={{ 
                            top: `${(i * 20)}px`, 
                            height: '20px',
                          }}
                          title={`Click to create event at ${hour % 12 || 12}:${minute.toString().padStart(2, '0')} ${hour < 12 ? 'AM' : 'PM'}`}
                        ></div>
                      );
                    })}
                  </div>
                  
                  {/* Hour and half-hour grid lines */}
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div key={i} className="h-10 border-b border-border time-grid-hour">
                      {/* Half-hour marker */}
                      <div className="h-[50%] border-b border-border border-dashed opacity-50 time-grid-half-hour"></div>
                    </div>
                  ))}
                  
                  {/* Current time indicator */}
                  {isSameDay(selectedDate, new Date()) && (
                    <div 
                      className="absolute left-0 right-0 border-t-2 border-red-500 z-20"
                      style={{ 
                        top: `${(new Date().getHours() * 60 + new Date().getMinutes()) / (24 * 60) * 960}px`,
                      }}
                    >
                      <div className="absolute -left-3 -top-1.5 w-3 h-3 rounded-full bg-red-500"></div>
                    </div>
                  )}
                  
                  {/* Time blocks */}
                  <div className="absolute left-0 right-0 top-0 pb-16" style={{ height: '960px' }}>
                    {(() => {
                      // Process time blocks to handle overlaps
                      const processedBlocks = [...timeBlocksForSelectedDate].map(timeBlock => {
                        const startTime = new Date(timeBlock.startTime);
                        const endTime = new Date(timeBlock.endTime);
                        const startHour = startTime.getHours();
                        const startMinute = startTime.getMinutes();
                        const endHour = endTime.getHours();
                        const endMinute = endTime.getMinutes();
                        
                        // Calculate position and height for 24-hour view
                        // Convert time to minutes since midnight
                        const startMinutesSinceMidnight = startHour * 60 + startMinute;
                        const endMinutesSinceMidnight = endHour * 60 + endMinute;
                        
                        // Convert to pixels (960px height / 24 hours = 40px per hour = 0.67px per minute)
                        const pixelStartPosition = Math.round((startMinutesSinceMidnight / (24 * 60)) * 960);
                        const pixelEndPosition = Math.round((endMinutesSinceMidnight / (24 * 60)) * 960);
                        const height = pixelEndPosition - pixelStartPosition;
                        
                        // Generate a random pastel color based on the time block title
                        const hash = timeBlock.title.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
                        const hue = hash % 360;
                        const borderColor = `hsl(${hue}, 70%, 60%)`;
                        const bgColor = `hsl(${hue}, 70%, 95%)`;
                        
                        // Determine if this time block is happening now
                        const now = new Date();
                        const isHappeningNow = now >= startTime && now <= endTime && isSameDay(selectedDate, now);
                        
                        return {
                          ...timeBlock,
                          startTime,
                          endTime,
                          startMinutesSinceMidnight,
                          endMinutesSinceMidnight,
                          pixelStartPosition,
                          pixelEndPosition,
                          height,
                          borderColor,
                          bgColor,
                          isHappeningNow,
                          column: 0 // Default column (will be assigned during collision detection)
                        };
                      });
                      
                      // Sort blocks by start time for proper collision detection
                      processedBlocks.sort((a, b) => {
                        // First sort by start time
                        if (a.startMinutesSinceMidnight !== b.startMinutesSinceMidnight) {
                          return a.startMinutesSinceMidnight - b.startMinutesSinceMidnight;
                        }
                        // If start times are the same, sort by duration (longer blocks first)
                        return (b.endMinutesSinceMidnight - b.startMinutesSinceMidnight) - 
                               (a.endMinutesSinceMidnight - a.startMinutesSinceMidnight);
                      });
                      
                      // Improved column assignment algorithm
                      // Create an array to track the end time of the last block in each column
                      const columnEndTimes: number[] = [];
                      
                      // Assign columns to each block
                      processedBlocks.forEach(block => {
                        // Find the first column where this block doesn't overlap
                        let columnIndex = 0;
                        let foundColumn = false;
                        
                        while (!foundColumn) {
                          // If we don't have this column yet or the column is free at this time
                          // (meaning the last block in this column ends before or exactly when this block starts)
                          if (columnEndTimes[columnIndex] === undefined || 
                              columnEndTimes[columnIndex] <= block.startMinutesSinceMidnight) {
                            // Assign this column to the block
                            block.column = columnIndex;
                            // Update the end time for this column
                            columnEndTimes[columnIndex] = block.endMinutesSinceMidnight;
                            foundColumn = true;
                          } else {
                            // Try the next column
                            columnIndex++;
                          }
                        }
                      });
                      
                      // Calculate the maximum number of columns needed
                      const maxColumn = processedBlocks.length > 0 
                        ? Math.max(...processedBlocks.map(b => b.column)) 
                        : 0;
                      
                      // Render the processed blocks
                      return processedBlocks.map((block) => {
                        // Calculate column width based on the maximum number of columns
                        const columnCount = maxColumn + 1; // Add 1 because columns are 0-indexed
                        const actualColumnWidth = columnCount > 1 ? 100 / columnCount : 100;
                        
                        return (
                          <div 
                            key={block.id} 
                            className={`absolute px-2 py-1 rounded-md border border-border hover:brightness-95 cursor-pointer overflow-hidden time-block-item ${block.isHappeningNow ? 'ring-2 ring-primary ring-offset-1' : ''}`}
                            style={{ 
                              top: `${block.pixelStartPosition}px`, 
                              height: `${Math.max(block.height, 32)}px`,
                              minHeight: '32px',
                              backgroundColor: block.bgColor,
                              borderLeft: `4px solid ${block.borderColor}`,
                              zIndex: 10,
                              left: `${block.column * actualColumnWidth}%`,
                              width: `${actualColumnWidth}%`
                            }}
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent triggering the grid click
                              handleEditTimeBlock(block.id);
                            }}
                          >
                            <div className="font-medium text-sm truncate">{block.title}</div>
                            <div className="text-xs opacity-70">
                              {format(block.startTime, 'h:mm a')} - {format(block.endTime, 'h:mm a')}
                            </div>
                            {block.description && block.height > 60 && (
                              <div className="text-xs mt-1 line-clamp-2 opacity-70">{block.description}</div>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Task Dialog */}
      {isAddingTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Add Task</h3>
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="flex items-center gap-2 w-full">
                  <Checkbox 
                    id="new-task-completed"
                    checked={newTaskCompleted}
                    onCheckedChange={(checked) => {
                      setNewTaskCompleted(!!checked);
                    }}
                  />
                  <input
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Add a task for this time block"
                    value={newTimeBlockTask}
                    onChange={(e) => setNewTimeBlockTask(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newTimeBlockTask.trim()) {
                        // Add task to pending tasks
                        setPendingTimeBlockTasks(prev => [
                          ...prev, 
                          {
                            id: Math.random().toString(36).substring(2, 9),
                            text: newTimeBlockTask.trim(),
                            completed: newTaskCompleted
                          }
                        ]);
                        setNewTimeBlockTask('');
                      }
                    }}
                  />
                </div>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    if (newTimeBlockTask.trim()) {
                      // Add task to pending tasks
                      setPendingTimeBlockTasks(prev => [
                        ...prev, 
                        {
                          id: Math.random().toString(36).substring(2, 9),
                          text: newTimeBlockTask.trim(),
                          completed: newTaskCompleted
                        }
                      ]);
                      setNewTimeBlockTask('');
                    }
                  }}
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Note Dialog */}
      {isAddingNote && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Add Note</h3>
            <div className="space-y-4">
              <Textarea
                placeholder="Note content"
                className="min-h-[150px]"
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddingNote(false)}>Cancel</Button>
                <Button onClick={() => handleAddNote()}>Add Note</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Idea Dialog */}
      {isAddingIdea && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Add Idea</h3>
            <div className="space-y-4">
              <Textarea
                placeholder="Your brilliant idea..."
                className="min-h-[150px]"
                value={newIdeaContent}
                onChange={(e) => setNewIdeaContent(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddingIdea(false)}>Cancel</Button>
                <Button onClick={() => handleAddIdea()}>Add Idea</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Time Block Dialog */}
      {isTimeBlockDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">{editingTimeBlockId ? 'Edit Time Block' : 'Add Time Block'}</h3>
            <div className="space-y-4">
              <input
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Time block title" 
                value={newTimeBlockTitle}
                onChange={(e) => setNewTimeBlockTitle(e.target.value)}
              />
              <div className="space-y-1">
                <label className="text-sm font-medium">Start Time</label>
                <div className="flex gap-2">
                  <input
                    type="date" 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={newTimeBlockStartDate}
                    onChange={(e) => setNewTimeBlockStartDate(e.target.value)}
                  />
                  <input
                    type="time" 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={newTimeBlockStartTime}
                    onChange={(e) => setNewTimeBlockStartTime(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">End Time</label>
                <div className="flex gap-2">
                  <input
                    type="date" 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={newTimeBlockEndDate}
                    onChange={(e) => setNewTimeBlockEndDate(e.target.value)}
                  />
                  <input
                    type="time" 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={newTimeBlockEndTime}
                    onChange={(e) => setNewTimeBlockEndTime(e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  For midnight (12:00 AM), enter 00:00
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Description (optional)</label>
                <Textarea 
                  placeholder="Add details about this time block" 
                  value={newTimeBlockDescription}
                  onChange={(e) => setNewTimeBlockDescription(e.target.value)}
                />
              </div>
              
              {/* Task section for time block */}
              <div className="space-y-1 border p-3 rounded-md bg-muted/20">
                <label className="text-sm font-medium">Tasks for this time block</label>
                
                {/* Display pending tasks for this time block */}
                {pendingTimeBlockTasks.length > 0 && (
                  <div className="space-y-2 mt-2 mb-3">
                    {pendingTimeBlockTasks.map((task, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Checkbox 
                          id={`pending-task-${index}`}
                          checked={task.completed}
                          onCheckedChange={(checked) => {
                            setPendingTimeBlockTasks(prev => 
                              prev.map((t, i) => i === index ? { ...t, completed: !!checked } : t)
                            );
                          }}
                        />
                        <label 
                          htmlFor={`pending-task-${index}`}
                          className={`flex-1 text-sm p-2 bg-background rounded border ${task.completed ? 'line-through text-muted-foreground' : ''}`}
                        >
                          {task.text}
                        </label>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 flex-shrink-0"
                          onClick={() => {
                            setPendingTimeBlockTasks(prev => 
                              prev.filter((_, i) => i !== index)
                            );
                          }}
                          aria-label="Remove task"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex gap-2">
                  <div className="flex items-center gap-2 w-full">
                    <Checkbox 
                      id="new-task-completed"
                      checked={newTaskCompleted}
                      onCheckedChange={(checked) => {
                        setNewTaskCompleted(!!checked);
                      }}
                    />
                    <input
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Add a task for this time block"
                      value={newTimeBlockTask}
                      onChange={(e) => setNewTimeBlockTask(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newTimeBlockTask.trim()) {
                          // Add task to pending tasks
                          setPendingTimeBlockTasks(prev => [
                            ...prev, 
                            {
                              id: Math.random().toString(36).substring(2, 9),
                              text: newTimeBlockTask.trim(),
                              completed: newTaskCompleted
                            }
                          ]);
                          setNewTimeBlockTask('');
                        }
                      }}
                    />
                  </div>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      if (newTimeBlockTask.trim()) {
                        // Add task to pending tasks
                        setPendingTimeBlockTasks(prev => [
                          ...prev, 
                          {
                            id: Math.random().toString(36).substring(2, 9),
                            text: newTimeBlockTask.trim(),
                            completed: newTaskCompleted
                          }
                        ]);
                        setNewTimeBlockTask('');
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  These tasks will be added to Today&apos;s Tasks
                </p>
              </div>
              
              {/* Notes section for time block */}
              <div className="space-y-1 border p-3 rounded-md bg-muted/20">
                <label className="text-sm font-medium">Notes for this time block</label>
                
                {/* Display pending notes for this time block */}
                {pendingTimeBlockNotes.length > 0 && (
                  <div className="space-y-2 mt-2 mb-3">
                    {pendingTimeBlockNotes.map((note, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="flex-1 text-sm p-2 bg-background rounded border whitespace-pre-wrap">
                          {note.content}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            setPendingTimeBlockNotes(prev => 
                              prev.filter((_, i) => i !== index)
                            );
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Add existing notes section */}
                {sortedNotes.length > 0 && (
                  <div className="mb-3">
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">
                      Add existing note
                    </label>
                    <div className="flex gap-2">
                      <select 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value=""
                        onChange={(e) => {
                          const selectedNoteId = e.target.value;
                          if (selectedNoteId) {
                            const selectedNote = notes[selectedNoteId];
                            if (selectedNote) {
                              // Check if note is already in pending notes
                              const isAlreadyAdded = pendingTimeBlockNotes.some(
                                note => note.content === selectedNote.content
                              );
                              
                              if (!isAlreadyAdded) {
                                // Add to pending notes
                                setPendingTimeBlockNotes(prev => [
                                  ...prev,
                                  {
                                    id: selectedNote.id,
                                    content: selectedNote.content
                                  }
                                ]);
                              }
                              
                              // Reset select
                              e.target.value = "";
                            }
                          }
                        }}
                      >
                        <option value="">Select a note...</option>
                        {sortedNotes.map(note => (
                          <option key={note.id} value={note.id}>
                            {note.content.length > 50 
                              ? `${note.content.substring(0, 50)}...` 
                              : note.content}
                          </option>
                        ))}
                      </select>
                      <Button 
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 flex-shrink-0"
                        onClick={() => {
                          setIsSelectingNote(true);
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="flex flex-col gap-2">
                  <Textarea
                    className="min-h-[80px] resize-none"
                    placeholder="Add a note for this time block"
                    value={newTimeBlockNote}
                    onChange={(e) => setNewTimeBlockNote(e.target.value)}
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    className="self-end"
                    onClick={() => {
                      if (newTimeBlockNote.trim()) {
                        // Add note to pending notes
                        setPendingTimeBlockNotes(prev => [
                          ...prev, 
                          {
                            id: Math.random().toString(36).substring(2, 9),
                            content: newTimeBlockNote.trim()
                          }
                        ]);
                        setNewTimeBlockNote('');
                      }
                    }}
                  >
                    Add Note
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  These notes will be attached to this time block
                </p>
              </div>
              
              <div className="flex justify-between gap-2">
                {editingTimeBlockId && (
                  <Button 
                    variant="destructive" 
                    onClick={() => {
                      if (editingTimeBlockId) {
                        handleDeleteTimeBlock(editingTimeBlockId);
                      }
                    }}
                  >
                    Delete
                  </Button>
                )}
                <div className={`flex gap-2 ${editingTimeBlockId ? 'ml-auto' : ''}`}>
                  <Button variant="outline" onClick={() => setIsTimeBlockDialogOpen(false)}>Cancel</Button>
                  <Button 
                    onClick={() => {
                      if (newTimeBlockTitle.trim()) {
                        const startDateTime = new Date(`${newTimeBlockStartDate}T${newTimeBlockStartTime}`);
                        const endDateTime = new Date(`${newTimeBlockEndDate}T${newTimeBlockEndTime}`);
                        
                        // Check if end time is midnight (00:00)
                        const isEndTimeMidnight = newTimeBlockEndTime === '00:00';
                        
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
                        }
                        
                        // Add all pending tasks
                        if (pendingTimeBlockTasks.length > 0) {
                          // Add each pending task to time block tasks and Today's Tasks
                          pendingTimeBlockTasks.forEach(task => {
                            // Add to time block tasks
                            setTimeBlockTasks(prev => ({
                              ...prev,
                              [timeBlockId]: [...(prev[timeBlockId] || []), task]
                            }));
                            
                            // Also add to Today's Tasks
                            addTask({ 
                              title: task.text, 
                              completed: false,
                              description: `From time block: ${newTimeBlockTitle.trim()}`
                            });
                          });
                          
                          // Clear pending tasks
                          setPendingTimeBlockTasks([]);
                        }

                        // Add all pending notes
                        if (pendingTimeBlockNotes.length > 0) {
                          // Add each pending note to time block notes
                          setTimeBlockNotes(prev => ({
                            ...prev,
                            [timeBlockId]: pendingTimeBlockNotes
                          }));
                          
                          // Clear pending notes
                          setPendingTimeBlockNotes([]);
                        }
                        
                        // Reset form and close dialog
                        setNewTimeBlockTitle('');
                        setNewTimeBlockStartDate(format(new Date(), 'yyyy-MM-dd'));
                        setNewTimeBlockStartTime('09:00');
                        setNewTimeBlockEndDate(format(new Date(), 'yyyy-MM-dd'));
                        setNewTimeBlockEndTime('10:00');
                        setNewTimeBlockDescription('');
                        setEditingTimeBlockId(null);
                        setIsTimeBlockDialogOpen(false);
                      }
                    }}
                  >
                    {editingTimeBlockId ? 'Update Time Block' : 'Add Time Block'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shutdown Dialog */}
      {isShutdownDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Daily Shutdown</h3>
            <div className="space-y-4">
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Shutdown Checklist</h4>
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="reviewedTasks" 
                      checked={shutdownChecklist.reviewedTasks}
                      onCheckedChange={(checked) => {
                        setShutdownChecklist(prev => ({
                          ...prev,
                          reviewedTasks: !!checked
                        }));
                      }}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="reviewedTasks"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Review completed tasks
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Acknowledge what you've accomplished today
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="capturedLooseEnds" 
                      checked={shutdownChecklist.capturedLooseEnds}
                      onCheckedChange={(checked) => {
                        setShutdownChecklist(prev => ({
                          ...prev,
                          capturedLooseEnds: !!checked
                        }));
                      }}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="capturedLooseEnds"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Capture loose ends
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Note any unfinished tasks or ideas that need attention
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="plannedTomorrow" 
                      checked={shutdownChecklist.plannedTomorrow}
                      onCheckedChange={(checked) => {
                        setShutdownChecklist(prev => ({
                          ...prev,
                          plannedTomorrow: !!checked
                        }));
                      }}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="plannedTomorrow"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Plan tomorrow
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Set intentions for your next day
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="clearMind" 
                      checked={shutdownChecklist.clearMind}
                      onCheckedChange={(checked) => {
                        setShutdownChecklist(prev => ({
                          ...prev,
                          clearMind: !!checked
                        }));
                      }}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="clearMind"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Clear your mind
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Write down any lingering thoughts
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Daily Reflection</label>
                <Textarea 
                  placeholder="What went well today? What could be improved? Any insights?" 
                  className="min-h-[100px]"
                  value={shutdownReflection}
                  onChange={(e) => setShutdownReflection(e.target.value)}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsShutdownDialogOpen(false)}>Cancel</Button>
                <Button onClick={() => handleCompleteShutdown()}>Complete Shutdown</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Note Selection Dialog */}
      {isSelectingNote && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
            <h3 className="text-lg font-medium mb-4">Select Notes to Add</h3>
            <div className="space-y-2 mb-4">
              <input
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Search notes..."
                value={noteSearchQuery}
                onChange={(e) => setNoteSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
              {sortedNotes
                .filter(note => 
                  note.content.toLowerCase().includes(noteSearchQuery.toLowerCase())
                )
                .map(note => {
                  const isSelected = selectedNotesForTimeBlock.includes(note.id);
                  return (
                    <div 
                      key={note.id} 
                      className={`p-3 rounded-md border ${isSelected ? 'border-primary bg-primary/10' : 'border-border bg-card'} hover:bg-accent/10 cursor-pointer`}
                      onClick={() => {
                        setSelectedNotesForTimeBlock(prev => 
                          isSelected 
                            ? prev.filter(id => id !== note.id)
                            : [...prev, note.id]
                        );
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <Checkbox 
                          checked={isSelected}
                          onCheckedChange={(checked) => {
                            setSelectedNotesForTimeBlock(prev => 
                              checked 
                                ? [...prev, note.id]
                                : prev.filter(id => id !== note.id)
                            );
                          }}
                        />
                        <div className="flex-1">
                          <p className="text-sm whitespace-pre-wrap line-clamp-3">{note.content}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(note.createdAt), 'MMM d, yyyy h:mm a')}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
            <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
              <Button variant="outline" onClick={() => {
                setIsSelectingNote(false);
                setSelectedNotesForTimeBlock([]);
                setNoteSearchQuery('');
              }}>
                Cancel
              </Button>
              <Button onClick={() => {
                // Add selected notes to pending notes
                const notesToAdd = selectedNotesForTimeBlock
                  .map(id => notes[id])
                  .filter(note => note !== undefined)
                  .filter(note => {
                    // Check if note is already in pending notes
                    return !pendingTimeBlockNotes.some(
                      pendingNote => pendingNote.content === note.content
                    );
                  });
                
                if (notesToAdd.length > 0) {
                  setPendingTimeBlockNotes(prev => [
                    ...prev,
                    ...notesToAdd.map(note => ({
                      id: note.id,
                      content: note.content
                    }))
                  ]);
                }
                
                setIsSelectingNote(false);
                setSelectedNotesForTimeBlock([]);
                setNoteSearchQuery('');
              }}>
                Add Selected Notes ({selectedNotesForTimeBlock.length})
              </Button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(155, 155, 155, 0.5);
          border-radius: 20px;
          border: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(155, 155, 155, 0.7);
        }
        
        /* Enhanced hover effects for time blocks */
        .time-block-item {
          transition: all 0.2s ease-in-out;
        }
        
        .time-block-item:hover {
          transform: translateX(2px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          border-color: var(--primary);
          filter: brightness(0.95);
        }
        
        .time-block-item:hover::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 4px;
          height: 100%;
          background-color: var(--primary);
          opacity: 0.7;
        }
        
        /* Individual 30-minute block hover effect */
        .time-block-hover-target {
          cursor: pointer;
          z-index: 6;
        }
        
        .time-block-hover-target:hover {
          background-color: rgba(var(--primary-rgb), 0.15);
          border-left: 3px solid var(--primary);
        }
        
        /* Cursor indicator for clickable grid */
        .time-grid-overlay {
          cursor: pointer;
        }
        
        /* Task completion animation */
        @keyframes taskComplete {
          0% {
            opacity: 1;
            transform: translateY(0);
          }
          60% {
            opacity: 0.5;
            transform: translateY(10px);
          }
          100% {
            opacity: 0;
            transform: translateY(20px);
          }
        }
        
        @keyframes taskUncomplete {
          0% {
            opacity: 0;
            transform: translateY(-10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .task-complete-animation {
          animation: taskComplete 0.3s ease-in-out forwards;
        }
        
        .task-uncomplete-animation {
          animation: taskUncomplete 0.3s ease-in-out forwards;
        }

        /* Task deletion animation */
        @keyframes taskDelete {
          0% {
            opacity: 1;
            transform: translateX(0);
          }
          100% {
            opacity: 0;
            transform: translateX(30px);
          }
        }
        
        .task-delete-animation {
          animation: taskDelete 0.3s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
} 