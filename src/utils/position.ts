// Planka Mobile — Position calculation utility
// The Planka system uses large integers for position (default 65536)
// with bisection for reordering

export const POSITION_GAP = 65536;

/**
 * Calculate position for inserting at the end of a list
 */
export function getNextPosition(existingPositions: number[]): number {
  if (existingPositions.length === 0) return POSITION_GAP;
  return Math.max(...existingPositions) + POSITION_GAP;
}

/**
 * Calculate position for inserting between two items
 */
export function getPositionBetween(
  before: number | null,
  after: number | null
): number {
  if (before === null && after === null) return POSITION_GAP;
  if (before === null) return (after ?? POSITION_GAP) / 2;
  if (after === null) return before + POSITION_GAP;
  return (before + after) / 2;
}

/**
 * Calculate position for inserting at the beginning
 */
export function getFirstPosition(existingPositions: number[]): number {
  if (existingPositions.length === 0) return POSITION_GAP;
  return Math.min(...existingPositions) / 2;
}
