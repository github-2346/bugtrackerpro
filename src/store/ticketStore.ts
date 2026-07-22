import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Ticket, TicketStatus, FilterState } from '../types';

interface TicketStore {
  tickets: Ticket[];
  filters: FilterState;
  addTicket: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>) => Ticket;
  updateTicket: (id: string, updates: Partial<Ticket>) => void;
  deleteTicket: (id: string) => void;
  updateStatus: (id: string, status: TicketStatus) => void;
  setFilters: (filters: FilterState) => void;
  clearFilters: () => void;
  getTicketById: (id: string) => Ticket | undefined;
  getTicketsByProject: (projectId: string) => Ticket[];
  getFilteredTickets: () => Ticket[];
}

const initialTickets: Ticket[] = [
  {
    id: '1',
    title: 'Fix login page validation',
    description: 'The email validation is not working correctly on the login page. Users can submit invalid email formats.',
    status: 'TODO',
    priority: 'HIGH',
    projectId: '1',
    reporterId: '2',
    assigneeId: '3',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Implement password reset',
    description: 'Add password reset functionality with email verification.',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    projectId: '1',
    reporterId: '2',
    assigneeId: '3',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Update user profile page',
    description: 'Redesign the user profile page with new layout.',
    status: 'DONE',
    priority: 'LOW',
    projectId: '1',
    reporterId: '1',
    assigneeId: '3',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'Mobile app crash on startup',
    description: 'The app crashes on Android devices running version 10 or lower.',
    status: 'TODO',
    priority: 'CRITICAL',
    projectId: '2',
    reporterId: '2',
    assigneeId: '3',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    title: 'Add push notifications',
    description: 'Implement push notification support for iOS and Android.',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    projectId: '2',
    reporterId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const useTicketStore = create<TicketStore>()(
  persist(
    (set, get) => ({
      tickets: initialTickets,
      filters: {},
      
      addTicket: (ticketData) => {
        const newTicket: Ticket = {
          ...ticketData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ tickets: [...state.tickets, newTicket] }));
        return newTicket;
      },
      
      updateTicket: (id, updates) => {
        set((state) => ({
          tickets: state.tickets.map((t) =>
            t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
          ),
        }));
      },
      
      deleteTicket: (id) => {
        set((state) => ({
          tickets: state.tickets.filter((t) => t.id !== id),
        }));
      },
      
      updateStatus: (id, status) => {
        set((state) => ({
          tickets: state.tickets.map((t) =>
            t.id === id ? { ...t, status, updatedAt: new Date().toISOString() } : t
          ),
        }));
      },
      
      setFilters: (filters) => {
        set({ filters });
      },
      
      clearFilters: () => {
        set({ filters: {} });
      },
      
      getTicketById: (id) => {
        return get().tickets.find((t) => t.id === id);
      },
      
      getTicketsByProject: (projectId) => {
        return get().tickets.filter((t) => t.projectId === projectId);
      },
      
      getFilteredTickets: () => {
        const { tickets, filters } = get();
        return tickets.filter((ticket) => {
          if (filters.status && ticket.status !== filters.status) return false;
          if (filters.assigneeId && ticket.assigneeId !== filters.assigneeId) return false;
          if (filters.projectId && ticket.projectId !== filters.projectId) return false;
          if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            if (
              !ticket.title.toLowerCase().includes(searchLower) &&
              !ticket.description.toLowerCase().includes(searchLower)
            ) {
              return false;
            }
          }
          return true;
        });
      },
    }),
    {
      name: 'ticket-storage',
    }
  )
);
