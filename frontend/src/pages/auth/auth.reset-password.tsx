import type {FormEvent, ReactNode} from 'react'
import {useState} from 'react'
import {Link, useNavigate, useSearchParams} from 'react-router-dom'
import {LotusMark} from '../../components/AuthIcons'
import {passwordLengthError, withLimits} from '../../components/PasswordRules'
import {PasswordStrength} from '../../components/PasswordStrength'
import {AUTH_HEADING, AUTH_SUBTITLE, AuthShell} from '../../layouts/AuthShell'
import {LanguageToggle} from '../../components/LanguageToggle'
import {useTranslation} from 'react-i18next'
import {authRoutes} from '../../routes/authRoutes'

type ResetIconName = 'alert' | 'arrow' | 'check' | 'dot' | 'eye' | 'eyeOff' | 'key' | 'lock' | 'mail' | 'shield'

const ResetIcon = ({name, size = 20}: { name: ResetIconName; size?: number }) => {
    const paths: Record<ResetIconName, ReactNode> = {
        key: <>
            <circle cx="8.5" cy="15.5" r="3.5"/>
            <path d="m11 13 8-8M16 5h3v3M14 7l3 3"/>
        </>,
        mail: <>
            <rect x="2.8" y="5" width="18.4" height="14" rx="2.4"/>
            <path d="m3.6 7 8.4 6.2L20.4 7"/>
        </>,
        lock: <>
            <rect x="4.5" y="10.5" width="15" height="10" rx="2.4"/>
            <path d="M8.2 10.5V8a3.8 3.8 0 0 1 7.6 0v2.5"/>
            <path d="M12 14.6v2.2"/>
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
        check: <>
            <circle cx="12" cy="12" r="9"/>
            <path d="m7.5 12.4 3.2 3.2 6-6.4"/>
        </>,
        arrow: <path d="M4 12h16M14 6l6 6-6 6"/>,
        shield: <>
            <path d="M12 21c4.4-1.9 7-5.2 7-9.4V5.6L12 3 5 5.6v6c0 4.2 2.6 7.5 7 9.4Z"/>
            <path d="m9 12 2.2 2.2L15.4 10"/>
        </>,
        alert: <>
            <path d="M12 3.8 2.8 20h18.4L12 3.8Z"/>
            <path d="M12 9.8v4.4M12 17h.01"/>
        </>,
        dot: <circle cx="12" cy="12" r="3"/>,
    }

    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
                aria-hidden="true">{paths[name]}</svg>
}


/* Card shell shared with the login and forgot-password screens: cream card, gold lotus, Petrona. */
const CARD = 'relative mx-auto mt-0 w-full max-w-141.5 rounded-[24px] border border-white/40 bg-[linear-gradient(180deg,#f2fafe_0%,#e8f6fe_100%)] px-5 pb-7 pt-8 shadow-[0_26px_60px_-18px_rgba(4,24,43,.55)] sm:rounded-2xl sm:px-7 sm:pb-8 sm:pt-9 lg:my-auto lg:px-12 lg:pb-11 lg:pt-10'
const FIELD = 'flex h-12 items-center gap-3 rounded-[9px] border border-[#6f9db8] bg-white px-3 text-[#0f2b3d] transition placeholder:text-[#8299a8] focus-within:shadow-[0_0_0_3px_rgba(2,132,199,.16)] lg:h-11'
const INPUT = 'w-px min-w-0 flex-1 self-stretch border-0 bg-transparent p-0 font-temple text-base text-[#0f2b3d] outline-none placeholder:text-[#8299a8] lg:text-[.95rem]'
const PRIMARY = 'flex min-h-13 w-full items-center justify-center gap-3 rounded-[10px] border border-[#0284c7] bg-[#0284c7] text-base font-bold text-white transition hover:-translate-y-px hover:bg-[#0369a1] hover:shadow-[0_8px_16px_rgba(24,80,61,.24)] disabled:cursor-wait disabled:opacity-75 lg:min-h-12.75'
const ERROR_BORDER = 'border-status-rose shadow-[0_0_0_3px_rgba(173,28,3,.12)]'

const PasswordField = ({id, label, placeholder, value, onChange, onBlur, error, autoFocus}: {
    id: string
    label: string
    placeholder: string
    value: string
    onChange: (value: string) => void
    onBlur?: () => void
    error?: string
    autoFocus?: boolean
}) => {
    const {t} = useTranslation()
    const [visible, setVisible] = useState(false)

    return (
        <label className="block" htmlFor={id}>
            <span className="mb-3 block text-base text-[#131313]">{label}</span>
            <span className={`${FIELD} ${error ? ERROR_BORDER : ''}`}>
                <ResetIcon name="key" size={21}/>
                <input
                    id={id}
                    className={INPUT}
                    type={visible ? 'text' : 'password'}
                    autoComplete="new-password"
                    autoFocus={autoFocus}
                    placeholder={placeholder}
                    value={value}
                    aria-invalid={Boolean(error) || undefined}
                    aria-describedby={error ? `${id}-error` : undefined}
                    onBlur={onBlur}
                    onChange={(event) => onChange(event.target.value)}
                />
                <button
                    className="grid h-11 w-11 shrink-0 place-items-center border-0 bg-transparent text-[#33566c] hover:text-sage-600 lg:h-9 lg:w-9"
                    type="button"
                    aria-label={visible ? t('auth.hidePassword') : t('auth.showPassword')}
                    aria-pressed={visible}
                    onClick={() => setVisible((current) => !current)}>
                    <ResetIcon name={visible ? 'eye' : 'eyeOff'} size={19}/>
                </button>
            </span>
            {error && <span id={`${id}-error`} role="alert"
                            className="mt-2 block text-[.8rem] leading-snug text-status-rose">{error}</span>}
        </label>
    )
}

/** Divider with the sign-in and sign-up links - same as the forgot-password screen. */
const FooterLinks = () => {
    const {t} = useTranslation()
    return (
        <div
            className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 border-t border-[#d9d3bf] pt-5 text-[.94rem]">
            <Link to={authRoutes.login}
                  className="inline-flex min-h-11 items-center px-1 font-bold text-sage-700 hover:underline lg:min-h-0">
                {t('auth.backToSignIn')}
            </Link>
            <span aria-hidden="true" className="text-[#9a9484]">·</span>
            <Link to={authRoutes.register}
                  className="inline-flex min-h-11 items-center px-1 font-bold text-sage-700 hover:underline lg:min-h-0">
                {t('auth.createAccountLink')}
            </Link>
        </div>
    )
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export const ResetPasswordPage = () => {
    const {t} = useTranslation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token')

    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({})
    const [saving, setSaving] = useState(false)
    const [done, setDone] = useState(false)
    const [touchedPassword, setTouchedPassword] = useState(false)

    /*
     * A real link carries a single-use token in the query string. There is no backend to check it
     * yet, so the password form is the default and the link is taken at face value - otherwise the
     * screen would be unreachable during the frontend phase.
     *
     * Once the API exists this becomes: ask the server whether the token is still valid, and fall
     * back to the not-valid / expired panel when it is not.
     *
     * For the demo: `?token=expired` shows the expired wording.
     */
    const unusable = token === 'expired' ? 'expired' : null

    const validate = () => {
        const next: { password?: string; confirm?: string } = {}

        if (!password) next.password = t('auth.errCreatePassword')
        else {
            const lengthError = passwordLengthError(password)
            if (lengthError) next.password = withLimits(t(lengthError))
        }

        if (!confirm) next.confirm = t('auth.errConfirmNewPassword')
        else if (confirm !== password) next.confirm = t('auth.errPasswordsDiffer')

        setErrors(next)
        return Object.keys(next).length === 0
    }

    const submit = (event: FormEvent) => {
        event.preventDefault()
        if (!validate()) return

        // Demo build: nothing is sent - the confirmation state is shown immediately.
        setSaving(true)
        window.setTimeout(() => {
            setSaving(false)
            setDone(true)
        }, 700)
    }

    /* --------------------- Step 3 - confirmation --------------------- */
    if (done) {
        return (
            <AuthShell>
                <div className={CARD}>
                    <LanguageToggle tone="card" label={false} className="absolute top-3 right-3 z-10"/>
                    <header className="text-center">
                        <LotusMark width={168} className="mx-auto mb-1"/>
                        <h1 className={AUTH_HEADING}>
                            {t('auth.reset')}
                        </h1>
                        <p className={AUTH_SUBTITLE}>
                            {t('auth.resetDoneBody')}
                        </p>
                    </header>

                    <div role="status" aria-live="polite"
                         className="mt-7 flex items-start gap-3 rounded-[10px] border border-sage-600/25 bg-[#eef6ef] px-4 py-3.5 text-ink">
                        <span className="mt-0.5 flex-none text-sage-600"><ResetIcon name="check" size={20}/></span>
                        <span className="text-[.92rem] leading-relaxed">
                            {t('auth.resetDoneNote')}
                        </span>
                    </div>

                    <ul className="mt-6 space-y-2.5 text-[.92rem] leading-relaxed text-[#33566c]">
                        <li className="flex gap-2.5">
                            <span className="mt-0.5 flex-none text-sage-600"><ResetIcon name="shield"
                                                                                         size={18}/></span>
                            <span>{t('auth.resetDone1')}</span>
                        </li>
                        <li className="flex gap-2.5">
                            <span className="mt-0.5 flex-none text-sage-600"><ResetIcon name="lock"
                                                                                         size={18}/></span>
                            <span>{t('auth.resetDone2')}</span>
                        </li>
                    </ul>

                    <button className={`${PRIMARY} mt-7`} type="button"
                            onClick={() => navigate(authRoutes.login)}>
                        <ResetIcon name="arrow" size={19}/> {t('auth.continueSignIn')}
                    </button>

                    <FooterLinks/>
                </div>
            </AuthShell>
        )
    }

    /* ---------- Link that cannot be used: missing or expired ---------- */
    if (unusable) {
        return (
            <AuthShell>
                <div className={CARD}>
                    <LanguageToggle tone="card" label={false} className="absolute top-3 right-3 z-10"/>
                    <header className="text-center">
                        <LotusMark width={168} className="mx-auto mb-1"/>
                        <h1 className="mb-2.5 mt-1 font-display text-[1.9rem] leading-none tracking-tight text-sage-900 sm:text-[clamp(2rem,2.6vw,2.7rem)]">
                            {unusable === 'expired' ? t('auth.linkExpiredTitle') : t('auth.linkInvalidTitle')}
                        </h1>
                        <p className="m-0 text-[1.02rem] leading-relaxed text-ink">
                            {t('auth.linkExpiredBody')}
                        </p>
                    </header>

                    <div role="alert"
                         className="mt-7 flex items-start gap-3 rounded-[10px] border border-status-rose/25 bg-[#fdf2f0] px-4 py-3.5 text-ink">
                        <span className="mt-0.5 flex-none text-status-rose"><ResetIcon name="alert" size={20}/></span>
                        <span className="text-[.92rem] leading-relaxed">
                            {t('auth.linkExpiredNote')}
                        </span>
                    </div>

                    <Link className={`${PRIMARY} mt-7`} to={authRoutes.forgotPassword}>
                        <ResetIcon name="mail" size={19}/> {t('auth.requestNewLink')}
                    </Link>

                    <FooterLinks/>
                </div>
            </AuthShell>
        )
    }

    /* ------------------- Step 2 - choose a new password ------------------- */
    return (
        <AuthShell>
            <div className={CARD}>
                <LanguageToggle tone="card" label={false} className="absolute top-3 right-3 z-10"/>
                <header className="text-center">
                    <LotusMark width={168} className="mx-auto mb-1"/>
                    <h1 className={AUTH_HEADING}>
                        {t('auth.resetTitle')}
                    </h1>
                    <p className={AUTH_SUBTITLE}>
                        {t('auth.resetSubtitle')}
                    </p>
                </header>

                <form className="mt-7 sm:mt-8" onSubmit={submit} noValidate>
                    <div className="space-y-6">
                        <div>
                            <PasswordField
                                id="new-password"
                                label={t('auth.newPassword')}
                                placeholder={t('auth.newPasswordPlaceholder')}
                                value={password}
                                autoFocus
                                onChange={(value) => {
                                    setPassword(value)
                                    setErrors((current) => ({...current, password: undefined}))
                                }}
                                error={errors.password}
                                onBlur={() => setTouchedPassword(true)}/>

                            <PasswordStrength
                                id="new-password"
                                className="mt-3"
                                value={password}
                                confirm={confirm}
                                touched={touchedPassword || Boolean(errors.password)}/>
                        </div>

                        <PasswordField
                            id="confirm-password"
                            label={t('auth.confirmPassword')}
                            placeholder={t('auth.confirmNewPasswordPlaceholder')}
                            value={confirm}
                            onChange={(value) => {
                                setConfirm(value)
                                setErrors((current) => ({...current, confirm: undefined}))
                            }}
                            error={errors.confirm}/>
                    </div>

                    <button className={`${PRIMARY} mt-7`} type="submit" disabled={saving}>
                        {saving ? t('auth.updating') : t('auth.updatePassword')} <ResetIcon name="arrow" size={19}/>
                    </button>

                    <p className="mt-4 text-center text-[.88rem] leading-relaxed text-[#5b7b8f]">
                        {t('auth.currentKeepsWorking')}
                    </p>
                </form>

                <FooterLinks/>
            </div>
        </AuthShell>
    )
}