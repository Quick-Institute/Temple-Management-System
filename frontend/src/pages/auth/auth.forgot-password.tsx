import type {FormEvent} from 'react'
import {useEffect, useRef, useState} from 'react'
import {Link, useNavigate} from 'react-router-dom'
import {LotusMark} from '../../components/AuthIcons'
import {AuthShell} from '../../layouts/AuthShell'
import {authRoutes} from '../../routes/authRoutes'

type ResetIconName = 'arrow' | 'check' | 'key' | 'mail' | 'person' | 'shield'

const ResetIcon = ({name, size = 22}: { name: ResetIconName; size?: number }) => {
    const paths = {
        mail: <>
            <rect x="2.8" y="5" width="18.4" height="14" rx="2.4"/>
            <path d="m3.6 7 8.4 6.2L20.4 7"/>
        </>,
        person: <>
            <circle cx="12" cy="7" r="3.6"/>
            <path d="M4.5 20.5v-1.7c0-3.5 3.3-5.7 7.5-5.7s7.5 2.2 7.5 5.7v1.7"/>
        </>,
        key: <>
            <circle cx="8.5" cy="15.5" r="3.5"/>
            <path d="m11 13 8-8M16 5h3v3M14 7l3 3"/>
        </>,
        arrow: <path d="M4 12h16M14 6l6 6-6 6"/>,
        check: <>
            <circle cx="12" cy="12" r="9"/>
            <path d="m7.5 12.4 3.2 3.2 6-6.4"/>
        </>,
        shield: <>
            <path d="M12 21c4.4-1.9 7-5.2 7-9.4V5.6L12 3 5 5.6v6c0 4.2 2.6 7.5 7 9.4Z"/>
            <path d="m9 12 2.2 2.2L15.4 10"/>
        </>,
    }

    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}


/** Card shell matching the login screen: cream card, gold lotus, Petrona heading. */
const CARD = 'mx-auto mt-0 w-full max-w-141.5 rounded-[24px] border border-white/30 bg-[#fffdf4]/[.98] px-5 pb-7 pt-8 shadow-[0_22px_42px_rgba(9,20,13,.15)] sm:rounded-2xl sm:px-7 sm:pb-8 sm:pt-9 lg:px-12 lg:pb-11 lg:pt-10'
const FIELD = 'flex h-12 items-center gap-3 rounded-[9px] border border-[#292B2B] bg-white px-3 text-[#292B2B] transition focus-within:shadow-[0_0_0_3px_rgba(27,98,75,.12)] lg:h-11'
const INPUT = 'w-px min-w-0 flex-1 self-stretch border-0 bg-transparent p-0 font-temple text-base text-[#292B2B] outline-none placeholder:text-[#292B2B] lg:text-[.95rem]'
const PRIMARY = 'flex min-h-13 w-full items-center justify-center gap-3 rounded-[10px] border border-[#1d5c46] bg-[#1d5c46] text-base font-bold text-white transition hover:-translate-y-px hover:bg-[#154935] hover:shadow-[0_8px_16px_rgba(24,80,61,.24)] disabled:cursor-wait disabled:opacity-75 lg:min-h-12.75'

/** of***@domain.lk — enough to recognise, not enough to leak the whole address. */
const mask = (value: string) => {
    const [user = '', domain = ''] = value.split('@')
    return `${user.slice(0, 2)}${'*'.repeat(Math.max(3, user.length - 2))}@${domain}`
}

export const ForgotPasswordPage = () => {
    const navigate = useNavigate()
    const [identifier, setIdentifier] = useState('')
    const [error, setError] = useState<string | undefined>()
    const [sending, setSending] = useState(false)
    const [sentTo, setSentTo] = useState<string | null>(null)
    const [cooldown, setCooldown] = useState(0)
    const [resent, setResent] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    /* Resend cooldown — 30 seconds, counted down without another round trip. */
    useEffect(() => {
        if (cooldown <= 0) return
        const timer = window.setTimeout(() => setCooldown((n) => n - 1), 1000)
        return () => window.clearTimeout(timer)
    }, [cooldown])

    const submit = (event: FormEvent) => {
        event.preventDefault()
        const value = identifier.trim()

        if (!value) {
            setError('Enter your registered email address.')
            inputRef.current?.focus()
            return
        }
        const looksEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)
        if (!looksEmail) {
            setError('Enter a valid email address, for example you@example.com.')
            inputRef.current?.focus()
            return
        }

        setError(undefined)
        setSending(true)
        // Demo build: nothing is sent — the confirmation state is shown immediately.
        window.setTimeout(() => {
            setSending(false)
            setSentTo(value)
            setCooldown(30)
        }, 700)
    }

    /* ---------------------------- Step 2 ---------------------------- */
    if (sentTo) {
        return (
            <AuthShell>
                <div className={CARD}>
                    <header className="text-center">
                        <LotusMark width={112} className="mx-auto mb-0"/>
                        <h1 className="mb-2.5 mt-1 font-display text-[1.9rem] leading-none tracking-tight text-[#123c2e] sm:text-[clamp(2rem,2.6vw,2.7rem)]">
                            Check your inbox
                        </h1>
                        <p className="m-0 text-[1.02rem] leading-relaxed text-[#111]">
                            If an account matches <b className="font-bold">{mask(sentTo)}</b>, a password reset link is
                            on
                            its way.
                        </p>
                    </header>

                    <div role="status" aria-live="polite"
                         className="mt-7 flex items-start gap-3 rounded-[10px] border border-[#1d5c46]/25 bg-[#eef6ef] px-4 py-3.5 text-[#1f2d26]">
                        <span className="mt-0.5 flex-none text-[#1d5c46]"><ResetIcon name="check" size={20}/></span>
                        <span className="text-[.92rem] leading-relaxed">
                            The link can be used once and expires in <b className="font-bold">30 minutes</b>. If it has not
                            arrived in a few minutes, check the spam folder.
                        </span>
                    </div>

                    <ul className="mt-6 space-y-2.5 text-[.92rem] leading-relaxed text-[#2c3a31]">
                        <li className="flex gap-2.5">
                            <span className="mt-0.5 flex-none text-[#1d5c46]"><ResetIcon name="mail" size={18}/></span>
                            <span>The link opens a page where you choose a new password. Your current password keeps working
                                until then.</span>
                        </li>
                        <li className="flex gap-2.5">
                            <span className="mt-0.5 flex-none text-[#1d5c46]"><ResetIcon name="shield"
                                                                                         size={18}/></span>
                            <span>Nobody from the temple or the system provider will ever ask you for your password or for
                                the reset link.</span>
                        </li>
                        <li className="flex gap-2.5">
                            <span className="mt-0.5 flex-none text-[#1d5c46]"><ResetIcon name="person"
                                                                                         size={18}/></span>
                            <span>No access to that inbox or phone number? Ask your temple’s Temple Admin or
                                Co-Administrator to recover the account for you.</span>
                        </li>
                    </ul>

                    <button className={`${PRIMARY} mt-7`} type="button" disabled={cooldown > 0}
                            onClick={() => {
                                setResent(true)
                                setCooldown(30)
                            }}>
                        <ResetIcon name="mail" size={19}/>
                        {cooldown > 0 ? `Send again in ${cooldown}s` : 'Send the link again'}
                    </button>

                    {resent && cooldown > 0 &&
                        <p role="status" className="mt-2.5 text-center text-[.86rem] text-[#3d6b52]">
                            A new link has been sent to {mask(sentTo)}.
                        </p>}

                    <div
                        className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 border-t border-[#d9d3bf] pt-5 text-[.94rem]">
                        <Link to={authRoutes.login}
                              className="inline-flex min-h-11 items-center px-1 font-bold text-[#14512f] hover:underline lg:min-h-0">
                            Back to sign in
                        </Link>
                        <span aria-hidden="true" className="text-[#9a9484]">·</span>
                        <button type="button"
                                className="inline-flex min-h-11 items-center px-1 font-bold text-[#14512f] hover:underline lg:min-h-0"
                                onClick={() => {
                                    setSentTo(null)
                                    setResent(false)
                                    setCooldown(0)
                                    setIdentifier('')
                                    window.setTimeout(() => inputRef.current?.focus(), 0)
                                }}>
                            Use a different address
                        </button>
                    </div>
                </div>
            </AuthShell>
        )
    }

    /* ---------------------------- Step 1 ---------------------------- */
    return (
        <AuthShell>
            <div className={CARD}>
                <header className="text-center">
                    <LotusMark width={112} className="mx-auto mb-0"/>
                    <h1 className="mb-2.5 mt-1 font-display text-[1.9rem] leading-none tracking-tight text-[#123c2e] sm:text-[clamp(2rem,2.6vw,2.7rem)]">
                        Reset your password
                    </h1>
                    <p className="m-0 text-[1.02rem] text-[#111]">
                        Enter your registered email address and we will send a reset link.
                    </p>
                </header>

                <form className="mt-7 sm:mt-9" onSubmit={submit} noValidate>
                    <label className="block" htmlFor="reset-identifier">
                        <span className="mb-3 block text-base text-[#131313]">Email Address</span>
                        <span
                            className={`${FIELD} ${error ? 'border-status-rose shadow-[0_0_0_3px_rgba(173,28,3,.12)]' : ''}`}>
                            <ResetIcon name="person" size={21}/>
                            <input
                                ref={inputRef}
                                id="reset-identifier"
                                className={INPUT}
                                type="email"
                                autoComplete="email"
                                inputMode="email"
                                autoCapitalize="none"
                                spellCheck={false}
                                placeholder="Enter your registered email address"
                                value={identifier}
                                aria-invalid={Boolean(error) || undefined}
                                aria-describedby={error ? 'reset-identifier-error' : undefined}
                                onChange={(event) => {
                                    setIdentifier(event.target.value)
                                    setError(undefined)
                                }}/>
                        </span>
                    </label>
                    {error &&
                        <span id="reset-identifier-error" role="alert"
                              className="mt-2 block text-[.8rem] leading-snug text-status-rose">{error}</span>}

                    <button className={`${PRIMARY} mt-7`} type="submit" disabled={sending}>
                        {sending ? 'Sending…' : 'Send reset link'} <ResetIcon name="arrow" size={19}/>
                    </button>

                    <p className="mt-4 text-center text-[.88rem] leading-relaxed text-[#5d6b62]">
                        The reset link is sent to your registered email address.
                        <br className="hidden sm:inline"/> If it has not arrived in a few minutes, check the spam
                        folder.
                    </p>
                </form>

                <div
                    className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 border-t border-[#d9d3bf] pt-5 text-[.94rem]">
                    <Link to={authRoutes.login}
                          className="inline-flex min-h-11 items-center px-1 font-bold text-[#14512f] hover:underline lg:min-h-0">
                        Back to sign in
                    </Link>
                    <span aria-hidden="true" className="text-[#9a9484]">·</span>
                    <button type="button"
                            className="inline-flex min-h-11 items-center px-1 font-bold text-[#14512f] hover:underline lg:min-h-0"
                            onClick={() => navigate(authRoutes.register)}>
                        Create an account
                    </button>
                </div>
            </div>
        </AuthShell>
    )
}