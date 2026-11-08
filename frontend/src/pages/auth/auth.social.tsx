import {useEffect, useRef, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {Loader} from 'lucide-react'
import {useAuth} from '../../context/AuthContext'
import {homeFor} from '../../data/demoUsers'
import {LotusMark} from '../../components/AuthIcons'

/**
 * Google / Facebook sign-in placeholder.
 *
 * The OAuth apps are not connected yet, so for now both buttons sign the visitor in as the Temple
 * Admin demo account and land on its dashboard. When the real providers are wired up, replace the
 * body of `signIn` below with the provider callback - the screens do not change.
 */
const SOCIAL_DEMO_ACCOUNT = {
    identifier: 'templeadmin@temple.lk',
    password: 'temple@2026',
    remember: true,
} as const

export const SocialSignInRoute = ({provider}: { provider: 'Google' | 'Facebook' }) => {
    const {signIn} = useAuth()
    const navigate = useNavigate()
    const [error, setError] = useState('')
    /* Strict-mode and double-click guard: the demo account is signed in exactly once. */
    const started = useRef(false)

    useEffect(() => {
        if (started.current) return
        started.current = true
        void (async () => {
            try {
                const user = await signIn({...SOCIAL_DEMO_ACCOUNT})
                navigate(homeFor(user.role), {replace: true})
            } catch {
                setError(`Could not continue with ${provider}. Please sign in with your email instead.`)
            }
        })()
    }, [navigate, provider, signIn])

    return (
        <div className="grid min-h-svh place-items-center bg-[linear-gradient(180deg,#f2fafe_0%,#e8f6fe_100%)] px-5">
            <div
                className="w-full max-w-104 rounded-2xl border border-white/60 bg-white/80 px-6 py-9 text-center shadow-[0_22px_46px_rgba(8,47,73,.14)]">
                <LotusMark width={132} className="mx-auto mb-2"/>

                {error ? (
                    <>
                        <h1 className="mt-2 font-arial text-[1.35rem] font-black text-sage-900">
                            Sign-in did not finish
                        </h1>
                        <p className="mt-1.5 text-[0.92rem] text-[#33566c]" role="alert">{error}</p>
                        <a className="mt-4 inline-flex min-h-11 items-center justify-center rounded-[10px] bg-sage-600 px-4 text-[0.95rem] font-bold text-white hover:bg-sage-700"
                           href="/auth/login">
                            Back to sign in
                        </a>
                    </>
                ) : (
                    <>
                        <p className="inline-flex items-center gap-2 rounded-full bg-[#eef8ff] px-3 py-1 text-[0.74rem] font-bold tracking-widest text-sage-700 uppercase">
                            <Loader size={13} className="animate-spin"/> {provider}
                        </p>
                        <h1 className="mt-3 font-arial text-[1.35rem] font-black text-sage-900">
                            Signing you in
                        </h1>
                        <p className="mt-1.5 text-[0.92rem] text-[#33566c]">
                            Continuing with {provider} as the Temple Admin demo account.
                        </p>
                    </>
                )}
            </div>
        </div>
    )
}