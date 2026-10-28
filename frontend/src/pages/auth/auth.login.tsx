import {useState} from 'react'
import {Link, useNavigate} from 'react-router-dom'
import {useAuth} from '../../context/AuthContext'
import {LotusMark} from '../../components/AuthIcons'
import {AuthShell} from '../../layouts/AuthShell'
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
    const {isSigningIn, signIn} = useAuth()
    const navigate = useNavigate()
    const [identifier, setIdentifier] = useState('')
    const [password, setPassword] = useState('')
    const [rememberMe, setRememberMe] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const handleSubmit = async () => {
        try {
            await signIn({identifier, password, remember: rememberMe})
            navigate(authRoutes.dashboard)
        } catch {
            // The real auth service will handle its server response without a temporary UI message.
        }
    }

    return (
        <AuthShell>
            <div
                className="mx-auto mt-0 w-full max-w-141.5 rounded-3xl border border-white/30 bg-[#fffdf4]/98 px-5 pb-7 pt-8 shadow-[0_22px_42px_rgba(9,20,13,.15)] sm:rounded-2xl sm:px-7 sm:pb-8 sm:pt-9 lg:my-auto lg:min-h-[clamp(520px,80svh,860px)] lg:px-9 lg:pb-11.5 lg:pt-10">
                <header className="text-center">
                    <LotusMark width={112} className="mx-auto mb-0 w-24 sm:w-28"/>
                    <h2 className="-mt-1.75 mb-2.5 font-display text-[2.15rem] leading-none tracking-tight text-[#123c2e] sm:text-[clamp(2.35rem,3vw,3.1rem)]">Welcome
                        Back</h2>
                    <p className="m-0 text-[1.05rem] text-[#111]">Login to your account</p>
                </header>

                <form className="mt-7 sm:mt-12 lg:mt-14" onSubmit={(event) => {
                    event.preventDefault();
                    void handleSubmit()
                }}>
                    <label className="mb-7.5 block" htmlFor="identifier">
                        <span className="mb-4 block text-base text-[#131313]">Email Address</span>
                        <span
                            className="flex h-12 items-center gap-3 rounded-[9px] border border-[#292B2B] bg-white px-3 text-[#292B2B] transition focus-within:shadow-[0_0_0_3px_rgba(27,98,75,.12)] lg:h-11"><LoginIcon
                            name="person" size={22}/><input
                            className="w-px min-w-0 flex-1 self-stretch border-0 bg-transparent p-0 font-temple text-base text-[#292B2B] outline-none lg:text-[.9rem]"
                            id="identifier" type="email" autoComplete="email" placeholder="Enter your email address"
                            value={identifier} onChange={(event) => setIdentifier(event.target.value)} required/></span>
                    </label>

                    <label className="mb-7.5 block" htmlFor="password">
                        <span className="mb-4 block text-base text-[#131313]">Password</span>
                        <span
                            className="flex h-12 items-center gap-3 rounded-[9px] border border-[#292B2B] bg-white px-3 text-[#292B2B] transition focus-within:shadow-[0_0_0_3px_rgba(27,98,75,.12)] lg:h-11"><LoginIcon
                            name="key" size={21}/><input
                            className="w-px min-w-0 flex-1 self-stretch border-0 bg-transparent p-0 font-temple text-base text-[#292B2B] outline-none lg:text-[.9rem]"
                            id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password"
                            placeholder="Enter your password" value={password}
                            onChange={(event) => setPassword(event.target.value)} required/><button
                            className="grid h-11 w-11 shrink-0 place-items-center border-0 bg-transparent text-[#292B2B] hover:text-[#1C4F3C] lg:h-9 lg:w-9"
                            type="button" aria-label={showPassword ? 'Hide password' : 'Show password'}
                            onClick={() => setShowPassword((visible) => !visible)}><LoginIcon
                            name={showPassword ? 'eyeOff' : 'eye'} size={19}/></button></span>
                    </label>

                    <div
                        className="-mt-1 mb-8 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[.85rem] lg:mb-10">
                        <label className="inline-flex cursor-pointer items-center gap-2.5 text-[#222]"><input
                            className="h-6 w-6 cursor-pointer rounded-[5px] border-[#292B2B] accent-[#1C4F3C] lg:h-5 lg:w-5"
                            type="checkbox" checked={rememberMe}
                            onChange={(event) => setRememberMe(event.target.checked)}/><span>Remember me</span></label>
                        <Link
                            className="inline-flex min-h-11 items-center text-[.85rem] font-bold text-[#1C4F3C] hover:underline lg:min-h-0 lg:py-0.75"
                            to={authRoutes.forgotPassword}>Forgot password?</Link>
                    </div>

                    <button
                        className="flex min-h-13 w-full items-center justify-center gap-6 rounded-[10px] border border-[#1d5c46] bg-[#1d5c46] text-base font-bold text-white transition hover:-translate-y-px hover:bg-[#154935] hover:shadow-[0_8px_16px_rgba(24,80,61,.24)] disabled:cursor-wait disabled:opacity-75 lg:min-h-12.75"
                        type="submit" disabled={isSigningIn}>
                        <span>{isSigningIn ? 'Signing In…' : 'Sign In'}</span>{!isSigningIn &&
                        <LoginIcon name="arrow" size={25} strokeWidth={2}/>}</button>
                    <div className="mt-4 flex gap-3 sm:block sm:space-y-4">
                        <Link
                            className="flex min-h-13 flex-1 items-center justify-center gap-0 rounded-[10px] border border-[#dce5ef] bg-white text-base font-bold text-white shadow-sm transition hover:-translate-y-px hover:shadow-[0_8px_16px_rgba(50,65,220,.25)] sm:min-h-12.75 sm:w-full sm:gap-4 sm:border-[#4157f4] sm:bg-[#4157f4] sm:shadow-none sm:hover:bg-[#3349e8]"
                            to={authRoutes.google}><GoogleIcon/><span className="sr-only sm:not-sr-only">Continue with Google</span></Link>
                        <Link
                            className="flex min-h-13 flex-1 items-center justify-center gap-0 rounded-[10px] border border-[#dce5ef] bg-white text-base font-bold text-[#292B2B] shadow-sm transition hover:-translate-y-px hover:border-[#1877f2] hover:bg-[#f8fbff] hover:text-[#1877f2] sm:min-h-12.75 sm:w-full sm:gap-4 sm:border-[#a9a9a9] sm:shadow-none"
                            to={authRoutes.facebook}><FacebookIcon/><span className="sr-only sm:not-sr-only">Continue with Facebook</span></Link>
                    </div>
                    <div className="my-6 text-center text-[.84rem] font-bold text-[#656565] sm:my-8">OR</div>
                    <Link
                        className="flex min-h-13 w-full items-center justify-center gap-3.25 rounded-[10px] border border-[#a9a9a9] bg-white text-base font-bold text-[#292B2B] transition hover:border-[#1d5c46] hover:bg-[#f4f7f4] hover:text-[#174634] lg:min-h-12.75"
                        to={authRoutes.register}><LoginIcon name="userPlus"
                                                            size={24}/><span>Create New Account</span></Link>
                </form>
            </div>
        </AuthShell>
    )
}