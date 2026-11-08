import type {FormEvent, ReactNode} from 'react'
import {useState} from 'react'
import {Link, Navigate, useNavigate, useParams} from 'react-router-dom'
import {LotusMark, TempleMark} from '../../components/AuthIcons'
import {passwordLengthError, withLimits} from '../../components/PasswordRules'
import {TempleCombobox} from '../../components/TempleCombobox'
import {
    detectLanguage,
    districtOptions,
    findTempleByCode,
    findTempleByNameAndDistrict,
    type Temple,
    type TempleLanguage,
} from '../../data/temples'
import {PasswordStrength} from '../../components/PasswordStrength'
import {SelectField} from '../../components/SelectField'
import {AUTH_HEADING, AUTH_SUBTITLE, AuthShell} from '../../layouts/AuthShell'
import {LanguageToggle} from '../../components/LanguageToggle'
import {useTranslation} from 'react-i18next'
import {authRoutes} from '../../routes/authRoutes'

/* ------------------------------------------------------------------ */
/* Icons - hand-drawn to match the line icons used on the login screen */
/* ------------------------------------------------------------------ */

type IconName =
    | 'briefcase' | 'chevron' | 'eye' | 'eyeOff' | 'hash' | 'home' | 'key' | 'mail'
    | 'check' | 'map' | 'pin' | 'mailbox' | 'person' | 'phone' | 'search' | 'temple' | 'user' | 'userPlus' | 'users'

const Icon = ({name, size = 18}: { name: IconName; size?: number }) => {
    /* The Temple Admin tab and the Temple Code field use the supplied temple mark. */
    if (name === 'temple') return <TempleMark size={size}/>

    const paths: Record<IconName, ReactNode> = {
        person: <>
            <circle cx="12" cy="8" r="3.4"/>
            <path d="M5 20.2v-1.1c0-3.2 3.1-5.2 7-5.2s7 2 7 5.2v1.1"/>
        </>,
        user: <>
            <circle cx="12" cy="12" r="9"/>
            <circle cx="12" cy="10" r="3"/>
            <path d="M6.4 19.2a6.1 6.1 0 0 1 11.2 0"/>
        </>,
        users: <>
            <circle cx="9.5" cy="8.5" r="3.2"/>
            <path d="M3 20v-1.1c0-3 2.9-4.9 6.5-4.9s6.5 1.9 6.5 4.9V20"/>
            <path d="M17 5.6a3.2 3.2 0 0 1 0 5.8M18.3 20v-1.1a5 5 0 0 0-1.5-3.5"/>
        </>,
        temple: <>
            <path d="M3 10.5 12 3.5l9 7"/>
            <path d="M5.5 9.8V20.5h13V9.8"/>
            <path d="M9.5 20.5v-5.7h5v5.7"/>
        </>,
        search: <>
            <circle cx="11" cy="11" r="6.4"/>
            <path d="M15.9 15.9 20.4 20.4"/>
        </>,
        mail: <>
            <rect x="2.8" y="5" width="18.4" height="14" rx="2"/>
            <path d="m3.5 6.5 8.5 6 8.5-6"/>
        </>,
        phone: <>
            <path
                d="M6.5 3.8h3l1.5 3.8-2 1.4a11 11 0 0 0 5.6 5.6l1.4-2 3.8 1.5v3a2 2 0 0 1-2.2 2A16.6 16.6 0 0 1 4.5 6a2 2 0 0 1 2-2.2Z"/>
        </>,
        briefcase: <>
            <rect x="3" y="7.5" width="18" height="12" rx="2"/>
            <path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5M3 12.5h18"/>
        </>,
        key: <>
            <circle cx="8.5" cy="15.5" r="3.5"/>
            <path d="m11 13 8-8M16 5h3v3M14 7l3 3"/>
        </>,
        eye: <>
            <path d="M2.5 12s3.5-5 9.5-5 9.5 5 9.5 5-3.5 5-9.5 5-9.5-5-9.5-5Z"/>
            <circle cx="12" cy="12" r="2.4"/>
        </>,
        eyeOff: <>
            <path
                d="m3 3 18 18M10.6 7.2A9.8 9.8 0 0 1 12 7c6 0 9.5 5 9.5 5a17.5 17.5 0 0 1-3.1 3.3M6.2 6.2A17.8 17.8 0 0 0 2.5 12s3.5 5 9.5 5c.9 0 1.8-.1 2.5-.4"/>
            <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>
        </>,
        hash: <>
            <path d="M9 3.5 7.5 20.5M16.5 3.5 15 20.5M3.5 9h17M3 15h17"/>
        </>,
        home: <>
            <path d="M3.5 10.5 12 3.5l8.5 7"/>
            <path d="M5.5 9.8V20.5h13V9.8"/>
        </>,
        pin: <>
            <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z"/>
            <circle cx="12" cy="10" r="2.6"/>
        </>,
        map: <>
            <path d="m3 6.5 6-2.5 6 2.5 6-2.5v13.5l-6 2.5-6-2.5-6 2.5V6.5Z"/>
            <path d="M9 4v14M15 6.5v14"/>
        </>,
        mailbox: <>
            <rect x="3" y="8" width="18" height="11" rx="2"/>
            <path d="M3 12.5h18M7 8V5.5h10V8"/>
        </>,
        chevron: <path d="m6 9.5 6 6 6-6"/>,
        check: <path d="m5 12.5 4.5 4.5L19 7.5"/>,
        userPlus: <>
            <circle cx="9" cy="8" r="3"/>
            <path d="M3.5 20v-1.5C3.5 15.9 5.9 14 9 14s5.5 1.9 5.5 4.5V20M18 8v7M14.5 11.5h7"/>
        </>,
    }

    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.55}
             strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="flex-none">
            {paths[name]}
        </svg>
    )
}


/* The Google mark keeps its four brand colours, the same artwork the login screen uses. */
const GoogleIcon = () => (
    <svg className="h-7 w-7 flex-none" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4"
              d="M21.35 12.24c0-.71-.06-1.39-.18-2.04H12v3.86h5.24a4.48 4.48 0 0 1-1.94 2.94v2.5h3.14c1.84-1.7 2.91-4.2 2.91-7.26Z"/>
        <path fill="#34A853"
              d="M12 21.75c2.63 0 4.84-.87 6.45-2.36L15.3 16.9c-.87.59-1.98.94-3.3.94-2.54 0-4.69-1.72-5.46-4.03H3.3v2.58A9.75 9.75 0 0 0 12 21.75Z"/>
        <path fill="#FBBC05"
              d="M6.54 13.81A5.86 5.86 0 0 1 6.24 12c0-.63.11-1.24.3-1.81V7.61H3.3A9.75 9.75 0 0 0 2.25 12c0 1.58.38 3.08 1.05 4.39l3.24-2.58Z"/>
        <path fill="#EA4335"
              d="M12 6.16c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.27 14.63 2.25 12 2.25a9.75 9.75 0 0 0-8.7 5.36l3.24 2.58C7.31 7.88 9.46 6.16 12 6.16Z"/>
    </svg>
)

const FacebookIcon = () => (
    <svg className="h-7 w-7 flex-none" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="10" fill="#1877F2"/>
        <path fill="#fff"
              d="M13.28 19v-6.1h2.05l.31-2.37h-2.36V9.02c0-.69.19-1.16 1.18-1.16h1.26V5.74a16.91 16.91 0 0 0-1.84-.1c-1.82 0-3.07 1.11-3.07 3.15v1.74H8.75v2.37h2.06V19h2.47Z"/>
    </svg>
)

/* ------------------------------------------------------------------ */
/* Roles + options                                                     */
/* ------------------------------------------------------------------ */

type Role = 'temple-admin' | 'committee-member' | 'family-user'

const ROLES: { key: Role; labelKey: string; icon: IconName; blurbKey: string }[] = [
    {
        key: 'temple-admin',
        labelKey: 'auth.roleTempleAdmin',
        icon: 'temple',
        blurbKey: 'auth.roleTempleAdminBlurb'
    },
    {
        key: 'committee-member',
        labelKey: 'auth.roleCommittee',
        icon: 'users',
        blurbKey: 'auth.roleCommitteeBlurb'
    },
    {
        key: 'family-user',
        labelKey: 'auth.roleFamily',
        icon: 'user',
        blurbKey: 'auth.roleFamilyBlurb'
    },
]

/**
 * Each account type has its own URL, so a tab is a page: /register/admin,
 * /register/familyuser and /register/committeemember. The param is the single source of truth -
 * the form below reads it instead of keeping a local `role` state, which means a shared link
 * always opens the right form and the browser back button walks through the tabs.
 */
const ROLE_SLUG: Record<Role, string> = {
    'temple-admin': 'admin',
    'committee-member': 'committeemember',
    'family-user': 'familyuser',
}

const ROUTE_FOR_SLUG: Record<string, string> = Object.fromEntries(
    Object.values(ROLE_SLUG).map((slug) => [slug, `/register/${slug}`]),
)

/** The inverse of ROLE_SLUG - which account type a slug belongs to, if any. */
const roleFromSlug = (slug?: string): Role | null =>
    (Object.keys(ROLE_SLUG) as Role[]).find((key) => ROLE_SLUG[key] === slug) ?? null

const ADMIN_DESIGNATIONS = ['Chief Incumbent Monk', 'Authorized Religious Representative', 'Designated Technical Administrator']

const COMMITTEES = ['Dayaka Sabhawa', 'Event or Programme Committee', 'Other']

const COMMITTEE_DESIGNATIONS = [
    'President', 'Vice-President', 'Secretary', 'Assistant Secretary', 'Treasurer', 'Committee Member', 'Other',
]

/* Districts now come from the temple registry so they can be shown in Sinhala or English. */
const districtsIn = (language: TempleLanguage) => districtOptions(language)

/* Sri Lanka uses both: the old nine digits plus V or X, and the newer twelve digits. */
const NIC_PATTERN = /^(?:\d{9}[vVxX]|\d{12})$/

/* ------------------------------------------------------------------ */
/* Field primitives                                                    */
/* ------------------------------------------------------------------ */

const labelClass = 'mb-2 block text-[1.02rem] leading-none text-[#0f2b3d]'
const boxClass =
    'flex h-12 items-center gap-3 rounded-[8px] border border-[#6f9db8] bg-white px-3 text-[#0f2b3d] transition placeholder:text-[#8299a8] ' +
    'focus-within:shadow-[0_0_0_3px_rgba(2,132,199,.16)] lg:h-[42px]'
const inputClass =
    'w-px min-w-0 flex-1 self-stretch border-0 bg-transparent p-0 text-[1rem] text-[#0f2b3d] outline-none placeholder:text-[#8ba3b0] lg:text-[0.86rem]'

type TextFieldProps = {
    id: string
    label: string
    icon: IconName
    placeholder: string
    type?: 'text' | 'email' | 'tel' | 'password'
    autoComplete?: string
    value: string
    onChange: (value: string) => void
    onBlur?: () => void
    error?: string
    full?: boolean
}

const FieldError = ({id, message}: { id: string; message?: string }) =>
    message ? <span id={`${id}-error`} role="alert"
                    className="mt-1.5 block text-[0.72rem] leading-snug text-status-rose">{message}</span> : null

const TextField = ({
                       id,
                       label,
                       icon,
                       placeholder,
                       type = 'text',
                       autoComplete,
                       value,
                       onChange,
                       onBlur,
                       error,
                       full
                   }: TextFieldProps) => (
    <div className={full ? 'sm:col-span-2' : undefined}>
        <label className={labelClass} htmlFor={id}>{label}</label>
        <div className={`${boxClass} ${error ? 'border-status-rose shadow-[0_0_0_3px_rgba(173,28,3,.12)]' : ''}`}>
            <Icon name={icon} size={17}/>
            <input
                id={id}
                name={id}
                type={type}
                className={inputClass}
                placeholder={placeholder}
                autoComplete={autoComplete}
                value={value}
                aria-invalid={Boolean(error) || undefined}
                aria-describedby={error ? `${id}-error` : undefined}
                onBlur={onBlur}
                onChange={(event) => onChange(event.target.value)}
            />
        </div>
        <FieldError id={id} message={error}/>
    </div>
)

const PasswordField = ({id, label, placeholder, value, onChange, onBlur, autoComplete, error, newRow}: {
    id: string
    label: string
    placeholder: string
    value: string
    onChange: (value: string) => void
    onBlur?: () => void
    autoComplete: string
    error?: string
    newRow?: boolean
}) => {
    const [visible, setVisible] = useState(false)
    return (
        <div className={newRow ? 'sm:col-start-1' : undefined}>
            <label className={labelClass} htmlFor={id}>{label}</label>
            <div className={`${boxClass} ${error ? 'border-status-rose shadow-[0_0_0_3px_rgba(173,28,3,.12)]' : ''}`}>
                <Icon name="key" size={17}/>
                <input
                    id={id}
                    name={id}
                    type={visible ? 'text' : 'password'}
                    className={inputClass}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    value={value}
                    aria-invalid={Boolean(error) || undefined}
                    aria-describedby={error ? `${id}-error` : undefined}
                    onBlur={onBlur}
                    onChange={(event) => onChange(event.target.value)}
                />
                <button
                    type="button"
                    onClick={() => setVisible((current) => !current)}
                    className="grid h-11 w-11 shrink-0 place-items-center rounded text-[#33566c] hover:text-sage-700 lg:h-9 lg:w-9"
                    aria-label={visible ? 'Hide password' : 'Show password'}
                    aria-pressed={visible}>
                    <Icon name={visible ? 'eye' : 'eyeOff'} size={17}/>
                </button>
            </div>
            <FieldError id={id} message={error}/>
        </div>
    )
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

type Form = {
    templeName: string
    templeCode: string
    firstName: string
    lastName: string
    email: string
    phone: string
    designation: string
    committee: string
    committeeOther: string
    designationOther: string
    address: string
    village: string
    district: string
    postalCode: string
    /** Family users only - the NIC is the primary key for a family record. */
    nic: string
    password: string
    confirmPassword: string
}

const EMPTY: Form = {
    templeName: '', templeCode: '', firstName: '', lastName: '', email: '', phone: '', designation: '',
    committee: '', committeeOther: '', designationOther: '', address: '', village: '', district: '',
    postalCode: '', nic: '', password: '', confirmPassword: '',
}

export const RegisterPage = () => {
    const {t} = useTranslation()
    const navigate = useNavigate()
    const {role: roleSlug} = useParams<{ role: string }>()
    /* An unknown or missing slug is sent to the admin form rather than rendering a blank tab. */
    const role = roleFromSlug(roleSlug)
    const [form, setForm] = useState<Form>(EMPTY)
    const [agreed, setAgreed] = useState(false)
    const [touchedPassword, setTouchedPassword] = useState(false)
    /* Which script the temple fields are in. Follows whatever the user typed, so a temple is never
       half Sinhala and half English. */
    const [language, setLanguage] = useState<TempleLanguage>('en')

    /*
     * Fill the temple fields from a registry entry. The village only belongs to the temple for a
     * committee member - for a family user it is their home village, so it is left alone.
     */
    const fillTemple = (temple: Temple) => {
        const withVillage = role === 'committee-member'
        setForm((current) => ({
            ...current,
            templeName: temple.name[language],
            templeCode: temple.code,
            district: temple.district[language],
            village: withVillage ? temple.village[language] : current.village,
        }))
        setErrors((current) => ({
            ...current,
            templeName: undefined,
            templeCode: undefined,
            district: undefined,
            ...(withVillage ? {village: undefined} : {}),
        }))
    }

    /* Typing a full code fills the rest straight away. */
    const onTempleCodeChange = (value: string) => {
        setForm((current) => ({...current, templeCode: value}))
        setErrors((current) => ({...current, templeCode: undefined}))
        const temple = findTempleByCode(value)
        if (temple) fillTemple(temple)
    }

    /* Leaving the name field resolves whatever was typed, narrowed by the district. */
    const onTempleNameCommit = (value: string) => {
        const temple = findTempleByNameAndDistrict(value, form.district)
        if (temple) fillTemple(temple)
    }

    /* Name plus district is enough to pin down a temple, so choosing a district fills the code too -
       which matters when two temples share a name. */
    const onDistrictChange = (value: string) => {
        set('district')(value)
        const temple = findTempleByNameAndDistrict(form.templeName, value)
        if (temple) fillTemple(temple)
    }
    const [errors, setErrors] = useState<Partial<Record<keyof Form | 'terms', string>>>({})
    const [submitting, setSubmitting] = useState(false)

    const set = (key: keyof Form) => (value: string) => {
        setForm((current) => ({...current, [key]: value}))
        setErrors((current) => ({...current, [key]: undefined}))
    }

    /* Same route, new param, so the form keeps everything the user has typed; only the errors
       raised by the previous tab are cleared. The Link below does the navigating. */
    const switchRole = () => setErrors({})

    const validate = () => {
        const next: Partial<Record<keyof Form | 'terms', string>> = {}
        const required = (key: keyof Form, message: string) => {
            if (!form[key].trim()) next[key] = message
        }

        if (role !== 'temple-admin') {
            required('templeName', 'Enter the name of your temple.')
            required('templeCode', 'Enter the temple code given by the temple office.')
        }

        required('firstName', t('auth.errFirstNameRequired'))
        required('lastName', t('auth.errLastNameRequired'))
        if (!form.email.trim()) next.email = t('auth.errEmailRequiredShort')
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = t('auth.errEmailInvalidShort')
        required('phone', t('auth.errPhoneRequired'))

        if (role === 'temple-admin') {
            required('designation', t('auth.errDesignationRequired'))
            if (form.designation === 'Other') required('designationOther', 'Enter your designation.')
        }

        if (role === 'committee-member') {
            required('village', 'Enter your village.')
            required('district', 'Select your district.')
            required('committee', 'Select your committee.')
            if (form.committee === 'Other') required('committeeOther', 'Enter the committee name.')
            required('designation', t('auth.errDesignationRequired'))
            if (form.designation === 'Other') required('designationOther', 'Enter your designation.')
        }

        if (role === 'family-user') {
            required('address', 'Enter your address.')
            required('village', 'Enter your village.')
            required('district', 'Select your district.')
            if (!form.postalCode.trim()) next.postalCode = t('auth.errPostalRequired')
            else if (!/^\d{5}$/.test(form.postalCode.trim())) next.postalCode = t('auth.errPostalFive')

            if (!form.nic.trim()) next.nic = t('auth.errNicRequired')
            else if (!NIC_PATTERN.test(form.nic.trim()))
                next.nic = t('auth.errNicInvalid')
        }

        /*
         * Only assign when there is something wrong. Writing `next.password = undefined` would
         * still create the key, and validate() decides from Object.keys(next).length - so the
         * form would never submit at all.
         */
        if (!form.password) next.password = t('auth.errCreatePasswordShort')
        else {
            const lengthError = passwordLengthError(form.password)
            if (lengthError) next.password = withLimits(t(lengthError))
        }
        if (!form.confirmPassword) next.confirmPassword = t('auth.errConfirmPassword')
        else if (form.password !== form.confirmPassword) next.confirmPassword = t('auth.errPasswordsDiffer')

        if (!agreed) next.terms = t('auth.errAcceptTerms')

        setErrors(next)
        return Object.keys(next).length === 0
    }

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (!validate()) return

        /*
         * Demo build: no account is created yet, so the details are not sent anywhere. Once the
         * screen is valid it lands on the dashboard, the same place a sign-in goes - nobody should
         * be sent back to the login form they have just filled in a registration for.
         * When the API exists this becomes: call it, and only navigate on success.
         */
        setSubmitting(true)
        window.setTimeout(() => {
            setSubmitting(false)
            navigate(authRoutes.dashboard)
        }, 700)
    }

    if (!role) return <Navigate to={authRoutes.registerAdmin} replace/>

    return (
        <AuthShell variant="signup">
            <div
                className="relative mx-auto mt-0 w-full max-w-236 rounded-[22px] border border-white/30 bg-[linear-gradient(180deg,#f2fafe_0%,#e8f6fe_100%)] px-5 pb-7 pt-7 shadow-[0_22px_42px_rgba(8,47,73,.15)] sm:rounded-[26px] sm:px-8 sm:pb-8 sm:pt-9 lg:my-auto lg:px-11 lg:pb-9">

                <LanguageToggle tone="card" label={false} className="absolute top-3 right-3 z-10"/>

                <header className="text-center">
                    <LotusMark width={168} className="mx-auto mb-1"/>
                    <h1 className={AUTH_HEADING}>{t('auth.registerTitle')}</h1>
                    <p className={AUTH_SUBTITLE}>{t('auth.registerSubtitle')}</p>
                </header>

                {/* Role selector */}
                <div role="tablist" aria-label={t('auth.accountType')}
                     className="mt-7 grid gap-2.5 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                    {ROLES.map(({key, labelKey, icon}) => (
                        <Link
                            key={key}
                            to={ROUTE_FOR_SLUG[ROLE_SLUG[key]]}
                            role="tab"
                            aria-selected={role === key}
                            onClick={switchRole}
                            className={`flex min-h-13.5 items-center justify-center gap-2.5 rounded-[10px] border px-3 text-center text-[0.95rem] leading-tight transition ${
                                role === key
                                    ? 'border-sage-700 bg-sage-700 text-white shadow-sm'
                                    : 'border-[#6f9db8] bg-white text-ink hover:border-sage-700 hover:bg-[#eff8ff]'
                            }`}>
                            <Icon name={icon} size={19}/>
                            {t(labelKey)}
                        </Link>
                    ))}
                </div>
                <p className="mt-2.5 text-center text-[0.82rem] text-[#5b7b8f]">
                    {t(ROLES.find((item) => item.key === role)!.blurbKey)}
                </p>

                <form className="mt-6" onSubmit={handleSubmit} noValidate>
                    <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:gap-x-10 xl:gap-x-14">
                        {/* Committee member / family user join an existing temple */}
                        {role !== 'temple-admin' && (
                            <>
                                {/* Type the temple name and the registered temples are offered;
                                    picking one fills the code, district and village below. */}
                                <TempleCombobox
                                    id="templeName"
                                    label={t('auth.templeName')}
                                    icon={<Icon name="temple" size={17}/>}
                                    placeholder={t('auth.templeNamePlaceholder')}
                                    value={form.templeName}
                                    language={language}
                                    onChange={(value) => {
                                        setLanguage(detectLanguage(value))
                                        set('templeName')(value)
                                    }}
                                    onPick={(temple) => fillTemple(temple)}
                                    onCommit={onTempleNameCommit}
                                    error={errors.templeName}/>
                                <TextField id="templeCode" label={t('auth.templeCode')} icon="temple"
                                           placeholder={t('auth.templeCodePlaceholder')}
                                           value={form.templeCode} onChange={onTempleCodeChange}
                                           onBlur={() => onTempleCodeChange(form.templeCode)}
                                           error={errors.templeCode}/>
                            </>
                        )}

                        <TextField id="firstName" label={t('auth.firstName')} icon="person"
                                   placeholder={t('auth.firstNamePlaceholder')}
                                   autoComplete="given-name" value={form.firstName} onChange={set('firstName')}
                                   error={errors.firstName}/>
                        <TextField id="lastName" label={t('auth.lastName')} icon="person"
                                   placeholder={t('auth.lastNamePlaceholder')}
                                   autoComplete="family-name" value={form.lastName} onChange={set('lastName')}
                                   error={errors.lastName}/>

                        <TextField id="email" label={t('auth.email')} icon="mail"
                                   placeholder={t('auth.emailPlaceholder')}
                                   type="email" autoComplete="email" value={form.email} onChange={set('email')}
                                   error={errors.email}/>
                        <TextField id="phone" label={t('auth.phoneNumber')} icon="phone"
                                   placeholder={t('auth.phonePlaceholder')} type="tel" autoComplete="tel"
                                   value={form.phone} onChange={set('phone')} error={errors.phone}/>

                        {/* Committee Member - committee name and designation */}
                        {role === 'committee-member' && (
                            <>
                                <TextField id="village" label={t('auth.village')} icon="home"
                                           placeholder={t('auth.villagePlaceholder')}
                                           value={form.village} onChange={set('village')} error={errors.village}/>
                                <SelectField id="district" label={t('auth.district')}
                                             icon={<Icon name="map" size={17}/>} placeholder={t('auth.selectDistrict')}
                                             options={districtsIn(language)} value={form.district}
                                             onChange={onDistrictChange} error={errors.district}/>
                                <SelectField id="committee" label={t('auth.committeeName')}
                                             icon={<Icon name="users" size={17}/>}
                                             placeholder={t('auth.selectCommittee')}
                                             options={COMMITTEES} value={form.committee} onChange={set('committee')}
                                             error={errors.committee}/>
                                <SelectField id="designation" label={t('auth.designation')}
                                             icon={<Icon name="briefcase" size={17}/>}
                                             placeholder={t('auth.selectDesignation')}
                                             options={COMMITTEE_DESIGNATIONS} value={form.designation}
                                             onChange={set('designation')} error={errors.designation}/>
                                {form.committee === 'Other' && (
                                    <TextField id="committeeOther"
                                               label={`${t('auth.committeeName')} (${t('auth.specify')})`} icon="users"
                                               placeholder={t('auth.committeeOther')} value={form.committeeOther}
                                               onChange={set('committeeOther')} error={errors.committeeOther}/>
                                )}
                                {form.designation === 'Other' && (
                                    <TextField id="designationOther"
                                               label={`${t('auth.designation')} (${t('auth.specify')})`}
                                               icon="briefcase"
                                               placeholder={t('auth.designationOther')} value={form.designationOther}
                                               onChange={set('designationOther')} error={errors.designationOther}/>
                                )}
                            </>
                        )}

                        {/* Temple Admin - designation only */}
                        {role === 'temple-admin' && (
                            <>
                                <SelectField id="designation" label={t('auth.designation')}
                                             icon={<Icon name="briefcase" size={17}/>}
                                             placeholder={t('auth.selectDesignation')}
                                             options={ADMIN_DESIGNATIONS} value={form.designation}
                                             onChange={set('designation')} error={errors.designation}/>
                                {form.designation === 'Other' && (
                                    <TextField id="designationOther"
                                               label={`${t('auth.designation')} (${t('auth.specify')})`}
                                               icon="briefcase"
                                               placeholder={t('auth.designationOther')} value={form.designationOther}
                                               onChange={set('designationOther')} error={errors.designationOther}/>
                                )}
                            </>
                        )}

                        {/* Family User - address block */}
                        {role === 'family-user' && (
                            <>
                                <TextField id="nic" label={t('auth.nic')} icon="user" placeholder="901234567V"
                                           autoComplete="off" value={form.nic} onChange={set('nic')}
                                           error={errors.nic}/>
                                <TextField id="address" label={t('auth.address')} icon="pin"
                                           placeholder={t('auth.addressPlaceholder')}
                                           autoComplete="street-address" value={form.address} onChange={set('address')}
                                           error={errors.address} full/>
                                <TextField id="village" label={t('auth.village')} icon="home"
                                           placeholder={t('auth.villagePlaceholder')}
                                           value={form.village} onChange={set('village')} error={errors.village}/>
                                <SelectField id="district" label={t('auth.district')}
                                             icon={<Icon name="map" size={17}/>} placeholder={t('auth.selectDistrict')}
                                             options={districtsIn(language)} value={form.district}
                                             onChange={onDistrictChange} error={errors.district}/>
                                <TextField id="postalCode" label={t('auth.postalCode')} icon="mailbox"
                                           placeholder={t('auth.postalCodePlaceholder')}
                                           autoComplete="postal-code" value={form.postalCode}
                                           onChange={set('postalCode')}
                                           error={errors.postalCode}/>
                            </>
                        )}

                        {/* Password and Confirm Password share a row; the checklist spans the full
                            width underneath, so it never splits the two fields apart. */}
                        <PasswordField id="password" label={t('auth.password')}
                                       placeholder={t('auth.createPasswordPlaceholder')} newRow
                                       autoComplete="new-password" value={form.password} onChange={set('password')}
                                       onBlur={() => setTouchedPassword(true)}
                                       error={errors.password}/>
                        <PasswordField id="confirmPassword" label={t('auth.confirmPassword')}
                                       placeholder={t('auth.confirmPasswordPlaceholder')}
                                       autoComplete="new-password" value={form.confirmPassword}
                                       onChange={set('confirmPassword')} error={errors.confirmPassword}/>
                        <PasswordStrength id="password" className="sm:col-span-2"
                                          value={form.password} confirm={form.confirmPassword}
                                          touched={touchedPassword || Boolean(errors.password)}/>
                    </div>

                    <div className="mt-5">
                        <label
                            className="flex cursor-pointer items-start gap-2.5 text-[0.95rem] leading-snug text-ink">
                            <input
                                type="checkbox"
                                checked={agreed}
                                onChange={(event) => {
                                    setAgreed(event.target.checked)
                                    setErrors((current) => ({...current, terms: undefined}))
                                }}
                                aria-invalid={Boolean(errors.terms) || undefined}
                                aria-describedby={errors.terms ? 'terms-error' : undefined}
                                className="mt-0.5 h-6 w-6 flex-none cursor-pointer rounded-[3px] border-[#6f9db8] accent-sage-700 lg:h-4.5 lg:w-4.5"/>
                            <span>
                                {t('auth.agreePrefix')}{' '}
                                <Link
                                    to={authRoutes.terms}
                                    className="py-1 font-bold text-sage-700 no-underline transition-colors hover:text-sage-800">
                                    {t('auth.terms')}
                                </Link>{' '}
                                {t('auth.and')}{' '}
                                <Link
                                    to={authRoutes.privacy}
                                    className="py-1 font-bold text-sage-700 no-underline transition-colors hover:text-sage-800">
                                    {t('auth.privacy')}
                                </Link>
                            </span>
                        </label>
                        {errors.terms && <span id="terms-error"
                                               className="mt-1.5 block text-[0.72rem] text-status-rose">{errors.terms}</span>}
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="mt-6 flex min-h-15 w-full items-center justify-center gap-3 rounded-[10px] border border-sage-700 bg-sage-700 text-[1.05rem] font-bold text-white transition hover:-translate-y-px hover:bg-sage-800 hover:shadow-[0_8px_16px_rgba(3,105,161,.24)] disabled:cursor-wait disabled:opacity-80">
                        <Icon name="userPlus" size={21}/>
                        {submitting ? t('auth.creatingAccount') : t('auth.register')}
                    </button>

                    <div
                        className="my-4 text-center text-[0.95rem] font-bold tracking-wide text-[#5b7b8f]">{t('common.or')}</div>

                    {/* Phones: two icon-only cards side by side, exactly like the login screen.
                        From sm up: the register screen's own full-width buttons. */}
                    <div className="mt-4 flex gap-3 sm:block sm:space-y-3.5">
                        <Link to={authRoutes.google}
                              className="flex min-h-13 flex-1 items-center justify-center gap-0 rounded-[10px] border border-[#9dc2d6] bg-white text-base font-bold text-ink shadow-sm transition hover:-translate-y-px hover:border-sage-600 hover:bg-cream sm:min-h-14.5 sm:w-full sm:gap-3 sm:rounded-[10px] sm:text-[1.02rem]">
                            <GoogleIcon/><span className="sr-only sm:not-sr-only">{t('auth.continueGoogle')}</span>
                        </Link>

                        <Link to={authRoutes.facebook}
                              className="flex min-h-13 flex-1 items-center justify-center gap-0 rounded-[10px] border border-line bg-white text-base font-bold text-[#33566c] shadow-sm transition hover:-translate-y-px hover:border-[#1877F2] hover:bg-[#f8fbff] hover:text-[#1877F2] sm:min-h-14.5 sm:w-full sm:gap-3 sm:border-[#c9cfd6] sm:text-[1.02rem] sm:text-ink sm:shadow-none">
                            <FacebookIcon/><span className="sr-only sm:not-sr-only">{t('auth.continueFacebook')}</span>
                        </Link>
                    </div>

                    <div className="mt-5 text-center text-[0.96rem] text-ink">
                        {t('auth.haveAccount')}{' '}
                        <Link to={authRoutes.login}
                              className="px-1.5 py-2 font-bold text-sage-700 hover:underline">{t('auth.login')}</Link>
                    </div>
                </form>
            </div>
        </AuthShell>
    )
}