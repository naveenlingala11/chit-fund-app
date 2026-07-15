import { Platform } from 'react-native';

/**
 * ChitSangham Central Configuration Module
 * Manages environment configurations, API endpoints, business defaults, and presets.
 */

// ─── API & SERVER CONFIGURATION ──────────────────────────────────────────────
export const API_CONFIG = {
  PROD_SERVER_URL: process.env.EXPO_PUBLIC_API_URL || 'https://chit-fund-app-84wg.onrender.com',
  DEV_SERVER_URL: {
    ANDROID: 'http://10.0.2.2:3000',
    DEFAULT: 'http://localhost:3000',
  },
  
  /**
   * Resolves the active backend server URL dynamically based on environment and platform.
   */
  getInitialServerUrl: (): string => {
    if (process.env.EXPO_PUBLIC_API_URL) {
      return process.env.EXPO_PUBLIC_API_URL;
    }
    if (!__DEV__) {
      return API_CONFIG.PROD_SERVER_URL;
    }
    return Platform.OS === 'android'
      ? API_CONFIG.DEV_SERVER_URL.ANDROID
      : API_CONFIG.DEV_SERVER_URL.DEFAULT;
  },
};

// ─── BUSINESS & CHIT RULES DEFAULTS ──────────────────────────────────────────
export const BUSINESS_CONFIG = {
  APP_NAME: 'ChitSangham',
  DEFAULT_FOREMAN_COMMISSION_PCT: 5,
  DEFAULT_MAX_BID_DISCOUNT_PCT: 30,
  DEFAULT_AUCTION_DAY_OF_MONTH: 10,
  DEFAULT_AUCTION_TIME: '18:00',
  BANK_FD_COMPARISON_ROI_PCT: 6.5,
};

// ─── HELP & SUPPORT DEFAULTS ─────────────────────────────────────────────────
export const SUPPORT_CONFIG = {
  PHONE: '+919876543210',
  WHATSAPP_PHONE: '919876543210',
  EMAIL: 'support@chitsangham.com',
  WHATSAPP_SUPPORT_MSG: 'Hi Support, I need help with the ChitSangham App!',
};

// ─── CHIT TEMPLATE PRESETS ───────────────────────────────────────────────────
export const CHIT_PRESETS = [
  {
    label: '₹1 Lakh (10M)',
    value: '100000',
    members: '10',
    commission: '5',
    day: '5',
    description: '10 Members • 10 Months',
  },
  {
    label: '₹5 Lakh (20M)',
    value: '500000',
    members: '20',
    commission: '5',
    day: '10',
    description: '20 Members • 20 Months',
  },
  {
    label: '₹10 Lakh (20M)',
    value: '1000000',
    members: '20',
    commission: '5',
    day: '15',
    description: '20 Members • 20 Months',
  },
];
