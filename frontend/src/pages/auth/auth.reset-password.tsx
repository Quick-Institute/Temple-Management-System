import type {FormEvent, ReactNode} from 'react'
import {useState} from 'react'
import {Link, useNavigate, useSearchParams} from 'react-router-dom'
import {LotusMark} from '../../components/AuthIcons'
import {AuthShell} from '../../layouts/AuthShell'
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
const CARD = 'mx-auto mt-0 w-full max-w-141.5 rounded-[24px] border border-white/30 bg-[#fffdf4]/[.98] px-5 pb-7 pt-8 shadow-[0_22px_42px_rgba(9,20,13,.15)] sm:rounded-2xl sm:px-7 sm:pb-8 sm:pt-9 lg:px-12 lg:pb-11 lg:pt-10'
const FIELD = 'flex h-12 items-center gap-3 rounded-[9px] border border-[#292B2B] bg-white px-3 text-[#292B2B] transition focus-within:shadow-[0_0_0_3px_rgba(27,98,75,.12)] lg:h-11'
const INPUT = 'w-px min-w-0 flex-1 self-stretch border-0 bg-transparent p-0 font-temple text-base text-[#292B2B] outline-none lg:text-[.95rem]'
const PRIMARY = 'flex min-h-13 w-full items-center justify-center gap-3 rounded-[10px] border border-[#1d5c46] bg-[#1d5c46] text-base font-bold text-white transition hover:-translate-y-px hover:bg-[#154935] hover:shadow-[0_8px_16px_rgba(24,80,61,.24)] disabled:cursor-wait disabled:opacity-75 lg:min-h-12.75'
const ERROR_BORDER = 'border-status-rose shadow-[0_0_0_3px_rgba(173,28,3,.12)]'

/* ------------------------------------------------------------------ */
/* Password strength — advisory only, it never blocks the submit       */
/* ------------------------------------------------------------------ */

const RULES: { label: string; test: (value: string) => boolean }[] = [
    {label: '8 or more characters', test: (value) => value.length >= 8},
    {label: 'Upper and lower case', test: (value) => /[a-z]/.test(value) && /[A-Z]/.test(value)},
    {label: 'A number', test: (value) => /\d/.test(value)},
    {label: 'A symbol', test: (value) => /[^A-Za-z0-9]/.test(value)},
]

const strength = (value: string) => {
    if (!value) return {label: '', bars: 0, color: '#1d5c46'}

    const points = RULES.filter((rule) => rule.test(value)).length + (value.length >= 12 ? 1 : 0)
    if (points <= 2) return {label: 'Weak', bars: 1, color: '#ad1c03'}
    if (points === 3) return {label: 'Medium', bars: 2, color: '#a26a0c'}
    return {label: 'Strong', bars: 3, color: '#1d5c46'}
}

const PasswordField = ({id, label, placeholder, value, onChange, error, autoFocus}: {
    id: string
    label: string
    placeholder: string
    value: string
    onChange: (value: string) => void
    error?: string
    autoFocus?: boolean
}) => {
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
                    onChange={(event) => onChange(event.target.value)}
                />
                <button
                    className="grid h-11 w-11 shrink-0 place-items-center border-0 bg-transparent text-[#292B2B] hover:text-[#1C4F3C] lg:h-9 lg:w-9"
                    type="button"
                    aria-label={visible ? 'Hide password' : 'Show password'}
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
const FooterLinks = () => (
    <div
        className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 border-t border-[#d9d3bf] pt-5 text-[.94rem]">
        <Link to={authRoutes.login}
              className="inline-flex min-h-11 items-center px-1 font-bold text-[#14512f] hover:underline lg:min-h-0">Back
            to sign in</Link>
        <span aria-hidden="true" className="text-[#9a9484]">·</span>
        <Link to={authRoutes.register}
              className="inline-flex min-h-11 items-center px-1 font-bold text-[#14512f] hover:underline lg:min-h-0">Create
            an account</Link>
    </div>
)

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export const ResetPasswordPage = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token')

    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({})
    const [saving, setSaving] = useState(false)
    const [done, setDone] = useState(false)

    /*
     * A real link carries a single-use token in the query string, so the screen has to cope with a
     * link that cannot be used. For the demo: no token at all reads as "not valid", and the token
     * 'expired' shows the expired wording - /auth/reset-password?token=expired
     */
    const unusable = !token ? 'missing' : token === 'expired' ? 'expired' : null

    const level = strength(password)

    const validate = () => {
        const next: { password?: string; confirm?: string } = {}

        if (!password) next.password = 'Create a new password.'
        else if (password.length < 8) next.password = 'Use at least 8 characters.'

        if (!confirm) next.confirm = 'Confirm your new password.'
        else if (confirm !== password) next.confirm = 'Passwords do not match.'

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
                    <header className="text-center">
                        <LotusMark width={112} className="mx-auto mb-0"/>
                        <h1 className="mb-2.5 mt-1 font-display text-[1.9rem] leading-none tracking-tight text-[#123c2e] sm:text-[clamp(2rem,2.6vw,2.7rem)]">
                            Password updated
                        </h1>
                        <p className="m-0 text-[1.02rem] leading-relaxed text-[#111]">
                            Your new password is active from now. Use it the next time you sign in.
                        </p>
                    </header>

                    <div role="status" aria-live="polite"
                         className="mt-7 flex items-start gap-3 rounded-[10px] border border-[#1d5c46]/25 bg-[#eef6ef] px-4 py-3.5 text-[#1f2d26]">
                        <span className="mt-0.5 flex-none text-[#1d5c46]"><ResetIcon name="check" size={20}/></span>
                        <span className="text-[.92rem] leading-relaxed">
                            Other devices signed in to this account have been signed out for safety.
                        </span>
                    </div>

                    <ul className="mt-6 space-y-2.5 text-[.92rem] leading-relaxed text-[#2c3a31]">
                        <li className="flex gap-2.5">
                            <span className="mt-0.5 flex-none text-[#1d5c46]"><ResetIcon name="shield"
                                                                                         size={18}/></span>
                            <span>The link you used is now spent - asking for another reset starts a new request.</span>
                        </li>
                        <li className="flex gap-2.5">
                            <span className="mt-0.5 flex-none text-[#1d5c46]"><ResetIcon name="lock"
                                                                                         size={18}/></span>
                            <span>Nobody from the temple or the system provider will ever ask you for your
                                password.</span>
                        </li>
                    </ul>

                    <button className={`${PRIMARY} mt-7`} type="button"
                            onClick={() => navigate(authRoutes.login)}>
                        <ResetIcon name="arrow" size={19}/> Continue to sign in
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
                    <header className="text-center">
                        <LotusMark width={112} className="mx-auto mb-0"/>
                        <h1 className="mb-2.5 mt-1 font-display text-[1.9rem] leading-none tracking-tight text-[#123c2e] sm:text-[clamp(2rem,2.6vw,2.7rem)]">
                            {unusable === 'expired' ? 'This link has expired' : 'This link is not valid'}
                        </h1>
                        <p className="m-0 text-[1.02rem] leading-relaxed text-[#111]">
                            Reset links can be used once and expire 30 minutes after they are sent.
                        </p>
                    </header>

                    <div role="alert"
                         className="mt-7 flex items-start gap-3 rounded-[10px] border border-status-rose/25 bg-[#fdf2f0] px-4 py-3.5 text-[#1f2d26]">
                        <span className="mt-0.5 flex-none text-status-rose"><ResetIcon name="alert" size={20}/></span>
                        <span className="text-[.92rem] leading-relaxed">
                            Open the link from the most recent email, or request a new one and use it within
                            30 minutes.
                        </span>
                    </div>

                    <Link className={`${PRIMARY} mt-7`} to={authRoutes.forgotPassword}>
                        <ResetIcon name="mail" size={19}/> Request a new link
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
                <header className="text-center">
                    <LotusMark width={112} className="mx-auto mb-0"/>
                    <h1 className="mb-2.5 mt-1 font-display text-[1.9rem] leading-none tracking-tight text-[#123c2e] sm:text-[clamp(2rem,2.6vw,2.7rem)]">
                        Choose a new password
                    </h1>
                    <p className="m-0 text-[1.02rem] leading-relaxed text-[#111]">
                        Pick something you do not use anywhere else.
                    </p>
                </header>

                <form className="mt-7 sm:mt-8" onSubmit={submit} noValidate>
                    <div className="space-y-6">
                        <div>
                            <PasswordField
                                id="new-password"
                                label="New Password"
                                placeholder="Enter your new password"
                                value={password}
                                autoFocus
                                onChange={(value) => {
                                    setPassword(value)
                                    setErrors((current) => ({...current, password: undefined}))
                                }}
                                error={errors.password}/>

                            {/* Strength meter - advisory, it never blocks the form. */}
                            <div className="mt-3" aria-hidden="true">
                                <div className="flex items-center gap-3">
                                    <span className="flex flex-1 gap-1.5">
                                        {[0, 1, 2].map((index) => (
                                            <span
                                                key={index}
                                                className="h-1.5 flex-1 rounded-full transition-colors duration-200"
                                                style={{
                                                    backgroundColor: index < level.bars ? level.color : '#e3ded0',
                                                }}/>
                                        ))}
                                    </span>
                                    <span className="w-14 flex-none text-right text-[.78rem] font-bold"
                                          style={{color: level.bars ? level.color : '#8b8b8b'}}>
                                        {level.bars ? level.label : '—'}
                                    </span>
                                </div>
                            </div>

                            <ul className="mt-3 flex list-none flex-wrap gap-x-4 gap-y-1.5 p-0 text-[.8rem] text-[#5d6b62]">
                                {RULES.map((rule) => {
                                    const passed = rule.test(password)
                                    return (
                                        <li key={rule.label}
                                            className={`flex items-center gap-1.5 ${passed ? 'text-[#1d5c46]' : ''}`}>
                                            <ResetIcon name={passed ? 'check' : 'dot'} size={13}/>
                                            {rule.label}
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>

                        <PasswordField
                            id="confirm-password"
                            label="Confirm Password"
                            placeholder="Re-enter your new password"
                            value={confirm}
                            onChange={(value) => {
                                setConfirm(value)
                                setErrors((current) => ({...current, confirm: undefined}))
                            }}
                            error={errors.confirm}/>
                    </div>

                    <button className={`${PRIMARY} mt-7`} type="submit" disabled={saving}>
                        {saving ? 'Updating…' : 'Update password'} <ResetIcon name="arrow" size={19}/>
                    </button>

                    <p className="mt-4 text-center text-[.88rem] leading-relaxed text-[#5d6b62]">
                        Your current password keeps working until the new one is saved.
                    </p>
                </form>

                <FooterLinks/>
            </div>
        </AuthShell>
    )
}