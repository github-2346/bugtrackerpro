import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  MessageSquare,
  Send,
  Clock,
  User,
  AlertCircle,
  Image,
} from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { TextArea } from '../components/ui/TextArea';
import { Select } from '../components/ui/Select';
import { useAuthStore, getAllUsers } from '../store/authStore';
import { useProjectStore } from '../store/projectStore';
import { useTicketStore } from '../store/ticketStore';
import { useCommentStore } from '../store/commentStore';
import type { TicketStatus, Priority } from '../types';
import { cn } from '../utils/cn';

export const TicketDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { projects } = useProjectStore();
  const { getTicketById, updateTicket, deleteTicket } = useTicketStore();
  const { getCommentsByTicket, addComment, deleteComment } = useCommentStore();
  const users = getAllUsers();

  const ticket = getTicketById(id || '');
  const comments = getCommentsByTicket(id || '');
  const project = ticket ? projects.find((p) => p.id === ticket.projectId) : null;
  const reporter = ticket ? users.find((u) => u.id === ticket.reporterId) : null;
  const assignee = ticket?.assigneeId ? users.find((u) => u.id === ticket.assigneeId) : null;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [editForm, setEditForm] = useState({
    title: ticket?.title || '',
    description: ticket?.description || '',
    status: ticket?.status || 'TODO',
    priority: ticket?.priority || 'MEDIUM',
    assigneeId: ticket?.assigneeId || '',
  });

  const canEdit =
    user?.role === 'ADMIN' ||
    user?.role === 'MANAGER' ||
    ticket?.reporterId === user?.id ||
    ticket?.assigneeId === user?.id;

  const canDelete = user?.role === 'ADMIN' || user?.role === 'MANAGER' || ticket?.reporterId === user?.id;

  if (!ticket) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <AlertCircle className="w-16 h-16 text-white mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Ticket Not Found</h2>
          <p className="text-white/70 mb-6">The ticket you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/kanban')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Board
          </Button>
        </div>
      </Layout>
    );
  }

  const handleEdit = () => {
    updateTicket(ticket.id, {
      title: editForm.title,
      description: editForm.description,
      status: editForm.status as TicketStatus,
      priority: editForm.priority as Priority,
      assigneeId: editForm.assigneeId || undefined,
    });
    setIsEditModalOpen(false);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this ticket?')) {
      deleteTicket(ticket.id);
      navigate('/kanban');
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    addComment({
      content: newComment,
      ticketId: ticket.id,
      authorId: user?.id || '',
    });
    setNewComment('');
  };

  const handleDeleteComment = (commentId: string) => {
    if (confirm('Delete this comment?')) {
      deleteComment(commentId);
    }
  };

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

  const getStatusStyle = (status: TicketStatus) => {
    switch (status) {
      case 'DONE':
        return 'bg-white text-black';
      case 'IN_PROGRESS':
        return 'bg-white text-black';
      default:
        return 'border border-white text-white bg-black';
    }
  };

  const statusOptions = [
    { value: 'TODO', label: 'To Do' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'DONE', label: 'Done' },
  ];

  const priorityOptions = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'CRITICAL', label: 'Critical' },
  ];

  const assigneeOptions = [
    { value: '', label: 'Unassigned' },
    ...users.map((u) => ({ value: u.id, label: u.name })),
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-white/70 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <div className="flex items-center space-x-3 mb-2">
              <Badge variant="outline">{project?.key}-{ticket.id}</Badge>
              <span className={cn('text-sm px-3 py-1 rounded-full', getStatusStyle(ticket.status))}>
                {ticket.status.replace('_', ' ')}
              </span>
              <span className={cn('text-sm px-3 py-1 rounded-full', getPriorityStyle(ticket.priority))}>
                {ticket.priority}
              </span>
            </div>
            <h1 className="text-4xl font-bold text-white">{ticket.title}</h1>
          </div>

          {canEdit && (
            <div className="flex space-x-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setEditForm({
                    title: ticket.title,
                    description: ticket.description,
                    status: ticket.status,
                    priority: ticket.priority,
                    assigneeId: ticket.assigneeId || '',
                  });
                  setIsEditModalOpen(true);
                }}
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
              {canDelete && (
                <Button variant="danger" onClick={handleDelete}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <h2 className="text-xl font-bold text-white mb-4">Description</h2>
              <p className="text-white/70 whitespace-pre-wrap">
                {ticket.description || 'No description provided.'}
              </p>
            </Card>

            {/* Screenshot */}
            {ticket.screenshot && (
              <Card>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Image className="w-5 h-5 mr-2" />
                  Screenshot
                </h2>
                <img
                  src={ticket.screenshot}
                  alt="Ticket screenshot"
                  className="w-full rounded-lg border border-white"
                />
              </Card>
            )}

            {/* Comments */}
            <Card>
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Comments ({comments.length})
              </h2>

              {/* Add Comment */}
              <div className="flex space-x-4 mb-6">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-black font-medium">
                    {user?.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full px-4 py-3 bg-black text-white border border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white resize-none"
                    rows={3}
                  />
                  <div className="flex justify-end mt-2">
                    <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                      <Send className="w-4 h-4 mr-2" />
                      Send
                    </Button>
                  </div>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-4">
                {comments.length === 0 ? (
                  <p className="text-white/50 text-center py-8">No comments yet</p>
                ) : (
                  comments.map((comment) => {
                    const author = users.find((u) => u.id === comment.authorId);
                    const canDeleteComment =
                      user?.role === 'ADMIN' || comment.authorId === user?.id;

                    return (
                      <div
                        key={comment.id}
                        className="flex space-x-4 p-4 border border-white/20 rounded-lg"
                      >
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-medium">
                            {author?.name.charAt(0).toUpperCase() || '?'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-white">
                              {author?.name || 'Unknown User'}
                            </span>
                            <div className="flex items-center space-x-3">
                              <span className="text-xs text-white/50">
                                {formatDate(comment.createdAt)}
                              </span>
                              {canDeleteComment && (
                                <button
                                  onClick={() => handleDeleteComment(comment.id)}
                                  className="text-white/50 hover:text-white transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="text-white/70">{comment.content}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Details */}
            <Card>
              <h2 className="text-xl font-bold text-white mb-6">Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-white/50 block mb-1">Project</label>
                  <p className="text-white font-medium">{project?.name || 'Unknown'}</p>
                </div>
                <div>
                  <label className="text-sm text-white/50 block mb-1">Status</label>
                  <span className={cn('inline-block px-3 py-1 rounded-full text-sm', getStatusStyle(ticket.status))}>
                    {ticket.status.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <label className="text-sm text-white/50 block mb-1">Priority</label>
                  <span className={cn('inline-block px-3 py-1 rounded-full text-sm', getPriorityStyle(ticket.priority))}>
                    {ticket.priority}
                  </span>
                </div>
              </div>
            </Card>

            {/* People */}
            <Card>
              <h2 className="text-xl font-bold text-white mb-6">People</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-white/50 block mb-2">Reporter</label>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                      <span className="text-black text-sm font-medium">
                        {reporter?.name.charAt(0).toUpperCase() || '?'}
                      </span>
                    </div>
                    <span className="text-white">{reporter?.name || 'Unknown'}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-white/50 block mb-2">Assignee</label>
                  {assignee ? (
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                        <span className="text-black text-sm font-medium">
                          {assignee.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-white">{assignee.name}</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white/50" />
                      </div>
                      <span className="text-white/50">Unassigned</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Dates */}
            <Card>
              <h2 className="text-xl font-bold text-white mb-6">Dates</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-white/50 block mb-1 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Created
                  </label>
                  <p className="text-white">{formatDate(ticket.createdAt)}</p>
                </div>
                <div>
                  <label className="text-sm text-white/50 block mb-1 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Updated
                  </label>
                  <p className="text-white">{formatDate(ticket.updatedAt)}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Ticket"
        size="lg"
      >
        <div className="space-y-6">
          <Input
            label="Title"
            value={editForm.title}
            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
          />
          <TextArea
            label="Description"
            value={editForm.description}
            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            rows={4}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Status"
              options={statusOptions}
              value={editForm.status}
              onChange={(e) => setEditForm({ ...editForm, status: e.target.value as TicketStatus })}
            />
            <Select
              label="Priority"
              options={priorityOptions}
              value={editForm.priority}
              onChange={(e) => setEditForm({ ...editForm, priority: e.target.value as Priority })}
            />
          </div>
          <Select
            label="Assignee"
            options={assigneeOptions}
            value={editForm.assigneeId}
            onChange={(e) => setEditForm({ ...editForm, assigneeId: e.target.value })}
          />
          <div className="flex justify-end space-x-4">
            <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};
