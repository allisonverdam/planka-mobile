// Planka Mobile — Board Kanban View
// The main board screen with horizontal-scrolling columns and vertical card lists

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getStoredToken } from '@/api/client';
import { useTheme } from '@/hooks/useTheme';
import { useBoardStore } from '@/stores/boardStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { borderRadius, spacing } from '@/theme';
import { typography } from '@/theme/typography';
import type { Card, Label, List } from '@/types/models';
import { Image } from 'expo-image';

const COLUMN_WIDTH = Dimensions.get('window').width * 0.78;
const COLUMN_MARGIN = spacing.sm;

// --- Card Component ---
function BoardCard({
  card,
  labels,
  memberCount,
  onPress,
  isClosed,
}: {
  card: Card;
  labels: Label[];
  memberCount: number;
  onPress: () => void;
  isClosed?: boolean;
}) {
  const { colors } = useTheme();
  const attachments = useBoardStore((s) => s.attachments);
  const serverUrl = useSettingsStore((s) => s.serverUrl);
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    getStoredToken().then(setAuthToken);
  }, []);

  const coverAttachment = useMemo(() => {
    if (!card.coverAttachmentId) return null;
    return attachments.find((a) => a.id === card.coverAttachmentId) || null;
  }, [card.coverAttachmentId, attachments]);

  const coverUri = coverAttachment && serverUrl && authToken
    ? (coverAttachment.data?.thumbnailUrls?.outside360
      ? coverAttachment.data.thumbnailUrls.outside360
      : `${serverUrl}/attachments/${coverAttachment.id}/download`)
    : null;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderLight }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Cover Image */}
      {coverUri && (
        <View style={styles.cardCoverContainer}>
          <Image
            source={{
              uri: coverUri,
              headers: {
                Cookie: `accessToken=${authToken};accessTokenVersion=1`,
              },
            }}
            style={styles.cardCover}
            contentFit="cover"
          />
        </View>
      )}
      <View style={styles.cardContent}>
        {/* Labels row */}
        {labels.length > 0 && (
          <View style={styles.cardLabels}>
            {labels.map((label) => (
              <View
                key={label.id}
                style={[styles.labelDot, { backgroundColor: label.color }]}
              />
            ))}
          </View>
        )}

        {/* Card name */}
        <Text
          style={[
            styles.cardName,
            { color: isClosed ? colors.textSecondary : colors.text },
            isClosed && { textDecorationLine: 'line-through' },
            typography.body
          ]}
          numberOfLines={3}
        >
          {card.name}
        </Text>

        {/* Card badges */}
        <View style={styles.cardBadges}>
          {card.dueDate && (
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: card.isDueCompleted
                    ? 'rgba(76,175,80,0.15)'
                    : new Date(card.dueDate) < new Date()
                      ? 'rgba(244,67,54,0.15)'
                      : 'rgba(255,152,0,0.15)',
                },
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  {
                    color: card.isDueCompleted
                      ? '#4CAF50'
                      : new Date(card.dueDate) < new Date()
                        ? '#F44336'
                        : '#FF9800',
                  },
                  typography.label,
                ]}
              >
                🕐 {new Date(card.dueDate).toLocaleDateString()}
              </Text>
            </View>
          )}
          {card.commentsTotal > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.surfaceHover }]}>
              <Text style={[styles.badgeText, { color: colors.textSecondary }, typography.label]}>
                💬 {card.commentsTotal}
              </Text>
            </View>
          )}
          {card.description && (
            <View style={[styles.badge, { backgroundColor: colors.surfaceHover }]}>
              <Text style={[styles.badgeText, { color: colors.textSecondary }, typography.label]}>
                📝
              </Text>
            </View>
          )}
          {memberCount > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.surfaceHover }]}>
              <Text style={[styles.badgeText, { color: colors.textSecondary }, typography.label]}>
                👤 {memberCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// --- Column Component ---
function BoardColumn({
  list,
  cards,
  getLabelsForCard,
  getMemberCount,
  onCardPress,
  onAddCard,
}: {
  list: List;
  cards: Card[];
  getLabelsForCard: (cardId: string) => Label[];
  getMemberCount: (cardId: string) => number;
  onCardPress: (cardId: string) => void;
  onAddCard: (listId: string, name: string) => void;
}) {
  const { colors, brand } = useTheme();
  const { t } = useTranslation();
  const [isAdding, setIsAdding] = useState(false);
  const [newCardName, setNewCardName] = useState('');

  const handleSubmitCard = () => {
    if (newCardName.trim()) {
      onAddCard(list.id, newCardName.trim());
      setNewCardName('');
      setIsAdding(false);
    }
  };

  return (
    <View style={[styles.column, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* Column header */}
      <View style={styles.columnHeader}>
        {list.color && (
          <View style={[styles.columnColorDot, { backgroundColor: list.color }]} />
        )}
        <Text style={[styles.columnTitle, { color: colors.text }, typography.bodySemiBold]} numberOfLines={1}>
          {list.name}
        </Text>
        <View style={[styles.cardCount, { backgroundColor: colors.surfaceHover }]}>
          <Text style={[{ color: colors.textSecondary }, typography.label]}>
            {cards.length}
          </Text>
        </View>
      </View>

      {/* Cards */}
      <FlatList
        data={cards}
        keyExtractor={(item) => item.id}
        style={styles.cardList}
        contentContainerStyle={styles.cardListContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <BoardCard
            card={item}
            labels={getLabelsForCard(item.id)}
            memberCount={getMemberCount(item.id)}
            onPress={() => onCardPress(item.id)}
            isClosed={list.type === 'closed'}
          />
        )}
      />

      {/* Add card */}
      {isAdding ? (
        <View style={styles.addCardForm}>
          <TextInput
            style={[
              styles.addCardInput,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: brand.primary,
                color: colors.text,
              },
              typography.body,
            ]}
            placeholder={t('board.addCard')}
            placeholderTextColor={colors.textTertiary}
            value={newCardName}
            onChangeText={setNewCardName}
            autoFocus
            multiline
            returnKeyType="done"
            onSubmitEditing={handleSubmitCard}
            blurOnSubmit
            onBlur={() => {
              if (!newCardName.trim()) setIsAdding(false);
            }}
          />
          <View style={styles.addCardActions}>
            <TouchableOpacity
              style={[styles.addCardButton, { backgroundColor: brand.primary }]}
              onPress={handleSubmitCard}
            >
              <Text style={[{ color: '#fff' }, typography.captionMedium]}>
                {t('board.createCard')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setIsAdding(false); setNewCardName(''); }}>
              <Text style={[{ color: colors.textSecondary }, typography.body]}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.addCardTrigger}
          onPress={() => setIsAdding(true)}
        >
          <Text style={[{ color: colors.textTertiary }, typography.body]}>
            + {t('board.addCard')}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// --- Board Screen ---
export default function BoardScreen() {
  const { boardId } = useLocalSearchParams<{ boardId: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, brand } = useTheme();
  const insets = useSafeAreaInsets();

  const board = useBoardStore((s) => s.board);
  const lists = useBoardStore((s) => s.lists);
  const isLoading = useBoardStore((s) => s.isLoading);
  const fetchBoard = useBoardStore((s) => s.fetchBoard);
  const getCardsForList = useBoardStore((s) => s.getCardsForList);
  const getLabelsForCard = useBoardStore((s) => s.getLabelsForCard);
  const getMembersForCard = useBoardStore((s) => s.getMembersForCard);
  const addCard = useBoardStore((s) => s.addCard);

  // Add list state
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const addList = useBoardStore((s) => s.addList);

  useEffect(() => {
    if (boardId) {
      fetchBoard(boardId);
    }
    return () => {
      useBoardStore.getState().reset();
    };
  }, [boardId, fetchBoard]);

  const handleCardPress = (cardId: string) => {
    router.push(`/(main)/card/${cardId}`);
  };

  const handleAddCard = useCallback(
    async (listId: string, name: string) => {
      await addCard(listId, name);
    },
    [addCard]
  );

  const handleAddList = async () => {
    if (newListName.trim()) {
      await addList(newListName.trim());
      setNewListName('');
      setIsAddingList(false);
    }
  };

  const getMemberCount = useCallback(
    (cardId: string) => getMembersForCard(cardId).length,
    [getMembersForCard]
  );

  // Filter to only show active lists
  // const activeLists = lists.filter((l) => l.type === 'active' || !l.type);
  const activeLists = lists.filter((l) => ['active', 'closed'].includes(l.type) || !l.type);  

  if (isLoading && !board) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={brand.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={[{ color: brand.primary }, typography.bodyLarge]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.boardTitle, { color: colors.text }, typography.h3]} numberOfLines={1}>
          {board?.name ?? t('board.title')}
        </Text>
      </View>

      {/* Kanban columns — horizontal scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.columnsScroll}
        contentContainerStyle={styles.columnsContainer}
        decelerationRate="fast"
        snapToInterval={COLUMN_WIDTH + COLUMN_MARGIN * 2}
        snapToAlignment="start"
      >
        {activeLists.map((list) => (
          <Animated.View key={list.id} entering={FadeIn.duration(300)} style={styles.columnWrapper}>
            <BoardColumn
              list={list}
              cards={getCardsForList(list.id)}
              getLabelsForCard={getLabelsForCard}
              getMemberCount={getMemberCount}
              onCardPress={handleCardPress}
              onAddCard={handleAddCard}
            />
          </Animated.View>
        ))}

        {/* Add list button */}
        <View style={styles.addListContainer}>
          {isAddingList ? (
            <View style={[styles.addListForm, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <TextInput
                style={[
                  styles.addListInput,
                  {
                    backgroundColor: colors.surfaceElevated,
                    borderColor: brand.primary,
                    color: colors.text,
                  },
                  typography.body,
                ]}
                placeholder={t('board.newListName')}
                placeholderTextColor={colors.textTertiary}
                value={newListName}
                onChangeText={setNewListName}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleAddList}
              />
              <View style={styles.addListActions}>
                <TouchableOpacity
                  style={[styles.addListButton, { backgroundColor: brand.primary }]}
                  onPress={handleAddList}
                >
                  <Text style={[{ color: '#fff' }, typography.captionMedium]}>
                    {t('board.addList')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setIsAddingList(false); setNewListName(''); }}>
                  <Text style={[{ color: colors.textSecondary }, typography.body]}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.addListTrigger, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => setIsAddingList(true)}
            >
              <Text style={[{ color: colors.textTertiary }, typography.bodySemiBold]}>
                + {t('board.addList')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
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
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  backButton: {
    padding: spacing.xs,
  },
  boardTitle: {
    flex: 1,
  },
  columnsScroll: {
    flex: 1,
  },
  columnsContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing['3xl'],
    gap: COLUMN_MARGIN,
    alignItems: 'stretch',
  },
  columnWrapper: {
    height: '100%',
  },
  // Column
  column: {
    width: COLUMN_WIDTH,
    height: '100%',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.sm,
    marginHorizontal: COLUMN_MARGIN / 2,
  },
  columnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  columnColorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  columnTitle: {
    flex: 1,
  },
  cardCount: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing['2xs'],
    borderRadius: borderRadius.sm,
    minWidth: 24,
    alignItems: 'center',
  },
  // Card list
  cardList: {
    flex: 1,
  },
  cardListContent: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  // Card
  card: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    padding: 0,
    overflow: 'hidden',
  },
  cardContent: {
    padding: spacing.md,
  },
  cardCoverContainer: {
    width: '100%',
    height: 120,
  },
  cardCover: {
    width: '100%',
    height: '100%',
  },
  cardLabels: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  labelDot: {
    width: 32,
    height: 6,
    borderRadius: 3,
  },
  cardName: {
    marginBottom: spacing.sm,
  },
  cardBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing['2xs'],
    borderRadius: borderRadius.xs,
    gap: spacing['2xs'],
  },
  badgeText: {},
  // Add card
  addCardTrigger: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  addCardForm: {
    padding: spacing.sm,
    gap: spacing.sm,
  },
  addCardInput: {
    borderWidth: 1.5,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    minHeight: 44,
    textAlignVertical: 'top',
  },
  addCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  addCardButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  // Add list
  addListContainer: {
    width: COLUMN_WIDTH * 0.75,
    marginHorizontal: COLUMN_MARGIN / 2,
    alignSelf: 'flex-start',
  },
  addListTrigger: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
  },
  addListForm: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.sm,
  },
  addListInput: {
    borderWidth: 1.5,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    height: 44,
  },
  addListActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  addListButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
});
