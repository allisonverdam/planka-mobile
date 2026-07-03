// Planka Mobile — Projects Screen (Tab)

import { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useTheme } from '@/hooks/useTheme';
import { useProjectStore } from '@/stores/projectStore';
import { spacing, borderRadius } from '@/theme';
import { typography } from '@/theme/typography';
import type { Project } from '@/types/models';

// Planka gradient backgrounds
const gradientColors: Record<string, string[]> = {
  'old-lime': ['#7ec844', '#41a538'],
  'ocean-dive': ['#2e80c7', '#1a5e9a'],
  'berry-red': ['#e04f5f', '#c0392b'],
  'sunset-glow': ['#f0982d', '#d35400'],
  'midnight-blue': ['#455a75', '#2c3e50'],
  'pink-tulip': ['#c36498', '#a0447a'],
};

function getProjectColor(project: Project): string {
  if (project.background?.name) {
    const colors = gradientColors[project.background.name];
    if (colors) return colors[0];
  }
  // Default colors by index
  const defaults = ['#2e80c7', '#4ea088', '#e04f5f', '#f0982d', '#c36498', '#455a75'];
  const hash = project.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return defaults[hash % defaults.length];
}

function ProjectCard({
  project,
  boardCount,
  index,
  onPress,
}: {
  project: Project;
  boardCount: number;
  index: number;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const bgColor = getProjectColor(project);

  return (
    <Animated.View entering={FadeInDown.duration(400).delay(index * 80)}>
      <TouchableOpacity
        style={[styles.projectCard, { backgroundColor: bgColor }]}
        onPress={onPress}
        activeOpacity={0.85}
      >
        <View style={styles.projectCardContent}>
          <Text style={[styles.projectName, typography.h2]} numberOfLines={2}>
            {project.name}
          </Text>
          <Text style={[styles.boardCount, typography.caption]}>
            {t('projects.boards', { count: boardCount })}
          </Text>
        </View>
        {/* Decorative circle */}
        <View style={styles.decorCircle} />
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function ProjectsScreen() {
  const { t } = useTranslation();
  const { colors, brand } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const projects = useProjectStore((s) => s.projects);
  const boards = useProjectStore((s) => s.boards);
  const fetchProjects = useProjectStore((s) => s.fetchProjects);
  const isLoading = useProjectStore((s) => s.isLoading);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const getBoardCount = useCallback(
    (projectId: string) => boards.filter((b) => b.projectId === projectId).length,
    [boards]
  );

  const handleProjectPress = (project: Project) => {
    const projectBoards = boards
      .filter((b) => b.projectId === project.id)
      .sort((a, b) => a.position - b.position);

    if (projectBoards.length === 1) {
      // Navigate directly to the only board
      router.push(`/(main)/board/${projectBoards[0].id}`);
    } else {
      router.push(`/(main)/project/${project.id}`);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Text style={[styles.headerTitle, { color: colors.text }, typography.h1]}>
          {t('projects.title')}
        </Text>
      </View>

      {/* Projects list */}
      <FlatList
        data={projects}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={fetchProjects}
            tintColor={brand.primary}
          />
        }
        renderItem={({ item, index }) => (
          <ProjectCard
            project={item}
            boardCount={getBoardCount(item.id)}
            index={index}
            onPress={() => handleProjectPress(item)}
          />
        )}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyTitle, { color: colors.textSecondary }, typography.h3]}>
                {t('projects.noProjects')}
              </Text>
              <Text style={[styles.emptyDesc, { color: colors.textTertiary }, typography.body]}>
                {t('projects.noProjectsDesc')}
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing.lg,
  },
  headerTitle: {
    // typography applied inline
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['3xl'],
    gap: spacing.md,
  },
  projectCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    minHeight: 120,
    overflow: 'hidden',
    position: 'relative',
  },
  projectCardContent: {
    flex: 1,
    justifyContent: 'space-between',
    zIndex: 1,
  },
  projectName: {
    color: '#fff',
    marginBottom: spacing.sm,
  },
  boardCount: {
    color: 'rgba(255,255,255,0.8)',
  },
  decorCircle: {
    position: 'absolute',
    right: -20,
    top: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    paddingHorizontal: spacing['3xl'],
  },
  emptyTitle: {
    marginBottom: spacing.sm,
  },
  emptyDesc: {
    textAlign: 'center',
  },
});
