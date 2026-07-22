import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Ticket, Trash2, Edit2 } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { TextArea } from '../components/ui/TextArea';
import { Badge } from '../components/ui/Badge';
import { useAuthStore, getAllUsers } from '../store/authStore';
import { useProjectStore } from '../store/projectStore';
import { useTicketStore } from '../store/ticketStore';

export const Projects: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { projects, addProject, updateProject, deleteProject, addMember, removeMember } = useProjectStore();
  const { tickets } = useTicketStore();
  const users = getAllUsers();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    key: '',
  });

  const userProjects = projects.filter(
    (p) => p.memberIds.includes(user?.id || '') || p.ownerId === user?.id || user?.role === 'ADMIN'
  );

  const canManageProjects = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  const handleCreateProject = () => {
    if (!formData.name || !formData.key) return;
    
    addProject({
      name: formData.name,
      description: formData.description,
      key: formData.key.toUpperCase(),
      ownerId: user?.id || '',
      memberIds: [user?.id || ''],
    });
    
    setFormData({ name: '', description: '', key: '' });
    setIsCreateModalOpen(false);
  };

  const handleEditProject = () => {
    if (!selectedProject || !formData.name) return;
    
    updateProject(selectedProject, {
      name: formData.name,
      description: formData.description,
    });
    
    setFormData({ name: '', description: '', key: '' });
    setIsEditModalOpen(false);
    setSelectedProject(null);
  };

  const handleDeleteProject = (projectId: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      deleteProject(projectId);
    }
  };

  const openEditModal = (project: typeof projects[0]) => {
    setSelectedProject(project.id);
    setFormData({
      name: project.name,
      description: project.description,
      key: project.key,
    });
    setIsEditModalOpen(true);
  };

  const openMembersModal = (projectId: string) => {
    setSelectedProject(projectId);
    setIsMembersModalOpen(true);
  };

  const selectedProjectData = projects.find((p) => p.id === selectedProject);

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Projects</h1>
            <p className="text-white/70">Manage your projects and teams</p>
          </div>
          {canManageProjects && (
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          )}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userProjects.map((project) => {
            const projectTickets = tickets.filter((t) => t.projectId === project.id);
            const projectMembers = users.filter((u) => project.memberIds.includes(u.id));
            const isOwner = project.ownerId === user?.id || user?.role === 'ADMIN';

            return (
              <Card key={project.id} hover className="group">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <Badge variant="outline" className="mb-2">{project.key}</Badge>
                    <h3 className="text-xl font-bold text-white group-hover:text-white">
                      {project.name}
                    </h3>
                  </div>
                  {isOwner && (
                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(project);
                        }}
                        className="p-2 text-white hover:bg-white hover:text-black rounded-lg transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProject(project.id);
                        }}
                        className="p-2 text-white hover:bg-white hover:text-black rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-white/70 mb-6 line-clamp-2">
                  {project.description || 'No description'}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-white/20">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1 text-white/70">
                      <Ticket className="w-4 h-4" />
                      <span className="text-sm">{projectTickets.length}</span>
                    </div>
                    <button
                      onClick={() => openMembersModal(project.id)}
                      className="flex items-center space-x-1 text-white/70 hover:text-white transition-colors"
                    >
                      <Users className="w-4 h-4" />
                      <span className="text-sm">{projectMembers.length}</span>
                    </button>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(`/kanban?project=${project.id}`)}
                  >
                    View Board
                  </Button>
                </div>
              </Card>
            );
          })}

          {userProjects.length === 0 && (
            <div className="col-span-full text-center py-16">
              <p className="text-white/50 text-lg">No projects found</p>
              {canManageProjects && (
                <Button
                  className="mt-4"
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  Create your first project
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Project Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Project"
      >
        <div className="space-y-6">
          <Input
            label="Project Name"
            placeholder="Enter project name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="Project Key"
            placeholder="e.g., PROJ"
            value={formData.key}
            onChange={(e) => setFormData({ ...formData, key: e.target.value.toUpperCase() })}
            maxLength={5}
          />
          <TextArea
            label="Description"
            placeholder="Enter project description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
          <div className="flex justify-end space-x-4">
            <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateProject}>
              Create Project
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Project Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Project"
      >
        <div className="space-y-6">
          <Input
            label="Project Name"
            placeholder="Enter project name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextArea
            label="Description"
            placeholder="Enter project description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
          <div className="flex justify-end space-x-4">
            <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditProject}>
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* Members Modal */}
      <Modal
        isOpen={isMembersModalOpen}
        onClose={() => setIsMembersModalOpen(false)}
        title="Project Members"
        size="lg"
      >
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-white mb-4">Current Members</h3>
            <div className="space-y-3">
              {selectedProjectData?.memberIds.map((memberId) => {
                const member = users.find((u) => u.id === memberId);
                if (!member) return null;
                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 border border-white rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                        <span className="text-black font-medium">
                          {member.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{member.name}</p>
                        <p className="text-white/50 text-sm">{member.role}</p>
                      </div>
                    </div>
                    {member.id !== selectedProjectData?.ownerId && canManageProjects && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMember(selectedProject!, member.id)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {canManageProjects && (
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Add Members</h3>
              <div className="space-y-3">
                {users
                  .filter((u) => !selectedProjectData?.memberIds.includes(u.id))
                  .map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 border border-white/50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{user.name}</p>
                          <p className="text-white/50 text-sm">{user.role}</p>
                        </div>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => addMember(selectedProject!, user.id)}
                      >
                        Add
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </Layout>
  );
};
