/**
 * Batch Range Validation Utilities
 * Ensures non-overlapping batch ranges and proper range assignment
 */

import { ProductionBatch } from "../services/api";

export interface BatchRange {
  from: number;
  to: number;
}

export interface RangeValidationResult {
  isValid: boolean;
  error?: string;
  suggestedRange?: BatchRange;
}

/**
 * Check if two ranges overlap
 */
export function rangesOverlap(range1: BatchRange, range2: BatchRange): boolean {
  return (
    (range1.from >= range2.from && range1.from <= range2.to) ||
    (range1.to >= range2.from && range1.to <= range2.to) ||
    (range2.from >= range1.from && range2.from <= range1.to) ||
    (range2.to >= range1.from && range2.to <= range1.to)
  );
}

/**
 * Validate a new batch range against existing batches
 */
export function validateBatchRange(
  newRange: BatchRange,
  existingBatches: ProductionBatch[],
  totalQuantity: number
): RangeValidationResult {
  // Validate range format
  if (newRange.from < 1) {
    return {
      isValid: false,
      error: "Range 'from' must be at least 1",
    };
  }

  if (newRange.to < newRange.from) {
    return {
      isValid: false,
      error: "Range 'to' must be greater than or equal to 'from'",
    };
  }

  if (newRange.to > totalQuantity) {
    return {
      isValid: false,
      error: `Range 'to' (${newRange.to}) cannot exceed total quantity (${totalQuantity})`,
    };
  }

  // Check for overlaps with existing batches
  for (const batch of existingBatches) {
    if (rangesOverlap(newRange, batch.range)) {
      return {
        isValid: false,
        error: `Range ${newRange.from}-${newRange.to} overlaps with existing batch #${batch.batchNumber} (${batch.range.from}-${batch.range.to})`,
      };
    }
  }

  return {
    isValid: true,
  };
}

/**
 * Get the next available range for a new batch
 */
export function getNextAvailableRange(
  existingBatches: ProductionBatch[],
  totalQuantity: number,
  requestedQuantity?: number
): BatchRange | null {
  if (existingBatches.length === 0) {
    // First batch starts at 1
    const to = requestedQuantity
      ? Math.min(requestedQuantity, totalQuantity)
      : totalQuantity;
    return { from: 1, to };
  }

  // Sort batches by range.from
  const sortedBatches = [...existingBatches].sort(
    (a, b) => a.range.from - b.range.from
  );

  // Find gaps between batches
  for (let i = 0; i < sortedBatches.length - 1; i++) {
    const currentBatch = sortedBatches[i];
    const nextBatch = sortedBatches[i + 1];
    const gapStart = currentBatch.range.to + 1;
    const gapEnd = nextBatch.range.from - 1;

    if (gapEnd >= gapStart) {
      // Found a gap
      const availableInGap = gapEnd - gapStart + 1;
      const quantity = requestedQuantity
        ? Math.min(requestedQuantity, availableInGap)
        : availableInGap;
      return {
        from: gapStart,
        to: gapStart + quantity - 1,
      };
    }
  }

  // Check if there's space after the last batch
  const lastBatch = sortedBatches[sortedBatches.length - 1];
  if (lastBatch.range.to < totalQuantity) {
    const from = lastBatch.range.to + 1;
    const availableAfter = totalQuantity - lastBatch.range.to;
    const quantity = requestedQuantity
      ? Math.min(requestedQuantity, availableAfter)
      : availableAfter;
    return {
      from,
      to: from + quantity - 1,
    };
  }

  // No available range
  return null;
}

/**
 * Calculate total assigned quantity from batches
 */
export function calculateAssignedQuantity(batches: ProductionBatch[]): number {
  return batches.reduce((sum, batch) => sum + batch.quantity, 0);
}

/**
 * Calculate remaining quantity available for new batches
 */
export function calculateRemainingQuantity(
  totalQuantity: number,
  batches: ProductionBatch[]
): number {
  const assigned = calculateAssignedQuantity(batches);
  return totalQuantity - assigned;
}

/**
 * Get all gaps in batch ranges
 */
export function findRangeGaps(
  batches: ProductionBatch[],
  totalQuantity: number
): BatchRange[] {
  if (batches.length === 0) {
    return [{ from: 1, to: totalQuantity }];
  }

  // Filter out batches without valid range data
  const validBatches = batches.filter(
    (b) =>
      b.range &&
      typeof b.range.from === "number" &&
      typeof b.range.to === "number"
  );

  if (validBatches.length === 0) {
    return [{ from: 1, to: totalQuantity }];
  }

  const gaps: BatchRange[] = [];
  const sortedBatches = [...validBatches].sort(
    (a, b) => a.range.from - b.range.from
  );

  // Check gap before first batch
  if (sortedBatches[0]?.range?.from > 1) {
    gaps.push({
      from: 1,
      to: sortedBatches[0].range.from - 1,
    });
  }

  // Check gaps between batches
  for (let i = 0; i < sortedBatches.length - 1; i++) {
    const currentBatch = sortedBatches[i];
    const nextBatch = sortedBatches[i + 1];

    if (currentBatch?.range && nextBatch?.range) {
      const gapStart = currentBatch.range.to + 1;
      const gapEnd = nextBatch.range.from - 1;

      if (gapEnd >= gapStart) {
        gaps.push({
          from: gapStart,
          to: gapEnd,
        });
      }
    }
  }

  // Check gap after last batch
  const lastBatch = sortedBatches[sortedBatches.length - 1];
  if (lastBatch?.range?.to && lastBatch.range.to < totalQuantity) {
    gaps.push({
      from: lastBatch.range.to + 1,
      to: totalQuantity,
    });
  }

  return gaps;
}

/**
 * Format range for display
 */
export function formatRange(range: BatchRange): string {
  return `${range.from}-${range.to}`;
}

/**
 * Calculate quantity from range
 */
export function calculateQuantityFromRange(range: BatchRange): number {
  return range.to - range.from + 1;
}

/**
 * Validate that all batches cover the total quantity without gaps or overlaps
 */
export function validateCompleteCoverage(
  batches: ProductionBatch[],
  totalQuantity: number
): RangeValidationResult {
  if (batches.length === 0) {
    return {
      isValid: false,
      error: "No batches assigned",
    };
  }

  const sortedBatches = [...batches].sort(
    (a, b) => a.range.from - b.range.from
  );

  // Check if first batch starts at 1
  if (sortedBatches[0].range.from !== 1) {
    return {
      isValid: false,
      error: `Gap at start: batches should start at 1, but first batch starts at ${sortedBatches[0].range.from}`,
    };
  }

  // Check for gaps and overlaps
  for (let i = 0; i < sortedBatches.length - 1; i++) {
    const currentBatch = sortedBatches[i];
    const nextBatch = sortedBatches[i + 1];

    // Check for gap
    if (nextBatch.range.from !== currentBatch.range.to + 1) {
      return {
        isValid: false,
        error: `Gap between batch #${currentBatch.batchNumber} (ends at ${currentBatch.range.to}) and batch #${nextBatch.batchNumber} (starts at ${nextBatch.range.from})`,
      };
    }
  }

  // Check if last batch ends at totalQuantity
  const lastBatch = sortedBatches[sortedBatches.length - 1];
  if (lastBatch.range.to !== totalQuantity) {
    return {
      isValid: false,
      error: `Gap at end: last batch ends at ${lastBatch.range.to}, but total quantity is ${totalQuantity}`,
    };
  }

  return {
    isValid: true,
  };
}

/**
 * Get batch statistics
 */
export function getBatchStatistics(batches: ProductionBatch[]) {
  const total = batches.length;
  const active = batches.filter((b) => b.status === "active").length;
  const completed = batches.filter((b) => b.status === "completed").length;
  const cancelled = batches.filter((b) => b.status === "cancelled").length;
  const totalQuantity = calculateAssignedQuantity(batches);
  const completedQuantity = batches
    .filter((b) => b.status === "completed")
    .reduce((sum, b) => sum + b.quantity, 0);

  return {
    total,
    active,
    completed,
    cancelled,
    totalQuantity,
    completedQuantity,
    remainingQuantity: totalQuantity - completedQuantity,
    completionPercentage:
      totalQuantity > 0 ? (completedQuantity / totalQuantity) * 100 : 0,
  };
}
