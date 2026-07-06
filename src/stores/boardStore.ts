// Planka Mobile — Board Store
// Manages the currently active board with lists, cards, labels, members

import {
  deleteAttachment as apiDeleteAttachment,
  createAttachment,
} from '@/api/attachments';
import { getBoard } from '@/api/boards';
import { addLabelToCard, addMemberToCard, updateCard as apiUpdateCard, createCard, removeLabelFromCard, removeMemberFromCard, type UpdateCardData } from '@/api/cards';
import {
  deleteComment as apiDeleteComment,
  updateComment as apiUpdateComment,
  createComment,
  getComments,
} from '@/api/comments';
import { updateList as apiUpdateList, createList } from '@/api/lists';
import {
  createTask as apiCreateTask,
  deleteTask as apiDeleteTask,
  deleteTaskList as apiDeleteTaskList,
  updateTask as apiUpdateTask,
  updateTaskList as apiUpdateTaskList,
  createTaskList,
} from '@/api/tasks';
import type {
  Attachment,
  Board,
  BoardMembership,
  Card,
  CardLabel,
  CardMembership,
  Comment,
  Label,
  List,
  Task,
  TaskList,
  User,
} from '@/types/models';
import { create } from 'zustand';

interface BoardState {
  board: Board | null;
  lists: List[];
  cards: Card[];
  labels: Label[];
  cardLabels: CardLabel[];
  cardMemberships: CardMembership[];
  boardMemberships: BoardMembership[];
  taskLists: TaskList[];
  tasks: Task[];
  attachments: Attachment[];
  comments: Comment[];
  users: User[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchBoard: (boardId: string) => Promise<void>;
  getCardsForList: (listId: string) => Card[];
  getLabelsForCard: (cardId: string) => Label[];
  getMembersForCard: (cardId: string) => User[];
  getTasksForCard: (cardId: string) => { taskLists: TaskList[]; tasks: Task[] };
  addCard: (listId: string, name: string) => Promise<Card | null>;
  updateCard: (cardId: string, data: UpdateCardData) => Promise<void>;
  addList: (name: string) => Promise<void>;
  updateList: (listId: string, data: { name?: string; position?: number }) => Promise<void>;
  toggleCardLabel: (cardId: string, labelId: string) => Promise<void>;
  toggleCardMember: (cardId: string, userId: string) => Promise<void>;

  // Checklists
  addTaskList: (cardId: string, name: string) => Promise<void>;
  updateTaskList: (taskListId: string, name: string) => Promise<void>;
  deleteTaskList: (taskListId: string) => Promise<void>;
  addTask: (taskListId: string, name: string) => Promise<void>;
  updateTask: (taskId: string, data: { name?: string; isCompleted?: boolean }) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;

  // Comments
  fetchComments: (cardId: string) => Promise<void>;
  addComment: (cardId: string, text: string) => Promise<void>;
  updateComment: (commentId: string, text: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;

  // Attachments
  addAttachment: (cardId: string, formData: FormData) => Promise<Attachment>;
  deleteAttachment: (attachmentId: string) => Promise<void>;

  reset: () => void;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  board: null,
  lists: [],
  cards: [],
  labels: [],
  cardLabels: [],
  cardMemberships: [],
  boardMemberships: [],
  taskLists: [],
  tasks: [],
  attachments: [],
  comments: [],
  users: [],
  isLoading: false,
  error: null,

  fetchBoard: async (boardId: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await getBoard(boardId);
      set({
        board: data.item,
        lists: (data.included.lists ?? []).sort((a, b) => a.position - b.position),
        cards: data.included.cards ?? [],
        labels: (data.included.labels ?? []).sort((a, b) => a.position - b.position),
        cardLabels: data.included.cardLabels ?? [],
        cardMemberships: data.included.cardMemberships ?? [],
        boardMemberships: data.included.boardMemberships ?? [],
        taskLists: data.included.taskLists ?? [],
        tasks: data.included.tasks ?? [],
        attachments: data.included.attachments ?? [],
        users: data.included.users ?? [],
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch board',
      });
    }
  },

  getCardsForList: (listId: string) => {
    return get()
      .cards.filter((c) => c.listId === listId)
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  },

  getLabelsForCard: (cardId: string) => {
    const { cardLabels, labels } = get();
    const labelIds = cardLabels.filter((cl) => cl.cardId === cardId).map((cl) => cl.labelId);
    return labels.filter((l) => labelIds.includes(l.id));
  },

  getMembersForCard: (cardId: string) => {
    const { cardMemberships, users } = get();
    const userIds = cardMemberships.filter((cm) => cm.cardId === cardId).map((cm) => cm.userId);
    return users.filter((u) => userIds.includes(u.id));
  },

  getTasksForCard: (cardId: string) => {
    const { taskLists, tasks } = get();
    const cardTaskLists = taskLists
      .filter((tl) => tl.cardId === cardId)
      .sort((a, b) => a.position - b.position);
    const cardTasks = tasks.filter((t) =>
      cardTaskLists.some((tl) => tl.id === t.taskListId)
    );
    return { taskLists: cardTaskLists, tasks: cardTasks };
  },

  addCard: async (listId: string, name: string) => {
    const { cards, board } = get();
    if (!board) return null;

    // Calculate position: place at the end of the list
    const listCards = cards.filter((c) => c.listId === listId);
    const maxPosition = listCards.reduce(
      (max, c) => Math.max(max, c.position ?? 0),
      0
    );
    const position = maxPosition + 65536;

    try {
      const response = await createCard(listId, { name, position });
      set({ cards: [...cards, response.item] });
      return response.item;
    } catch (error) {
      console.error('Failed to create card:', error);
      return null;
    }
  },

  updateCard: async (cardId: string, data: UpdateCardData) => {
    try {
      const response = await apiUpdateCard(cardId, data);
      set({
        cards: get().cards.map((c) => (c.id === cardId ? response.item : c)),
      });
    } catch (error) {
      console.error('Failed to update card:', error);
    }
  },

  addList: async (name: string) => {
    const { board, lists } = get();
    if (!board) return;

    const maxPosition = lists.reduce((max, l) => Math.max(max, l.position), 0);
    const position = maxPosition + 65536;

    try {
      const response = await createList(board.id, { name, position });
      set({ lists: [...lists, response.item].sort((a, b) => a.position - b.position) });
    } catch (error) {
      console.error('Failed to create list:', error);
    }
  },

  updateList: async (listId: string, data: { name?: string; position?: number }) => {
    try {
      const response = await apiUpdateList(listId, data);
      set({
        lists: get()
          .lists.map((l) => (l.id === listId ? response.item : l))
          .sort((a, b) => a.position - b.position),
      });
    } catch (error) {
      console.error('Failed to update list:', error);
    }
  },

  toggleCardLabel: async (cardId: string, labelId: string) => {
    const { cardLabels } = get();
    const existing = cardLabels.find(
      (cl) => cl.cardId === cardId && cl.labelId === labelId
    );

    try {
      if (existing) {
        await removeLabelFromCard(cardId, labelId);
        set({
          cardLabels: cardLabels.filter((cl) => cl.id !== existing.id),
        });
      } else {
        const response = await addLabelToCard(cardId, labelId);
        set({
          cardLabels: [...cardLabels, response.item as CardLabel],
        });
      }
    } catch (error) {
      console.error('Failed to toggle card label:', error);
    }
  },

  toggleCardMember: async (cardId: string, userId: string) => {
    const { cardMemberships } = get();
    const existing = cardMemberships.find(
      (cm) => cm.cardId === cardId && cm.userId === userId
    );

    try {
      if (existing) {
        await removeMemberFromCard(cardId, userId);
        set({
          cardMemberships: cardMemberships.filter((cm) => cm.id !== existing.id),
        });
      } else {
        const response = await addMemberToCard(cardId, userId);
        set({
          cardMemberships: [...cardMemberships, response.item as CardMembership],
        });
      }
    } catch (error) {
      console.error('Failed to toggle card member:', error);
    }
  },

  // --- Checklists (Task Lists & Tasks) ---
  addTaskList: async (cardId: string, name: string) => {
    const { taskLists } = get();
    const maxPosition = taskLists
      .filter((tl) => tl.cardId === cardId)
      .reduce((max, tl) => Math.max(max, tl.position), 0);
    const position = maxPosition + 65536;

    try {
      const response = await createTaskList(cardId, { name, position });
      set({
        taskLists: [...taskLists, response.item].sort((a, b) => a.position - b.position),
      });
    } catch (error) {
      console.error('Failed to add task list:', error);
    }
  },

  updateTaskList: async (taskListId: string, name: string) => {
    try {
      const response = await apiUpdateTaskList(taskListId, { name });
      set({
        taskLists: get().taskLists.map((tl) => (tl.id === taskListId ? response.item : tl)),
      });
    } catch (error) {
      console.error('Failed to update task list:', error);
    }
  },

  deleteTaskList: async (taskListId: string) => {
    try {
      await apiDeleteTaskList(taskListId);
      set({
        taskLists: get().taskLists.filter((tl) => tl.id !== taskListId),
        tasks: get().tasks.filter((t) => t.taskListId !== taskListId),
      });
    } catch (error) {
      console.error('Failed to delete task list:', error);
    }
  },

  addTask: async (taskListId: string, name: string) => {
    const { tasks } = get();
    const maxPosition = tasks
      .filter((t) => t.taskListId === taskListId)
      .reduce((max, t) => Math.max(max, t.position), 0);
    const position = maxPosition + 65536;

    try {
      const response = await apiCreateTask(taskListId, { name, position });
      set({
        tasks: [...tasks, response.item].sort((a, b) => a.position - b.position),
      });
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  },

  updateTask: async (taskId: string, data: { name?: string; isCompleted?: boolean }) => {
    try {
      const response = await apiUpdateTask(taskId, data);
      set({
        tasks: get().tasks.map((t) => (t.id === taskId ? response.item : t)),
      });
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  },

  deleteTask: async (taskId: string) => {
    try {
      await apiDeleteTask(taskId);
      set({
        tasks: get().tasks.filter((t) => t.id !== taskId),
      });
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  },

  // --- Comments ---
  fetchComments: async (cardId: string) => {
    try {
      const response = await getComments(cardId);
      set({ comments: response.items });
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  },

  addComment: async (cardId: string, text: string) => {
    try {
      const response = await createComment(cardId, { text });
      set({
        comments: [...get().comments, response.item],
      });
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  },

  updateComment: async (commentId: string, text: string) => {
    try {
      const response = await apiUpdateComment(commentId, { text });
      set({
        comments: get().comments.map((c) => (c.id === commentId ? response.item : c)),
      });
    } catch (error) {
      console.error('Failed to update comment:', error);
    }
  },

  deleteComment: async (commentId: string) => {
    try {
      await apiDeleteComment(commentId);
      set({
        comments: get().comments.filter((c) => c.id !== commentId),
      });
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  },

  addAttachment: async (cardId: string, formData: FormData): Promise<Attachment> => {
    try {
      const response = await createAttachment(cardId, formData);
      set({
        attachments: [...get().attachments, response.item],
      });
      return response.item;
    } catch (error) {
      console.error('Failed to add attachment:', error);
      throw error;
    }
  },

  deleteAttachment: async (attachmentId: string) => {
    try {
      await apiDeleteAttachment(attachmentId);
      set({
        attachments: get().attachments.filter((a) => a.id !== attachmentId),
      });
    } catch (error) {
      console.error('Failed to delete attachment:', error);
    }
  },

  reset: () => {
    set({
      board: null,
      lists: [],
      cards: [],
      labels: [],
      cardLabels: [],
      cardMemberships: [],
      boardMemberships: [],
      taskLists: [],
      tasks: [],
      attachments: [],
      comments: [],
      users: [],
      isLoading: false,
      error: null,
    });
  },
}));
