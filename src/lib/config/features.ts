/**
 * Feature Flags Configuration
 *
 * This file contains feature flags to enable/disable features
 * without modifying backend logic.
 */

export const FEATURES = {
  /**
   * Enable/disable comment functionality across the application
   * Backend remains intact for future use
   */
  ENABLE_COMMENTS: false,

  /**
   * Enable/disable chat functionality across the application
   * Backend remains intact for future use
   */
  ENABLE_CHAT: false,
<<<<<<< HEAD
=======

  /**
   * Enable/disable like functionality across the application
   * Backend remains intact for future use
   */
  ENABLE_LIKES: false,
>>>>>>> c40b79b (benerin update)
} as const;

export type FeatureFlags = typeof FEATURES;
