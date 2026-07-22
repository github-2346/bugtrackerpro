import React, { useState } from 'react';
import { User, Mail, Shield, Calendar, Edit2, Save } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { useAuthStore } from '../store/authStore';
import { useTicketStore } from '../store/ticketStore';
import { useProjectStore } from '../store/projectStore';

export const Profile: React.FC = () => {
  const { user, updateProfile } = useAuthStore();
  const { tickets } = useTicketStore();
  const { projects } = useProjectStore();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');

  const myTickets = tickets.filter((t) => t.assigneeId === user?.id);
  const myProjects = projects.filter(
    (p) => p.memberIds.includes(user?.id || '') || p.ownerId === user?.id
  );

  const todoCount = myTickets.filter((t) => t.status === 'TODO').length;
  const inProgressCount = myTickets.filter((t) => t.status === 'IN_PROGRESS').length;
  const doneCount = myTickets.filter((t) => t.status === 'DONE').length;

  const handleSave = () => {
    if (name.trim()) {
      updateProfile({ name: name.trim() });
      setIsEditing(false);
    }
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-white text-black';
      case 'MANAGER':
        return 'bg-white text-black';
      default:
        return 'border border-white text-white';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!user) return null;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Profile</h1>
          <p className="text-white/70">Manage your account settings</p>
        </div>

        {/* Profile Card */}
        <Card>
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center">
                <span className="text-4xl font-bold text-black">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                {isEditing ? (
                  <div className="flex items-center space-x-4">
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-64"
                    />
                    <Button onClick={handleSave} size="sm">
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setName(user.name);
                        setIsEditing(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                    <p className="text-white/70">{user.email}</p>
                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm ${getRoleBadgeStyle(user.role)}`}>
                      {user.role}
                    </span>
                  </>
                )}
              </div>
            </div>
            {!isEditing && (
              <Button variant="secondary" onClick={() => setIsEditing(true)}>
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-4 p-4 border border-white/20 rounded-lg">
              <div className="p-3 bg-white rounded-lg">
                <User className="w-5 h-5 text-black" />
              </div>
              <div>
                <p className="text-white/50 text-sm">Full Name</p>
                <p className="text-white font-medium">{user.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-4 border border-white/20 rounded-lg">
              <div className="p-3 bg-white rounded-lg">
                <Mail className="w-5 h-5 text-black" />
              </div>
              <div>
                <p className="text-white/50 text-sm">Email</p>
                <p className="text-white font-medium">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-4 border border-white/20 rounded-lg">
              <div className="p-3 bg-white rounded-lg">
                <Shield className="w-5 h-5 text-black" />
              </div>
              <div>
                <p className="text-white/50 text-sm">Role</p>
                <p className="text-white font-medium">{user.role}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card hover>
            <div className="text-center">
              <p className="text-4xl font-bold text-white mb-2">{myProjects.length}</p>
              <p className="text-white/70">Projects</p>
            </div>
          </Card>
          <Card hover>
            <div className="text-center">
              <p className="text-4xl font-bold text-white mb-2">{todoCount}</p>
              <p className="text-white/70">To Do</p>
            </div>
          </Card>
          <Card hover>
            <div className="text-center">
              <p className="text-4xl font-bold text-white mb-2">{inProgressCount}</p>
              <p className="text-white/70">In Progress</p>
            </div>
          </Card>
          <Card hover>
            <div className="text-center">
              <p className="text-4xl font-bold text-white mb-2">{doneCount}</p>
              <p className="text-white/70">Completed</p>
            </div>
          </Card>
        </div>

        {/* Activity */}
        <Card>
          <h2 className="text-2xl font-bold text-white mb-6">My Tickets</h2>
          {myTickets.length === 0 ? (
            <p className="text-white/50 text-center py-8">No tickets assigned to you</p>
          ) : (
            <div className="space-y-4">
              {myTickets.slice(0, 10).map((ticket) => {
                const project = projects.find((p) => p.id === ticket.projectId);
                return (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between p-4 border border-white/20 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <Badge variant="outline">{project?.key}-{ticket.id}</Badge>
                      <div>
                        <p className="text-white font-medium">{ticket.title}</p>
                        <p className="text-white/50 text-sm">
                          {project?.name} • {ticket.priority}
                        </p>
                      </div>
                    </div>
                    <Badge variant={ticket.status === 'DONE' ? 'default' : 'outline'}>
                      {ticket.status.replace('_', ' ')}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Account Info */}
        <Card>
          <h2 className="text-2xl font-bold text-white mb-6">Account Information</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-white/20 rounded-lg">
              <div className="flex items-center space-x-4">
                <Calendar className="w-5 h-5 text-white/50" />
                <div>
                  <p className="text-white font-medium">Member Since</p>
                  <p className="text-white/50 text-sm">{formatDate(user.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};
