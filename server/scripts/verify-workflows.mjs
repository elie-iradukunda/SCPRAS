const baseUrl = process.env.API_URL || 'http://localhost:5000/api';

async function request(path, { token, method = 'GET', body } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  let data = null;
  try { data = await response.json(); } catch { data = null; }
  if (!response.ok) throw new Error(`${method} ${path} returned ${response.status}: ${data?.message || 'unknown error'}`);
  return { status: response.status, data };
}

async function login(email, password) {
  return (await request('/auth/login', { method: 'POST', body: { email, password } })).data.token;
}

const results = [];
const mark = (workflow, operation, status) => results.push({ workflow, operation, status, result: status >= 200 && status < 300 ? 'PASS' : 'FAIL' });

const [admin, manager, engineer, qs, store, foreman] = await Promise.all([
  login('admin@scpras.rw', 'admin123'),
  login('manager@scpras.rw', 'manager123'),
  login('engineer@scpras.rw', 'engineer123'),
  login('qs@scpras.rw', 'qs123456'),
  login('store@scpras.rw', 'store123'),
  login('foreman@scpras.rw', 'foreman123'),
]);

const suffix = Date.now();

const createdUser = await request('/settings/users', {
  token: admin,
  method: 'POST',
  body: { fullName: 'Panel Test User', email: `panel-${suffix}@scpras.rw`, password: 'PanelTest123', role: 'site_engineer', phone: '0780000999' },
});
mark('User administration', 'create authorized user', createdUser.status);
const updatedUser = await request(`/settings/users/${createdUser.data.id}`, { token: admin, method: 'PATCH', body: { status: 'inactive' } });
mark('User administration', 'deactivate user', updatedUser.status);
const deletedUser = await request(`/settings/users/${createdUser.data.id}`, { token: admin, method: 'DELETE' });
mark('User administration', 'delete test user', deletedUser.status);

const createdProject = await request('/projects', {
  token: manager,
  method: 'POST',
  body: {
    projectName: `Panel Verification Project ${suffix}`,
    projectCode: `PANEL-${suffix}`,
    clientName: 'Academic Verification Client',
    location: 'Kigali, Rwanda',
    projectType: 'Residential',
    budget: 25000000,
    currency: 'RWF',
    startDate: '2026-06-28',
    deadline: '2026-09-30',
    status: 'planning',
    progress: 0,
  },
});
mark('Project baseline', 'create project', createdProject.status);
const projectId = createdProject.data.id;
const updatedProject = await request(`/projects/${projectId}`, { token: manager, method: 'PATCH', body: { status: 'active', progress: 5 } });
mark('Project baseline', 'update approved baseline', updatedProject.status);

const createdActivity = await request('/activities', {
  token: engineer,
  method: 'POST',
  body: {
    projectId,
    activityCode: `SITE-${suffix}`,
    activityName: 'Panel workflow verification',
    phase: 'Site establishment',
    description: 'Verified progress capture from the site-engineer workspace.',
    constraints: 'Awaiting temporary power connection.',
    plannedProgress: 25,
    actualProgress: 10,
    status: 'ongoing',
    responsiblePerson: 'Uwimana Vestine',
  },
});
mark('Site reporting', 'create progress and constraint update', createdActivity.status);
const updatedActivity = await request(`/activities/${createdActivity.data.id}`, { token: foreman, method: 'PATCH', body: { actualProgress: 25, status: 'ongoing', constraints: '' } });
mark('Site reporting', 'update actual progress', updatedActivity.status);

const createdMaterial = await request('/materials', {
  token: qs,
  method: 'POST',
  body: {
    projectId,
    materialCode: `MAT-${suffix}`,
    materialName: 'Panel test cement',
    category: 'Structural',
    unit: 'bags',
    plannedQuantity: 100,
    receivedQuantity: 0,
    usedQuantity: 0,
    unitCost: 14000,
    estimatedCost: 1400000,
    currency: 'RWF',
    status: 'pending',
  },
});
mark('Material control', 'create BOQ material', createdMaterial.status);
const receivedMaterial = await request('/materials/receive', {
  token: store,
  method: 'POST',
  body: { materialId: createdMaterial.data.id, receivedQuantity: 40, mode: 'add', lastReceivedDate: '2026-06-28', receivedBy: 'Store Officer' },
});
mark('Material control', 'receive stock', receivedMaterial.status);

const checkIn = await request('/attendance/check-in', {
  token: foreman,
  method: 'POST',
  body: { workerId: 1, projectId, location: 'Kigali test site' },
});
mark('Attendance', 'worker check-in', checkIn.status);
const checkOut = await request('/attendance/check-out', { token: foreman, method: 'POST', body: { attendanceId: checkIn.data.id } });
mark('Attendance', 'worker check-out', checkOut.status);

const progressReport = await request('/reports/progress', { token: manager });
mark('Reporting', 'project-manager progress report', progressReport.status);
const materialReport = await request('/reports/material', { token: store });
mark('Reporting', 'store material report', materialReport.status);
const financialReport = await request('/reports/financial', { token: qs });
mark('Reporting', 'quantity-surveyor financial report', financialReport.status);

await request(`/attendance/${checkIn.data.id}`, { token: foreman, method: 'DELETE' });
await request(`/activities/${createdActivity.data.id}`, { token: manager, method: 'DELETE' });
await request(`/materials/${createdMaterial.data.id}`, { token: qs, method: 'DELETE' });
await request(`/projects/${projectId}`, { token: manager, method: 'DELETE' });
mark('Test cleanup', 'remove temporary records', 200);

console.table(results);
console.log(`Workflow verification passed: ${results.length} operations across ${new Set(results.map((item) => item.workflow)).size} workflows.`);
