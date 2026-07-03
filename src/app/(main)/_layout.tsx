// Planka Mobile — Main group layout with Stack navigator

import { Stack } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';

export default function MainLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="project/[projectId]"
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="board/[boardId]"
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="card/[cardId]"
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
    </Stack>
  );
}
