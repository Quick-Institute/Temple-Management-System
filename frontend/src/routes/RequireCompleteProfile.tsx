import type {ReactNode} from 'react'
import {Navigate, useLocation} from 'react-router-dom'
import {useProfileCompletion} from '../data/profileCompletion'
import {authRoutes} from './authRoutes'

/*
 * Wraps the screens that cannot run without the details a social provider does not supply.
 *
 * A visitor who registered with Google / Facebook and chose "skip for now" can move around the app,
 * but the moment they try one of these operations they are sent back to the completion portal with
 * "fill this in to continue", and the screen they wanted is remembered in `returnTo` so they land
 * there as soon as the form is saved.
 *
 * Accounts that never went through a provider have no draft, so their status is 'complete' and the
 * guard is transparent.
 */
export const RequireCompleteProfile = ({children, feature}: { children: ReactNode; feature?: string }) => {
    const {status} = useProfileCompletion()
    const location = useLocation()

    if (status === 'complete') return <>{children}</>

    const params = new URLSearchParams({
        reason: 'blocked',
        returnTo: `${location.pathname}${location.search}`,
    })
    if (feature) params.set('feature', feature)

    return <Navigate to={`${authRoutes.completeProfile}?${params.toString()}`} replace/>
}