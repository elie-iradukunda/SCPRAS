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
