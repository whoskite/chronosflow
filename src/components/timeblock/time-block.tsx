"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '../ui/badge';
import { Plus, Trash2, Calendar as CalendarIcon, Clock, X, CheckCircle, Save } from 'lucide-react';
import { useStore } from '@/lib/store/use-store';
import { format, isSameDay } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Define interfaces for time block tasks
interface TimeBlockTask {
  id: string;
  text: string;
  completed: boolean;
}

export function TimeBlockSchedule() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [newTimeBlockTitle, setNewTimeBlockTitle] = useState('');
  const [newTimeBlockDescription, setNewTimeBlockDescription] = useState('');
  const [newTimeBlockStartDate, setNewTimeBlockStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [newTimeBlockStartTime, setNewTimeBlockStartTime] = useState('09:00');
  const [newTimeBlockEndDate, setNewTimeBlockEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [newTimeBlockEndTime, setNewTimeBlockEndTime] = useState('10:00');
  const [newTimeBlockTag, setNewTimeBlockTag] = useState('');
  const [newTimeBlockTags, setNewTimeBlockTags] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTimeBlockId, setEditingTimeBlockId] = useState<string | null>(null);
  const [timeBlockTasks, setTimeBlockTasks] = useState<Record<string, TimeBlockTask[]>>({});
  const [newTimeBlockTask, setNewTimeBlockTask] = useState('');
  const [viewingTimeBlockId, setViewingTimeBlockId] = useState<string | null>(null);
  const [isTimeBlockDetailsOpen, setIsTimeBlockDetailsOpen] = useState(false);
  const [activeTimeBlockTab, setActiveTimeBlockTab] = useState<'details' | 'tasks'>('details');
  const [initialTaskForTimeBlock, setInitialTaskForTimeBlock] = useState('');

  const { timeBlocks, addTimeBlock, deleteTimeBlock, updateTimeBlock, addTask, tasks, updateTask, deleteTask } = useStore();

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
      
      // Close the time block details dialog if it's open
      if (viewingTimeBlockId === timeBlockId) {
        setIsTimeBlockDetailsOpen(false);
      }
    }
  };

  const handleAddTimeBlock = () => {
    if (newTimeBlockTitle.trim()) {
      const startDateTime = new Date(`${newTimeBlockStartDate}T${newTimeBlockStartTime}`);
      const endDateTime = new Date(`${newTimeBlockEndDate}T${newTimeBlockEndTime}`);
      
      let timeBlockId: string;
      
      if (editingTimeBlockId) {
        // Update existing time block
        updateTimeBlock(editingTimeBlockId, {
          title: newTimeBlockTitle.trim(),
          description: newTimeBlockDescription.trim(),
          startTime: startDateTime,
          endTime: endDateTime,
          tags: newTimeBlockTags
        });
        timeBlockId = editingTimeBlockId;
      } else {
        // Add new time block
        timeBlockId = addTimeBlock({
          title: newTimeBlockTitle.trim(),
          description: newTimeBlockDescription.trim(),
          startTime: startDateTime,
          endTime: endDateTime,
          tags: newTimeBlockTags,
          status: 'planned'
        });
      }
      
      // Add initial task if provided
      if (initialTaskForTimeBlock.trim()) {
        const newTask: TimeBlockTask = {
          id: Math.random().toString(36).substring(2, 9),
          text: initialTaskForTimeBlock.trim(),
          completed: false
        };
        
        // Add to time block tasks
        setTimeBlockTasks(prev => ({
          ...prev,
          [timeBlockId]: [...(prev[timeBlockId] || []), newTask]
        }));
        
        // Also add to Today&apos;s Tasks
        addTask({ 
          title: initialTaskForTimeBlock.trim(), 
          completed: false,
          description: `From time block: ${newTimeBlockTitle.trim()}`
        });
        
        // Reset the initial task field
        setInitialTaskForTimeBlock('');
      }
      
      resetFormAndState();
    }
  };

  const resetFormAndState = () => {
    setNewTimeBlockTitle('');
    setNewTimeBlockDescription('');
    setNewTimeBlockStartDate(format(new Date(), 'yyyy-MM-dd'));
    setNewTimeBlockStartTime('09:00');
    setNewTimeBlockEndDate(format(new Date(), 'yyyy-MM-dd'));
    setNewTimeBlockEndTime('10:00');
    setNewTimeBlockTag('');
    setNewTimeBlockTags([]);
    setEditingTimeBlockId(null);
    setIsDialogOpen(false);
    setInitialTaskForTimeBlock('');
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTimeBlockTag.trim()) {
      e.preventDefault();
      if (!newTimeBlockTags.includes(newTimeBlockTag.trim())) {
        setNewTimeBlockTags([...newTimeBlockTags, newTimeBlockTag.trim()]);
      }
      setNewTimeBlockTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNewTimeBlockTags(newTimeBlockTags.filter(tag => tag !== tagToRemove));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    setSelectedDate(date);
  };

  // Function to handle clicking on a time slot
  const handleTimeSlotClick = (hour: number, minute: number) => {
    // Reset any editing state first
    setEditingTimeBlockId(null);
    
    // Set the start time to the clicked time slot
    const startTime = `${Math.floor(hour).toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    
    // Set the end time to 30 minutes later if it's a half-hour slot, or 1 hour later if it's an hour slot
    let endHour = hour;
    let endMinute = minute;
    
    if (minute === 30) {
      endHour += 1;
      endMinute = 0;
    } else {
      endMinute = 30;
    }
    
    const endTime = `${Math.floor(endHour).toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
    
    setNewTimeBlockStartDate(format(selectedDate, 'yyyy-MM-dd'));
    setNewTimeBlockStartTime(startTime);
    setNewTimeBlockEndDate(format(selectedDate, 'yyyy-MM-dd'));
    setNewTimeBlockEndTime(endTime);
    
    // Open the dialog
    setIsDialogOpen(true);
  };

  // Generate time slots for the day (half-hourly from 6am to 10pm)
  const timeSlots = Array.from({ length: 34 }, (_, i) => {
    const hour = 6 + i / 2; // Start at 6am, increment by 0.5 for half hours
    const minute = i % 2 === 0 ? 0 : 30;
    const time = new Date();
    time.setHours(Math.floor(hour), minute, 0, 0);
    
    return {
      hour,
      minute,
      time: `${Math.floor(hour)}:${minute === 0 ? '00' : '30'}`,
      label: format(time, 'h:mm a'),
      isHalfHour: minute === 30
    };
  });

  const timeBlocksForSelectedDate = Object.values(timeBlocks).filter((timeBlock) => 
    isSameDay(new Date(timeBlock.startTime), selectedDate)
  ).sort((a, b) => 
    new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  const handleAddTimeBlockTask = (timeBlockId: string) => {
    if (newTimeBlockTask.trim()) {
      const newTask: TimeBlockTask = {
        id: Math.random().toString(36).substring(2, 9),
        text: newTimeBlockTask.trim(),
        completed: false
      };
      
      setTimeBlockTasks(prev => ({
        ...prev,
        [timeBlockId]: [...(prev[timeBlockId] || []), newTask]
      }));
      
      // Also add to Today&apos;s Tasks
      const timeBlock = timeBlocks[timeBlockId];
      addTask({ 
        title: newTimeBlockTask.trim(), 
        completed: false,
        description: timeBlock ? `From time block: ${timeBlock.title}` : undefined
      });
      
      setNewTimeBlockTask('');
    }
  };
  
  const handleToggleTimeBlockTask = (timeBlockId: string, taskId: string) => {
    // Find the task to toggle
    const taskToToggle = timeBlockTasks[timeBlockId]?.find(task => task.id === taskId);
    if (!taskToToggle) return;
    
    // Toggle the task in the time block tasks
    setTimeBlockTasks(prev => ({
      ...prev,
      [timeBlockId]: prev[timeBlockId].map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    }));
    
    // Find the corresponding task in the main tasks list by matching the text and time block title
    const timeBlock = timeBlocks[timeBlockId];
    if (!timeBlock) return;
    
    const matchingMainTask = Object.values(tasks).find(task => 
      task.title === taskToToggle.text && 
      task.description === `From time block: ${timeBlock.title}`
    );
    
    // If found, update its completion status
    if (matchingMainTask) {
      updateTask(matchingMainTask.id, { completed: !taskToToggle.completed });
    }
  };
  
  const handleDeleteTimeBlockTask = (timeBlockId: string, taskId: string) => {
    // Find the task to delete
    const taskToDelete = timeBlockTasks[timeBlockId]?.find(task => task.id === taskId);
    if (!taskToDelete) return;
    
    // Delete the task from the time block tasks
    setTimeBlockTasks(prev => ({
      ...prev,
      [timeBlockId]: prev[timeBlockId].filter(task => task.id !== taskId)
    }));
    
    // Find the corresponding task in the main tasks list by matching the text and time block title
    const timeBlock = timeBlocks[timeBlockId];
    if (!timeBlock) return;
    
    const matchingMainTask = Object.values(tasks).find(task => 
      task.title === taskToDelete.text && 
      task.description === `From time block: ${timeBlock.title}`
    );
    
    // If found, delete it
    if (matchingMainTask) {
      deleteTask(matchingMainTask.id);
    }
  };

  const handleViewTimeBlock = (timeBlockId: string) => {
    const timeBlock = timeBlocks[timeBlockId];
    if (timeBlock) {
      setViewingTimeBlockId(timeBlockId);
      setNewTimeBlockTitle(timeBlock.title);
      setNewTimeBlockDescription(timeBlock.description || '');
      setNewTimeBlockStartDate(format(new Date(timeBlock.startTime), 'yyyy-MM-dd'));
      setNewTimeBlockStartTime(format(new Date(timeBlock.startTime), 'HH:mm'));
      setNewTimeBlockEndDate(format(new Date(timeBlock.endTime), 'yyyy-MM-dd'));
      setNewTimeBlockEndTime(format(new Date(timeBlock.endTime), 'HH:mm'));
      setNewTimeBlockTags(timeBlock.tags || []);
      setActiveTimeBlockTab('details');
      setIsTimeBlockDetailsOpen(true);
      
      // Find any task associated with this time block in the main tasks list
      const associatedTask = Object.values(tasks).find(task => 
        task.description === `From time block: ${timeBlock.title}`
      );
      
      // If found, set it as the initial task
      if (associatedTask) {
        setInitialTaskForTimeBlock(associatedTask.title);
      } else {
        setInitialTaskForTimeBlock('');
      }
    }
  };

  // Calculate the position of the current time indicator
  const calculateCurrentTimePosition = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    // Calculate how far we are through the day (from 6am to 10pm = 16 hours)
    // Our timeSlots array has 34 slots (17 hours with half-hour increments)
    
    // First, convert current time to minutes since 6am
    const minutesSince6am = (hours - 6) * 60 + minutes;
    
    // If before 6am, return 0 (top of the schedule)
    if (minutesSince6am < 0) return 0;
    
    // If after 10pm, return the bottom of the schedule
    const totalMinutesInSchedule = 17 * 60; // 17 hours from 6am to 11pm
    if (minutesSince6am > totalMinutesInSchedule) return '100%';
    
    // Calculate percentage through the schedule
    const percentage = (minutesSince6am / totalMinutesInSchedule) * 100;
    
    // Return the position
    return `${percentage}%`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Time Blocking</h2>
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={format(selectedDate, 'yyyy-MM-dd')}
            onChange={handleDateChange}
            className="w-auto"
          />
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            if (!open) resetFormAndState();
            setIsDialogOpen(open);
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingTimeBlockId(null)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Time Block
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingTimeBlockId ? 'Edit Time Block' : 'Add Time Block'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Input 
                    placeholder="Time block title" 
                    value={newTimeBlockTitle}
                    onChange={(e) => setNewTimeBlockTitle(e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      <Input 
                        type="date" 
                        value={newTimeBlockStartDate}
                        onChange={(e) => setNewTimeBlockStartDate(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <Input 
                        type="time" 
                        value={newTimeBlockStartTime}
                        onChange={(e) => setNewTimeBlockStartTime(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      <Input 
                        type="date" 
                        value={newTimeBlockEndDate}
                        onChange={(e) => setNewTimeBlockEndDate(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <Input 
                        type="time" 
                        value={newTimeBlockEndTime}
                        onChange={(e) => setNewTimeBlockEndTime(e.target.value)}
                      />
                    </div>
                  </div>
                  <Textarea 
                    placeholder="Description (optional)" 
                    value={newTimeBlockDescription}
                    onChange={(e) => setNewTimeBlockDescription(e.target.value)}
                  />
                  
                  {/* Task input field - made more prominent */}
                  <div className="border p-3 rounded-md bg-muted/20">
                    <label className="text-sm font-medium mb-1 block">Task for this time block</label>
                    <Input
                      placeholder="Add a task for this time block"
                      value={initialTaskForTimeBlock}
                      onChange={(e) => setInitialTaskForTimeBlock(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      This task will be added to Today&apos;s Tasks
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tags</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {newTimeBlockTags.map(tag => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <button 
                            type="button" 
                            onClick={() => handleRemoveTag(tag)}
                            className="rounded-full hover:bg-muted p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <Input 
                      placeholder="Add tags (press Enter to add)" 
                      value={newTimeBlockTag}
                      onChange={(e) => setNewTimeBlockTag(e.target.value)}
                      onKeyDown={handleAddTag}
                    />
                    <p className="text-xs text-muted-foreground">
                      Tags help categorize your time blocks (e.g., &quot;Work&quot;, &quot;Study&quot;, &quot;Personal&quot;)
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  {editingTimeBlockId && (
                    <Button variant="outline" onClick={resetFormAndState}>
                      Cancel
                    </Button>
                  )}
                  <Button onClick={handleAddTimeBlock}>
                    {editingTimeBlockId ? 'Update' : 'Add'} Time Block
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Daily Schedule - {format(selectedDate, 'EEEE, MMMM d, yyyy')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 relative">
              {/* Current time indicator - only show if selected date is today */}
              {isSameDay(selectedDate, new Date()) && (
                <div 
                  className="absolute left-0 right-0 border-t-2 border-red-500 z-20 pointer-events-none"
                  style={{ 
                    top: calculateCurrentTimePosition(),
                  }}
                >
                  <div className="absolute -left-3 -top-1.5 w-3 h-3 rounded-full bg-red-500"></div>
                </div>
              )}
              
              {timeSlots.map((slot) => {
                const blocksInThisSlot = timeBlocksForSelectedDate.filter(block => {
                  const blockStartTime = new Date(block.startTime);
                  const blockStartHour = blockStartTime.getHours();
                  const blockStartMinute = blockStartTime.getMinutes();
                  
                  return blockStartHour === Math.floor(slot.hour) && 
                         (slot.minute === 0 ? blockStartMinute < 30 : blockStartMinute >= 30);
                });

                return (
                  <div 
                    key={slot.time} 
                    className={`grid grid-cols-12 py-1 ${slot.isHalfHour ? 'border-t border-dashed' : 'border-t'} hover:bg-muted/50 cursor-pointer transition-colors group ${slot.isHalfHour ? 'h-6' : 'h-8'}`}
                    onClick={() => handleTimeSlotClick(slot.hour, slot.minute)}
                  >
                    <div className={`col-span-2 text-sm ${slot.isHalfHour ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
                      {slot.label}
                    </div>
                    <div className="col-span-10">
                      {blocksInThisSlot.length > 0 ? (
                        <div className="space-y-1">
                          {blocksInThisSlot.map(block => {
                            const startTime = new Date(block.startTime);
                            const endTime = new Date(block.endTime);
                            const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
                            
                            return (
                              <div 
                                key={block.id} 
                                className="bg-primary/10 p-2 rounded-md"
                                style={{ 
                                  height: `${Math.max(durationHours * 4, 1)}rem`,
                                }}
                                onClick={(e) => e.stopPropagation()} // Prevent triggering the parent click handler
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="text-sm font-medium">{block.title}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
                                    </p>
                                    {block.tags && block.tags.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {block.tags.map((tag: string) => (
                                          <Badge key={tag} variant="outline" className="text-xs py-0 px-1.5">
                                            {tag}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteTimeBlock(block.id);
                                    }}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                                {block.description && (
                                  <p className="text-xs mt-1">{block.description}</p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className={`w-full flex items-center justify-center ${slot.isHalfHour ? 'h-4' : 'h-6'}`}>
                          <div className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100">
                            {slot.isHalfHour ? '+' : 'Click to add'}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Time Blocks</CardTitle>
          </CardHeader>
          <CardContent>
            {timeBlocksForSelectedDate.length === 0 ? (
              <p className="text-sm text-muted-foreground">No time blocks for this day. Add one to get started.</p>
            ) : (
              <div className="space-y-3">
                {timeBlocksForSelectedDate.map((timeBlock) => (
                  <div key={timeBlock.id} className="space-y-1">
                    <div className="flex items-start justify-between">
                      <div className="cursor-pointer" onClick={() => handleViewTimeBlock(timeBlock.id)}>
                        <p className="text-sm font-medium">{timeBlock.title}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>
                            {format(new Date(timeBlock.startTime), 'h:mm a')} - 
                            {format(new Date(timeBlock.endTime), 'h:mm a')}
                          </span>
                        </div>
                        {timeBlock.tags && timeBlock.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {timeBlock.tags.map((tag: string) => (
                              <Badge key={tag} variant="outline" className="text-xs py-0 px-1.5">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTimeBlock(timeBlock.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    {timeBlock.description && (
                      <p className="text-xs text-muted-foreground">{timeBlock.description}</p>
                    )}
                    <Separator className="my-1" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Time Block Details Dialog */}
      <Dialog open={isTimeBlockDetailsOpen} onOpenChange={setIsTimeBlockDetailsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Time Block Details</DialogTitle>
          </DialogHeader>
          
          <Tabs value={activeTimeBlockTab} onValueChange={(value) => setActiveTimeBlockTab(value as 'details' | 'tasks')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-4 mt-4">
              {viewingTimeBlockId && timeBlocks[viewingTimeBlockId] && (
                <>
                  <div>
                    <label htmlFor="view-title" className="block text-sm font-medium mb-1">
                      Title
                    </label>
                    <Input
                      id="view-title"
                      value={newTimeBlockTitle}
                      onChange={(e) => setNewTimeBlockTitle(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Start Time
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="date"
                        value={newTimeBlockStartDate}
                        onChange={(e) => setNewTimeBlockStartDate(e.target.value)}
                      />
                      <Input
                        type="time"
                        value={newTimeBlockStartTime}
                        onChange={(e) => setNewTimeBlockStartTime(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      End Time
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="date"
                        value={newTimeBlockEndDate}
                        onChange={(e) => setNewTimeBlockEndDate(e.target.value)}
                      />
                      <Input
                        type="time"
                        value={newTimeBlockEndTime}
                        onChange={(e) => setNewTimeBlockEndTime(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="view-description" className="block text-sm font-medium mb-1">
                      Description
                    </label>
                    <Textarea
                      id="view-description"
                      value={newTimeBlockDescription}
                      onChange={(e) => setNewTimeBlockDescription(e.target.value)}
                    />
                  </div>
                  
                  {/* Task input field - made more prominent */}
                  <div className="border p-3 rounded-md bg-muted/20">
                    <label className="text-sm font-medium mb-1 block">Task for this time block</label>
                    <Input
                      placeholder="Add a task for this time block"
                      value={initialTaskForTimeBlock}
                      onChange={(e) => setInitialTaskForTimeBlock(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      This task will be added to Today&apos;s Tasks
                    </p>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsTimeBlockDetailsOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => {
                      if (viewingTimeBlockId) {
                        // Update the time block
                        const startDateTime = new Date(`${newTimeBlockStartDate}T${newTimeBlockStartTime}`);
                        const endDateTime = new Date(`${newTimeBlockEndDate}T${newTimeBlockEndTime}`);
                        
                        updateTimeBlock(viewingTimeBlockId, {
                          title: newTimeBlockTitle.trim(),
                          description: newTimeBlockDescription.trim() || undefined,
                          startTime: startDateTime,
                          endTime: endDateTime,
                          tags: newTimeBlockTags
                        });
                        
                        // Handle task update
                        const timeBlock = timeBlocks[viewingTimeBlockId];
                        if (timeBlock) {
                          // Find any existing associated task
                          const existingTask = Object.values(tasks).find(task => 
                            task.description === `From time block: ${timeBlock.title}`
                          );
                          
                          if (initialTaskForTimeBlock.trim()) {
                            if (existingTask) {
                              // Update existing task
                              updateTask(existingTask.id, { 
                                title: initialTaskForTimeBlock.trim(),
                                description: `From time block: ${newTimeBlockTitle.trim()}`
                              });
                            } else {
                              // Create new task
                              addTask({ 
                                title: initialTaskForTimeBlock.trim(), 
                                completed: false,
                                description: `From time block: ${newTimeBlockTitle.trim()}`
                              });
                            }
                          } else if (existingTask) {
                            // Delete task if field is empty but task exists
                            deleteTask(existingTask.id);
                          }
                        }
                        
                        setIsTimeBlockDetailsOpen(false);
                      }
                    }}>
                      Save Changes
                    </Button>
                  </div>
                </>
              )}
            </TabsContent>
            
            <TabsContent value="tasks" className="space-y-4 pt-4">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Add a task..."
                  value={newTimeBlockTask}
                  onChange={(e) => setNewTimeBlockTask(e.target.value)}
                  onKeyDown={(e) => viewingTimeBlockId && e.key === 'Enter' && handleAddTimeBlockTask(viewingTimeBlockId)}
                  className="flex-1"
                />
                <Button 
                  onClick={() => viewingTimeBlockId && handleAddTimeBlockTask(viewingTimeBlockId)}
                >
                  Add
                </Button>
              </div>
              
              <div className="space-y-0">
                {viewingTimeBlockId && timeBlockTasks[viewingTimeBlockId]?.length > 0 ? (
                  <>
                    <h3 className="text-sm font-medium mb-2">Tasks</h3>
                    <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1">
                      {timeBlockTasks[viewingTimeBlockId].map(task => (
                        <div key={task.id} className="flex items-start gap-2 py-2 px-3 border-b hover:bg-muted/40 rounded-sm transition-colors group">
                          <Checkbox
                            id={`task-${task.id}`}
                            checked={task.completed}
                            onCheckedChange={() => handleToggleTimeBlockTask(viewingTimeBlockId, task.id)}
                            className="mt-0.5"
                          />
                          <div className="flex-1">
                            <label
                              htmlFor={`task-${task.id}`}
                              className={`text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}
                            >
                              {task.text}
                            </label>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDeleteTimeBlockTask(viewingTimeBlockId, task.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="bg-muted/50 p-3 rounded-full mb-3">
                      <CheckCircle className="h-6 w-6 opacity-50" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      No tasks yet
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-between mt-4">
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => {
                if (viewingTimeBlockId) {
                  handleDeleteTimeBlock(viewingTimeBlockId);
                  setIsTimeBlockDetailsOpen(false);
                }
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  if (viewingTimeBlockId) {
                    // Update the time block with current details
                    const timeBlock = timeBlocks[viewingTimeBlockId];
                    if (timeBlock) {
                      updateTimeBlock(viewingTimeBlockId, {
                        title: timeBlock.title,
                        description: timeBlock.description,
                        startTime: new Date(timeBlock.startTime),
                        endTime: new Date(timeBlock.endTime),
                        tags: timeBlock.tags,
                        status: timeBlock.status
                      });
                    }
                    setIsTimeBlockDetailsOpen(false);
                  }
                }}
              >
                <Save className="h-4 w-4 mr-2" />
                Update Time Block
              </Button>
              <Button onClick={() => setIsTimeBlockDetailsOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 