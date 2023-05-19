import { Role } from '../interfaces/role';

export const TabItems = [
  {
    name: 'Booking',
    path: 'book-parking',
    outlineIcon: 'car-sport-outline',
    fillIcon: 'car-sport',
    role: Role.Admin | Role.Lecturer | Role.Student
  },
  {
    name: 'Checkin',
    path: '',
    outlineIcon: 'qr-code-outline',
    fillIcon: 'qr-code',
    role: Role.Admin | Role.Lecturer | Role.Student
  },
  {
    name: 'Emergency',
    path: '',
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
