import {useEffect, useRef, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {Loader} from 'lucide-react'
import {useAuth} from '../../context/AuthContext'
import {homeFor} from '../../data/demoUsers'
import {LotusMark} from '../../components/AuthIcons'
import {type SocialProvider, startSocialProfile} from '../../data/profileCompletion'
import {authRoutes} from '../../routes/authRoutes'

/**
 * Google / Facebook sign-in placeholder.
 *
 * The OAuth apps are not connected yet, so each button "returns" a sample provider profile - a name
 * and an email address, which is all a real provider gives us:
 *
 *     { name: 'Amaya Jayasuriya', email: 'amaya.jayasuriya@gmail.com', emailVerified: true }
 *
 * Those two fields are not enough for a temple account (phone, temple, address, NIC ...), so the
 * visitor is handed to the profile completion portal instead of a dashboard. There they can fill the
 * gaps or skip, and the app keeps asking before any operation that needs them.
 *
 * When the real providers are wired up, replace `PROVIDER_PROFILES[provider]` with the decoded ID
 * token and pass the same {name, email} to `startSocialProfile` - the screens do not change.
 */
const PROVIDER_PROFILES: Record<SocialProvider, {
    name: string;
    email: string;
    identifier: string;
    password: string
}> = {
    Google: {
        name: 'Amaya Jayasuriya',
        email: 'amaya.jayasuriya@gmail.com',
        identifier: 'templeadmin@temple.lk',
        password: 'temple@2026',
    },
    Facebook: {
        name: 'Ruwan Bandara',
        email: 'ruwan.bandara@example.com',
        identifier: 'templeadmin@temple.lk',
        password: 'temple@2026',
    },
}

export const SocialSignInRoute = ({provider}: { provider: SocialProvider }) => {
    const {signIn} = useAuth()
    const navigate = useNavigate()
    const [error, setError] = useState('')
    /* Strict-mode and double-click guard: the provider hand-off runs exactly once. */
    const started = useRef(false)

    useEffect(() => {
        if (started.current) return
        started.current = true
        void (async () => {
            try {
                const profile = PROVIDER_PROFILES[provider]
                const user = await signIn({identifier: profile.identifier, password: profile.password, remember: true})

                /* A provider can never supply the rest - the portal asks for it. */
                startSocialProfile(provider, {name: profile.name, email: profile.email})

                const params = new URLSearchParams({reason: 'welcome', returnTo: homeFor(user.role)})
                navigate(`${authRoutes.completeProfile}?${params.toString()}`, {replace: true})
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
                           href={authRoutes.login}>
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
                            We have your name and email from {provider}. The remaining details are asked on the
                            next screen.
                        </p>
                    </>
                )}
            </div>
        </div>
    )
}