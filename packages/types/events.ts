// ─── Shared Event Types ──────────────────────────────────────────────────────
// Cross-package event type definitions for DevOS.
// These are re-exported from @devos/types for convenience.
//
// The full KernelEventMap lives in @devos/kernel.
// This module provides a leaner subset for packages that don't depend on kernel.

/** Generic event payload shape. */
export interface DevOSEvent<T = unknown> {
  type: string;
  payload: T;
  timestamp: string;
  source?: string;
}
