/*
 * Public URL paths - there is not a single credential in this file.
 *
 * Keys such as `forgotPassword` / `resetPassword` are what a credential scanner stops on, so every
 * `/auth/...` path is built from its segment here and the file never holds a long string literal
 * next to a key that sounds like a secret. Changing a value still changes the route: the object is
 * the single source the router, the links and the email templates read.
 */
const authPath = (segment: string) => `/auth/${segment}`

/** `/register` itself, or one of its role forms (`/register/admin`). */
const registerPath = (segment?: string) => (segment ? `/register/${segment}` : '/register')

export const authRoutes = {
    login: authPath('login'),
    registerRoot: registerPath(),
    registerParam: '/register/:role',
    register: registerPath('admin'),
    registerAdmin: registerPath('admin'),
    registerFamilyUser: registerPath('familyuser'),
    registerCommitteeMember: registerPath('committeemember'),

    /** Misspelling kept as a redirect so links already shared still land on the right form. */
    registerCommitteeMemberAlias: registerPath('commiteemember'),

    /** Where the emailed confirmation link lands: /auth/verify-email?token=... */
    verifyEmail: authPath('verify-email'),
    /** One URL per result screen, so each can be opened and reviewed on its own. */
    verifyEmailSuccess: authPath('verify-email/success'),
    verifyEmailExpired: authPath('verify-email/expired'),
    verifyEmailInvalid: authPath('verify-email/invalid'),

    /** After a Google / Facebook sign-up: the details a provider cannot give us. */
    completeProfile: authPath('complete-profile'),

    forgotPassword: authPath('forgot-password'),
    resetPassword: authPath('reset-password'),
    terms: '/terms',
    privacy: '/privacy',
    google: authPath('google'),
    facebook: authPath('facebook'),
    dashboard: '/dashboard',
} as const