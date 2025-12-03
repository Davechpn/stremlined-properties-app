// Role-based access control constants

export enum Role {
  OWNER = 'owner',
  ADMIN = 'admin',
  MANAGER = 'manager',
  AGENT = 'agent',
  VIEWER = 'viewer',
}

export interface Permission {
  manageMembers: boolean;
  manageOrganization: boolean;
  manageProperties: boolean;
  inviteMembers: boolean;
  removeMembers: boolean;
  changeRoles: boolean;
  viewMembers: boolean;
  viewProperties: boolean;
  updateProperties: boolean;
  deleteProperties: boolean;
}

export const ROLE_PERMISSIONS: Record<Role, Permission> = {
  [Role.OWNER]: {
    manageMembers: true,
    manageOrganization: true,
    manageProperties: true,
    inviteMembers: true,
    removeMembers: true,
    changeRoles: true,
    viewMembers: true,
    viewProperties: true,
    updateProperties: true,
    deleteProperties: true,
  },
  [Role.ADMIN]: {
    manageMembers: true,
    manageOrganization: true,
    manageProperties: true,
    inviteMembers: true,
    removeMembers: true,
    changeRoles: true,
    viewMembers: true,
    viewProperties: true,
    updateProperties: true,
    deleteProperties: true,
  },
  [Role.MANAGER]: {
    manageMembers: false,
    manageOrganization: false,
    manageProperties: true,
    inviteMembers: false,
    removeMembers: false,
    changeRoles: false,
    viewMembers: true,
    viewProperties: true,
    updateProperties: true,
    deleteProperties: true,
  },
  [Role.AGENT]: {
    manageMembers: false,
    manageOrganization: false,
    manageProperties: false,
    inviteMembers: false,
    removeMembers: false,
    changeRoles: false,
    viewMembers: true,
    viewProperties: true,
    updateProperties: true,
    deleteProperties: false,
  },
  [Role.VIEWER]: {
    manageMembers: false,
    manageOrganization: false,
    manageProperties: false,
    inviteMembers: false,
    removeMembers: false,
    changeRoles: false,
    viewMembers: true,
    viewProperties: true,
    updateProperties: false,
    deleteProperties: false,
  },
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  [Role.OWNER]: 'Full control of the organization including member management and settings',
  [Role.ADMIN]: 'Manage members, organization settings, and all properties',
  [Role.MANAGER]: 'Manage all properties but cannot change organization settings or members',
  [Role.AGENT]: 'View and update assigned properties',
  [Role.VIEWER]: 'Read-only access to organization data',
};

export const ROLE_COLORS: Record<Role, string> = {
  [Role.OWNER]: '#DC143C',
  [Role.ADMIN]: '#0066CC',
  [Role.MANAGER]: '#00A86B',
  [Role.AGENT]: '#FF6B35',
  [Role.VIEWER]: '#6C757D',
};
