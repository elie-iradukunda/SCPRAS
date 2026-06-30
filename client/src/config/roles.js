export const ROLES = Object.freeze({
  ADMIN: 'admin',
  PROJECT_MANAGER: 'project_manager',
  SITE_ENGINEER: 'site_engineer',
  QUANTITY_SURVEYOR: 'quantity_surveyor',
  STORE_OFFICER: 'store_officer',
  CONTRACTOR_FOREMAN: 'contractor_foreman',
});

export const ALL_ROLES = Object.freeze(Object.values(ROLES));

export const ROLE_LABELS = Object.freeze({
  [ROLES.ADMIN]: 'Administrator',
  [ROLES.PROJECT_MANAGER]: 'Project Manager',
  [ROLES.SITE_ENGINEER]: 'Site Engineer',
  [ROLES.QUANTITY_SURVEYOR]: 'Quantity Surveyor / Cost Estimator',
  [ROLES.STORE_OFFICER]: 'Logistics / Store Officer',
  [ROLES.CONTRACTOR_FOREMAN]: 'Contractor / Foreman',
});

export const PAGE_ACCESS = Object.freeze({
  '/dashboard': ALL_ROLES,
  '/projects': [ROLES.PROJECT_MANAGER, ROLES.SITE_ENGINEER, ROLES.QUANTITY_SURVEYOR, ROLES.CONTRACTOR_FOREMAN],
  '/site-updates': [ROLES.PROJECT_MANAGER, ROLES.SITE_ENGINEER, ROLES.CONTRACTOR_FOREMAN],
  '/workers': [ROLES.PROJECT_MANAGER],
  '/attendance': [ROLES.PROJECT_MANAGER, ROLES.SITE_ENGINEER, ROLES.CONTRACTOR_FOREMAN],
  '/materials': [ROLES.PROJECT_MANAGER, ROLES.SITE_ENGINEER, ROLES.QUANTITY_SURVEYOR, ROLES.STORE_OFFICER],
  '/workforce': [ROLES.PROJECT_MANAGER, ROLES.CONTRACTOR_FOREMAN],
  '/ai-insights': [ROLES.PROJECT_MANAGER, ROLES.SITE_ENGINEER, ROLES.QUANTITY_SURVEYOR],
  '/reports': ALL_ROLES,
  '/settings': [ROLES.ADMIN],
});

export function canAccess(role, path) {
  return Boolean(role && PAGE_ACCESS[path]?.includes(role));
}
