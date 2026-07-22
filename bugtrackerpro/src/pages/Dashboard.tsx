import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderKanban, Ticket, CheckCircle, Clock, AlertCircle, Users } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useAuthStore } from '../store/authStore';
import { useProjectStore } from '../store/projectStore';
import { useTicketStore } from '../store/ticketStore';
import { getAllUsers } from '../store/authStore';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { projects } = useProjectStore();
  const { tickets } = useTicketStore();

  const userProjects = projects.filter(
    (p) => p.memberIds.includes(user?.id || '') || p.ownerId === user?.id
  );

  const todoCount = tickets.filter((t) => t.status === 'TODO').length;
  const inProgressCount = tickets.filter((t) => t.status === 'IN_PROGRESS').length;
  const doneCount = tickets.filter((t) => t.status === 'DONE').length;
  const myTickets = tickets.filter((t) => t.assigneeId === user?.id);

  const stats = [
    { icon: FolderKanban, label: 'Projects', value: userProjects.length },
    { icon: Ticket, label: 'To Do', value: todoCount },
    { icon: Clock, label: 'In Progress', value: inProgressCount },
    { icon: CheckCircle, label: 'Completed', value: doneCount },
  ];

  const recentTickets = tickets.slice(0, 5);
  const users = getAllUsers();

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-white text-black';
      case 'HIGH':
        return 'bg-white text-black';
      case 'MEDIUM':
        return 'border border-white text-white bg-black';
      default:
        return 'border border-white text-white bg-black';
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, {user?.name}
          </h1>
          <p className="text-white/70">Here's what's happening with your projects</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.label} hover className="group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm mb-1">{stat.label}</p>
                  <p className="text-4xl font-bold text-white">{stat.value}</p>
                </div>
                <div className="p-3 bg-white rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="w-6 h-6 text-black" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Tickets */}
          <div className="lg:col-span-2">
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Recent Tickets</h2>
                <button
                  onClick={() => navigate('/kanban')}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  View All →
                </button>
              </div>
              <div className="space-y-4">
                {recentTickets.length === 0 ? (
                  <p className="text-white/50 text-center py-8">No tickets yet</p>
                ) : (
                  recentTickets.map((ticket) => {
                    const project = projects.find((p) => p.id === ticket.projectId);
                    const assignee = users.find((u) => u.id === ticket.assigneeId);
                    return (
                      <div
                        key={ticket.id}
                        onClick={() => navigate(`/ticket/${ticket.id}`)}
                        className="p-4 border border-white rounded-lg hover:bg-white hover:text-black transition-all duration-200 cursor-pointer group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <Badge variant="outline" className="text-xs group-hover:bg-black group-hover:text-white group-hover:border-black">
                                {project?.key}-{ticket.id}
                              </Badge>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityStyle(ticket.priority)} group-hover:bg-black group-hover:text-white`}>
                                {ticket.priority}
                              </span>
                            </div>
                            <h3 className="font-medium text-white group-hover:text-black">
                              {ticket.title}
                            </h3>
                            <p className="text-sm text-white/70 mt-1 group-hover:text-black/70">
                              {assignee ? `Assigned to ${assignee.name}` : 'Unassigned'}
                            </p>
                          </div>
                          <Badge variant={ticket.status === 'DONE' ? 'default' : 'outline'} className="group-hover:bg-black group-hover:text-white">
                            {ticket.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          </div>

          {/* My Assigned Tickets */}
          <div>
            <Card>
              <div className="flex items-center space-x-2 mb-6">
                <AlertCircle className="w-5 h-5 text-white" />
                <h2 className="text-xl font-bold text-white">My Tickets</h2>
              </div>
              <div className="space-y-3">
                {myTickets.length === 0 ? (
                  <p className="text-white/50 text-center py-8">No tickets assigned</p>
                ) : (
                  myTickets.slice(0, 5).map((ticket) => (
                    <div
                      key={ticket.id}
                      onClick={() => navigate(`/ticket/${ticket.id}`)}
                      className="p-3 border border-white rounded-lg hover:bg-white hover:text-black transition-all duration-200 cursor-pointer group"
                    >
                      <p className="font-medium text-white truncate group-hover:text-black">
                        {ticket.title}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-white/70 group-hover:text-black/70">
                          {ticket.status.replace('_', ' ')}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityStyle(ticket.priority)} group-hover:bg-black group-hover:text-white`}>
                          {ticket.priority}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Team Members */}
            <Card className="mt-6">
              <div className="flex items-center space-x-2 mb-6">
                <Users className="w-5 h-5 text-white" />
                <h2 className="text-xl font-bold text-white">Team</h2>
              </div>
              <div className="space-y-3">
                {users.slice(0, 5).map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                      <span className="text-black font-medium">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{member.name}</p>
                      <p className="text-white/50 text-xs">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};
