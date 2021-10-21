import { MenuID, MenuItem } from '../pages/more/menu.interface';
import { Role } from './role';

export interface Settings {
  /* bus tracking */
  tripFrom: string;
  tripTo: string;
  /* timetable */
  intakeHistory: string[];
  viewWeek: boolean; // shared with lecturer
  modulesBlacklist: string[];
  intakeGroup: string | null;
  /* exam schedule */
  examIntake: string | null;
  /* default location (for staff only) */
  defaultCampus: string;
  defaultVenue: string;
  /* attendix */
  scan: boolean;
  /* more page */
  favoriteItems: MenuID[];
  /* theme, need to change this after auto */
  theme: string;
  accentColor: string;
  /* dashboard */
  dashboardSections: string[];
  menuUI: 'cards' | 'list';
  disableShakespear: boolean;
  tourGuideSeen: boolean;
  shakeSensitivity: number;
  hideProfilePicture: boolean;
  enableMalaysiaTimezone: boolean;
  timeFormat: '12' | '24';
  /* bus shuttle service */
  busFirstLocation: string;
  busSecondLocation: string;
  userProfileName: string[];
  changedName: boolean;
}

/** Delete this in the future, used only for migration. */
export interface SettingsOld {
  role: Role; // @deprecated use storage instead
  /* bus tracking */
  tripFrom: string;
  tripTo: string;
  /* timetable */
  intakeHistory: string[];
  viewWeek: boolean; // shared with lecturer
  intakeGroup: string;
  /* exam schedule */
  examIntake: string;
  /* contact number */
  contactNo: string;
  /* default location (for staff only) */
  defaultCampus: string;
  defaultVenue: string;
  /* attendix */
  scan: boolean;
  attendixv1: boolean; // ui/ux update
  /* more page */
  favoriteItems: MenuItem[];
  /* admin-front-line */
  canAccessResults: boolean;
}
