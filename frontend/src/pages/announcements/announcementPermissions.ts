
export type AnnouncementRole =
  | 'Super Admin'
  | 'Temple Admin'
  | 'Co-Administrator'
  | 'Family User'

export type AnnouncementPermissions = {
  canViewAllTemples: boolean
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
  canReview: boolean
  canPublish: boolean
  canViewRestricted: boolean
}

export const rolePermissions: Record<AnnouncementRole, AnnouncementPermissions> = {
  'Super Admin': {
    canViewAllTemples: true,
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canReview: false,
    canPublish: false,
    canViewRestricted: false,
  },

  'Temple Admin': {
    canViewAllTemples: false,
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canReview: true,
    canPublish: true,
    canViewRestricted: true,
  },

  'Co-Administrator': {
    canViewAllTemples: false,
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canReview: true,
    canPublish: true,
    canViewRestricted: true,
  },

  'Family User': {
    canViewAllTemples: false,
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canReview: false,
    canPublish: false,
    canViewRestricted: true,
  },
}

export const announcementRoles: AnnouncementRole[] = [
  'Super Admin',
  'Temple Admin',
  'Co-Administrator',
  'Family User',
]
