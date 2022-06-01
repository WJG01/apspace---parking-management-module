export const AccentColors = [
  { title: 'Clear Blue (Default)', name: 'blue', value: '#2a83ff', rgba: '42, 131, 255' },
  { title: 'Light Indigo', name: 'purple', value: '#6d54d4', rgba: '109, 84, 212' },
  { title: 'Terracotta', name: 'pink', value: '#de6a62', rgba: '222, 106, 98' },
  { title: 'Mango Orange', name: 'orange', value: '#ff8b33', rgba: '255, 139, 51' },
  { title: 'Neutral', name: 'grey', value: '#669299', rgba: '102, 146, 153' }
];

export const CampusLocation = ['New Campus', 'TPM', 'Online'];

export const MenuOptions = ['cards', 'list'];

export const ShakespearSensitivityOptions = [
  { index: 0, value: 40 },
  { index: 1, value: 50 },
  { index: 2, value: 60 },
  { index: 3, value: 70 },
  { index: 4, value: 80 }
];

export const StudentDashboardSection = [
  { name: 'Notice Board', value: 'noticeBoard' },
  { name: 'News', value: 'news' },
  { name: 'Upcoming Trips', value: 'upcomingTrips' },
  { name: 'Contacts', value: 'contacts' },
  { name: 'APCard Chart', value: 'apcard' },
  { name: 'Financial Chart', value: 'financials' },
  { name: 'CGPA Chart', value: 'cgpa' }
];

export const StaffDashboardSection = [
  { name: 'Notice Board', value: 'noticeBoard' },
  { name: 'News', value: 'news' },
  { name: 'APCard Chart', value: 'apcard' },
];

export const TimeFormats = ['12', '24'];

export const Themes = [
  { title: 'Auto (Default)', value: '' },
  { title: 'Light', value: 'light' },
  { title: 'Dark', value: 'dark' }
];

// Return Dashboard Section Name from ID
export const StudentDashboardName = StudentDashboardSection.reduce((acc, menu) => ({ ...acc, [menu.value]: menu.name }), {});
export const StaffDashboardName = StaffDashboardSection.reduce((acc, menu) => ({ ...acc, [menu.value]: menu.name }), {});
