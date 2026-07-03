// Planka Mobile — API Domain Models
// Mapped from Planka Swagger v2.0.1

export interface User {
  id: string;
  name: string;
  email: string;
  username: string | null;
  phone: string | null;
  organization: string | null;
  language: string | null;
  subscribeToOwnCards: boolean;
  avatarUrl: string | null;
  isAdmin: boolean;
  isDeletionLocked: boolean;
  isLocked: boolean;
  isRoleLocked: boolean;
  isUsernameLocked: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface Project {
  id: string;
  name: string;
  background: {
    type: 'gradient' | 'image';
    name?: string;
  } | null;
  backgroundImage: BackgroundImage | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface BackgroundImage {
  id: string;
  projectId: string;
  size: string;
  url: string;
  thumbnailUrls: {
    outside360: string;
  };
  createdAt: string;
  updatedAt: string | null;
}

export interface Board {
  id: string;
  projectId: string;
  position: number;
  name: string;
  defaultView: 'kanban' | 'grid' | 'list';
  defaultCardType: 'project' | 'story';
  limitCardTypesToDefaultOne: boolean;
  alwaysDisplayCardCreator: boolean;
  expandTaskListsByDefault: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface BoardMembership {
  id: string;
  projectId: string;
  boardId: string;
  userId: string;
  role: 'editor' | 'viewer';
  canComment: boolean | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface List {
  id: string;
  boardId: string;
  position: number;
  name: string;
  type: 'active' | 'closed' | 'trash';
  color: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface Card {
  id: string;
  boardId: string;
  listId: string;
  creatorUserId: string | null;
  prevListId: string | null;
  coverAttachmentId: string | null;
  type: 'project' | 'story';
  position: number | null;
  name: string;
  description: string | null;
  dueDate: string | null;
  isDueCompleted: boolean | null;
  stopwatch: Stopwatch | null;
  commentsTotal: number;
  isClosed: boolean;
  listChangedAt: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface Stopwatch {
  startedAt: string | null;
  total: number;
}

export interface Label {
  id: string;
  boardId: string;
  position: number;
  name: string | null;
  color: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface CardLabel {
  id: string;
  cardId: string;
  labelId: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface CardMembership {
  id: string;
  cardId: string;
  userId: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface TaskList {
  id: string;
  cardId: string;
  position: number;
  name: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface Task {
  id: string;
  taskListId: string;
  position: number;
  name: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface Comment {
  id: string;
  cardId: string;
  userId: string | null;
  text: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface Attachment {
  id: string;
  cardId: string;
  creatorUserId: string | null;
  type: 'file' | 'link';
  data: {
    encoding: "binary";
    image: any[];
    size: number;
    url?: string;
    mimeType?: string;
    thumbnailUrls?: {
      outside360?: string;
      outside720?: string;
    };
  };
  name: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface Action {
  id: string;
  boardId: string | null;
  cardId: string;
  userId: string | null;
  type: 'createCard' | 'moveCard' | 'addMemberToCard' | 'removeMemberFromCard' | 'completeTask' | 'uncompleteTask';
  data: Record<string, unknown>;
  createdAt: string;
  updatedAt: string | null;
}

export interface Notification {
  id: string;
  userId: string;
  cardId: string;
  actionId: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface CustomFieldGroup {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface CustomField {
  id: string;
  baseCustomFieldGroupId: string | null;
  customFieldGroupId: string | null;
  position: number;
  name: string;
  showOnFrontOfCard: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface CustomFieldValue {
  customFieldGroupId: string;
  customFieldId: string;
  cardId: string;
  value: string;
}

export interface ProjectManager {
  id: string;
  projectId: string;
  userId: string;
  createdAt: string;
  updatedAt: string | null;
}

// Bootstrap response — all initial data in one request
export interface BootstrapData {
  user?: User;
  currentUser?: User;
  board: Board | null;
  projects: Project[];
  boards: Board[];
  boardMemberships: BoardMembership[];
  labels: Label[];
  lists: List[];
  cards: Card[];
  cardMemberships: CardMembership[];
  cardLabels: CardLabel[];
  taskLists: TaskList[];
  tasks: Task[];
  users: User[];
  projectManagers: ProjectManager[];
  notificationServices: unknown[];
  notifications: Notification[];
  customFieldGroups: CustomFieldGroup[];
  customFields: CustomField[];
  customFieldValues: CustomFieldValue[];
  backgroundImages: BackgroundImage[];
}

// Board detail response
export interface BoardDetailData {
  item: Board;
  included: {
    lists: List[];
    cards: Card[];
    cardMemberships: CardMembership[];
    cardLabels: CardLabel[];
    labels: Label[];
    taskLists: TaskList[];
    tasks: Task[];
    boardMemberships: BoardMembership[];
    customFieldGroups: CustomFieldGroup[];
    customFields: CustomField[];
    customFieldValues: CustomFieldValue[];
    attachments: Attachment[];
    users: User[];
  };
}

// Card detail response
export interface CardDetailData {
  item: Card;
  included: {
    cardMemberships: CardMembership[];
    cardLabels: CardLabel[];
    taskLists: TaskList[];
    tasks: Task[];
    attachments: Attachment[];
    customFieldGroups: CustomFieldGroup[];
    customFields: CustomField[];
    customFieldValues: CustomFieldValue[];
  };
}
