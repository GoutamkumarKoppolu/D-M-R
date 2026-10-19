// All tunable values from requirements.md live here. Change them only with a decision file.

// Vouching (section 6.4)
export const VOUCHES_REQUIRED = 1;
export const VOUCH_RADIUS_M = 1000;
export const VOUCH_BLOCK_DAYS = 30;
export const PENDING_DISTANCE_ROUND_M = 100;

// SOS timeline (section 8.2)
export const STAGE2_DELAY_S = 30;
export const STAGE3_DELAY_S = 90;
export const RADIUS_1_M = 500;
export const RADIUS_2_M = 1000;
export const AUTO_CLOSE_MIN = 30;
export const EXTEND_MIN = 30;
export const MAX_RING_PER_STAGE = 20;
export const MAX_ACCEPTED = 5;
export const MOCK_RADIUS_M = 1000;

// Rate limits (section 8.6)
export const MAX_SOS_PER_DAY = 3;
export const RATE_LIMIT_WINDOW_H = 24;

// SOS button (section 7.4)
export const SOS_HOLD_S = 5;
export const SOS_COUNTDOWN_S = 10;
export const EMERGENCY_NUMBER = '108';
export const POLICE_NUMBER = '112';

// Households and invites (section 7.2)
export const MAX_FAMILY = 5;
export const MAX_PERSONAL_HELPERS = 10;
export const INVITE_CODE_LENGTH = 6;
export const INVITE_TTL_H = 24;
export const MEDICAL_NOTES_MAX = 500;
export const NAME_MIN = 2;
export const NAME_MAX = 50;
export const REPORT_TEXT_MAX = 300;

// Push and alarm (sections 11, 12.1, 14)
export const MAX_FCM_TOKENS = 5;
export const SOS_ALERT_TTL_S = 120;
export const ALERT_DISTANCE_ROUND_M = 50;
export const ALARM_MAX_S = 60;
export const TEST_ALARM_S = 15;

// Location (section 15)
export const GEOHASH_PRECISION = 9;
export const TRACKING_INTERVAL_S = 15;
export const TRACKING_DISTANCE_M = 30;

// Retention and admin (sections 4.1, 7.7)
export const RETENTION_DAYS = 90;
export const RECENT_SOS_ADMIN_LIMIT = 50;

// Elder mode (section 16)
export const ELDER_FONT_SCALE = 1.4;
export const ELDER_MIN_TOUCH_DP = 64;
export const SOS_BUTTON_MIN_DP = 200;
