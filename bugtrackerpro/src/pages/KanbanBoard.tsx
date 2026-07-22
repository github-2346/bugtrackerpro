import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Search, Filter, X } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { TextArea } from '../components/ui/TextArea';
import { useAuthStore, getAllUsers } from '../store/authStore';
import { useProjectStore } from '../store/projectStore';
import { useTicketStore } from '../store/ticketStore';
import type { Ticket, TicketStatus, Priority } from '../types';
import { cn } from '../utils/cn';

const columns: { id: TicketStatus; title: string }[] = [
  { id: 'TODO', title: 'To Do' },
  { id: 'IN_PROGRESS', title: 'In Progress' },
  { id: 'DONE', title: 'Done' },
];

interface TicketCardProps {
  ticket: Ticket;
  isDragging?: boolean;
}

const TicketCard: React.FC<TicketCardProps> = ({ ticket, isDragging }) => {
  const navigate = useNavigate();
  const { projects } = useProjectStore();
  const users = getAllUsers();
  
  const project = projects.find((p) => p.id === ticket.projectId);
  const assignee = users.find((u) => u.id === ticket.assigneeId);

  const getPriorityStyle = (priority: Priority) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-white text-black';
      case 'HIGH':
        return 'bg-white text-black';
      default:
        return 'border border-white text-white bg-black';
    }
  };

  return (
    <div
      onClick={() => !isDragging && navigate(`/ticket/${ticket.id}`)}
      className={cn(
        'bg-black border border-white rounded-lg p-4 cursor-pointer',
        'transition-all duration-200 group',
        isDragging ? 'opacity-50 scale-105' : 'hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]'
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <Badge variant="outline" className="text-xs">
          {project?.key}-{ticket.id}
        </Badge>
        <span className={cn('text-xs px-2 py-0.5 rounded-full', getPriorityStyle(ticket.priority))}>
          {ticket.priority}
        </span>
      </div>
      <h3 className="font-medium text-white mb-2 line-clamp-2">{ticket.title}</h3>
      <p className="text-sm text-white/50 line-clamp-2 mb-3">{ticket.description}</p>
      {assignee && (
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
            <span className="text-black text-xs font-medium">
              {assignee.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="text-xs text-white/70">{assignee.name}</span>
        </div>
      )}
    </div>
  );
};

interface SortableTicketProps {
  ticket: Ticket;
}

const SortableTicket: React.FC<SortableTicketProps> = ({ ticket }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ticket.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TicketCard ticket={ticket} isDragging={isDragging} />
    </div>
  );
};

interface ColumnProps {
  column: { id: TicketStatus; title: string };
  tickets: Ticket[];
}

const Column: React.FC<ColumnProps> = ({ column, tickets }) => {
  return (
    <div className="flex-1 min-w-[300px] max-w-[400px]">
      <div className="bg-black border border-white rounded-xl p-4 h-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">{column.title}</h2>
          <Badge>{tickets.length}</Badge>
        </div>
        <SortableContext
          items={tickets.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4 min-h-[400px]">
            {tickets.map((ticket) => (
              <SortableTicket key={ticket.id} ticket={ticket} />
            ))}
          </div>
        </SortableContext>
      </div>
    </div>
  );
};

export const KanbanBoard: React.FC = () => {
  const [searchParams] = useSearchParams();
  const projectIdFromUrl = searchParams.get('project');
  
  const { user } = useAuthStore();
  const { projects } = useProjectStore();
  const { tickets, updateStatus, addTicket, clearFilters } = useTicketStore();
  const users = getAllUsers();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState(projectIdFromUrl || '');
  const [selectedAssignee, setSelectedAssignee] = useState('');

  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM' as Priority,
    projectId: projectIdFromUrl || '',
    assigneeId: '',
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      if (selectedProject && ticket.projectId !== selectedProject) return false;
      if (selectedAssignee && ticket.assigneeId !== selectedAssignee) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !ticket.title.toLowerCase().includes(query) &&
          !ticket.description.toLowerCase().includes(query)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [tickets, selectedProject, selectedAssignee, searchQuery]);

  const activeTicket = activeId
    ? tickets.find((t) => t.id === activeId)
    : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeTicket = tickets.find((t) => t.id === active.id);
    if (!activeTicket) return;

    // Find which column the ticket was dropped in
    const overTicket = tickets.find((t) => t.id === over.id);
    if (overTicket && overTicket.status !== activeTicket.status) {
      updateStatus(activeTicket.id, overTicket.status);
    }
  };

  const handleDragOver = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeTicket = tickets.find((t) => t.id === active.id);
    const overTicket = tickets.find((t) => t.id === over.id);

    if (activeTicket && overTicket && activeTicket.status !== overTicket.status) {
      updateStatus(activeTicket.id, overTicket.status);
    }
  };

  const handleCreateTicket = () => {
    if (!newTicket.title || !newTicket.projectId) return;

    addTicket({
      title: newTicket.title,
      description: newTicket.description,
      status: 'TODO',
      priority: newTicket.priority,
      projectId: newTicket.projectId,
      reporterId: user?.id || '',
      assigneeId: newTicket.assigneeId || undefined,
    });

    setNewTicket({
      title: '',
      description: '',
      priority: 'MEDIUM',
      projectId: projectIdFromUrl || '',
      assigneeId: '',
    });
    setIsCreateModalOpen(false);
  };

  const handleClearFilters = () => {
    setSelectedProject('');
    setSelectedAssignee('');
    setSearchQuery('');
    clearFilters();
  };

  const userProjects = projects.filter(
    (p) => p.memberIds.includes(user?.id || '') || p.ownerId === user?.id || user?.role === 'ADMIN'
  );

  const projectOptions = [
    { value: '', label: 'All Projects' },
    ...userProjects.map((p) => ({ value: p.id, label: p.name })),
  ];

  const assigneeOptions = [
    { value: '', label: 'All Assignees' },
    ...users.map((u) => ({ value: u.id, label: u.name })),
  ];

  const priorityOptions = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'CRITICAL', label: 'Critical' },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Kanban Board</h1>
            <p className="text-white/70">Drag and drop to update ticket status</p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Ticket
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-black text-white border border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>
          <Button
            variant={showFilters ? 'primary' : 'secondary'}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-black border border-white rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white">Filters</h3>
              <button
                onClick={handleClearFilters}
                className="text-white/70 hover:text-white transition-colors flex items-center space-x-1"
              >
                <X className="w-4 h-4" />
                <span>Clear All</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Project"
                options={projectOptions}
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
              />
              <Select
                label="Assignee"
                options={assigneeOptions}
                value={selectedAssignee}
                onChange={(e) => setSelectedAssignee(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Kanban Columns */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
        >
          <div className="flex space-x-6 overflow-x-auto pb-4">
            {columns.map((column) => (
              <Column
                key={column.id}
                column={column}
                tickets={filteredTickets.filter((t) => t.status === column.id)}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTicket ? <TicketCard ticket={activeTicket} isDragging /> : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Create Ticket Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Ticket"
        size="lg"
      >
        <div className="space-y-6">
          <Input
            label="Title"
            placeholder="Enter ticket title"
            value={newTicket.title}
            onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
          />
          <TextArea
            label="Description"
            placeholder="Describe the issue..."
            value={newTicket.description}
            onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
            rows={4}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Project"
              options={userProjects.map((p) => ({ value: p.id, label: p.name }))}
              value={newTicket.projectId}
              onChange={(e) => setNewTicket({ ...newTicket, projectId: e.target.value })}
            />
            <Select
              label="Priority"
              options={priorityOptions}
              value={newTicket.priority}
              onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value as Priority })}
            />
          </div>
          <Select
            label="Assignee (Optional)"
            options={assigneeOptions}
            value={newTicket.assigneeId}
            onChange={(e) => setNewTicket({ ...newTicket, assigneeId: e.target.value })}
          />
          <div className="flex justify-end space-x-4">
            <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTicket}>
              Create Ticket
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};
