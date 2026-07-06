// Planka Mobile — Project Detail Screen (Board Selection)

import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/useTheme';
import { useProjectStore } from '@/stores/projectStore';
import { borderRadius, spacing } from '@/theme';
import { typography } from '@/theme/typography';
import type { Board } from '@/types/models';
import { useTranslation } from 'react-i18next';

export default function ProjectDetailScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const router = useRouter();
  const { colors, brand } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const projects = useProjectStore((s) => s.projects);
  const getBoardsForProject = useProjectStore((s) => s.getBoardsForProject);

  const project = projects.find((p) => p.id === projectId);
  const boards = projectId ? getBoardsForProject(projectId) : [];

  const handleBoardPress = (board: Board) => {
    router.push(`/(main)/board/${board.id}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={[{ color: brand.primary }, typography.bodyLarge]}>← {t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }, typography.h2]} numberOfLines={1}>
          {project?.name ?? 'Project'}
        </Text>
      </View>

      {/* Board list */}
      <FlatList
        data={boards}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.duration(400).delay(index * 80)}>
            <TouchableOpacity
              style={[styles.boardItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => handleBoardPress(item)}
              activeOpacity={0.7}
            >
              <View style={[styles.boardIcon, { backgroundColor: brand.primary + '20' }]}>
                <Text style={{ fontSize: 20 }}>📊</Text>
              </View>
              <View style={styles.boardInfo}>
                <Text style={[{ color: colors.text }, typography.bodySemiBold]} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={[{ color: colors.textTertiary }, typography.caption]}>
                  {item.defaultView} view
                </Text>
              </View>
              <Text style={[{ color: colors.textTertiary }, typography.bodyLarge]}>›</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  backButton: {
    paddingVertical: spacing.xs,
  },
  headerTitle: {},
  list: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  boardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    gap: spacing.md,
  },
  boardIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boardInfo: {
    flex: 1,
    gap: spacing['2xs'],
  },
});
