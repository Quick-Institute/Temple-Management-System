import type {FormEvent} from 'react'
import {useEffect, useRef, useState} from 'react'
import {Link, Navigate, useNavigate, useSearchParams} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import {LotusMark} from '../../components/AuthIcons'
import {AUTH_HEADING, AUTH_SUBTITLE, AuthShell} from '../../layouts/AuthShell'
import {LanguageToggle} from '../../components/LanguageToggle'
import {authRoutes} from '../../routes/authRoutes'

/*
 * Email verification screens.
 *
 * Every state has its own URL, so each one can be opened, linked and reviewed on its own:
 *
 *   /auth/verify-email?token=…      the link from the email - shows the "confirming" screen
 *   /auth/verify-email/success      address confirmed
 *   /auth/verify-email/expired      the 24-hour link has lapsed
 *   /auth/verify-email/invalid      bad / incomplete / already-spent link
 *
 * The backend is NOT connected yet. /auth/verify-email settles on sample behaviour and forwards to
 * one of the three result screens, the same way the register form's temporary submit works:
 *
 *   …?token=demo-expired   -> /auth/verify-email/expired
 *   …?token=demo-invalid   -> /auth/verify-email/invalid
 *   …?token=<anything>     -> /auth/verify-email/success
 *
 * When the API is wired later, only `resolve()` below needs to call it and return the matching path.
 */

type IconName = 'arrow' | 'check' | 'clock' | 'mail' | 'shield' | 'wave'

const Icon = ({name, size = 22}: { name: IconName; size?: number }) => {
    const paths = {
        mail: <>
            <rect x="2.8" y="5" width="18.4" height="14" rx="2.4"/>
            <path d="m3.6 7 8.4 6.2L20.4 7"/>
        </>,
        check: <>
            <circle cx="12" cy="12" r="9"/>
            <path d="m7.5 12.4 3.2 3.2 6-6.4"/>
        </>,
        shield: <>
            <path d="M12 21c4.4-1.9 7-5.2 7-9.4V5.6L12 3 5 5.6v6c0 4.2 2.6 7.5 7 9.4Z"/>
            <path d="m9 12 2.2 2.2L15.4 10"/>
        </>,
        clock: <>
            <circle cx="12" cy="12" r="9"/>
            <path d="M12 7.5V12l3.2 2"/>
        </>,
        arrow: <path d="M4 12h16M14 6l6 6-6 6"/>,
        wave: <>
            <path d="M3 9c2.4-2.6 4.6-2.6 7 0s4.6 2.6 7 0 2.5-1.6 4-1.2"/>
            <path d="M3 15c2.4-2.6 4.6-2.6 7 0s4.6 2.6 7 0 2.5-1.6 4-1.2"/>
        </>,
    }

    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {paths[name]}
    </svg>
}

/* Same card shell as the login / forgot-password screens: soft blue card, gold lotus, Petrona heading. */
const CARD = 'relative mx-auto mt-0 w-full max-w-141.5 rounded-[24px] border border-white/40 bg-[linear-gradient(180deg,#f2fafe_0%,#e8f6fe_100%)] px-5 pb-7 pt-8 shadow-[0_26px_60px_-18px_rgba(4,24,43,.55)] sm:rounded-2xl sm:px-7 sm:pb-8 sm:pt-9 lg:my-auto lg:px-12 lg:pb-11 lg:pt-10'
const FIELD = 'flex h-12 items-center gap-3 rounded-[9px] border border-[#6f9db8] bg-white px-3 text-[#0f2b3d] transition placeholder:text-[#8299a8] focus-within:shadow-[0_0_0_3px_rgba(2,132,199,.16)] lg:h-11'
const INPUT = 'w-px min-w-0 flex-1 self-stretch border-0 bg-transparent p-0 font-temple text-base text-[#0f2b3d] outline-none placeholder:text-[#8299a8] lg:text-[.95rem]'
const PRIMARY = 'flex min-h-13 w-full items-center justify-center gap-3 rounded-[10px] border border-[#0284c7] bg-[#0284c7] text-base font-bold text-white transition hover:-translate-y-px hover:bg-[#0369a1] hover:shadow-[0_8px_16px_rgba(24,80,61,.24)] disabled:cursor-wait disabled:opacity-75 lg:min-h-12.75'

/** of***@domain.lk - enough to recognise, not enough to leak the whole address. */
const mask = (value: string) => {
    const [user = '', domain = ''] = value.split('@')
    return `${user.slice(0, 2)}${'*'.repeat(Math.max(3, user.length - 2))}@${domain}`
}

/** Shared frame: lotus, heading, subtitle, and the language switch in the corner. */
const Card = ({title, subtitle, children, labelledBy}: {
    title: string
    subtitle: React.ReactNode
    children: React.ReactNode
    labelledBy?: string
}) => (
    <AuthShell>
        <div className={CARD}>
            <LanguageToggle tone="card" label={false} className="absolute top-3 right-3 z-10"/>
            <header className="text-center">
                <LotusMark width={168} className="mx-auto mb-1"/>
                <h1 className={AUTH_HEADING} id={labelledBy}>{title}</h1>
                <p className={AUTH_SUBTITLE}>{subtitle}</p>
            </header>
            {children}
        </div>
    </AuthShell>
)

/** Says plainly that nothing is talking to the server yet. */
const DemoNote = () => {
    const {t} = useTranslation()
    return (
        <p className="mt-5 border-t border-[#d9d3bf] pt-4 text-center text-[0.8rem] leading-relaxed text-[#5b7285]">
            {t('auth.verifyDemoNote')}
        </p>
    )
}

const FooterLinks = () => {
    const {t} = useTranslation()
    return (
        <div
            className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 border-t border-[#d9d3bf] pt-5 text-[.94rem]">
            <Link to={authRoutes.login}
                  className="inline-flex min-h-11 items-center px-1 font-bold text-sage-700 hover:underline lg:min-h-0">
                {t('auth.backToSignIn')}
            </Link>
            <span aria-hidden="true" className="text-[#9a9484]">·</span>
            <Link to={authRoutes.registerAdmin}
                  className="inline-flex min-h-11 items-center px-1 font-bold text-sage-700 hover:underline lg:min-h-0">
                {t('auth.createAccountLink')}
            </Link>
        </div>
    )
}

/* ---------------------------------------------------------------------------
 * /auth/verify-email?token=…  -  the link from the email opens here
 * ------------------------------------------------------------------------- */
export const VerifyEmailPage = () => {
    const {t} = useTranslation()
    const navigate = useNavigate()
    const [params] = useSearchParams()
    const token = (params.get('token') ?? '').trim()

    useEffect(() => {
        if (!token) {
            navigate(authRoutes.verifyEmailInvalid, {replace: true})
            return
        }

        /* Demo behaviour - replace this block with the API call once the frontend is connected. */
        const target = token === 'demo-expired'
            ? authRoutes.verifyEmailExpired
            : token === 'demo-invalid' || token === 'demo-used'
                ? authRoutes.verifyEmailInvalid
                : authRoutes.verifyEmailSuccess

        const timer = window.setTimeout(() => navigate(target, {replace: true}), 900)
        return () => window.clearTimeout(timer)
    }, [token, navigate])

    if (!token) return <Navigate to={authRoutes.verifyEmailInvalid} replace/>

    return (
        <Card
            title={t('auth.verifyConfirmTitle')}
            subtitle={t('auth.verifyConfirmSubtitle')}>
            <div role="status" aria-live="polite" className="mt-9 flex flex-col items-center gap-4">
                <span className="relative flex h-14 w-14 items-center justify-center">
                    <span className="absolute inset-0 animate-ping rounded-full bg-sage-600/15"/>
                    <span
                        className="relative grid h-14 w-14 place-items-center rounded-full bg-[#e3f2fd] text-sage-600">
                        <Icon name="mail" size={24}/>
                    </span>
                </span>
                <p className="text-[.92rem] leading-relaxed text-[#33566c]">{t('auth.verifyWorking')}</p>
            </div>
            <DemoNote/>
        </Card>
    )
}

/* ---------------------------------------------------------------------------
 * /auth/verify-email/success   (add ?already=1 to see the repeat-visit wording)
 * ------------------------------------------------------------------------- */
export const VerifyEmailSuccessPage = () => {
    const {t} = useTranslation()
    const [params] = useSearchParams()
    const already = params.get('already') === '1'

    return (
        <Card
            title={t(already ? 'auth.verifyAlreadyTitle' : 'auth.verifySuccessTitle')}
            subtitle={t(already ? 'auth.verifyAlreadyBody' : 'auth.verifySuccessBody')}>
            <div role="status" aria-live="polite"
                 className="mt-7 flex items-start gap-3 rounded-[10px] border border-sage-600/25 bg-[#eef6ef] px-4 py-3.5 text-ink">
                <span className="mt-0.5 flex-none text-sage-600"><Icon name="check" size={20}/></span>
                <span className="text-[.92rem] leading-relaxed">{t('auth.verifySuccessNote')}</span>
            </div>

            <Link to={authRoutes.login} className={`${PRIMARY} mt-7`}>
                <Icon name="arrow" size={19}/>
                {t('auth.verifyContinue')}
            </Link>

            <p className="mt-4 text-center text-[.86rem] leading-relaxed text-[#33566c]">
                {t('auth.verifySuccessFoot')}
            </p>

            <DemoNote/>
        </Card>
    )
}

/* ---------------------------------------------------------------------------
 * Shared resend form for the two dead-end screens (demo only - no request is made)
 * ------------------------------------------------------------------------- */
const ResendForm = () => {
    const {t} = useTranslation()
    const [email, setEmail] = useState('')
    const [error, setError] = useState<string | undefined>()
    const [sending, setSending] = useState(false)
    const [sentTo, setSentTo] = useState<string | null>(null)
    const [cooldown, setCooldown] = useState(0)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (cooldown <= 0) return
        const timer = window.setTimeout(() => setCooldown((n) => n - 1), 1000)
        return () => window.clearTimeout(timer)
    }, [cooldown])

    const submit = (event: FormEvent) => {
        event.preventDefault()
        const value = email.trim()

        if (!value) {
            setError(t('auth.verifyErrEmailRequired'))
            inputRef.current?.focus()
            return
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
            setError(t('auth.verifyErrEmailInvalid'))
            inputRef.current?.focus()
            return
        }

        setError(undefined)
        setSending(true)
        /* Demo build: nothing is sent. Replace with the resend API call later. */
        window.setTimeout(() => {
            setSending(false)
            setSentTo(value)
            setCooldown(30)
        }, 700)
    }

    if (sentTo) {
        const [before, after] = t('auth.verifyResent').split('%%')
        return (
            <div role="status" aria-live="polite" className="mt-6 text-center">
                <p className="text-[.95rem] leading-relaxed text-[#33566c]">
                    {before}<b className="font-bold">{mask(sentTo)}</b>{after}
                </p>
                <button type="button" disabled={cooldown > 0} className={`${PRIMARY} mt-5`}
                        onClick={() => {
                            setSentTo(null)
                            setEmail('')
                            setCooldown(0)
                            window.setTimeout(() => inputRef.current?.focus(), 0)
                        }}>
                    <Icon name="mail" size={19}/>
                    {cooldown > 0
                        ? t('auth.verifyRetryIn').replace('%%', String(cooldown))
                        : t('auth.verifyUseDifferent')}
                </button>
            </div>
        )
    }

    return (
        <form className="mt-6" onSubmit={submit} noValidate>
            <label htmlFor="verify-email" className="mb-1.5 block text-[.88rem] font-bold text-ink">
                {t('auth.verifyEmailLabel')}
            </label>
            <div className={FIELD}>
                <span className="flex-none text-[#4b7791]"><Icon name="mail" size={18}/></span>
                <input
                    id="verify-email"
                    ref={inputRef}
                    className={INPUT}
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    placeholder="you@example.com"
                    value={email}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? 'verify-email-error' : undefined}
                    onChange={(event) => {
                        setEmail(event.target.value)
                        if (error) setError(undefined)
                    }}
                />
            </div>
            {error &&
                <p id="verify-email-error" role="alert"
                   className="mt-1.5 text-[.84rem] font-bold text-[#b42318]">{error}</p>}

            <button type="submit" className={`${PRIMARY} mt-4`} disabled={sending}>
                <Icon name="mail" size={19}/>
                {sending ? t('auth.verifySending') : t('auth.verifySendNew')}
            </button>
        </form>
    )
}

/* ---------------------------------------------------------------------------
 * /auth/verify-email/expired  -  the 24-hour window has passed
 * ------------------------------------------------------------------------- */
export const VerifyEmailExpiredPage = () => {
    const {t} = useTranslation()
    return (
        <Card title={t('auth.verifyExpiredTitle')} subtitle={t('auth.verifyExpiredSubtitle')}>
            <div role="alert"
                 className="mt-6 flex items-start gap-3 rounded-[10px] border border-[#e0c9a6] bg-[#fdf6ea] px-4 py-3.5 text-[#6b5330]">
                <span className="mt-0.5 flex-none"><Icon name="clock" size={20}/></span>
                <span className="text-[.92rem] leading-relaxed">{t('auth.verifyExpiredNote')}</span>
            </div>
            <ResendForm/>
            <FooterLinks/>
            <DemoNote/>
        </Card>
    )
}

/* ---------------------------------------------------------------------------
 * /auth/verify-email/invalid  -  missing, malformed or already-spent link
 * ------------------------------------------------------------------------- */
export const VerifyEmailInvalidPage = () => {
    const {t} = useTranslation()
    return (
        <Card title={t('auth.verifyInvalidTitle')} subtitle={t('auth.verifyInvalidSubtitle')}>
            <div role="alert"
                 className="mt-6 flex items-start gap-3 rounded-[10px] border border-[#e0c9a6] bg-[#fdf6ea] px-4 py-3.5 text-[#6b5330]">
                <span className="mt-0.5 flex-none"><Icon name="shield" size={20}/></span>
                <span className="text-[.92rem] leading-relaxed">{t('auth.verifyInvalidNote')}</span>
            </div>
            <ResendForm/>
            <FooterLinks/>
            <DemoNote/>
        </Card>
    )
}