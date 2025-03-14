"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, X, Edit, Calendar as CalendarIcon, Clock, Save } from 'lucide-react';
import { useStore } from '@/lib/store/use-store';
import { format } from 'date-fns';

export function Board() {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [editedNoteContent, setEditedNoteContent] = useState('');

  const { 
    tasks, 
    notes, 
    timeBlocks,
    addTask, 
    updateTask, 
    addNote,
    updateNote
  } = useStore();

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      addTask({ title: newTaskTitle.trim(), completed: false });
      setNewTaskTitle('');
      setIsAddingTask(false);
    }
  };

  const handleAddNote = () => {
    if (newNoteContent.trim()) {
      addNote({ content: newNoteContent.trim() });
      setNewNoteContent('');
      setIsAddingNote(false);
    }
  };

  const handleToggleTask = (id: string, completed: boolean) => {
    updateTask(id, { completed });
  };

  const handleNoteClick = (noteId: string) => {
    setSelectedNote(noteId);
    setIsNoteDialogOpen(true);
    setIsEditingNote(false);
  };

  const handleCloseNoteDialog = () => {
    setSelectedNote(null);
    setIsNoteDialogOpen(false);
    setIsEditingNote(false);
    setEditedNoteContent('');
  };

  const handleEditNote = (noteId: string) => {
    setSelectedNote(noteId);
    setEditedNoteContent(notes[noteId].content);
    setIsEditingNote(true);
    setIsNoteDialogOpen(true);
  };

  const handleSaveNote = () => {
    if (selectedNote && editedNoteContent.trim()) {
      updateNote(selectedNote, { content: editedNoteContent.trim() });
      setIsEditingNote(false);
    }
  };

  const tasksList = Object.values(tasks).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const notesList = Object.values(notes).sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const timeBlocksList = Object.values(timeBlocks).sort((a, b) => 
    new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  // Get the selected note if one is selected
  const currentNote = selectedNote ? notes[selectedNote] : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Board Journal</h2>
        <div className="flex items-center gap-2">
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
              <Tabs defaultValue="task">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="task">Task</TabsTrigger>
                  <TabsTrigger value="note">Note</TabsTrigger>
                  <TabsTrigger value="timeblock">Time Block</TabsTrigger>
                </TabsList>
                <TabsContent value="task" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Input
                      placeholder="Task title"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                    />
                    <Textarea placeholder="Description (optional)" />
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleAddTask}>Add Task</Button>
                  </div>
                </TabsContent>
                <TabsContent value="note" className="space-y-4 pt-4">
                  <Textarea
                    placeholder="Note content"
                    className="min-h-[150px]"
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <Button onClick={handleAddNote}>Add Note</Button>
                  </div>
                </TabsContent>
                <TabsContent value="timeblock" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Input placeholder="Time block title" />
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        <Input type="date" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <Input type="time" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        <Input type="date" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <Input type="time" />
                      </div>
                    </div>
                    <Textarea placeholder="Description (optional)" />
                  </div>
                  <div className="flex justify-end">
                    <Button>Add Time Block</Button>
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="today">
        <TabsList className="mb-4">
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="week">This Week</TabsTrigger>
          <TabsTrigger value="month">This Month</TabsTrigger>
        </TabsList>
        
        <TabsContent value="today" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Tasks Section */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Tasks</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setIsAddingTask(!isAddingTask)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {isAddingTask && (
                  <div className="flex items-center gap-2 mb-2">
                    <Input
                      placeholder="New task"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                    />
                    <Button size="icon" variant="ghost" onClick={() => setIsAddingTask(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                    <Button size="icon" onClick={handleAddTask}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                {tasksList.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No tasks yet. Add one to get started.</p>
                ) : (
                  <div className="space-y-2">
                    {tasksList.map((task) => (
                      <div key={task.id} className="flex items-start gap-2">
                        <Checkbox
                          id={`task-${task.id}`}
                          checked={task.completed}
                          onCheckedChange={(checked) => 
                            handleToggleTask(task.id, checked as boolean)
                          }
                        />
                        <div className="flex-1">
                          <label
                            htmlFor={`task-${task.id}`}
                            className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                              task.completed ? 'line-through text-muted-foreground' : ''
                            }`}
                          >
                            {task.title}
                          </label>
                          {task.description && (
                            <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
                          )}
                        </div>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes Section */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Notes</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setIsAddingNote(!isAddingNote)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {isAddingNote && (
                  <div className="space-y-2 mb-2">
                    <Textarea
                      placeholder="New note"
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setIsAddingNote(false)}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleAddNote}>
                        Add
                      </Button>
                    </div>
                  </div>
                )}
                {notesList.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No notes yet. Add one to get started.</p>
                ) : (
                  <div className="space-y-3">
                    {notesList.map((note) => (
                      <div key={note.id} className="space-y-1">
                        <div className="flex items-start justify-between">
                          <p 
                            className="text-sm whitespace-pre-wrap cursor-pointer hover:text-blue-500 transition-colors"
                            onClick={() => handleNoteClick(note.id)}
                          >
                            {note.content}
                          </p>
                          <Button variant="ghost" size="icon" onClick={() => handleEditNote(note.id)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(note.updatedAt), 'MMM d, h:mm a')}
                        </p>
                        <Separator className="my-1" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Time Blocks Section */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Time Blocks</CardTitle>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Time Block</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Input placeholder="Time block title" />
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="h-4 w-4" />
                              <Input type="date" />
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <Input type="time" />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="h-4 w-4" />
                              <Input type="date" />
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <Input type="time" />
                            </div>
                          </div>
                          <Textarea placeholder="Description (optional)" />
                        </div>
                        <div className="flex justify-end">
                          <Button>Add Time Block</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {timeBlocksList.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No time blocks yet. Add one to get started.</p>
                ) : (
                  <div className="space-y-3">
                    {timeBlocksList.map((timeBlock) => (
                      <div key={timeBlock.id} className="space-y-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium">{timeBlock.title}</p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>
                                {format(new Date(timeBlock.startTime), 'h:mm a')} - 
                                {format(new Date(timeBlock.endTime), 'h:mm a')}
                              </span>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-3 w-3" />
                          </Button>
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
        </TabsContent>
        
        <TabsContent value="week" className="space-y-4">
          <p className="text-muted-foreground">Weekly view coming soon...</p>
        </TabsContent>
        
        <TabsContent value="month" className="space-y-4">
          <p className="text-muted-foreground">Monthly view coming soon...</p>
        </TabsContent>
      </Tabs>

      {/* Note Dialog */}
      <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditingNote ? 'Edit Note' : 'Note'}</DialogTitle>
          </DialogHeader>
          {currentNote && (
            <div className="space-y-4">
              {isEditingNote ? (
                <Textarea
                  value={editedNoteContent}
                  onChange={(e) => setEditedNoteContent(e.target.value)}
                  className="min-h-[150px]"
                />
              ) : (
                <div className="whitespace-pre-wrap">
                  {currentNote.content}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Last updated: {format(new Date(currentNote.updatedAt), 'MMM d, yyyy h:mm a')}
              </p>
            </div>
          )}
          <DialogFooter className="flex justify-between sm:justify-between">
            {isEditingNote ? (
              <>
                <Button variant="outline" onClick={() => setIsEditingNote(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveNote}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={handleCloseNoteDialog}>
                  Close
                </Button>
                <Button onClick={() => {
                  if (currentNote) {
                    setEditedNoteContent(currentNote.content);
                    setIsEditingNote(true);
                  }
                }}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 