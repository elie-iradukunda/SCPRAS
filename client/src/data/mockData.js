export const projects = [
  { name: 'Residential Building', location: 'Kigali, Rwanda', progress: 75, budget: 120000, spent: 85000, status: 'On Track' },
  { name: 'School Construction', location: 'Musanze', progress: 45, budget: 80000, spent: 42000, status: 'Delayed' },
  { name: 'Road Construction', location: 'Rubavu', progress: 60, budget: 200000, spent: 115000, status: 'On Track' },
  { name: 'Warehouse Project', location: 'Huye', progress: 30, budget: 150000, spent: 45000, status: 'At Risk' },
];

export const workers = [
  { name: 'Jean Bosco', role: 'Mason', phone: '078123456', status: 'Present', hours: 10 },
  { name: 'Mukamana Claudine', role: 'Carpenter', phone: '078452118', status: 'Present', hours: 9.5 },
  { name: 'Nshimiyimana Eric', role: 'Helper', phone: '078994521', status: 'Absent', hours: 0 },
  { name: 'Niyonzima John', role: 'Steel Fixer', phone: '078001244', status: 'Present', hours: 9.5 },
];

export const materials = [
  { name: 'Cement (50kg)', planned: 500, used: 420, remaining: 80, variance: -12, status: 'Normal' },
  { name: 'Bricks', planned: 20000, used: 18500, remaining: 1500, variance: -7.5, status: 'Normal' },
  { name: 'Sand', planned: 120, used: 110, remaining: 10, variance: -8.3, status: 'Normal' },
  { name: 'Steel Bars', planned: 3.5, used: 3.9, remaining: -0.4, variance: 11.4, status: 'High' },
  { name: 'Concrete', planned: 80, used: 70, remaining: 10, variance: -12.5, status: 'Normal' },
];

export const progressTrend = [
  { month: 'Jan', planned: 25, actual: 18 },
  { month: 'Feb', planned: 35, actual: 32 },
  { month: 'Mar', planned: 45, actual: 39 },
  { month: 'Apr', planned: 55, actual: 57 },
  { month: 'May', planned: 65, actual: 70 },
  { month: 'Jun', planned: 75, actual: 87 },
];

export const insights = [
  { type: 'risk', title: 'Cement usage is 12% higher than planned in Residential Building.' },
  { type: 'delay', title: 'School Construction is behind schedule by 5 days.' },
  { type: 'labor', title: 'Increase bricklayers in Road Construction to meet deadline.' },
  { type: 'weather', title: 'Rain forecast may delay concrete works this week.' },
];

export const reports = [
  { name: 'Progress Report', owner: 'Project Manager', format: 'PDF', status: 'Ready' },
  { name: 'Material Report', owner: 'Site Engineer', format: 'Excel', status: 'Ready' },
  { name: 'Attendance Report', owner: 'Admin', format: 'PDF', status: 'Draft' },
  { name: 'AI Report', owner: 'Admin', format: 'PDF', status: 'Ready' },
];
