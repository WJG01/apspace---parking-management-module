import { Role } from '../interfaces/role';

export const TabItems = [
  {
    name: 'Parking',
    path: 'parking-book',
    outlineIcon: 'car-sport-outline',
    fillIcon: 'car-sport',
    role: Role.Admin | Role.Lecturer | Role.Student
  },
  {
    name: 'Checkin',
    path: 'parking-checkin',
    outlineIcon: 'qr-code-outline',
    fillIcon: 'qr-code',
    role: Role.Admin | Role.Lecturer | Role.Student
  },
  {
    name: 'Emergency',
    path: 'parking-emergency',
    outlineIcon: 'megaphone-outline',
    fillIcon: 'megaphone',
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
