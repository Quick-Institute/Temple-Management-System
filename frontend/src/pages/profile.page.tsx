import {LogOut, UserRound} from 'lucide-react'
import {useAuth} from '../context/AuthContext'

export const ProfilePage = () => {
    const {user, signOut} = useAuth()

    return (
        <div className="mx-auto flex max-w-208 flex-col gap-4">
            <div className="card flex flex-col items-center gap-3 px-6 py-12 text-center">
                <span
                    className="grid h-16 w-16 place-items-center rounded-full bg-cream text-sage-800 ring-1 ring-line">
                    <UserRound size={26} strokeWidth={1.7}/>
                </span>
                <div>
                    <h1 className="font-temple text-[1.5rem] leading-tight text-sage-900">
                        {user?.name ?? 'My profile'}
                    </h1>
                    <p className="mt-1 text-[0.92rem] text-ink-soft">
                        {user?.roleLabel ?? 'Signed in'}
                        {user?.templeName ? ` · ${user.templeName}` : ''}
                    </p>
                </div>
                <p className="max-w-136 text-[0.92rem] leading-relaxed text-muted">
                    Profile details are not shown for now. This screen will be filled in once the
                    personal details and contact fields are agreed.
                </p>
                <button className="btn btn-secondary mt-1" onClick={signOut}>
                    <LogOut size={15}/> Sign out
                </button>
            </div>
        </div>
    )
}