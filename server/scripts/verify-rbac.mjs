const baseUrl = process.env.API_URL || 'http://localhost:5000/api';

const accounts = [
  { role: 'admin', email: 'admin@scpras.rw', password: 'admin123', allowed: '/settings', forbidden: null },
  { role: 'project_manager', email: 'manager@scpras.rw', password: 'manager123', allowed: '/projects', forbidden: '/settings' },
  { role: 'site_engineer', email: 'engineer@scpras.rw', password: 'engineer123', allowed: '/activities', forbidden: '/settings' },
  { role: 'quantity_surveyor', email: 'qs@scpras.rw', password: 'qs123456', allowed: '/materials', forbidden: '/activities' },
  { role: 'store_officer', email: 'store@scpras.rw', password: 'store123', allowed: '/materials', forbidden: '/activities' },
  { role: 'contractor_foreman', email: 'foreman@scpras.rw', password: 'foreman123', allowed: '/activities', forbidden: '/materials' },
];

async function call(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, options);
  let data = null;
  try { data = await response.json(); } catch { data = null; }
  return { status: response.status, data };
}

const checks = [];
const publicDashboard = await call('/dashboard');
checks.push({ role: 'anonymous', check: 'dashboard protected', expected: 401, actual: publicDashboard.status });

for (const account of accounts) {
  const login = await call('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: account.email, password: account.password }),
  });
  checks.push({ role: account.role, check: 'login', expected: 200, actual: login.status });
  if (!login.data?.token) continue;

  const headers = { Authorization: `Bearer ${login.data.token}` };
  const dashboard = await call('/dashboard', { headers });
  checks.push({ role: account.role, check: 'dashboard read', expected: 200, actual: dashboard.status });

  const allowed = await call(account.allowed, { headers });
  checks.push({ role: account.role, check: `${account.allowed} allowed`, expected: 200, actual: allowed.status });

  if (account.forbidden) {
    const forbidden = await call(account.forbidden, { headers });
    checks.push({ role: account.role, check: `${account.forbidden} denied`, expected: 403, actual: forbidden.status });
  }
}

console.table(checks);
const failures = checks.filter((check) => check.actual !== check.expected);
if (failures.length) {
  console.error(`RBAC verification failed: ${failures.length} check(s).`);
  process.exitCode = 1;
} else {
  console.log(`RBAC verification passed: ${checks.length} check(s).`);
}
