// Planka Mobile — Card Detail Screen (Modal)
// Displays card properties: name, description, labels, members, due date, and stopwatch.

import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as IntentLauncher from 'expo-intent-launcher';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getStoredToken } from '@/api/client';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/stores/authStore';
import { useBoardStore } from '@/stores/boardStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { borderRadius, spacing } from '@/theme';
import { typography } from '@/theme/typography';
import type { Attachment } from '@/types/models';

export default function CardDetailScreen() {
  const { cardId } = useLocalSearchParams<{ cardId: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, brand, semantic } = useTheme();
  const insets = useSafeAreaInsets();

  // Stores
  const board = useBoardStore((s) => s.board);
  const cards = useBoardStore((s) => s.cards);
  const labels = useBoardStore((s) => s.labels);
  const boardMembers = useBoardStore((s) => s.users);
  const getLabelsForCard = useBoardStore((s) => s.getLabelsForCard);
  const getMembersForCard = useBoardStore((s) => s.getMembersForCard);
  const updateCard = useBoardStore((s) => s.updateCard);
  const toggleCardLabel = useBoardStore((s) => s.toggleCardLabel);
  const toggleCardMember = useBoardStore((s) => s.toggleCardMember);

  const storeTaskLists = useBoardStore((s) => s.taskLists);
  const storeTasks = useBoardStore((s) => s.tasks);
  const storeAttachments = useBoardStore((s) => s.attachments);
  const cardComments = useBoardStore((s) => s.comments);

  const addTaskList = useBoardStore((s) => s.addTaskList);
  const updateTaskList = useBoardStore((s) => s.updateTaskList);
  const deleteTaskList = useBoardStore((s) => s.deleteTaskList);
  const addTask = useBoardStore((s) => s.addTask);
  const updateTask = useBoardStore((s) => s.updateTask);
  const deleteTask = useBoardStore((s) => s.deleteTask);

  const fetchComments = useBoardStore((s) => s.fetchComments);
  const addComment = useBoardStore((s) => s.addComment);
  const updateComment = useBoardStore((s) => s.updateComment);
  const deleteComment = useBoardStore((s) => s.deleteComment);

  const addAttachment = useBoardStore((s) => s.addAttachment);
  const deleteAttachment = useBoardStore((s) => s.deleteAttachment);
  
  const currentUser = useAuthStore((s) => s.user);

  const card = useMemo(() => cards.find((c) => c.id === cardId), [cards, cardId]);
  const cardLabels = useMemo(() => (cardId ? getLabelsForCard(cardId) : []), [cardId, getLabelsForCard, card]);
  const cardMembers = useMemo(() => (cardId ? getMembersForCard(cardId) : []), [cardId, getMembersForCard, card]);

  // Derived Checklist data
  const cardTaskLists = useMemo(() => {
    if (!cardId) return [];
    return storeTaskLists.filter((tl) => tl.cardId === cardId).sort((a, b) => a.position - b.position);
  }, [cardId, storeTaskLists]);

  const cardTasks = useMemo(() => {
    if (!cardId) return [];
    return storeTasks.filter((t) => cardTaskLists.some((tl) => tl.id === t.taskListId)).sort((a, b) => a.position - b.position);
  }, [cardId, storeTasks, cardTaskLists]);

  // Derived Attachments data
  const cardAttachments = useMemo(() => {
    if (!cardId) return [];
    return storeAttachments.filter((a) => a.cardId === cardId);
  }, [cardId, storeAttachments]);

  // Fetch comments
  useEffect(() => {
    if (cardId) {
      fetchComments(cardId);
    }
  }, [cardId, fetchComments]);

  // Fetch Server credentials
  const serverUrl = useSettingsStore((s) => s.serverUrl);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [selectedViewerImage, setSelectedViewerImage] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    getStoredToken().then(setAuthToken);
  }, []);

  const coverAttachment = useMemo(() => {
    if (!card || !card.coverAttachmentId) return null;
    return cardAttachments.find((a) => a.id === card.coverAttachmentId) || null;
  }, [card, cardAttachments]);  

  // Edit States
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isEditingDesc, setIsEditingDesc] = useState(false);

  // Checklist Local States
  const [isAddingChecklist, setIsAddingChecklist] = useState(false);
  const [newChecklistName, setNewChecklistName] = useState('');
  const [activeAddingTaskId, setActiveAddingTaskId] = useState<string | null>(null);
  const [newTaskName, setNewTaskName] = useState('');
  const [editingTaskListId, setEditingTaskListId] = useState<string | null>(null);
  const [editingTaskListName, setEditingTaskListName] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskName, setEditingTaskName] = useState('');

  const handleSaveTaskListTitle = async (taskListId: string) => {
    if (editingTaskListName.trim()) {
      await updateTaskList(taskListId, editingTaskListName.trim());
    }
    setEditingTaskListId(null);
  };

  const handleSaveTaskName = async (taskId: string) => {
    if (editingTaskName.trim()) {
      await updateTask(taskId, { name: editingTaskName.trim() });
    }
    setEditingTaskId(null);
  };

  // Comment Local States
  const [newCommentText, setNewCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');

  const handleSaveComment = async (commentId: string) => {
    if (editingCommentText.trim()) {
      await updateComment(commentId, editingCommentText.trim());
    }
    setEditingCommentId(null);
  };

  // Selector Modals
  const [showLabelSelector, setShowLabelSelector] = useState(false);
  const [showMemberSelector, setShowMemberSelector] = useState(false);

  // Helper User lookup
  const getUserById = useCallback((userId: string | null) => {
    if (!userId) return { name: t('card.systemUser') };
    return boardMembers.find((u) => u.id === userId) || { name: t('card.unknownUser') };
  }, [boardMembers, t]);

  // Actions handlers
  const handleCreateChecklist = async () => {
    if (cardId && newChecklistName.trim()) {
      await addTaskList(cardId, newChecklistName.trim());
      setNewChecklistName('');
      setIsAddingChecklist(false);
    }
  };

  const handleCreateTask = async (taskListId: string) => {
    if (newTaskName.trim()) {
      await addTask(taskListId, newTaskName.trim());
      setNewTaskName('');
      setActiveAddingTaskId(null);
    }
  };

  const handlePostComment = async () => {
    if (cardId && newCommentText.trim()) {
      await addComment(cardId, newCommentText.trim());
      setNewCommentText('');
    }
  };

  const handlePickDocument = async () => {
    if (!cardId) return;
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        const file = res.assets[0];
        const formData = new FormData();
        formData.append('name', file.name || 'document');
        formData.append('type', 'file');
        formData.append('file', {
          uri: file.uri,
          name: file.name,
          type: file.mimeType || 'application/octet-stream',
        } as any);

        const newAttachment = await addAttachment(cardId, formData);
        if (newAttachment.data?.mimeType?.startsWith('image/') && !card?.coverAttachmentId) {
          await updateCard(cardId, { coverAttachmentId: newAttachment.id });
        }
      }
    } catch (err) {
      console.error('Pick document error:', err);
      Alert.alert('Error', 'Failed to upload attachment');
    }
  };

  const handlePickImage = async () => {
    if (!cardId) return;
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission required', 'We need camera roll permissions to select images');
        return;
      }

      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        const file = res.assets[0];
        const formData = new FormData();
        const uriParts = file.uri.split('/');
        const fileName = uriParts[uriParts.length - 1] || 'photo.jpg';

        formData.append('name', fileName);
        formData.append('type', 'file');
        formData.append('file', {
          uri: file.uri,
          name: fileName,
          type: file.mimeType || 'image/jpeg',
        } as any);

        const newAttachment = await addAttachment(cardId, formData);
        if (newAttachment.data?.mimeType?.startsWith('image/') && !card?.coverAttachmentId) {
          await updateCard(cardId, { coverAttachmentId: newAttachment.id });
        }
      }
    } catch (err) {
      console.error('Pick image error:', err);
      Alert.alert('Error', 'Failed to upload image');
    }
  };

  const handleDownloadAndShare = async (att: Attachment) => {
    if (!serverUrl || !authToken) return;
    setIsDownloading(true);
    try {
      const downloadUrl = att.data.url || `${serverUrl}/attachments/${att.id}/download`;
      const safeName = att.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
      const downloadPath = `${FileSystem.documentDirectory}${safeName}`;
      
      const { uri } = await FileSystem.downloadAsync(
        downloadUrl,
        downloadPath,
        {
          headers: {
            Cookie: `accessToken=${authToken};accessTokenVersion=1`,
          },
        }
      );
      
      if (Platform.OS === 'android') {
        const contentUri = await FileSystem.getContentUriAsync(uri);
        await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
          data: contentUri,
          flags: 1, // Grant read URI permission
          type: att.data?.mimeType || 'application/octet-stream',
        });
      } else {
        const isSharingAvailable = await Sharing.isAvailableAsync();
        if (isSharingAvailable) {
          await Sharing.shareAsync(uri);
        } else {
          Alert.alert('Error', 'Sharing is not available on this device');
        }
      }
    } catch (err) {
      console.error('Download error:', err);
      Alert.alert('Error', 'Failed to download and open file');
    } finally {
      setIsDownloading(false);
    }
  };

  // Stopwatch state
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (card) {
      setName(card.name);
      setDescription(card.description ?? '');
    }
  }, [card]);

  // Stopwatch timer effect
  useEffect(() => {
    if (!card?.stopwatch) {
      setElapsedSeconds(0);
      return;
    }

    const stopwatch = card.stopwatch;
    if (stopwatch.startedAt) {
      const startTime = new Date(stopwatch.startedAt).getTime();
      const updateTimer = () => {
        const delta = Math.floor((Date.now() - startTime) / 1000);
        setElapsedSeconds(Math.max(0, stopwatch.total + delta));
      };
      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    } else {
      setElapsedSeconds(stopwatch.total);
    }
  }, [card?.stopwatch]);

  if (!card) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={brand.primary} />
      </View>
    );
  }

  const handleNameBlur = () => {
    if (name.trim() && name !== card.name) {
      updateCard(card.id, { name: name.trim() });
    }
  };

  const handleSaveDescription = () => {
    updateCard(card.id, { description: description.trim() || null });
    setIsEditingDesc(false);
  };

  // Stopwatch actions
  const handleToggleStopwatch = () => {
    const sw = card.stopwatch;
    if (sw?.startedAt) {
      // Stop
      const startTime = new Date(sw.startedAt).getTime();
      const delta = Math.floor((Date.now() - startTime) / 1000);
      const newTotal = sw.total + delta;
      updateCard(card.id, {
        stopwatch: { startedAt: null, total: Math.max(0, newTotal) },
      });
    } else {
      // Start
      updateCard(card.id, {
        stopwatch: { startedAt: new Date().toISOString(), total: sw?.total ?? 0 },
      });
    }
  };

  const handleResetStopwatch = () => {
    updateCard(card.id, { stopwatch: null });
  };

  // Helper formatting for seconds to HH:MM:SS
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0'),
    ].join(':');
  };  

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background, paddingTop: Platform.OS === 'ios' ? spacing.md : insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      {/* Header */}
      <View style={[styles.header, { borderColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.textSecondary }, typography.captionMedium]}>
          {t('board.title')} / {board?.name}
        </Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Text style={[{ color: colors.textSecondary }, typography.bodyLarge]}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Cover Attachment Header Preview */}
        {coverAttachment && serverUrl && authToken && (
          <View style={styles.coverContainer}>
            <Image
              source={{
                uri: coverAttachment.data?.thumbnailUrls?.outside720
                  ? coverAttachment.data.thumbnailUrls.outside720
                  : `${serverUrl}/attachments/${coverAttachment.id}/download`,
                headers: {
                  Cookie: `accessToken=${authToken};accessTokenVersion=1`,
                },
              }}
              style={styles.coverImage}
              contentFit="cover"
            />
            <TouchableOpacity
              style={styles.removeCoverBtn}
              onPress={() => updateCard(card.id, { coverAttachmentId: null })}
            >
              <Text style={styles.removeCoverBtnText}>✕ {t('card.removeCover')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Card Name */}
        <TextInput
          style={[styles.titleInput, { color: colors.text, borderBottomColor: colors.border }, typography.h1]}
          value={name}
          onChangeText={setName}
          onBlur={handleNameBlur}
          multiline
          returnKeyType="done"
          blurOnSubmit
        />

        {/* Labels Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }, typography.bodySemiBold]}>
              🏷️ {t('card.labels')}
            </Text>
            <TouchableOpacity onPress={() => setShowLabelSelector(true)}>
              <Text style={[{ color: brand.primary }, typography.captionMedium]}>+ Add</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.labelList}>
            {cardLabels.map((lbl) => (
              <TouchableOpacity
                key={lbl.id}
                style={[styles.labelBadge, { backgroundColor: lbl.color }]}
                onPress={() => toggleCardLabel(card.id, lbl.id)}
              >
                <Text style={[styles.labelText, typography.captionMedium]}>
                  {lbl.name || ' '}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Members Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }, typography.bodySemiBold]}>
              👤 {t('card.members')}
            </Text>
            <TouchableOpacity onPress={() => setShowMemberSelector(true)}>
              <Text style={[{ color: brand.primary }, typography.captionMedium]}>+ Add</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.memberList}>
            {cardMembers.map((member) => (
              <TouchableOpacity
                key={member.id}
                style={[styles.memberBadge, { backgroundColor: brand.primary + '20', borderColor: brand.primary }]}
                onPress={() => toggleCardMember(card.id, member.id)}
              >
                <Text style={[{ color: brand.primary }, typography.captionMedium]}>
                  {member.name.charAt(0).toUpperCase()}
                </Text>
                <Text style={[{ color: colors.text }, typography.captionMedium]}>
                  {member.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Stopwatch Section */}
        <View style={[styles.section, styles.stopwatchSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.stopwatchHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }, typography.bodySemiBold]}>
              ⏱️ {t('card.stopwatch')}
            </Text>
            {card.stopwatch && (
              <TouchableOpacity onPress={handleResetStopwatch}>
                <Text style={[{ color: semantic.error }, typography.caption]}>Reset</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.stopwatchBody}>
            <Text style={[styles.timerText, { color: colors.text }, typography.displayMedium]}>
              {formatTime(elapsedSeconds)}
            </Text>
            <TouchableOpacity
              style={[
                styles.stopwatchButton,
                {
                  backgroundColor: card.stopwatch?.startedAt
                    ? semantic.error
                    : semantic.success,
                },
              ]}
              onPress={handleToggleStopwatch}
            >
              <Text style={[{ color: '#fff' }, typography.captionMedium]}>
                {card.stopwatch?.startedAt ? 'Stop' : 'Start'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Description Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }, typography.bodySemiBold]}>
              📝 {t('card.description')}
            </Text>
            {!isEditingDesc && (
              <TouchableOpacity onPress={() => setIsEditingDesc(true)}>
                <Text style={[{ color: brand.primary }, typography.captionMedium]}>
                  {t('common.edit')}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {isEditingDesc ? (
            <View style={styles.descEditor}>
              <TextInput
                style={[
                  styles.descInput,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                  typography.body,
                ]}
                placeholder={t('card.descriptionPlaceholder')}
                placeholderTextColor={colors.textTertiary}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
              <View style={styles.descActions}>
                <TouchableOpacity
                  style={[styles.saveDescButton, { backgroundColor: brand.primary }]}
                  onPress={handleSaveDescription}
                >
                  <Text style={[{ color: '#fff' }, typography.captionMedium]}>
                    {t('common.save')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setIsEditingDesc(false); setDescription(card.description ?? ''); }}>
                  <Text style={[{ color: colors.textSecondary }, typography.body]}>
                    {t('common.cancel')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : card.description ? (
            <View style={[styles.markdownContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Markdown
                style={{
                  body: { color: colors.text, fontFamily: typography.body.fontFamily, fontSize: typography.body.fontSize },
                  paragraph: { marginVertical: spacing.xs },
                }}
              >
                {card.description}
              </Markdown>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.emptyDescBox, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => setIsEditingDesc(true)}
            >
              <Text style={[{ color: colors.textTertiary }, typography.body]}>
                {t('card.descriptionPlaceholder')}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Attachments Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }, typography.bodySemiBold]}>
              📎 {t('card.attachments')}
            </Text>
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <TouchableOpacity onPress={handlePickDocument}>
                <Text style={[{ color: brand.primary }, typography.captionMedium]}>+ {t('card.file')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handlePickImage}>
                <Text style={[{ color: brand.primary }, typography.captionMedium]}>+ {t('card.image')}</Text>
              </TouchableOpacity>
            </View>
          </View>
          {cardAttachments.length > 0 ? (
            <View style={styles.attachmentsList}>
              {cardAttachments.map((att) => {
                const isImage = att.data?.mimeType?.startsWith('image/');
                const isCover = card?.coverAttachmentId === att.id;
                const imageUrl = isImage && serverUrl && authToken ? att.data.url : null;
                const thumbnailUrl = isImage && serverUrl && authToken
                  ? (att.data?.thumbnailUrls?.outside360
                    ? att.data.thumbnailUrls.outside360
                    : imageUrl)
                  : null;

                return (
                  <View
                    key={att.id}
                    style={[styles.attachmentCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  >
                    <TouchableOpacity
                      style={{ flexDirection: 'row', flex: 1, alignItems: 'center', gap: spacing.md }}
                      onPress={() => {
                        if (imageUrl) {
                          setSelectedViewerImage(imageUrl);
                        } else {
                          handleDownloadAndShare(att);
                        }
                      }}
                    >
                      {thumbnailUrl ? (
                        <View style={[styles.attachmentPreviewContainer, { backgroundColor: colors.surfaceElevated }]}>
                          <Image
                            source={{
                              uri: thumbnailUrl,
                              headers: {
                                Cookie: `accessToken=${authToken};accessTokenVersion=1`,
                              },
                            }}
                            style={styles.attachmentThumbnail}
                            contentFit="cover"
                          />
                        </View>
                      ) : (
                        <View style={[styles.attachmentFileContainer, { backgroundColor: colors.surfaceElevated }]}>
                          <Text style={{ fontSize: 24 }}>📄</Text>
                        </View>
                      )}
                      <View style={{ flex: 1, gap: 2 }}>
                        <Text style={[{ color: colors.text }, typography.bodySemiBold]} numberOfLines={1}>
                          {att.name}
                        </Text>
                        
                        {isImage && (
                          <TouchableOpacity
                            style={[
                              styles.makeCoverBtnWrapper,
                              { backgroundColor: isCover ? brand.primary : colors.borderLight }
                            ]}
                            onPress={() => updateCard(card.id, { coverAttachmentId: isCover ? null : att.id })}
                          >
                            <Text style={{ color: isCover ? '#fff' : colors.textSecondary, fontSize: 10, fontWeight: '600' }}>
                              {isCover ? `✕ ${t('card.removeCover')}` : `🖼️ ${t('card.makeCover')}`}
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </TouchableOpacity>
                    
                    <TouchableOpacity onPress={() => deleteAttachment(att.id)} style={{ padding: spacing.sm }}>
                      <Text style={{ color: semantic.error, fontSize: 16 }}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={[styles.emptyBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[{ color: colors.textTertiary }, typography.body]}>{t('card.noAttachments')}</Text>
            </View>
          )}
        </View>

        {/* Checklists Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }, typography.bodySemiBold]}>
              ☑️ {t('card.checklists')}
            </Text>
            <TouchableOpacity onPress={() => setIsAddingChecklist(true)}>
              <Text style={[{ color: brand.primary }, typography.captionMedium]}>+ {t('common.create')}</Text>
            </TouchableOpacity>
          </View>

          {isAddingChecklist && (
            <View style={[styles.addChecklistForm, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <TextInput
                style={[styles.addChecklistInput, { backgroundColor: colors.surfaceElevated, borderColor: colors.border, color: colors.text }, typography.body]}
                placeholder={t('card.newChecklistName')}
                placeholderTextColor={colors.textTertiary}
                value={newChecklistName}
                onChangeText={setNewChecklistName}
                autoFocus
              />
              <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm }}>
                <TouchableOpacity
                  style={[styles.smallButton, { backgroundColor: brand.primary }]}
                  onPress={handleCreateChecklist}
                >
                  <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>{t('common.create')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.smallButton, { backgroundColor: colors.surfaceHover }]}
                  onPress={() => { setIsAddingChecklist(false); setNewChecklistName(''); }}
                >
                  <Text style={{ color: colors.text, fontSize: 12 }}>{t('common.cancel')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {cardTaskLists.map((taskList) => {
            const listTasks = cardTasks.filter((t) => t.taskListId === taskList.id);
            const completedTasks = listTasks.filter((t) => t.isCompleted);
            const progress = listTasks.length > 0 ? completedTasks.length / listTasks.length : 0;

            return (
              <View key={taskList.id} style={[styles.checklistCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {/* Checklist Title */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  {editingTaskListId === taskList.id ? (
                    <TextInput
                      style={[{ color: colors.text, flex: 1, paddingVertical: 2, borderBottomWidth: 1, borderBottomColor: brand.primary, marginRight: spacing.md }, typography.bodySemiBold]}
                      value={editingTaskListName}
                      onChangeText={setEditingTaskListName}
                      autoFocus
                      onBlur={() => handleSaveTaskListTitle(taskList.id)}
                      onSubmitEditing={() => handleSaveTaskListTitle(taskList.id)}
                    />
                  ) : (
                    <TouchableOpacity
                      style={{ flex: 1, marginRight: spacing.md }}
                      onPress={() => {
                        setEditingTaskListId(taskList.id);
                        setEditingTaskListName(taskList.name);
                      }}
                    >
                      <Text style={[{ color: colors.text }, typography.bodySemiBold]}>
                        {taskList.name}
                      </Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => deleteTaskList(taskList.id)}>
                    <Text style={{ color: semantic.error, fontSize: 14 }}>{t('common.delete')}</Text>
                  </TouchableOpacity>
                </View>

                {/* Progress Bar */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginVertical: spacing.xs }}>
                  <View style={{ flex: 1, height: 6, backgroundColor: colors.borderLight, borderRadius: 3, overflow: 'hidden' }}>
                    <View style={{ width: `${progress * 100}%`, height: '100%', backgroundColor: brand.primary }} />
                  </View>
                  <Text style={[{ color: colors.textSecondary }, typography.caption]}>
                    {Math.round(progress * 100)}%
                  </Text>
                </View>

                {/* Tasks List */}
                <View style={{ gap: spacing.sm, marginTop: spacing.xs }}>
                  {listTasks.map((task) => (
                    <View key={task.id} style={styles.taskItem}>
                      <TouchableOpacity
                        style={[styles.checkbox, { borderColor: task.isCompleted ? brand.primary : colors.border, backgroundColor: task.isCompleted ? brand.primary : 'transparent' }]}
                        onPress={() => updateTask(task.id, { isCompleted: !task.isCompleted })}
                      >
                        {task.isCompleted && <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>✓</Text>}
                      </TouchableOpacity>
                      {editingTaskId === task.id ? (
                        <TextInput
                          style={[{ color: colors.text, flex: 1, paddingVertical: 2, borderBottomWidth: 1, borderBottomColor: brand.primary, marginRight: spacing.md }, typography.body]}
                          value={editingTaskName}
                          onChangeText={setEditingTaskName}
                          autoFocus
                          onBlur={() => handleSaveTaskName(task.id)}
                          onSubmitEditing={() => handleSaveTaskName(task.id)}
                        />
                      ) : (
                        <TouchableOpacity
                          style={{ flex: 1 }}
                          onPress={() => {
                            setEditingTaskId(task.id);
                            setEditingTaskName(task.name);
                          }}
                        >
                          <Text style={[{ color: task.isCompleted ? colors.textTertiary : colors.text, textDecorationLine: task.isCompleted ? 'line-through' : 'none' }, typography.body]}>
                            {task.name}
                          </Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity onPress={() => deleteTask(task.id)}>
                        <Text style={{ color: colors.textTertiary, fontSize: 12 }}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>

                {/* Add Task Input */}
                <View style={{ marginTop: spacing.sm }}>
                  {activeAddingTaskId === taskList.id ? (
                    <View style={{ gap: spacing.xs }}>
                      <TextInput
                        style={[styles.taskInput, { backgroundColor: colors.surfaceElevated, borderColor: colors.border, color: colors.text }, typography.body]}
                        placeholder={t('card.addTaskPlaceholder')}
                        placeholderTextColor={colors.textTertiary}
                        value={newTaskName}
                        onChangeText={setNewTaskName}
                        autoFocus
                      />
                      <View style={{ flexDirection: 'row', gap: spacing.md }}>
                        <TouchableOpacity
                          style={[styles.smallButton, { backgroundColor: brand.primary }]}
                          onPress={() => handleCreateTask(taskList.id)}
                        >
                          <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>{t('common.create')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.smallButton, { backgroundColor: colors.surfaceHover }]}
                          onPress={() => { setActiveAddingTaskId(null); setNewTaskName(''); }}
                        >
                          <Text style={{ color: colors.text, fontSize: 12 }}>{t('common.cancel')}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <TouchableOpacity onPress={() => setActiveAddingTaskId(taskList.id)}>
                      <Text style={[{ color: colors.textTertiary }, typography.body]}>{t('card.addChecklistItem')}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Comments / Activity Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }, typography.bodySemiBold]}>
            💬 {t('card.comments')}
          </Text>

          {/* New Comment Input */}
          <View style={[styles.commentInputBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TextInput
              style={[styles.commentInput, { color: colors.text }, typography.body]}
              placeholder={t('card.addComment')}
              placeholderTextColor={colors.textTertiary}
              value={newCommentText}
              onChangeText={setNewCommentText}
              multiline
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', padding: spacing.sm }}>
              <TouchableOpacity
                style={[styles.saveDescButton, { backgroundColor: brand.primary, opacity: !newCommentText.trim() ? 0.6 : 1 }]}
                disabled={!newCommentText.trim()}
                onPress={handlePostComment}
              >
                <Text style={{ color: '#fff', fontWeight: '600' }}>{t('common.send')}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Comments List */}
          <View style={{ gap: spacing.md, marginTop: spacing.sm }}>
            {cardComments.map((comment) => {
              const author = getUserById(comment.userId);
              
              return (
                <View key={comment.id} style={styles.commentCard}>
                  <View style={[styles.commentAvatar, { backgroundColor: brand.primary }]}>
                    <Text style={{ color: '#fff', fontWeight: '700' }}>
                      {author.name?.charAt(0)?.toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1, gap: spacing.xs }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={[{ color: colors.text }, typography.bodySemiBold]}>
                        {author.name}
                      </Text>
                      <Text style={[{ color: colors.textTertiary }, typography.caption]}>
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    {editingCommentId === comment.id ? (
                      <View style={{ gap: spacing.xs, marginTop: spacing.xs }}>
                        <TextInput
                          style={[
                            styles.commentInput,
                            {
                              color: colors.text,
                              backgroundColor: colors.surfaceElevated,
                              borderColor: colors.border,
                              borderWidth: 1,
                              borderRadius: borderRadius.md,
                              padding: spacing.sm,
                              minHeight: 60,
                            },
                            typography.body,
                          ]}
                          value={editingCommentText}
                          onChangeText={setEditingCommentText}
                          multiline
                        />
                        <View style={{ flexDirection: 'row', gap: spacing.md, justifyContent: 'flex-end', marginTop: spacing.xs }}>
                          <TouchableOpacity
                            style={[styles.smallButton, { backgroundColor: brand.primary }]}
                            onPress={() => handleSaveComment(comment.id)}
                          >
                            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>{t('common.save')}</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.smallButton, { backgroundColor: colors.surfaceHover }]}
                            onPress={() => setEditingCommentId(null)}
                          >
                            <Text style={{ color: colors.text, fontSize: 12 }}>{t('common.cancel')}</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <View style={[styles.commentTextContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Markdown
                          style={{
                            body: { color: colors.text, fontFamily: typography.body.fontFamily, fontSize: typography.body.fontSize },
                            paragraph: { marginVertical: 0 },
                          }}
                        >
                          {comment.text}
                        </Markdown>
                      </View>
                    )}
                  </View>
                  {/* Edit and Delete buttons if comment belongs to user */}
                  {currentUser?.id === comment.userId && editingCommentId !== comment.id && (
                    <View style={{ gap: spacing.xs, marginLeft: spacing.sm, justifyContent: 'center' }}>
                      <TouchableOpacity
                        onPress={() => {
                          setEditingCommentId(comment.id);
                          setEditingCommentText(comment.text);
                        }}
                      >
                        <Text style={{ color: brand.primary, fontSize: 12 }}>{t('common.edit')}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => deleteComment(comment.id)}>
                        <Text style={{ color: semantic.error, fontSize: 12 }}>{t('common.delete')}</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Label Selector Modal */}
      <Modal visible={showLabelSelector} transparent animationType="fade">
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[{ color: colors.text }, typography.h3]}>{t('card.labels')}</Text>
              <TouchableOpacity onPress={() => setShowLabelSelector(false)}>
                <Text style={[{ color: colors.textSecondary }, typography.bodyLarge]}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.selectorList}>
              {labels.map((lbl) => {
                const isActive = cardLabels.some((cl) => cl.id === lbl.id);
                return (
                  <TouchableOpacity
                    key={lbl.id}
                    style={[
                      styles.selectorItem,
                      {
                        borderBottomColor: colors.borderLight,
                        backgroundColor: isActive ? brand.primary + '10' : 'transparent',
                      },
                    ]}
                    onPress={() => toggleCardLabel(card.id, lbl.id)}
                  >
                    <View style={[styles.colorBar, { backgroundColor: lbl.color }]} />
                    <Text style={[styles.selectorItemText, { color: colors.text }, typography.bodySemiBold]}>
                      {lbl.name || 'Untitled Label'}
                    </Text>
                    {isActive && <Text style={{ color: brand.primary, fontSize: 16 }}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Member Selector Modal */}
      <Modal visible={showMemberSelector} transparent animationType="fade">
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[{ color: colors.text }, typography.h3]}>{t('card.members')}</Text>
              <TouchableOpacity onPress={() => setShowMemberSelector(false)}>
                <Text style={[{ color: colors.textSecondary }, typography.bodyLarge]}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.selectorList}>
              {boardMembers.map((member) => {
                const isActive = cardMembers.some((cm) => cm.id === member.id);
                return (
                  <TouchableOpacity
                    key={member.id}
                    style={[
                      styles.selectorItem,
                      {
                        borderBottomColor: colors.borderLight,
                        backgroundColor: isActive ? brand.primary + '10' : 'transparent',
                      },
                    ]}
                    onPress={() => toggleCardMember(card.id, member.id)}
                  >
                    <View style={[styles.avatarMini, { backgroundColor: brand.primary }]}>
                      <Text style={styles.avatarMiniText}>
                        {member.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <Text style={[styles.selectorItemText, { color: colors.text }, typography.body]}>
                      {member.name}
                    </Text>
                    {isActive && <Text style={{ color: brand.primary, fontSize: 16 }}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
      {/* Fullscreen Image Viewer Modal */}
      <Modal visible={!!selectedViewerImage} transparent animationType="fade" onRequestClose={() => setSelectedViewerImage(null)}>
        <View style={[styles.viewerOverlay, { backgroundColor: 'rgba(0,0,0,0.95)' }]}>
          <TouchableOpacity style={styles.viewerCloseArea} activeOpacity={1} onPress={() => setSelectedViewerImage(null)} />
          {selectedViewerImage && (
            <Image
              source={{
                uri: selectedViewerImage,
                headers: {
                  Cookie: `accessToken=${authToken};accessTokenVersion=1`,
                },
              }}
              style={styles.viewerImage}
              contentFit="contain"
            />
          )}
          <TouchableOpacity style={styles.viewerCloseButton} onPress={() => setSelectedViewerImage(null)}>
            <Text style={styles.viewerCloseButtonText}>✕ {t('common.close')}</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {isDownloading && (
        <View style={styles.downloadOverlay}>
          <View style={[styles.downloadModalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <ActivityIndicator size="large" color={brand.primary} />
            <Text style={[{ color: colors.text, marginTop: spacing.md }, typography.bodyMedium]}>
              {t('common.downloading')}
            </Text>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {},
  closeButton: {
    padding: spacing.xs,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.xl,
  },
  titleInput: {
    borderBottomWidth: 1.5,
    paddingVertical: spacing.xs,
    paddingHorizontal: 0,
    fontWeight: '700',
  },
  section: {
    gap: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {},
  // Labels
  labelList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  labelBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    minWidth: 60,
    alignItems: 'center',
  },
  labelText: {
    color: '#fff',
    fontWeight: '600',
  },
  // Members
  memberList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    gap: spacing.xs,
  },
  // Stopwatch
  stopwatchSection: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.lg,
  },
  stopwatchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  stopwatchBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timerText: {
    fontWeight: '700',
  },
  stopwatchButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  // Description
  descEditor: {
    gap: spacing.sm,
  },
  descInput: {
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    minHeight: 120,
  },
  descActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  saveDescButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  markdownContainer: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.lg,
  },
  emptyDescBox: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Modal Style
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    width: '100%',
    maxHeight: '70%',
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  selectorList: {
    maxHeight: 300,
  },
  selectorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.md,
  },
  colorBar: {
    width: 24,
    height: 16,
    borderRadius: borderRadius.xs,
  },
  selectorItemText: {
    flex: 1,
  },
  avatarMini: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarMiniText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  // Attachments
  attachmentsList: {
    gap: spacing.sm,
  },
  attachmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    gap: spacing.md,
  },
  attachmentPreviewContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachmentFileContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyBox: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Checklists
  addChecklistForm: {
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.xs,
  },
  addChecklistInput: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    height: 44,
  },
  smallButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checklistCard: {
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskInput: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    height: 44,
  },
  // Comments
  commentInputBox: {
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  commentInput: {
    padding: spacing.md,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  commentCard: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentTextContainer: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.md,
    flex: 1,
  },
  // Card Cover Header
  coverContainer: {
    width: '100%',
    height: 180,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: spacing.xs,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  removeCoverBtn: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  removeCoverBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  // Attachment Details
  attachmentThumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.md,
  },
  makeCoverBtnWrapper: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  // Image Viewer Modal
  viewerOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewerCloseArea: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  viewerImage: {
    width: '90%',
    height: '80%',
  },
  viewerCloseButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    zIndex: 10,
  },
  viewerCloseButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  downloadOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  downloadModalContent: {
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
  },
});
