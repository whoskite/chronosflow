"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, ChevronLeft, ChevronRight, Power, Lightbulb, StickyNote } from 'lucide-react';
import { useStore } from '@/lib/store/use-store';
import { format, addDays, subDays, isSameDay } from 'date-fns';

export function DailyView() {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newIdeaContent, setNewIdeaContent] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isAddingIdea, setIsAddingIdea] = useState(false);
  const [isTimeBlockDialogOpen, setIsTimeBlockDialogOpen] = useState(false);
  const [editingTimeBlockId, setEditingTimeBlockId] = useState<string | null>(null);
  const [isShutdownDialogOpen, setIsShutdownDialogOpen] = useState(false);
  const [shutdownReflection, setShutdownReflection] = useState('');
  const [shutdownChecklist, setShutdownChecklist] = useState({
    reviewedTasks: false,
    capturedLooseEnds: false,
    plannedTomorrow: false,
    clearMind: false
  });
  
  // Time block form state
  const [newTimeBlockTitle, setNewTimeBlockTitle] = useState('');
  const [newTimeBlockStartDate, setNewTimeBlockStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [newTimeBlockStartTime, setNewTimeBlockStartTime] = useState('09:00');
  const [newTimeBlockEndDate, setNewTimeBlockEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [newTimeBlockEndTime, setNewTimeBlockEndTime] = useState('10:00');
  const [newTimeBlockDescription, setNewTimeBlockDescription] = useState('');
  
  // Add a state variable for the selected date
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const { 
    timeBlocks,
    addTask, 
    addNote,
    addTimeBlock,
    updateTimeBlock
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
  };

  // Handle adding a task
  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      addTask({ title: newTaskTitle.trim(), completed: false });
      setNewTaskTitle('');
      setIsAddingTask(false);
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

  // Handle adding a time block
  const handleAddTimeBlock = () => {
    if (newTimeBlockTitle.trim()) {
      // Parse the date strings and combine with the selected date
      const startDateTime = new Date(`${newTimeBlockStartDate}T${newTimeBlockStartTime}`);
      const endDateTime = new Date(`${newTimeBlockEndDate}T${newTimeBlockEndTime}`);
      
      // Only add if end time is after start time or if end time is midnight (00:00)
      // Special case for midnight: if end time is 00:00, it should be interpreted as end of day
      const isEndTimeMidnight = newTimeBlockEndTime === '00:00';
      
      if (endDateTime > startDateTime || isEndTimeMidnight) {
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
          addTimeBlock({
            title: newTimeBlockTitle.trim(),
            startTime: startDateTime,
            endTime: isEndTimeMidnight ? adjustedEndDateTime : endDateTime,
            description: newTimeBlockDescription.trim() || undefined,
            status: 'planned'
          });
        }
        
        // Reset form
        resetTimeBlockForm();
      }
    }
  };

  // Handle shutdown checklist item toggle
  const handleShutdownChecklistToggle = (item: keyof typeof shutdownChecklist) => {
    setShutdownChecklist(prev => ({
        ...prev,
      [item]: !prev[item]
    }));
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
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Item</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <Button 
                  variant="outline" 
                  className="flex flex-col h-24 items-center justify-center gap-2"
                  onClick={() => {
                    setIsAddingTask(true);
                    setIsAddingNote(false);
                    setIsAddingIdea(false);
                  }}
                >
                  <Checkbox className="h-8 w-8" />
                  <span>Task</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="flex flex-col h-24 items-center justify-center gap-2"
                  onClick={() => {
                    setIsAddingTask(false);
                    setIsAddingNote(true);
                    setIsAddingIdea(false);
                  }}
                >
                  <StickyNote className="h-8 w-8" />
                  <span>Note</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="flex flex-col h-24 items-center justify-center gap-2"
                  onClick={() => {
                    setIsAddingTask(false);
                    setIsAddingNote(false);
                    setIsAddingIdea(true);
                  }}
                >
                  <Lightbulb className="h-8 w-8" />
                  <span>Idea</span>
                </Button>
              </div>
              {isAddingTask && (
                <div className="space-y-4">
                  <input
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Task title"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <Button onClick={handleAddTask}>Add Task</Button>
                  </div>
                </div>
              )}
              {isAddingNote && (
                <div className="space-y-4">
                  <Textarea
                    placeholder="Note content"
                    className="min-h-[150px]"
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <Button onClick={handleAddNote}>Add Note</Button>
                  </div>
                </div>
              )}
              {isAddingIdea && (
                <div className="space-y-4">
                  <Textarea
                    placeholder="Your brilliant idea..."
                    className="min-h-[150px]"
                    value={newIdeaContent}
                    onChange={(e) => setNewIdeaContent(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <Button onClick={handleAddIdea}>Add Idea</Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
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
                <Button variant="ghost" size="sm" onClick={() => setIsAddingTask(true)}>
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
                <Button variant="ghost" size="sm" onClick={() => setIsTimeBlockDialogOpen(true)}>
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

      {/* Time Block Dialog */}
      <Dialog open={isTimeBlockDialogOpen} onOpenChange={setIsTimeBlockDialogOpen}>
        <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingTimeBlockId ? 'Edit Time Block' : 'Add Time Block'}</DialogTitle>
                    </DialogHeader>
          <div className="space-y-4 py-4">
                      <div className="space-y-2">
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
                      </div>
                      <div className="flex justify-end">
                        <Button onClick={handleAddTimeBlock}>
                          {editingTimeBlockId ? 'Update Time Block' : 'Add Time Block'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

      {/* Shutdown Dialog */}
      <Dialog open={isShutdownDialogOpen} onOpenChange={setIsShutdownDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Daily Shutdown</DialogTitle>
            <DialogDescription>
              Complete your day with intention
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Shutdown Checklist</h3>
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="reviewedTasks" 
                    checked={shutdownChecklist.reviewedTasks}
                    onCheckedChange={() => handleShutdownChecklistToggle('reviewedTasks')}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="reviewedTasks"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Review completed tasks
                    </label>
              <p className="text-xs text-muted-foreground">
                      Acknowledge what you&apos;ve accomplished today
              </p>
            </div>
          </div>
          
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="capturedLooseEnds" 
                    checked={shutdownChecklist.capturedLooseEnds}
                    onCheckedChange={() => handleShutdownChecklistToggle('capturedLooseEnds')}
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
                    onCheckedChange={() => handleShutdownChecklistToggle('plannedTomorrow')}
                  />
                  <div className="grid gap-1.5 leading-none">
                                  <label
                      htmlFor="plannedTomorrow"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                      Plan tomorrow
                                  </label>
                    <p className="text-xs text-muted-foreground">
                      Set up your time blocks and priorities for tomorrow
                          </p>
                        </div>
                    </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="clearMind" 
                    checked={shutdownChecklist.clearMind}
                    onCheckedChange={() => handleShutdownChecklistToggle('clearMind')}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="clearMind"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Clear your mind
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Say &quot;shutdown complete&quot; and disconnect from work
                          </p>
                        </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
              <h3 className="text-sm font-medium">Daily Reflection</h3>
                      <Textarea 
                placeholder="What went well today? What could be improved? Any insights or lessons learned?"
                className="min-h-[150px]"
                value={shutdownReflection}
                onChange={(e) => setShutdownReflection(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                This reflection will be saved as a note when you complete the shutdown process.
              </p>
                    </div>
                  </div>
          <DialogFooter>
            <div className="flex justify-between w-full">
              <Button variant="outline" onClick={() => setIsShutdownDialogOpen(false)}>
                Cancel
                </Button>
              <Button onClick={handleCompleteShutdown}>
                Complete Shutdown
                  </Button>
                </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
} 