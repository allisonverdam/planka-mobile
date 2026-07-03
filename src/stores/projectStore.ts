// Planka Mobile — Project Store
// Manages projects list and boards, hydrated from bootstrap

import { create } from 'zustand';
import { getProjects } from '@/api/projects';
import type {
  Project,
  Board,
  BoardMembership,
  ProjectManager,
  User,
  BootstrapData,
  BackgroundImage,
} from '@/types/models';

interface ProjectState {
  projects: Project[];
  boards: Board[];
  boardMemberships: BoardMembership[];
  projectManagers: ProjectManager[];
  users: User[];
  backgroundImages: BackgroundImage[];
  isLoading: boolean;
  error: string | null;

  // Actions
  hydrateFromBootstrap: (data: BootstrapData) => void;
  fetchProjects: () => Promise<void>;
  getBoardsForProject: (projectId: string) => Board[];
  reset: () => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  boards: [],
  boardMemberships: [],
  projectManagers: [],
  users: [],
  backgroundImages: [],
  isLoading: false,
  error: null,

  hydrateFromBootstrap: (data: BootstrapData) => {
    set({
      projects: data.projects ?? [],
      boards: data.boards ?? [],
      boardMemberships: data.boardMemberships ?? [],
      projectManagers: data.projectManagers ?? [],
      users: data.users ?? [],
      backgroundImages: data.backgroundImages ?? [],
    });
  },

  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await getProjects();
      set({
        projects: response.items,
        boards: response.included.boards ?? [],
        boardMemberships: response.included.boardMemberships ?? [],
        projectManagers: response.included.projectManagers ?? [],
        users: response.included.users ?? [],
        backgroundImages: response.included.backgroundImages ?? [],
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch projects',
      });
    }
  },

  getBoardsForProject: (projectId: string) => {
    return get()
      .boards.filter((b) => b.projectId === projectId)
      .sort((a, b) => a.position - b.position);
  },

  reset: () => {
    set({
      projects: [],
      boards: [],
      boardMemberships: [],
      projectManagers: [],
      users: [],
      backgroundImages: [],
      isLoading: false,
      error: null,
    });
  },
}));
