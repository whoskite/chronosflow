"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useStore } from '@/lib/store/use-store';
import { format } from 'date-fns';

export function Notes() {
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState('');

  const { notes, addNote, updateNote, deleteNote } = useStore();

  const handleAddNote = () => {
    if (newNoteContent.trim()) {
      addNote({ content: newNoteContent.trim() });
      setNewNoteContent('');
    }
  };

  const handleEditNote = (id: string) => {
    setEditingNote(id);
    setEditedContent(notes[id].content);
  };

  const handleSaveEdit = () => {
    if (editingNote && editedContent.trim()) {
      updateNote(editingNote, { content: editedContent.trim() });
      setEditingNote(null);
      setEditedContent('');
    }
  };

  const handleCancelEdit = () => {
    setEditingNote(null);
    setEditedContent('');
  };

  const notesList = Object.values(notes).sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Notes</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Note
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Note</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Textarea
                placeholder="Write your thoughts..."
                className="min-h-[200px]"
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
              />
              <div className="flex justify-end">
                <Button onClick={handleAddNote}>Save Note</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Quick Note</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                placeholder="Brain dump your thoughts here..."
                className="min-h-[100px]"
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
              />
              <div className="flex justify-end">
                <Button onClick={handleAddNote}>Save</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {notesList.map((note) => (
          <Card key={note.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-muted-foreground">
                  {format(new Date(note.updatedAt), 'MMM d, yyyy h:mm a')}
                </CardTitle>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleEditNote(note.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => deleteNote(note.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {editingNote === note.id ? (
                <div className="space-y-2">
                  <Textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="min-h-[150px]"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSaveEdit}>
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="whitespace-pre-wrap text-sm">{note.content}</div>
              )}
            </CardContent>
          </Card>
        ))}

        {notesList.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="py-6">
              <div className="text-center text-muted-foreground">
                <p>No notes yet. Start by adding one above.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 