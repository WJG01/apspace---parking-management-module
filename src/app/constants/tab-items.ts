import { Role } from '../interfaces/role';

export const TabItems = [
  {
    name: 'Timetable',
    path: 'lecturer-timetable',
    outlineIcon: 'calendar-outline',
    fillIcon: 'calendar',
    role: Role.Lecturer
  },
  {
    name: 'Timetable',
    path: 'student-timetable',
    outlineIcon: 'calendar-outline',
    fillIcon: 'calendar',
    role: Role.Student
  },
  {
    name: 'Profile',
    path: 'profile',
    outlineIcon: 'person-outline',
    fillIcon: 'person',
    role: Role.Admin
  },
  {
    name: 'Attendance',
    path: 'attendance',
    outlineIcon: 'time-outline',
    fillIcon: 'time',
    role: Role.Student
  },
  {
    name: 'Dashboard',
    path: 'dashboard',
    outlineIcon: 'grid-outline',
    fillIcon: 'grid',
    role: Role.Admin | Role.Lecturer | Role.Student
  },
  {
    name: 'APCard',
    path: 'apcard',
    outlineIcon: 'card-outline',
    fillIcon: 'card',
    role: Role.Admin | Role.Lecturer | Role.Student
  },
  {
    name: 'More',
    path: 'more',
    outlineIcon: 'ellipsis-vertical-outline',
    fillIcon: 'ellipsis-vertical',
    role: Role.Admin | Role.Lecturer | Role.Student
  },

];
