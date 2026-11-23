import type {FormEvent} from 'react'
import {useMemo, useState} from 'react'
import {Link, useNavigate, useSearchParams} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import {LotusMark} from '../../components/AuthIcons'
import {LanguageToggle} from '../../components/LanguageToggle'
import {SelectField} from '../../components/SelectField'
import {AUTH_HEADING, AUTH_SUBTITLE, AuthShell} from '../../layouts/AuthShell'
import {districtOptions, findTempleByCode, TEMPLES} from '../../data/temples'
import {
    type CompletionField,
    type CompletionRole,
    type ProfileDraft,
    useProfileCompletion,
} from '../../data/profileCompletion'
import {homeFor} from '../../data/demoUsers'
import {useAuth} from '../../context/AuthContext'
import {authRoutes} from '../../routes/authRoutes'

/*
 * Profile completion portal - the step after "Continue with Google / Facebook".
 *
 * A provider gives back a name and an email address and nothing else. The temple account still needs
 * a phone number, a temple, an address and so on, so this screen asks for exactly those fields:
 *
 *   /auth/complete-profile                              first visit after a social sign-up
 *   /auth/complete-profile?reason=blocked&returnTo=…    bounced here from a screen that needs them
 *   /auth/complete-profile?reason=edit                   opened from the reminder banner
 *
 * The visitor may leave it for later ("Skip for now"). The fields stay saved, a banner keeps
 * reminding them, and the screens that cannot work without the details send them back here with
 * "fill this in to continue".
 *
 * Nothing is sent to the server - the draft lives in localStorage (see data/profileCompletion.ts).
 */

const CARD =
    'relative mx-auto mt-0 w-full max-w-141.5 rounded-[24px] border border-white/40 bg-[linear-gradient(180deg,#f2fafe_0%,#e8f6fe_100%)] px-5 pb-7 pt-8 shadow-[0_26px_60px_-18px_rgba(4,24,43,.55)] sm:rounded-2xl sm:px-7 sm:pb-8 sm:pt-9 lg:my-auto lg:px-10 lg:pb-10 lg:pt-9'
const FIELD = 'flex h-12 items-center gap-3 rounded-[9px] border border-[#6f9db8] bg-white px-3 text-[#0f2b3d] transition placeholder:text-[#8299a8] focus-within:shadow-[0_0_0_3px_rgba(2,132,199,.16)] lg:h-11'
const INPUT = 'w-px min-w-0 flex-1 self-stretch border-0 bg-transparent p-0 font-temple text-base text-[#0f2b3d] outline-none placeholder:text-[#8299a8] lg:text-[.95rem]'
const LABEL = 'mb-1.5 block text-[0.86rem] font-semibold text-[#0f2b3d]'
const PRIMARY = 'flex min-h-13 w-full items-center justify-center gap-3 rounded-[10px] border border-[#0284c7] bg-[#0284c7] text-base font-bold text-white transition hover:-translate-y-px hover:bg-[#0369a1] hover:shadow-[0_8px_16px_rgba(24,80,61,.24)] lg:min-h-12.75'
const SECONDARY = 'flex min-h-12 w-full items-center justify-center rounded-[10px] border border-[#9dc2d6] bg-white text-[0.95rem] font-bold text-[#2c5468] transition hover:border-sage-600 hover:bg-[#eff8ff] hover:text-sage-700'
const ERROR = 'mt-1 text-[0.8rem] font-semibold text-[#a3231c]'

const ROLES: { key: CompletionRole; labelKey: string; noteKey: string }[] = [
    {key: 'family-user', labelKey: 'complete.roleFamily', noteKey: 'complete.roleFamilyNote'},
    {key: 'committee-member', labelKey: 'complete.roleCommittee', noteKey: 'complete.roleCommitteeNote'},
    {key: 'temple-admin', labelKey: 'complete.roleAdmin', noteKey: 'complete.roleAdminNote'},
]

const DESIGNATIONS: Record<CompletionRole, string[]> = {
    'temple-admin': ['Chief Incumbent Monk', 'Authorized Religious Representative', 'Designated Technical Administrator'],
    'committee-member': ['President', 'Vice-President', 'Secretary', 'Assistant Secretary', 'Treasurer', 'Committee Member'],
    'family-user': ['Devotee', 'Dayaka Family Member', 'Volunteer'],
}

const COMMITTEES = ['Dayaka Sabhawa', 'Event or Programme Committee']

const NIC_PATTERN = /^(?:\d{9}[vVxX]|\d{12})$/
const POSTAL_PATTERN = /^\d{5}$/
const PHONE_PATTERN = /^0\d{9}$/

/** Errors the portal can raise on its own - the API will own these rules later. */
type Errors = Partial<Record<CompletionField | 'templeCodeUnknown', string>>

export const CompleteProfilePage = () => {
    const {t} = useTranslation()
    const navigate = useNavigate()
    const [params] = useSearchParams()
    const {user} = useAuth()
    const {draft, status, missing, save, skip, patch} = useProfileCompletion()

    const reason = params.get('reason') ?? 'welcome'
    const returnTo = params.get('returnTo') || (user ? homeFor(user.role) : '/dashboard')
    const blockedFeature = params.get('feature') ?? ''

    const [errors, setErrors] = useState<Errors>({})
    const [flash, setFlash] = useState('')

    const districts = useMemo(() => districtOptions('en'), [])
    const templeCodes = useMemo(() => TEMPLES.map((temple) => temple.code), [])

    /* No social sign-up in progress - the visitor typed the URL or cleared the browser data. */
    if (!draft) {
        return (
            <AuthShell variant="signup">
                <div className={CARD}>
                    <LanguageToggle tone="card" label={false} className="absolute top-3 right-3 z-10"/>
                    <header className="text-center">
                        <LotusMark width={168} className="mx-auto mb-1"/>
                        <h1 className={AUTH_HEADING}>{t('complete.emptyTitle')}</h1>
                        <p className={AUTH_SUBTITLE}>{t('complete.emptyBody')}</p>
                    </header>
                    <Link className={`${PRIMARY} mt-6`} to={authRoutes.login}>{t('complete.emptyAction')}</Link>
                </div>
            </AuthShell>
        )
    }

    const set = (field: keyof ProfileDraft, value: string | boolean) => {
        patch({[field]: value} as Partial<ProfileDraft>)
        setErrors((current) => ({...current, [field]: undefined, templeCodeUnknown: undefined}))
        setFlash('')
    }

    const validate = (): Errors => {
        const next: Errors = {}
        const role = draft.role

        if (!role) {
            next.role = t('complete.errRole')
            return next
        }

        if (!PHONE_PATTERN.test(draft.phone.trim())) next.phone = t('complete.errPhone')
        if (!draft.designation.trim()) next.designation = t('complete.errRequired')

        if (role !== 'temple-admin') {
            if (!draft.templeCode.trim()) next.templeCode = t('complete.errRequired')
            else if (!findTempleByCode(draft.templeCode.trim())) next.templeCodeUnknown = t('complete.errTempleUnknown')
            if (!draft.village.trim()) next.village = t('complete.errRequired')
            if (!draft.district.trim()) next.district = t('complete.errRequired')
        }

        if (role === 'committee-member' && !draft.committee.trim()) next.committee = t('complete.errRequired')

        if (role === 'family-user') {
            if (!POSTAL_PATTERN.test(draft.postalCode.trim())) next.postalCode = t('complete.errPostal')
            if (!draft.address.trim()) next.address = t('complete.errRequired')
            if (!NIC_PATTERN.test(draft.nic.trim())) next.nic = t('complete.errNic')
        }

        if (!draft.agreedToTerms) next.agreedToTerms = t('complete.errTerms')
        return next
    }

    const onSave = (event: FormEvent) => {
        event.preventDefault()
        const found = validate()
        setErrors(found)
        if (Object.keys(found).length > 0) {
            setFlash('')
            return
        }

        const result = save()
        if (result.missing.length === 0) {
            if (reason === 'blocked') setFlash(t('complete.savedContinue'))
            navigate(returnTo, {replace: true})
        }
    }

    const onSkip = () => {
        skip()
        navigate(returnTo, {replace: true})
    }

    const role = draft.role
    const showTemple = role !== '' && role !== 'temple-admin'
    const showFamily = role === 'family-user'
    const showCommittee = role === 'committee-member'

    return (
        <AuthShell variant="signup">
            <div className={CARD}>
                <LanguageToggle tone="card" label={false} className="absolute top-3 right-3 z-10"/>

                <header className="text-center">
                    <LotusMark width={168} className="mx-auto mb-1"/>
                    <h1 className={AUTH_HEADING}>{t('complete.title')}</h1>
                    <p className={AUTH_SUBTITLE}>
                        {t('complete.subtitle', {provider: draft.provider})}
                    </p>
                </header>

                {/* Why we are here: blocked from a screen, or just after the provider hand-off. */}
                {reason === 'blocked' && (
                    <div
                        className="mt-4 rounded-[10px] border border-[#f0d9a8] bg-[#fff8e8] px-3.5 py-3 text-[0.85rem] leading-relaxed text-[#7a5312]"
                        role="alert">
                        <strong className="font-bold">{t('complete.blockedTitle')}</strong>{' '}
                        {blockedFeature
                            ? t('complete.blockedBodyFeature', {feature: blockedFeature})
                            : t('complete.blockedBody')}
                    </div>
                )}

                {reason === 'edit' && (
                    <div
                        className="mt-4 rounded-[10px] border border-[#bcd9ea] bg-white/70 px-3.5 py-3 text-[0.85rem] leading-relaxed text-[#33566c]">
                        {t('complete.editBanner')}
                    </div>
                )}

                {status === 'skipped' && reason !== 'blocked' && (
                    <div
                        className="mt-4 rounded-[10px] border border-[#bcd9ea] bg-white/70 px-3.5 py-3 text-[0.85rem] leading-relaxed text-[#33566c]">
                        {t('complete.skippedBanner', {count: missing.length})}
                    </div>
                )}

                {/* What the provider already gave us - read only. */}
                <div className="mt-5 rounded-[10px] border border-[#d5e6f0] bg-white/70 px-3.5 py-3">
                    <p className="text-[0.72rem] font-bold tracking-[.12em] text-[#5b7285] uppercase">
                        {t('complete.fromProvider', {provider: draft.provider})}
                    </p>
                    <div className="mt-1.5 grid gap-1 sm:grid-cols-2">
                        <p className="text-[0.9rem] text-ink">
                            <span className="text-[#5b7285]">{t('complete.name')}: </span>
                            <strong className="font-semibold">{draft.providerName || '-'}</strong>
                        </p>
                        <p className="text-[0.9rem] break-all text-ink">
                            <span className="text-[#5b7285]">{t('complete.email')}: </span>
                            <strong className="font-semibold">{draft.providerEmail || '-'}</strong>
                        </p>
                    </div>
                    <p className="mt-1.5 text-[0.78rem] leading-relaxed text-[#5b7285]">
                        {t('complete.providerNote', {provider: draft.provider})}
                    </p>
                </div>

                <form className="mt-5 space-y-4" onSubmit={onSave} noValidate>
                    {/* Role decides which of the fields below are needed. */}
                    <fieldset>
                        <legend className={LABEL}>{t('complete.fieldRole')}</legend>
                        <div className="grid gap-2 sm:grid-cols-3">
                            {ROLES.map((option) => {
                                const active = draft.role === option.key
                                return (
                                    <button
                                        key={option.key}
                                        type="button"
                                        aria-pressed={active}
                                        onClick={() => set('role', option.key)}
                                        className={`rounded-[9px] border px-3 py-2.5 text-left transition ${
                                            active
                                                ? 'border-sage-600 bg-white shadow-[0_0_0_3px_rgba(2,132,199,.16)]'
                                                : 'border-[#9dc2d6] bg-white/60 hover:border-sage-600 hover:bg-white'
                                        }`}>
                                        <span className="block text-[0.88rem] font-bold text-ink">
                                            {t(option.labelKey)}
                                        </span>
                                        <span className="mt-0.5 block text-[0.74rem] leading-snug text-[#5b7285]">
                                            {t(option.noteKey)}
                                        </span>
                                    </button>
                                )
                            })}
                        </div>
                        {errors.role && <p className={ERROR} role="alert">{errors.role}</p>}
                    </fieldset>

                    <div>
                        <label className={LABEL} htmlFor="cp-phone">{t('complete.fieldPhone')}</label>
                        <div className={FIELD}>
                            <input id="cp-phone" className={INPUT} inputMode="tel" autoComplete="tel"
                                   placeholder="0771234567" value={draft.phone}
                                   onChange={(event) => set('phone', event.target.value)}/>
                        </div>
                        {errors.phone && <p className={ERROR} role="alert">{errors.phone}</p>}
                    </div>

                    {showTemple && (
                        <>
                            <div>
                                <label className={LABEL} htmlFor="cp-temple">{t('complete.fieldTemple')}</label>
                                <div className={FIELD}>
                                    <input id="cp-temple" className={INPUT} list="cp-temple-codes"
                                           placeholder="SMB-VIH-0042" value={draft.templeCode}
                                           onChange={(event) => set('templeCode', event.target.value.toUpperCase())}/>
                                </div>
                                <datalist id="cp-temple-codes">
                                    {templeCodes.map((code) => <option key={code} value={code}/>)}
                                </datalist>
                                <p className="mt-1 text-[0.76rem] text-[#5b7285]">
                                    {t('complete.hintTemple', {count: TEMPLES.length})}
                                </p>
                                {errors.templeCode && <p className={ERROR} role="alert">{errors.templeCode}</p>}
                                {errors.templeCodeUnknown &&
                                    <p className={ERROR} role="alert">{errors.templeCodeUnknown}</p>}
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className={LABEL} htmlFor="cp-village">{t('complete.fieldVillage')}</label>
                                    <div className={FIELD}>
                                        <input id="cp-village" className={INPUT} value={draft.village}
                                               onChange={(event) => set('village', event.target.value)}/>
                                    </div>
                                    {errors.village && <p className={ERROR} role="alert">{errors.village}</p>}
                                </div>

                                <SelectField
                                    id="cp-district"
                                    label={t('complete.fieldDistrict')}
                                    placeholder={t('complete.fieldDistrictPlaceholder')}
                                    options={districts}
                                    value={draft.district}
                                    onChange={(value) => set('district', value)}
                                    error={errors.district}
                                />
                            </div>
                        </>
                    )}

                    {showCommittee && (
                        <SelectField
                            id="cp-committee"
                            label={t('complete.fieldCommittee')}
                            placeholder={t('complete.fieldCommitteePlaceholder')}
                            options={COMMITTEES}
                            value={draft.committee}
                            onChange={(value) => set('committee', value)}
                            error={errors.committee}
                        />
                    )}

                    {role && (
                        <SelectField
                            id="cp-designation"
                            label={t('complete.fieldDesignation')}
                            placeholder={t('complete.fieldDesignationPlaceholder')}
                            options={DESIGNATIONS[role]}
                            value={draft.designation}
                            onChange={(value) => set('designation', value)}
                            error={errors.designation}
                        />
                    )}

                    {showFamily && (
                        <>
                            <div>
                                <label className={LABEL} htmlFor="cp-address">{t('complete.fieldAddress')}</label>
                                <div className={FIELD}>
                                    <input id="cp-address" className={INPUT} autoComplete="street-address"
                                           value={draft.address}
                                           onChange={(event) => set('address', event.target.value)}/>
                                </div>
                                {errors.address && <p className={ERROR} role="alert">{errors.address}</p>}
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className={LABEL} htmlFor="cp-postal">{t('complete.fieldPostalCode')}</label>
                                    <div className={FIELD}>
                                        <input id="cp-postal" className={INPUT} inputMode="numeric" maxLength={5}
                                               placeholder="00200" value={draft.postalCode}
                                               onChange={(event) => set('postalCode', event.target.value)}/>
                                    </div>
                                    {errors.postalCode && <p className={ERROR} role="alert">{errors.postalCode}</p>}
                                </div>

                                <div>
                                    <label className={LABEL} htmlFor="cp-nic">{t('complete.fieldNic')}</label>
                                    <div className={FIELD}>
                                        <input id="cp-nic" className={INPUT} placeholder="901234567V"
                                               value={draft.nic}
                                               onChange={(event) => set('nic', event.target.value.toUpperCase())}/>
                                    </div>
                                    {errors.nic && <p className={ERROR} role="alert">{errors.nic}</p>}
                                </div>
                            </div>
                        </>
                    )}

                    <label className="flex items-start gap-2.5 text-[0.85rem] leading-relaxed text-[#33566c]">
                        <input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 accent-sage-600"
                               checked={draft.agreedToTerms}
                               onChange={(event) => set('agreedToTerms', event.target.checked)}/>
                        <span>{t('complete.terms')}</span>
                    </label>
                    {errors.agreedToTerms && <p className={ERROR} role="alert">{errors.agreedToTerms}</p>}

                    {flash && (
                        <p className="rounded-[10px] border border-[#bfe3cd] bg-[#eefaf1] px-3 py-2 text-[0.85rem] font-semibold text-[#1c6b3c]"
                           role="status">{flash}</p>
                    )}

                    <button type="submit" className={PRIMARY}>{t('complete.saveAction')}</button>
                    <button type="button" className={SECONDARY} onClick={onSkip}>{t('complete.skipAction')}</button>

                    <p className="text-center text-[0.78rem] leading-relaxed text-[#5b7285]">
                        {t('complete.skipNote')}
                    </p>
                </form>

                <p className="mt-5 border-t border-[#d9d3bf] pt-4 text-center text-[0.78rem] leading-relaxed text-[#5b7285]">
                    {t('complete.demoNote')}
                </p>
            </div>
        </AuthShell>
    )
}