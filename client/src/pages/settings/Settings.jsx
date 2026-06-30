import {
  AlertTriangle,
  CheckCircle2,
  Lock,
  Monitor,
  Plus,
  Shield,
  Smartphone,
  Trash2,
  UserCog,
  Wifi,
  WifiOff,
  Wrench,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import { api, apiErrorMessage } from '../../services/api.js';

const emptyDevice = { name: '', type: 'qr', location: '', status: 'online' };
const emptyUser = { fullName: '', email: '', password: '', role: 'project_manager', phone: '' };
const ROLE_OPTIONS = [
  ['admin', 'Administrator'],
  ['project_manager', 'Project Manager'],
  ['site_engineer', 'Site Engineer'],
  ['quantity_surveyor', 'Quantity Surveyor / Cost Estimator'],
  ['store_officer', 'Logistics / Store Officer'],
  ['contractor_foreman', 'Contractor / Foreman'],
];

const DEVICE_ICONS = { qr: Monitor, rfid: Wifi, nfc: Smartphone, mobile: Smartphone };
const DEVICE_LABELS = { qr: 'QR Scanner', rfid: 'RFID Reader', nfc: 'NFC Device', mobile: 'Mobile App' };
const DEVICE_COLORS = { qr: 'text-blue-700 bg-blue-50', rfid: 'text-purple-700 bg-purple-50', nfc: 'text-emerald-700 bg-emerald-50', mobile: 'text-amber-700 bg-amber-50' };

const STATUS_BADGE = {
  online:      { label: 'Online',      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  offline:     { label: 'Offline',     badge: 'bg-slate-100 text-slate-600 border-slate-200',      dot: 'bg-slate-400' },
  maintenance: { label: 'Maintenance', badge: 'bg-amber-50 text-amber-700 border-amber-200',       dot: 'bg-amber-500' },
};

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function TextInput(props) {
  return (
    <input
      {...props}
      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
    />
  );
}

function SelectInput(props) {
  return (
    <select
      {...props}
      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
    />
  );
}

export default function Settings() {
  const [settings, setSettings] = useState({ roles: {}, users: [], devices: [], security: {} });
  const [deviceForm, setDeviceForm] = useState(emptyDevice);
  const [userForm, setUserForm] = useState(emptyUser);
  const [status, setStatus] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [userDeleteConfirm, setUserDeleteConfirm] = useState(null);

  const loadSettings = async () => {
    try {
      const { data } = await api.get('/settings');
      setSettings(data);
    } catch (error) {
      setStatus({ type: 'error', message: apiErrorMessage(error) });
    }
  };

  useEffect(() => {
    let ignore = false;
    async function loadInitialSettings() {
      try {
        const { data } = await api.get('/settings');
        if (!ignore) setSettings(data);
      } catch (error) {
        if (!ignore) setStatus({ type: 'error', message: apiErrorMessage(error) });
      }
    }
    loadInitialSettings();
    return () => { ignore = true; };
  }, []);

  const roleTotal = useMemo(() => Object.values(settings.roles || {}).reduce((total, v) => total + Number(v || 0), 0), [settings.roles]);
  const maxRoleCount = useMemo(() => Math.max(...Object.values(settings.roles || {}).map(Number), 1), [settings.roles]);
  const onlineDevices = settings.devices.filter((d) => d.status === 'online').length;

  const updateDeviceForm = (field, value) => setDeviceForm((current) => ({ ...current, [field]: value }));
  const updateUserForm = (field, value) => setUserForm((current) => ({ ...current, [field]: value }));

  const createUser = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setStatus(null);
    try {
      await api.post('/settings/users', userForm);
      setUserForm(emptyUser);
      await loadSettings();
      setStatus({ type: 'success', message: 'Authorized SCPRAS user created.' });
    } catch (error) {
      setStatus({ type: 'error', message: apiErrorMessage(error) });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleUser = async (user) => {
    setStatus(null);
    try {
      const nextStatus = user.status === 'inactive' ? 'active' : 'inactive';
      await api.patch(`/settings/users/${user.id}`, { status: nextStatus });
      await loadSettings();
      setStatus({ type: 'success', message: `${user.fullName} is now ${nextStatus}.` });
    } catch (error) {
      setStatus({ type: 'error', message: apiErrorMessage(error) });
    }
  };

  const deleteUser = async (userId) => {
    setUserDeleteConfirm(null);
    setStatus(null);
    try {
      await api.delete(`/settings/users/${userId}`);
      await loadSettings();
      setStatus({ type: 'success', message: 'User account removed.' });
    } catch (error) {
      setStatus({ type: 'error', message: apiErrorMessage(error) });
    }
  };

  const createDevice = async (event) => {
    event.preventDefault();
    if (!deviceForm.name.trim()) {
      setStatus({ type: 'error', message: 'Device name is required.' });
      return;
    }
    setIsSaving(true);
    setStatus(null);
    try {
      await api.post('/settings/devices', deviceForm);
      setDeviceForm(emptyDevice);
      await loadSettings();
      setStatus({ type: 'success', message: `Device "${deviceForm.name}" registered successfully.` });
    } catch (error) {
      setStatus({ type: 'error', message: apiErrorMessage(error) });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleDevice = async (device) => {
    setStatus(null);
    try {
      const newStatus = device.status === 'online' ? 'maintenance' : 'online';
      await api.patch(`/settings/devices/${device.id}`, { status: newStatus });
      await loadSettings();
      setStatus({ type: 'success', message: `${device.name} set to ${newStatus}.` });
    } catch (error) {
      setStatus({ type: 'error', message: apiErrorMessage(error) });
    }
  };

  const deleteDevice = async (deviceId) => {
    setStatus(null);
    setDeleteConfirm(null);
    try {
      await api.delete(`/settings/devices/${deviceId}`);
      await loadSettings();
      setStatus({ type: 'success', message: 'Device removed.' });
    } catch (error) {
      setStatus({ type: 'error', message: apiErrorMessage(error) });
    }
  };

  return (
    <section className="page-shell">
      <PageHeader
        eyebrow="System Settings"
        title="Administration and Security"
        description="Manage the six approved SCPRAS roles, user access, attendance devices and account security."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Users" value={roleTotal} icon={UserCog} tone="blue" />
        <StatCard label="Online Devices" value={onlineDevices} icon={Smartphone} tone="green" />
        <StatCard label="Security" value="Active" icon={Shield} tone="purple" />
      </div>

      {status && (
        <div className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-semibold shadow-sm ${status.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800'}`}>
          {status.type === 'success' ? <CheckCircle2 size={18} className="shrink-0 text-emerald-600" /> : <AlertTriangle size={18} className="shrink-0 text-red-500" />}
          <span>{status.message}</span>
          <button className="ml-auto opacity-60 hover:opacity-100" onClick={() => setStatus(null)}><X size={16} /></button>
        </div>
      )}

      {deleteConfirm && (
        <div className="flex items-center justify-between gap-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm shadow-sm">
          <div className="flex items-center gap-2 font-semibold text-amber-800">
            <AlertTriangle size={18} className="text-amber-600" />
            Remove this device? It will no longer record attendance.
          </div>
          <div className="flex gap-2">
            <button className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            <button className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700" onClick={() => deleteDevice(deleteConfirm)}>Yes, Remove</button>
          </div>
        </div>
      )}

      {userDeleteConfirm && (
        <div className="flex items-center justify-between gap-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm shadow-sm">
          <div className="flex items-center gap-2 font-semibold text-amber-800">
            <AlertTriangle size={18} className="text-amber-600" />
            Remove this SCPRAS user account and its access?
          </div>
          <div className="flex gap-2">
            <button className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700" onClick={() => setUserDeleteConfirm(null)} type="button">Cancel</button>
            <button className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white" onClick={() => deleteUser(userDeleteConfirm)} type="button">Remove User</button>
          </div>
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[0.75fr_1.25fr]">
        <div className="panel-pad">
          <div className="mb-4 flex items-center gap-2">
            <UserCog className="text-blue-700" size={20} />
            <div>
              <h3 className="font-extrabold text-ink">Create Authorized User</h3>
              <p className="text-xs text-slate-500">Assign only one approved role to each account.</p>
            </div>
          </div>
          <form className="space-y-3" onSubmit={createUser}>
            <Field label="Full Name"><TextInput required value={userForm.fullName} onChange={(e) => updateUserForm('fullName', e.target.value)} /></Field>
            <Field label="Email"><TextInput required type="email" placeholder="user@scpras.rw" value={userForm.email} onChange={(e) => updateUserForm('email', e.target.value)} /></Field>
            <Field label="Temporary Password"><TextInput required minLength="8" type="password" value={userForm.password} onChange={(e) => updateUserForm('password', e.target.value)} /></Field>
            <Field label="Assigned Role">
              <SelectInput value={userForm.role} onChange={(e) => updateUserForm('role', e.target.value)}>
                {ROLE_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </SelectInput>
            </Field>
            <Field label="Phone"><TextInput value={userForm.phone} onChange={(e) => updateUserForm('phone', e.target.value)} /></Field>
            <button className="primary-button w-full justify-center" disabled={isSaving} type="submit">
              <Plus size={18} /> {isSaving ? 'Saving...' : 'Create User'}
            </button>
          </form>
        </div>

        <div className="panel overflow-hidden">
          <div className="border-b border-slate-100 px-4 py-4">
            <p className="muted-label">Role-based Access Registry</p>
            <h3 className="font-extrabold text-ink">{settings.users.length} authorized users</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead className="table-head"><tr><th className="px-4 py-3 text-left">User</th><th className="px-4 py-3 text-left">Role</th><th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-center">Access</th></tr></thead>
              <tbody>
                {settings.users.map((user) => (
                  <tr key={user.id}>
                    <td className="table-cell"><p className="font-semibold text-ink">{user.fullName}</p><p className="text-xs text-slate-500">{user.email}</p></td>
                    <td className="table-cell text-sm font-semibold text-slate-700">{ROLE_OPTIONS.find(([value]) => value === user.role)?.[1] || user.role}</td>
                    <td className="table-cell"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${user.status === 'inactive' ? 'bg-slate-100 text-slate-600' : 'bg-emerald-50 text-emerald-700'}`}>{user.status || 'active'}</span></td>
                    <td className="table-cell"><div className="flex justify-center gap-2"><button className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700" onClick={() => toggleUser(user)} type="button">{user.status === 'inactive' ? 'Activate' : 'Deactivate'}</button><button className="icon-button h-8 w-8 text-red-500" onClick={() => setUserDeleteConfirm(user.id)} type="button" aria-label={`Remove ${user.fullName}`}><Trash2 size={14} /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-5">
          {/* Add Device Form */}
          <div className="panel-pad">
            <div className="mb-4 flex items-center gap-2">
              <Monitor className="text-blue-700" size={20} />
              <h3 className="font-extrabold text-ink">Register Attendance Device</h3>
            </div>
            <form id="device-form" className="space-y-3" onSubmit={createDevice}>
              <Field label="Device Name">
                <TextInput required placeholder="e.g. Main Gate Scanner" value={deviceForm.name} onChange={(e) => updateDeviceForm('name', e.target.value)} />
              </Field>
              <Field label="Device Type">
                <SelectInput value={deviceForm.type} onChange={(e) => updateDeviceForm('type', e.target.value)}>
                  <option value="qr">QR Scanner</option>
                  <option value="rfid">RFID Reader</option>
                  <option value="nfc">NFC Device</option>
                  <option value="mobile">Mobile App</option>
                </SelectInput>
              </Field>
              <Field label="Installation Location">
                <TextInput placeholder="e.g. Site entrance, Block A" value={deviceForm.location} onChange={(e) => updateDeviceForm('location', e.target.value)} />
              </Field>
              <Field label="Initial Status">
                <SelectInput value={deviceForm.status} onChange={(e) => updateDeviceForm('status', e.target.value)}>
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="maintenance">Maintenance</option>
                </SelectInput>
              </Field>
            </form>
          </div>

          {/* Role Distribution */}
          <div className="panel-pad">
            <div className="mb-4 flex items-center gap-2">
              <UserCog className="text-blue-700" size={20} />
              <h3 className="font-extrabold text-ink">Role Distribution</h3>
            </div>
            {Object.keys(settings.roles || {}).length === 0 ? (
              <p className="text-sm text-slate-400">No role data available.</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(settings.roles || {}).map(([role, count]) => {
                  const pct = Math.round((Number(count) / maxRoleCount) * 100);
                  return (
                    <div key={role}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="font-semibold capitalize text-slate-700">{role.replace(/_/g, ' ')}</span>
                        <span className="font-extrabold text-ink">{count}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-2 rounded-full bg-blue-600 transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
                <p className="pt-1 text-xs text-slate-400">{roleTotal} total user accounts</p>
              </div>
            )}
          </div>

          {/* Security */}
          <div className="panel-pad space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="text-blue-700" size={20} />
              <h3 className="font-extrabold text-ink">Security Configuration</h3>
            </div>
            {[
              { icon: Lock, label: 'Authentication', value: settings.security.auth || 'JWT token-based auth enabled', ok: true },
              { icon: Shield, label: 'Password Hashing', value: settings.security.passwordHashing || 'bcrypt with salt rounds enabled', ok: true },
              { icon: Wrench, label: 'Demo Fallback', value: settings.security.demoMode ? 'Demo mode is ON — data is not persisted' : 'Production mode — database connected', ok: !settings.security.demoMode },
            ].map(({ icon: Icon, label, value, ok }) => (
              <div key={label} className={`flex items-start gap-3 rounded-lg border p-3 ${ok ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
                <Icon size={16} className={`mt-0.5 shrink-0 ${ok ? 'text-emerald-600' : 'text-amber-600'}`} />
                <div>
                  <p className="text-xs font-bold text-slate-500">{label}</p>
                  <p className={`text-sm font-semibold ${ok ? 'text-emerald-800' : 'text-amber-800'}`}>{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Devices table */}
        <div className="panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
            <div>
              <p className="muted-label">Device Registry</p>
              <h3 className="font-extrabold text-ink">{settings.devices.length} devices registered</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {onlineDevices} online
              </span>
            </div>
          </div>

          {settings.devices.length === 0 ? (
            <div className="p-8 text-center">
              <Monitor size={40} className="mx-auto text-slate-300" />
              <p className="mt-3 font-semibold text-slate-500">No devices registered yet.</p>
              <p className="mt-1 text-sm text-slate-400">Add a QR scanner, RFID reader or NFC device to start tracking attendance.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px]">
                <thead className="table-head">
                  <tr>
                    <th className="px-4 py-3 text-left">Device</th>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-left">Location</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {settings.devices.map((device) => {
                    const DevIcon = DEVICE_ICONS[device.type] || Monitor;
                    const devColor = DEVICE_COLORS[device.type] || 'text-slate-700 bg-slate-100';
                    const st = STATUS_BADGE[device.status] || STATUS_BADGE.offline;
                    const isOnline = device.status === 'online';

                    return (
                      <tr key={device.id}>
                        <td className="table-cell">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${devColor}`}>
                              <DevIcon size={16} />
                            </div>
                            <span className="font-semibold text-ink">{device.name}</span>
                          </div>
                        </td>
                        <td className="table-cell">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${devColor}`}>
                            {DEVICE_LABELS[device.type] || device.type.toUpperCase()}
                          </span>
                        </td>
                        <td className="table-cell text-slate-600">{device.location || '—'}</td>
                        <td className="table-cell">
                          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${st.badge}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                            {st.label}
                          </span>
                        </td>
                        <td className="table-cell text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition ${isOnline ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100' : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                              onClick={() => toggleDevice(device)}
                              type="button"
                            >
                              {isOnline ? <><WifiOff size={13} /> Set Offline</> : <><Wifi size={13} /> Set Online</>}
                            </button>
                            <button
                              className="icon-button h-8 w-8 text-red-500 hover:border-red-200 hover:bg-red-50"
                              onClick={() => setDeleteConfirm(device.id)}
                              type="button"
                              aria-label="Remove device"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
