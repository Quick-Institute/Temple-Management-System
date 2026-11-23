import {Link, useLocation} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import {useProfileCompletion} from '../data/profileCompletion'
import {authRoutes} from '../routes/authRoutes'

/*
 * Reminder for accounts created with Google / Facebook that still miss the details the provider
 * could not give us. It sits at the top of the shell so "you can edit this later" is not a promise
 * the app forgets about, and it disappears the moment the portal is saved.
 */
export const ProfileIncompleteBanner = () => {
    const {t} = useTranslation()
    const location = useLocation()
    const {status, missing, draft} = useProfileCompletion()

    /* Nothing to say for email/password accounts, or once the form is complete. */
    if (!draft || status === 'complete') return null

    const params = new URLSearchParams({
        reason: 'edit',
        returnTo: `${location.pathname}${location.search}`,
    })

    return (
        <div
            className="mb-4 flex flex-col gap-2 rounded-xl border border-[#f0d9a8] bg-[#fff8e8] px-4 py-3 text-[0.86rem] leading-relaxed text-[#7a5312] sm:flex-row sm:items-center sm:justify-between"
            role="status">
            <p>
                <strong className="font-bold">
                    {status === 'skipped' ? t('banner.skippedTitle') : t('banner.pendingTitle')}
                </strong>{' '}
                {t('banner.body', {count: missing.length, provider: draft.provider})}
            </p>
            <Link
                className="inline-flex shrink-0 items-center justify-center rounded-lg border border-[#c9a457] bg-white px-3 py-1.5 text-[0.84rem] font-bold text-[#7a5312] transition hover:bg-[#fff2d6]"
                to={`${authRoutes.completeProfile}?${params.toString()}`}>
                {t('banner.action')}
            </Link>
        </div>
    )
}