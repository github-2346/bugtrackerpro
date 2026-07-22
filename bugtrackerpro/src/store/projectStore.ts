import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Project } from '../types';

interface ProjectStore {
  projects: Project[];
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addMember: (projectId: string, userId: string) => void;
  removeMember: (projectId: string, userId: string) => void;
  getProjectById: (id: string) => Project | undefined;
  getProjectsByUser: (userId: string) => Project[];
}

const initialProjects: Project[] = [
  {
    id: '1',
    name: 'E-Commerce Platform',
    description: 'Main e-commerce platform development project',
    key: 'ECOM',
    ownerId: '2',
    memberIds: ['1', '2', '3'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Mobile App',
    description: 'iOS and Android mobile application',
    key: 'MOB',
    ownerId: '2',
    memberIds: ['2', '3'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: initialProjects,
      
      addProject: (projectData) => {
        const newProject: Project = {
          ...projectData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ projects: [...state.projects, newProject] }));
        return newProject;
      },
      
      updateProject: (id, updates) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
          ),
        }));
      },
      
      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
        }));
      },
      
      addMember: (projectId, userId) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId && !p.memberIds.includes(userId)
              ? { ...p, memberIds: [...p.memberIds, userId], updatedAt: new Date().toISOString() }
              : p
          ),
        }));
      },
      
      removeMember: (projectId, userId) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? { ...p, memberIds: p.memberIds.filter((id) => id !== userId), updatedAt: new Date().toISOString() }
              : p
          ),
        }));
      },
      
      getProjectById: (id) => {
        return get().projects.find((p) => p.id === id);
      },
      
      getProjectsByUser: (userId) => {
        return get().projects.filter((p) => p.memberIds.includes(userId) || p.ownerId === userId);
      },
    }),
    {
      name: 'project-storage',
    }
  )
);
