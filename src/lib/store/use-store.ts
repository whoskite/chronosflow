import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Task = {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  dueDate?: Date;
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
};

export type Note = {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
};

export type TimeBlock = {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  actualStartTime?: Date;
  actualEndTime?: Date;
  description?: string;
  color?: string;
  tags?: string[];
  status: 'planned' | 'in-progress' | 'completed';
  notes?: string;
};

export type BoardSection = {
  id: string;
  title: string;
  items: string[]; // IDs of tasks or notes
};

export type Board = {
  id: string;
  title: string;
  sections: BoardSection[];
  createdAt: Date;
  updatedAt: Date;
};

type Store = {
  tasks: Record<string, Task>;
  notes: Record<string, Note>;
  timeBlocks: Record<string, TimeBlock>;
  boards: Record<string, Board>;
  
  // Task actions
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => string;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  
  // Note actions
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateNote: (id: string, note: Partial<Omit<Note, 'updatedAt'>>) => void;
  deleteNote: (id: string) => void;
  
  // TimeBlock actions
  addTimeBlock: (timeBlock: Omit<TimeBlock, 'id'>) => string;
  updateTimeBlock: (id: string, timeBlock: Partial<TimeBlock>) => void;
  deleteTimeBlock: (id: string) => void;
  
  // Board actions
  addBoard: (board: Omit<Board, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateBoard: (id: string, board: Partial<Omit<Board, 'updatedAt'>>) => void;
  deleteBoard: (id: string) => void;
  
  // Board section actions
  addBoardSection: (boardId: string, section: Omit<BoardSection, 'id'>) => string;
  updateBoardSection: (boardId: string, sectionId: string, section: Partial<BoardSection>) => void;
  deleteBoardSection: (boardId: string, sectionId: string) => void;
  
  // Board item actions
  addItemToSection: (boardId: string, sectionId: string, itemId: string) => void;
  moveItemBetweenSections: (boardId: string, fromSectionId: string, toSectionId: string, itemId: string) => void;
  removeItemFromSection: (boardId: string, sectionId: string, itemId: string) => void;
};

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useStore = create<Store>()(
  persist(
    (set) => ({
      tasks: {},
      notes: {},
      timeBlocks: {},
      boards: {},
      
      // Task actions
      addTask: (task) => {
        const id = generateId();
        set((state) => ({
          tasks: {
            ...state.tasks,
            [id]: {
              ...task,
              id,
              completed: false,
              createdAt: new Date(),
            },
          },
        }));
        return id;
      },
      
      updateTask: (id, task) => {
        set((state) => ({
          tasks: {
            ...state.tasks,
            [id]: {
              ...state.tasks[id],
              ...task,
            },
          },
        }));
      },
      
      deleteTask: (id) => {
        set((state) => {
          const newTasks = { ...state.tasks };
          delete newTasks[id];
          return { tasks: newTasks };
        });
      },
      
      // Note actions
      addNote: (note) => {
        const id = generateId();
        const now = new Date();
        set((state) => ({
          notes: {
            ...state.notes,
            [id]: {
              ...note,
              id,
              createdAt: now,
              updatedAt: now,
            },
          },
        }));
        return id;
      },
      
      updateNote: (id, note) => {
        set((state) => ({
          notes: {
            ...state.notes,
            [id]: {
              ...state.notes[id],
              ...note,
              updatedAt: new Date(),
            },
          },
        }));
      },
      
      deleteNote: (id) => {
        set((state) => {
          const newNotes = { ...state.notes };
          delete newNotes[id];
          return { notes: newNotes };
        });
      },
      
      // TimeBlock actions
      addTimeBlock: (timeBlock) => {
        const id = generateId();
        set((state) => ({
          timeBlocks: {
            ...state.timeBlocks,
            [id]: {
              ...timeBlock,
              id,
            },
          },
        }));
        return id;
      },
      
      updateTimeBlock: (id, timeBlock) => {
        set((state) => ({
          timeBlocks: {
            ...state.timeBlocks,
            [id]: {
              ...state.timeBlocks[id],
              ...timeBlock,
            },
          },
        }));
      },
      
      deleteTimeBlock: (id) => {
        set((state) => {
          const newTimeBlocks = { ...state.timeBlocks };
          delete newTimeBlocks[id];
          return { timeBlocks: newTimeBlocks };
        });
      },
      
      // Board actions
      addBoard: (board) => {
        const id = generateId();
        const now = new Date();
        set((state) => ({
          boards: {
            ...state.boards,
            [id]: {
              ...board,
              id,
              createdAt: now,
              updatedAt: now,
            },
          },
        }));
        return id;
      },
      
      updateBoard: (id, board) => {
        set((state) => ({
          boards: {
            ...state.boards,
            [id]: {
              ...state.boards[id],
              ...board,
              updatedAt: new Date(),
            },
          },
        }));
      },
      
      deleteBoard: (id) => {
        set((state) => {
          const newBoards = { ...state.boards };
          delete newBoards[id];
          return { boards: newBoards };
        });
      },
      
      // Board section actions
      addBoardSection: (boardId, section) => {
        const sectionId = generateId();
        set((state) => ({
          boards: {
            ...state.boards,
            [boardId]: {
              ...state.boards[boardId],
              sections: [
                ...state.boards[boardId].sections,
                {
                  ...section,
                  id: sectionId,
                  items: section.items || [],
                },
              ],
              updatedAt: new Date(),
            },
          },
        }));
        return sectionId;
      },
      
      updateBoardSection: (boardId, sectionId, section) => {
        set((state) => ({
          boards: {
            ...state.boards,
            [boardId]: {
              ...state.boards[boardId],
              sections: state.boards[boardId].sections.map((s) =>
                s.id === sectionId ? { ...s, ...section } : s
              ),
              updatedAt: new Date(),
            },
          },
        }));
      },
      
      deleteBoardSection: (boardId, sectionId) => {
        set((state) => ({
          boards: {
            ...state.boards,
            [boardId]: {
              ...state.boards[boardId],
              sections: state.boards[boardId].sections.filter((s) => s.id !== sectionId),
              updatedAt: new Date(),
            },
          },
        }));
      },
      
      // Board item actions
      addItemToSection: (boardId, sectionId, itemId) => {
        set((state) => ({
          boards: {
            ...state.boards,
            [boardId]: {
              ...state.boards[boardId],
              sections: state.boards[boardId].sections.map((section) =>
                section.id === sectionId
                  ? { ...section, items: [...section.items, itemId] }
                  : section
              ),
              updatedAt: new Date(),
            },
          },
        }));
      },
      
      moveItemBetweenSections: (boardId, fromSectionId, toSectionId, itemId) => {
        set((state) => {
          const fromSection = state.boards[boardId].sections.find((s) => s.id === fromSectionId);
          const toSection = state.boards[boardId].sections.find((s) => s.id === toSectionId);
          
          if (!fromSection || !toSection) return state;
          
          return {
            boards: {
              ...state.boards,
              [boardId]: {
                ...state.boards[boardId],
                sections: state.boards[boardId].sections.map((section) => {
                  if (section.id === fromSectionId) {
                    return {
                      ...section,
                      items: section.items.filter((id) => id !== itemId),
                    };
                  }
                  if (section.id === toSectionId) {
                    return {
                      ...section,
                      items: [...section.items, itemId],
                    };
                  }
                  return section;
                }),
                updatedAt: new Date(),
              },
            },
          };
        });
      },
      
      removeItemFromSection: (boardId, sectionId, itemId) => {
        set((state) => ({
          boards: {
            ...state.boards,
            [boardId]: {
              ...state.boards[boardId],
              sections: state.boards[boardId].sections.map((section) =>
                section.id === sectionId
                  ? { ...section, items: section.items.filter((id) => id !== itemId) }
                  : section
              ),
              updatedAt: new Date(),
            },
          },
        }));
      },
    }),
    {
      name: 'project-ai-storage',
    }
  )
); 