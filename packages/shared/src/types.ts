// Firestore document shapes (section 11).
// TS is the timestamp type: Date in pure code, Firestore Timestamp in functions (ADR-0016).

export type Lang = 'en' | 'te';
export type HelperStatus = 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'REMOVED';
export type HelperTag = 'NEIGHBOUR' | 'GUARD' | 'SHOP_OWNER' | 'DRIVER' | 'YOUTH' | 'MEDICAL';
export type HelpType = 'HELP_NEEDED' | 'LIFT' | 'DRIVE' | 'SIT_WITH';
export type SosStatus = 'OPEN' | 'ACTIVE' | 'CLOSED';
export type CloseReason = 'RESOLVED' | 'AUTO_CLOSED';
export type InviteKind = 'FAMILY' | 'RESIDENT' | 'PERSONAL_HELPER';
export type ReportReason = 'RUDE' | 'NO_SHOW' | 'UNSAFE' | 'FAKE' | 'OTHER';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface HelperProfile<TS = Date> {
  status: HelperStatus;
  tags: HelperTag[];
  areaOnly: boolean;
  goWithPartner: boolean;
  available: boolean;
  alarmTested: boolean;
  vouchedBy: { uid: string; name: string; at: TS }[];
  vouchBlockedUntil: TS | null;
}

export interface User<TS = Date> {
  uid: string;
  phone: string;
  name: string;
  lang: Lang;
  elderMode: boolean;
  mockMode: boolean;
  homePin: LatLng | null;
  geohash: string | null;
  colonyName: string | null;
  fcmTokens: string[];
  helper: HelperProfile<TS>;
  householdIds: string[];
  familyOfHouseholdIds: string[];
  createdAt: TS;
}

export interface HelperDirectoryEntry {
  uid: string;
  name: string;
  tags: HelperTag[];
  colonyName: string;
  status: HelperStatus;
  vouchedByNames: string[];
}

export interface Household<TS = Date> {
  id: string;
  name: string;
  residentIds: string[];
  familyIds: string[];
  personalHelperIds: string[];
  addressLine: string;
  landmark: string | null;
  colonyName: string;
  homePin: LatLng;
  geohash: string;
  floor: number | null;
  liftAvailable: boolean | null;
  needsCarrying: boolean | null;
  carAvailable: boolean | null;
  medicalNotes: string | null;
  bloodGroup: string | null;
  preferredHospital: string | null;
  patientAge: number | null;
  createdAt: TS;
}

export interface Invite<TS = Date> {
  code: string;
  householdId: string;
  kind: InviteKind;
  targetPhone: string | null;
  createdBy: string;
  expiresAt: TS;
  usedBy: string | null;
}

export interface Sos<TS = Date> {
  id: string;
  householdId: string;
  raisedBy: string;
  isMock: boolean;
  status: SosStatus;
  closeReason: CloseReason | null;
  helpType: HelpType;
  colonyName: string;
  patientAge: number | null;
  stage: 1 | 2 | 3;
  rungHelperIds: string[];
  acceptedHelperIds: string[];
  arrivedAt: Record<string, TS>;
  createdAt: TS;
  firstAcceptedAt: TS | null;
  extendedUntil: TS | null;
  closedAt: TS | null;
}

export interface SosPrivate {
  addressLine: string;
  landmark: string | null;
  homePin: LatLng;
  floor: number | null;
  liftAvailable: boolean | null;
  needsCarrying: boolean | null;
  carAvailable: boolean | null;
  medicalNotes: string | null;
  bloodGroup: string | null;
  preferredHospital: string | null;
  raisedByPhone: string;
  residentPhones: string[];
  familyPhones: { name: string; phone: string }[];
  acceptedHelpers: { uid: string; name: string; phone: string }[];
}

export interface Tracking<TS = Date> {
  lat: number;
  lng: number;
  updatedAt: TS;
}

export interface Report<TS = Date> {
  id: string;
  reportedUid: string;
  reporterUid: string;
  reason: ReportReason;
  text: string;
  sosId: string | null;
  status: 'OPEN' | 'REVIEWED';
  createdAt: TS;
}

export interface DailyStats {
  sosRaised: number;
  sosWithAccept: number;
  medianSecondsToAccept: number | null;
}
