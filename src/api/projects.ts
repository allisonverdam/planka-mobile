// Planka Mobile — Projects API

import { apiClient } from './client';
import type { Project, Board, ProjectManager, BackgroundImage, User, BoardMembership } from '@/types/models';

export interface ProjectListResponse {
  items: Project[];
  included: {
    boards: Board[];
    boardMemberships: BoardMembership[];
    projectManagers: ProjectManager[];
    backgroundImages: BackgroundImage[];
    users: User[];
  };
}

export interface ProjectDetailResponse {
  item: Project;
  included: {
    boards: Board[];
    boardMemberships: BoardMembership[];
    projectManagers: ProjectManager[];
    backgroundImages: BackgroundImage[];
    users: User[];
  };
}

export async function getProjects(): Promise<ProjectListResponse> {
  const response = await apiClient.get<ProjectListResponse>('/projects');
  return response.data;
}

export async function getProject(projectId: string): Promise<ProjectDetailResponse> {
  const response = await apiClient.get<ProjectDetailResponse>(`/projects/${projectId}`);
  return response.data;
}

export async function createProject(data: { name: string }): Promise<{ item: Project }> {
  const response = await apiClient.post<{ item: Project }>('/projects', data);
  return response.data;
}

export async function updateProject(
  projectId: string,
  data: Partial<Pick<Project, 'name' | 'background'>>
): Promise<{ item: Project }> {
  const response = await apiClient.patch<{ item: Project }>(`/projects/${projectId}`, data);
  return response.data;
}

export async function deleteProject(projectId: string): Promise<void> {
  await apiClient.delete(`/projects/${projectId}`);
}
