export const authRoutes = {
    login: '/auth/login',
    registerRoot: '/register',
    registerParam: '/register/:role',
    register: '/register/admin',
    registerAdmin: '/register/admin',
    registerFamilyUser: '/register/familyuser',
    registerCommitteeMember: '/register/committeemember',

    /** Misspelling kept as a redirect so links already shared still land on the right form. */
    registerCommitteeMemberAlias: '/register/commiteemember',

    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    terms: '/terms',
    privacy: '/privacy',
    google: '/auth/google',
    facebook: '/auth/facebook',
    dashboard: '/dashboard',
} as const