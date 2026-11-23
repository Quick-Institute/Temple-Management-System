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

    /** Where the emailed confirmation link lands: /auth/verify-email?token=... */
    verifyEmail: '/auth/verify-email',
    /** One URL per result screen, so each can be opened and reviewed on its own. */
    verifyEmailSuccess: '/auth/verify-email/success',
    verifyEmailExpired: '/auth/verify-email/expired',
    verifyEmailInvalid: '/auth/verify-email/invalid',

    /** After a Google / Facebook sign-up: the details a provider cannot give us. */
    completeProfile: '/auth/complete-profile',

    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    terms: '/terms',
    privacy: '/privacy',
    google: '/auth/google',
    facebook: '/auth/facebook',
    dashboard: '/dashboard',
} as const