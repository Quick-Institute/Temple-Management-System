import {useState} from 'react'
import {Link, useNavigate} from 'react-router-dom'
import {useAuth} from '../../context/AuthContext'
import {homeFor} from '../../data/demoUsers'
import {useTranslation} from 'react-i18next'
import {LotusMark} from '../../components/AuthIcons'
import {AUTH_HEADING, AUTH_SUBTITLE, AuthShell} from '../../layouts/AuthShell'
import {LanguageToggle} from '../../components/LanguageToggle'
import {authRoutes} from '../../routes/authRoutes'

type LoginIconName = 'arrow' | 'eye' | 'eyeOff' | 'key' | 'person' | 'userPlus'
type LoginIconProps = { name: LoginIconName; size?: number; strokeWidth?: number }

const LoginIcon = ({name, size = 24, strokeWidth = 1.8}: LoginIconProps) => {
    const paths = {
        person: <>
            <circle cx="12" cy="7" r="3.6"/>
            <path d="M4.5 20.5v-1.7c0-3.5 3.3-5.7 7.5-5.7s7.5 2.2 7.5 5.7v1.7"/>
        </>,
        key: <>
            <circle cx="8.5" cy="15.5" r="3.5"/>
            <path d="m11 13 8-8M16 5h3v3M14 7l3 3"/>
        </>,
        arrow: <>
            <path d="M4 12h16M14 6l6 6-6 6"/>
        </>,
        userPlus: <>
            <circle cx="9" cy="8" r="3"/>
            <path d="M3.5 20v-1.5C3.5 15.9 5.9 14 9 14s5.5 1.9 5.5 4.5V20M18 8v7M14.5 11.5h7"/>
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
    }
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
                aria-hidden="true">{paths[name]}</svg>
}

const GoogleIcon = () => (
    <svg className="h-7 w-7" viewBox="0 0 24 24" aria-hidden="true">
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
    <svg className="h-7 w-7" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="10" fill="#1877F2"/>
        <path fill="#fff"
              d="M13.28 19v-6.1h2.05l.31-2.37h-2.36V9.02c0-.69.19-1.16 1.18-1.16h1.26V5.74a16.91 16.91 0 0 0-1.84-.1c-1.82 0-3.07 1.11-3.07 3.15v1.74H8.75v2.37h2.06V19h2.47Z"/>
    </svg>
)

export const AuthLoginPage = () => {
    const {t} = useTranslation()
    const {isSigningIn, signIn} = useAuth()
    const navigate = useNavigate()
    const [identifier, setIdentifier] = useState('')
    const [password, setPassword] = useState('')
    const [rememberMe, setRememberMe] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async () => {
        setError('')
        try {
            const user = await signIn({identifier, password, remember: rememberMe})
            /* Each user type lands on its own home screen. */
            navigate(homeFor(user.role))
        } catch (signInError) {
            setError(signInError instanceof Error ? signInError.message : 'Sign-in failed. Please try again.')
        }
    }

    return (
        <AuthShell>
            <div
                className="relative mx-auto mt-0 w-full max-w-141.5 rounded-3xl border border-white/40 bg-[linear-gradient(180deg,#f2fafe_0%,#e8f6fe_100%)] px-5 pb-7 pt-8 shadow-[0_26px_60px_-18px_rgba(4,24,43,.55)] sm:rounded-2xl sm:px-7 sm:pb-8 sm:pt-9 lg:my-auto lg:min-h-[clamp(520px,80svh,860px)] lg:px-9 lg:pb-11.5 lg:pt-10">
                {/* Language switch, inside the card's top corner on every auth screen. */}
                <LanguageToggle tone="card" label={false} className="absolute top-3 right-3 z-10"/>

                <header className="text-center">
                    <LotusMark width={168} className="mx-auto mb-1"/>
                    {/*
                      * Lotus, heading, subtitle - exactly the three lines the register, forgot-password
                      * and reset-password cards show. The little blue divider that used to sit under
                      * this heading was the only thing still making the login card look different.
                      */}
                    <h1 className={AUTH_HEADING}>{t('auth.welcomeBack')}</h1>
                    <p className={AUTH_SUBTITLE}>{t('auth.loginTitle')}</p>
                </header>

                <form className="mt-7 sm:mt-12 lg:mt-14" onSubmit={(event) => {
                    event.preventDefault();
                    void handleSubmit()
                }}>
                    <label className="mb-7.5 block" htmlFor="identifier">
                        <span className="mb-4 block text-base text-[#131313]">{t('auth.email')}</span>
                        <span
                            className="flex h-12 items-center gap-3 rounded-[9px] border border-[#6f9db8] bg-white px-3 text-[#2c5468] transition focus-within:shadow-[0_0_0_3px_rgba(2,132,199,.16)] lg:h-11"><LoginIcon
                            name="person" size={22}/><input
                            className="w-px min-w-0 flex-1 self-stretch border-0 bg-transparent p-0 font-temple text-base outline-none placeholder:text-[#8299a8] lg:text-[.9rem]"
                            id="identifier" type="email" autoComplete="email" placeholder={t('auth.emailPlaceholder')}
                            value={identifier} onChange={(event) => setIdentifier(event.target.value)} required/></span>
                    </label>

                    <label className="mb-7.5 block" htmlFor="password">
                        <span className="mb-4 block text-base text-[#131313]">{t('auth.password')}</span>
                        <span
                            className="flex h-12 items-center gap-3 rounded-[9px] border border-[#6f9db8] bg-white px-3 text-[#2c5468] transition focus-within:shadow-[0_0_0_3px_rgba(2,132,199,.16)] lg:h-11"><LoginIcon
                            name="key" size={21}/><input
                            className="w-px min-w-0 flex-1 self-stretch border-0 bg-transparent p-0 font-temple text-base text-ink outline-none lg:text-[.9rem]"
                            id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password"
                            placeholder={t('auth.passwordPlaceholder')} value={password}
                            onChange={(event) => setPassword(event.target.value)} required/><button
                            className="grid h-11 w-11 shrink-0 place-items-center border-0 bg-transparent text-[#4a7c96] hover:text-sage-600 lg:h-9 lg:w-9"
                            type="button" aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                            onClick={() => setShowPassword((visible) => !visible)}><LoginIcon
                            name={showPassword ? 'eyeOff' : 'eye'} size={19}/></button></span>
                    </label>

                    <div
                        className="-mt-1 mb-8 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[.85rem] lg:mb-10">
                        <label className="inline-flex cursor-pointer items-center gap-2.5 text-[#222]"><input
                            className="h-6 w-6 cursor-pointer rounded-[5px] border-[#6f9db8] accent-sage-600 lg:h-5 lg:w-5"
                            type="checkbox" checked={rememberMe}
                            onChange={(event) => setRememberMe(event.target.checked)}/><span>{t('auth.remember')}</span></label>
                        <Link
                            className="inline-flex min-h-11 items-center text-[.85rem] font-bold text-sage-600 hover:underline lg:min-h-0 lg:py-0.75"
                            to={authRoutes.forgotPassword}>{t('auth.forgot')}</Link>
                    </div>

                    <button
                        className="flex min-h-13 w-full items-center justify-center gap-6 rounded-[10px] border border-sage-600 bg-sage-600 text-base font-bold text-white transition hover:-translate-y-px hover:bg-sage-700 hover:shadow-[0_8px_16px_rgba(2,132,199,.24)] disabled:cursor-wait disabled:opacity-75 lg:min-h-12.75"
                        type="submit" disabled={isSigningIn}>
                        <span>{isSigningIn ? t('auth.signingIn') : t('auth.signIn')}</span>{!isSigningIn &&
                        <LoginIcon name="arrow" size={25} strokeWidth={2}/>}</button>
                    <div className="mt-4 flex gap-3 sm:block sm:space-y-4">
                        <Link
                            className="flex min-h-13 flex-1 items-center justify-center gap-0 rounded-[10px] border border-[#9dc2d6] bg-white text-base font-bold text-ink shadow-sm transition hover:-translate-y-px hover:border-sage-600 hover:bg-cream sm:min-h-12.75 sm:w-full sm:gap-4"
                            to={authRoutes.google}><GoogleIcon/><span
                            className="sr-only sm:not-sr-only">{t('auth.continueGoogle')}</span></Link>
                        <Link
                            className="flex min-h-13 flex-1 items-center justify-center gap-0 rounded-[10px] border border-[#dce5ef] bg-white text-base font-bold text-[#2c5468] shadow-sm transition hover:-translate-y-px hover:border-[#1877f2] hover:bg-[#f8fbff] hover:text-[#1877f2] sm:min-h-12.75 sm:w-full sm:gap-4 sm:border-[#9dc2d6] sm:shadow-none"
                            to={authRoutes.facebook}><FacebookIcon/><span
                            className="sr-only sm:not-sr-only">{t('auth.continueFacebook')}</span></Link>
                    </div>
                    {error && (
                        <p className="mt-4 rounded-[10px] border border-[#f3c5c5] bg-[#fdf0f0] px-3 py-2 text-[.85rem] font-semibold text-[#a3231c]"
                           role="alert">{error}</p>
                    )}

                    <div
                        className="my-6 text-center text-[.84rem] font-bold text-[#656565] sm:my-8">{t('common.or')}</div>
                    <Link
                        className="flex min-h-13 w-full items-center justify-center gap-3.25 rounded-[10px] border border-[#9dc2d6] bg-white text-base font-bold text-[#2c5468] transition hover:border-sage-600 hover:bg-[#eff8ff] hover:text-sage-700 lg:min-h-12.75"
                        to={authRoutes.register}><LoginIcon name="userPlus"
                                                            size={24}/><span>{t('auth.createAccount')}</span></Link>
                </form>
            </div>
        </AuthShell>
    )
}