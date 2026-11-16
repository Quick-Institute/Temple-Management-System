import {type FormEvent, type ReactNode, useMemo, useState} from 'react'
import {Link, Navigate, useNavigate, useSearchParams} from 'react-router-dom'
import {
    ArrowLeft,
    BadgeCheck,
    Banknote,
    Building2,
    CalendarCheck,
    ChevronDown,
    CircleAlert,
    CircleCheck,
    ImagePlus,
    Info,
    Landmark,
    MapPin,
    Phone,
    Plus,
    Save,
    ScrollText,
    ShieldCheck,
    Trash2,
    UserCog,
    UserPlus,
    Users2,
} from 'lucide-react'
import {AppShell} from '../../layouts/AppShell'
import TempleFooterWave from '../../components/TempleFooterWave'
import {SelectField} from '../../components/SelectField'
import {
    CO_ADMIN_ROLES,
    DANA_SESSION_SUGGESTIONS,
    DISTRICTS_EN,
    FACILITY_SUGGESTIONS,
    PROVINCES,
    TEMPLE_TYPES,
} from '../../data/templeOptions'
import {useTemples} from '../../data/templeStore.tsx'
import type {CapacityField, CoAdministrator, TempleRecord} from '../../data/templeStatus'
import {coAdminRoleShort} from '../../data/templeStatus'
import {DISTRICTS} from '../../data/temples'
import {adminRoutes} from '../../routes/adminRoutes'
import {useAuth} from '../../context/AuthContext'
import {useTranslation} from 'react-i18next'
import {usePermissions} from '../../hooks/usePermissions'
import {canCreateTemple, canEditTempleRecord} from '../../data/templeAccess'
import {isAllowed} from '../../data/permissions'

/* --------------------------------- form ------------------------------------ */

type FormState = {
    name: string
    type: string
    /** Filled in only when `type` is "Other" - stored as the record's type. */
    otherType: string
    established: string
    chiefIncumbent: string
    description: string
    address: string
    village: string
    gnDivision: string
    dsDivision: string
    district: string
    province: string
    postalCode: string
    phone: string
    phoneAlt: string
    email: string
    website: string
    landExtent: string
    facilities: string[]
    capacity: CapacityField[]
    danaSessions: string[]
    bank: string
    branch: string
    accountName: string
    accountNumber: string
    coAdmins: CoAdministrator[]
}

const EMPTY: FormState = {
    name: '', type: '', otherType: '', established: '', chiefIncumbent: '', description: '',
    address: '', village: '', gnDivision: '', dsDivision: '', district: '', province: 'Western',
    postalCode: '', phone: '', phoneAlt: '', email: '', website: '', landExtent: '',
    facilities: ['Buddha Mandiraya', 'Dana Salawa'],
    capacity: [{id: 'cap-1', label: 'Dana hall', seats: ''}],
    danaSessions: ['Morning Dana'],
    bank: '', branch: '', accountName: '', accountNumber: '',
    coAdmins: [],
}

const fromRecord = (record: TempleRecord): FormState => ({
    name: record.name,
    type: TEMPLE_TYPES.includes(record.type) ? record.type : 'Other',
    otherType: TEMPLE_TYPES.includes(record.type) ? '' : record.type,
    established: record.established,
    chiefIncumbent: record.chiefIncumbent,
    description: record.description,
    address: record.address,
    village: record.village,
    gnDivision: record.gnDivision,
    dsDivision: record.dsDivision,
    district: record.district,
    province: record.province,
    postalCode: record.postalCode,
    phone: record.phone,
    phoneAlt: record.phoneAlt,
    email: record.email,
    website: record.website,
    landExtent: record.landExtent,
    facilities: record.facilities,
    capacity: record.capacity,
    danaSessions: record.danaSessions,
    ...record.banking,
    coAdmins: record.coAdmins,
})

/** Jump list in the right rail; mirrors the section ids below. */
const FORM_SECTIONS = [
    {id: 'sec-basic', labelKey: 'temple.form.secBasic'},
    {id: 'sec-location', labelKey: 'temple.form.secLocation'},
    {id: 'sec-contact', labelKey: 'temple.form.secContact'},
    {id: 'sec-coadmin', labelKey: 'temple.form.secCoadmin'},
    {id: 'sec-facilities', labelKey: 'temple.form.secFacilities'},
    {id: 'sec-dana', labelKey: 'temple.form.secDana'},
    {id: 'sec-media', labelKey: 'temple.form.secMedia'},
]

type Errors = Partial<Record<keyof FormState, string>>

/* The registration ID is issued on approval, so it is not collected here. */
const REQUIRED: (keyof FormState)[] = ['name', 'type', 'village', 'district', 'phone', 'chiefIncumbent']

const validate = (form: FormState, t: (key: string) => string): Errors => {
    const errors: Errors = {}
    REQUIRED.forEach((field) => {
        const value = form[field]
        if (typeof value === 'string' && value.trim() === '') errors[field] = t('temple.form.vRequired')
    })
    if (form.type === 'Other' && form.otherType.trim() === '') {
        errors.otherType = t('temple.form.vOtherType')
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = t('temple.form.vEmail')
    if (form.phone && !/^\+?[0-9\s-]{9,}$/.test(form.phone)) errors.phone = t('temple.form.vPhone')
    if (form.established && !/^(18|19|20)\d{2}$/.test(form.established)) errors.established = t('temple.form.vYear')
    if (form.capacity.some((row) => row.seats && !/^\d+$/.test(row.seats))) {
        errors.capacity = t('temple.form.vSeats')
    }
    return errors
}

/* ------------------------------- UI atoms ---------------------------------- */

const Field = ({label, required, error, hint, children, htmlFor}: {
    label: string
    required?: boolean
    error?: string
    hint?: string
    children: ReactNode
    htmlFor?: string
}) => (
    <div className="min-w-0">
        <label className="field-label" htmlFor={htmlFor}>
            {label} {required && <span className="text-status-rose">*</span>}
        </label>
        {children}
        {error ? <p className="field-error">{error}</p> : hint ? <p className="field-hint">{hint}</p> : null}
    </div>
)

const Section = ({id, icon, title, description, optional, open, onToggle, children}: {
    id: string
    icon: ReactNode
    title: string
    description: string
    /** Optional sections start closed so the form looks short and simple. */
    optional?: boolean
    open?: boolean
    onToggle?: () => void
    children: ReactNode
}) => {
    const {t} = useTranslation()
    const expanded = !optional || open
    const head = (
        <>
            <span
                className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-accent-gold-50 text-status-amber">{icon}</span>
            <div className="min-w-0 flex-1 text-left">
                <h2 className="font-temple text-[1.36rem] font-semibold text-ink">
                    {title}
                    {optional && (
                        <span
                            className="ml-2 align-middle text-[0.9rem] font-semibold text-muted">{t('temple.form.optional')}</span>
                    )}
                </h2>
                <p className="mt-0.5 text-[0.98rem] text-muted">{description}</p>
            </div>
        </>
    )

    return (
        <section id={id} className="section-card scroll-mt-24">
            {optional ? (
                <button type="button" onClick={onToggle} aria-expanded={expanded}
                        className="flex w-full items-center gap-3 px-4 py-4 text-left transition hover:bg-cream/60 sm:px-5">
                    {head}
                    <ChevronDown size={22}
                                 className={`flex-none text-muted transition ${expanded ? 'rotate-180' : ''}`}/>
                </button>
            ) : (
                <div className="flex items-center gap-3 border-b border-line-soft px-4 py-4 sm:px-5">{head}</div>
            )}
            {expanded && <div className="grid gap-4 px-4 py-5 sm:grid-cols-2 sm:px-5">{children}</div>}
        </section>
    )
}

/* --------------------------------- page ------------------------------------ */

export const AddTemplePage = () => {
    const navigate = useNavigate()
    const [params] = useSearchParams()
    const {user} = useAuth()
    const {role} = usePermissions()
    const {t, i18n} = useTranslation()
    const {createRequest, updateRecord, getRecord} = useTemples()

    const editId = params.get('id')
    const editing = params.get('mode') === 'edit' && Boolean(editId)
    const record = editing && editId ? getRecord(editId) : undefined

    /* A Co-Administrator may update their assigned temple but never create one, and never
       appoint Co-Administrators. The route guard already enforces this; these flags also shape
       the form so the relevant sections simply do not appear for them. */
    const mayCreate = canCreateTemple(role)
    const mayAppointCoAdmins = isAllowed(role, 'appointCoAdmin')

    const [form, setForm] = useState<FormState>(record ? fromRecord(record) : EMPTY)
    const [errors, setErrors] = useState<Errors>({})
    const [saved, setSaved] = useState<'created' | 'updated' | null>(null)
    const [photo, setPhoto] = useState<string | null>(null)
    const [newFacility, setNewFacility] = useState('')
    /* The role chosen in the "Appoint a Co-Administrator" dropdown. */
    const [appointRole, setAppointRole] = useState('')
    /* Optional sections are closed until asked for - a short form reads as a simple form.
       Appointments are not required, so that section starts closed too, unless the temple
       already has Co-Administrators worth showing. */
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        'sec-coadmin': (record?.coAdmins?.length ?? 0) > 0,
    })
    const toggleSection = (id: string) => setOpenSections((current) => ({...current, [id]: !current[id]}))

    const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setForm((current) => ({...current, [key]: value}))
        setErrors((current) => ({...current, [key]: undefined}))
        setSaved(null)
    }

    const toggle = (key: 'facilities' | 'danaSessions', value: string) => {
        setForm((current) => ({
            ...current,
            [key]: current[key].includes(value)
                ? current[key].filter((item) => item !== value)
                : [...current[key], value],
        }))
        setSaved(null)
    }

    const addFacility = () => {
        const value = newFacility.trim()
        if (!value) return
        setForm((current) => ({
            ...current,
            facilities: current.facilities.includes(value) ? current.facilities : [...current.facilities, value],
        }))
        setNewFacility('')
        setSaved(null)
    }

    const setCapacity = (id: string, patch: Partial<CapacityField>) => {
        setForm((current) => ({
            ...current,
            capacity: current.capacity.map((row) => (row.id === id ? {...row, ...patch} : row)),
        }))
        setErrors((current) => ({...current, capacity: undefined}))
        setSaved(null)
    }

    const addCapacity = () => {
        setForm((current) => ({
            ...current,
            capacity: [...current.capacity, {id: `cap-${Date.now()}`, label: '', seats: ''}],
        }))
        setSaved(null)
    }

    const removeCapacity = (id: string) => {
        setForm((current) => ({...current, capacity: current.capacity.filter((row) => row.id !== id)}))
        setSaved(null)
    }

    /* A temple may appoint any number of Co-Administrators and repeat a designation (an assistant
       representative, a second technical contact), so the list is never capped or filtered down. */
    const designationOptions = CO_ADMIN_ROLES

    /* Option values are stored in English (they are what the record keeps), so only the label the
       user reads is translated. `defaultValue` keeps any typed value visible as it was entered. */
    const opt = (group: string, value: string) => t(`temple.opt.${group}.${value}`, {defaultValue: value})
    const districtLabel = (value: string) =>
        i18n.language === 'si' ? (DISTRICTS.find((d) => d.en === value)?.si ?? value) : value
    const selectTexts = {
        search: t('temple.select.search'),
        searchCreate: t('temple.select.searchCreate'),
        searchAria: t('temple.select.searchAria'),
        use: t('temple.select.use'),
        newBadge: t('temple.select.new'),
        noMatch: t('temple.select.noMatch'),
    }

    const addCoAdmin = (role: CoAdministrator['role']) => {
        setForm((current) => ({
            ...current,
            coAdmins: [...current.coAdmins, {
                id: `co-${Date.now()}`,
                role,
                name: '',
                email: '',
                phone: '',
                reference: '',
                appointedOn: new Date().toISOString().slice(0, 10),
                status: 'Invited',
            }],
        }))
        setSaved(null)
    }

    const setCoAdmin = (id: string, patch: Partial<CoAdministrator>) => {
        setForm((current) => ({
            ...current,
            coAdmins: current.coAdmins.map((admin) => (admin.id === id ? {...admin, ...patch} : admin)),
        }))
        setSaved(null)
    }

    const removeCoAdmin = (id: string) => {
        setForm((current) => ({...current, coAdmins: current.coAdmins.filter((admin) => admin.id !== id)}))
        setSaved(null)
    }

    /* The percentage is derived from the same checklist the panel renders, so the two never
       disagree (100% next to unchecked rows looked broken). */
    const checklist = useMemo(() => ([
        {label: t('temple.form.ckName'), done: form.name !== ''},
        {label: t('temple.form.ckType'), done: form.type !== ''},
        {label: t('temple.form.ckChief'), done: form.chiefIncumbent !== ''},
        {label: t('temple.form.ckLocation'), done: form.village !== '' && form.district !== ''},
        {label: t('temple.form.ckPhone'), done: form.phone !== ''},
        {label: t('temple.form.ckCapacity'), done: form.capacity.some((row) => row.seats !== '')},
        {label: t('temple.form.ckCoadmin'), done: form.coAdmins.length > 0},
        {label: t('temple.form.ckDana'), done: form.accountNumber !== ''},
    ]), [form, t])

    const filled = Math.round((checklist.filter((item) => item.done).length / checklist.length) * 100)

    /* An edit link for a record that has since been dropped lands back on the list. The guard sits
       after every hook so the hook order never changes between renders. */
    if (editing && !record) return <Navigate to={adminRoutes.templeInformation} replace/>
    /* Defense in depth: a Co-Administrator (or any read-only role) cannot create a temple, and can
       only edit a record they are allowed to manage. */
    if (!editing && !mayCreate) return <Navigate to={adminRoutes.templeInformation} replace/>
    if (editing && !canEditTempleRecord(user, record)) return <Navigate to={adminRoutes.templeInformation} replace/>

    const onSubmit = (event: FormEvent) => {
        event.preventDefault()
        const nextErrors = validate(form, t)
        setErrors(nextErrors)
        if (Object.keys(nextErrors).length > 0) {
            document.getElementById('temple-form')?.scrollIntoView({behavior: 'smooth', block: 'start'})
            return
        }

        const payload = {
            name: form.name,
            type: form.type === 'Other' ? form.otherType.trim() : form.type,
            established: form.established,
            chiefIncumbent: form.chiefIncumbent,
            description: form.description,
            address: form.address,
            village: form.village,
            gnDivision: form.gnDivision,
            dsDivision: form.dsDivision,
            district: form.district,
            province: form.province,
            postalCode: form.postalCode,
            phone: form.phone,
            phoneAlt: form.phoneAlt,
            email: form.email,
            website: form.website,
            landExtent: form.landExtent,
            facilities: form.facilities,
            capacity: form.capacity.filter((row) => row.label.trim() !== ''),
            danaSessions: form.danaSessions,
            banking: {
                bank: form.bank,
                branch: form.branch,
                accountName: form.accountName,
                accountNumber: form.accountNumber,
            },
            /* Only a role that may appoint Co-Administrators can change that list; everyone else
               (e.g. a Co-Administrator editing their own temple) preserves it unchanged. */
            coAdmins: mayAppointCoAdmins ? form.coAdmins : (record?.coAdmins ?? []),
            committee: record?.committee ?? [],
            documents: record?.documents ?? [],
        }

        if (editing && record) {
            updateRecord(record.id, payload)
            setSaved('updated')
            navigate(`${adminRoutes.templeInformation}/${record.id}`, {state: {flash: 'updated'}})
            return
        }

        const created = createRequest(payload)
        setSaved('created')
        navigate(`${adminRoutes.templeInformation}/${created.id}`, {state: {flash: 'created'}})
    }

    const assignedId = record?.registrationId ?? null

    return (
        <AppShell footer={<TempleFooterWave/>}>
            <div className="temple-info-scope mx-auto flex max-w-[105rem] flex-col gap-4">

                {/* Same sky-blue hero as the All Temples banner, so moving between the two
                    screens does not change the colour language. */}
                <header
                    className="relative rounded-2xl border border-[#BAE6FD] bg-linear-to-r from-[#D0E8F9] via-[#E4F2FD] to-[#D5EDFD] px-4 py-5 shadow-[0_4px_20px_rgba(2,132,199,0.08)] sm:px-6 sm:py-6">

                    {/* Artwork clipped on its own layer, never on the header, so focus rings and
                        tooltips inside the banner are not cut off. */}
                    <div aria-hidden="true"
                         className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl select-none">
                        <div className="absolute inset-y-0 right-0 hidden w-[30%] overflow-hidden lg:block">
                            <img src="/kataragama_stupa.jpg" alt=""
                                 className="h-full w-full object-cover object-right"
                                 style={{
                                     maskImage: 'linear-gradient(to left, black 30%, rgba(0,0,0,0.5) 58%, transparent 90%)',
                                     WebkitMaskImage: 'linear-gradient(to left, black 30%, rgba(0,0,0,0.5) 58%, transparent 90%)',
                                 }}/>
                        </div>
                        <div
                            className="absolute left-[52%] top-1/2 hidden -translate-y-1/2 text-sky-500 opacity-20 xl:block">
                            <svg className="h-36 w-36" viewBox="0 0 100 100" fill="currentColor">
                                <path
                                    d="M50 8 C62 26 84 45 80 70 C76 88 56 94 50 84 C44 94 24 88 20 70 C16 45 38 26 50 8 Z"
                                    opacity="0.6"/>
                                <path
                                    d="M50 15 L50 80 M50 35 C60 40 70 50 72 60 M50 45 C40 50 30 60 28 60 M50 55 C60 60 68 70 66 75 M50 65 C40 70 32 75 34 78"
                                    stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.4"/>
                            </svg>
                        </div>
                    </div>

                    <div className="relative flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                            <Link to={adminRoutes.templeInformation}
                                  className="inline-flex items-center gap-1.5 rounded-full bg-white/75 px-3 py-1 text-[0.78rem] font-semibold text-sage-700 ring-1 ring-[#BAE6FD] transition hover:bg-white">
                                <ArrowLeft size={14}/> {t('temple.form.back')}
                            </Link>
                            <h1 className="mt-2 font-temple text-[1.6rem] leading-tight font-semibold text-sage-900 sm:text-[1.9rem]">
                                {editing ? t('temple.form.editTitle') : t('temple.addNew')}
                            </h1>
                            <p className="mt-1 max-w-[76ch] text-[0.95rem] text-sky-900/80">
                                {editing ? t('temple.form.editIntro') : t('temple.form.createIntro')}
                            </p>
                        </div>
                        <div className="flex flex-none gap-2">
                            <Link to={adminRoutes.templeInformation}
                                  className="btn btn-outline btn-sm">{t('common.cancel')}</Link>
                            <button type="submit" form="temple-form" className="btn btn-primary btn-sm">
                                <Save size={15}/> {editing ? t('temple.form.save') : t('temple.form.submit')}
                            </button>
                        </div>
                    </div>
                </header>

                {/* Registration ID is issued by the system, never typed here. */}
                <div className="info-note items-start border-accent-blue/25 bg-accent-blue-50 text-status-blue">
                    <ShieldCheck size={17} className="mt-0.5 flex-none"/>
                    <span>
                        {assignedId
                            ? t('temple.form.regIdAssigned', {id: assignedId})
                            : t('temple.form.regIdPending')}
                    </span>
                </div>

                {record?.status === 'Pending approval' && (
                    <div
                        className="flex items-start gap-2.5 rounded-xl border border-accent-blue/30 bg-accent-blue-50 px-4 py-3 text-[0.86rem] text-status-blue">
                        <CircleAlert size={17} className="mt-0.5 flex-none"/>
                        <span>{t('temple.form.pendingNotice')}</span>
                    </div>
                )}

                {record?.status === 'Changes requested' && record.reviewNote && (
                    <div role="alert"
                         className="flex items-start gap-2.5 rounded-xl border border-accent-purple/30 bg-accent-purple-50 px-4 py-3 text-[0.86rem] text-accent-purple">
                        <Info size={17} className="mt-0.5 flex-none"/>
                        <span><strong
                            className="font-semibold">{t('temple.form.reviewFrom')}</strong> {record.reviewNote}
                            <span className="mt-0.5 block text-ink-soft">{t('temple.form.reviewResubmit')}</span></span>
                    </div>
                )}

                {saved && (
                    <div role="status"
                         className="flex items-start gap-2.5 rounded-xl border border-accent-green/30 bg-accent-green-50 px-4 py-3 text-[0.86rem] text-accent-green">
                        <CircleCheck size={17} className="mt-0.5 flex-none"/>
                        <div>
                            <strong className="block font-semibold">
                                {saved === 'updated' ? t('temple.form.savedUpdated') : t('temple.form.savedCreated')}
                            </strong>
                            <span className="text-ink-soft">{t('temple.form.savedLocal')}</span>
                        </div>
                    </div>
                )}

                {Object.keys(errors).length > 0 && (
                    <div role="alert"
                         className="flex items-start gap-2.5 rounded-xl border border-status-rose/30 bg-lotus-50 px-4 py-3 text-[0.86rem] text-status-rose">
                        <CircleAlert size={17} className="mt-0.5 flex-none"/>
                        <span>{t('temple.form.errorCount', {count: Object.keys(errors).length})}</span>
                    </div>
                )}

                <form id="temple-form" onSubmit={onSubmit} noValidate
                      className="grid items-start gap-4 xl:grid-cols-[1.55fr_1fr]">

                    <div className="flex min-w-0 flex-col gap-4">
                        {/* Basic information */}
                        <Section id="sec-basic" icon={<Landmark size={20}/>} title={t('temple.form.secBasic')}
                                 description={t('temple.form.secBasicD')}>
                            <Field label={t('temple.form.fName')} required error={errors.name} htmlFor="name">
                                <input id="name" className="field-input" value={form.name}
                                       onChange={(event) => set('name', event.target.value)}
                                       placeholder={t('temple.form.phName')}/>
                            </Field>
                            {/* Open list: temples use many types, so anything can be typed. */}
                            <SelectField id="type" label={t('temple.form.fType')} creatable searchable
                                         icon={<Landmark size={17}/>}
                                         placeholder={t('temple.form.phType')}
                                         optionLabel={(value) => opt('type', value)} texts={selectTexts}
                                         options={TEMPLE_TYPES} value={form.type}
                                         onChange={(value) => set('type', value)} error={errors.type}
                                         hint={t('temple.form.hintType')}/>
                            {form.type === 'Other' && (
                                <Field label={t('temple.form.fOtherType')} required error={errors.otherType}
                                       htmlFor="otherType" hint={t('temple.form.hintOtherType')}>
                                    <input id="otherType" className="field-input" value={form.otherType}
                                           onChange={(event) => set('otherType', event.target.value)}
                                           placeholder={t('temple.form.phOtherType')}/>
                                </Field>
                            )}
                            <Field label={t('temple.form.fChief')} required error={errors.chiefIncumbent}
                                   htmlFor="chiefIncumbent">
                                <input id="chiefIncumbent" className="field-input" value={form.chiefIncumbent}
                                       onChange={(event) => set('chiefIncumbent', event.target.value)}
                                       placeholder={t('temple.form.phChief')}/>
                            </Field>
                            <Field label={t('temple.form.fEstablished')} error={errors.established}
                                   htmlFor="established"
                                   hint={t('temple.form.hintEstablished')}>
                                <input id="established" className="field-input" inputMode="numeric" maxLength={4}
                                       value={form.established}
                                       onChange={(event) => set('established', event.target.value)} placeholder="1892"/>
                            </Field>
                            <div className="sm:col-span-2">
                                <Field label={t('temple.form.fAbout')} htmlFor="description">
                                    <textarea id="description" className="field-input min-h-24 resize-y"
                                              value={form.description}
                                              onChange={(event) => set('description', event.target.value)}
                                              placeholder={t('temple.form.phAbout')}/>
                                </Field>
                            </div>
                        </Section>

                        {/* Location */}
                        <Section id="sec-location" icon={<MapPin size={20}/>} title={t('temple.form.secLocation')}
                                 description={t('temple.form.secLocationD')}>
                            <div className="sm:col-span-2">
                                <Field label={t('temple.form.fAddress')} htmlFor="address">
                                    <input id="address" className="field-input" value={form.address}
                                           onChange={(event) => set('address', event.target.value)}
                                           placeholder={t('temple.form.phAddress')}/>
                                </Field>
                            </div>
                            <Field label={t('temple.form.fVillage')} required error={errors.village} htmlFor="village">
                                <input id="village" className="field-input" value={form.village}
                                       onChange={(event) => set('village', event.target.value)}
                                       placeholder={t('temple.form.phVillage')}/>
                            </Field>
                            <Field label={t('temple.form.fGN')} htmlFor="gnDivision">
                                <input id="gnDivision" className="field-input" value={form.gnDivision}
                                       onChange={(event) => set('gnDivision', event.target.value)}/>
                            </Field>
                            <Field label={t('temple.form.fDS')} htmlFor="dsDivision">
                                <input id="dsDivision" className="field-input" value={form.dsDivision}
                                       onChange={(event) => set('dsDivision', event.target.value)}
                                       placeholder={t('temple.form.phDS')}/>
                            </Field>
                            <Field label={t('temple.form.fPostal')} htmlFor="postalCode">
                                <input id="postalCode" className="field-input" inputMode="numeric" maxLength={5}
                                       value={form.postalCode}
                                       onChange={(event) => set('postalCode', event.target.value)} placeholder="11500"/>
                            </Field>
                            <SelectField id="district" label={t('temple.form.fDistrict')} searchable
                                         icon={<MapPin size={17}/>}
                                         placeholder={t('temple.form.phDistrict')} options={DISTRICTS_EN}
                                         optionLabel={districtLabel} texts={selectTexts}
                                         value={form.district} onChange={(value) => set('district', value)}
                                         error={errors.district}/>
                            <SelectField id="province" label={t('temple.form.fProvince')}
                                         icon={<MapPin size={17}/>}
                                         placeholder={t('temple.form.phProvince')} options={PROVINCES}
                                         optionLabel={(value) => opt('province', value)} texts={selectTexts}
                                         value={form.province} onChange={(value) => set('province', value)}/>
                        </Section>

                        {/* Contact */}
                        <Section id="sec-contact" icon={<Phone size={20}/>} title={t('temple.form.secContact')}
                                 description={t('temple.form.secContactD')}>
                            <Field label={t('temple.form.fPhone')} required error={errors.phone} htmlFor="phone">
                                <input id="phone" className="field-input" value={form.phone}
                                       onChange={(event) => set('phone', event.target.value)}
                                       placeholder="+94 31 223 4478"/>
                            </Field>
                            <Field label={t('temple.form.fPhoneAlt')} htmlFor="phoneAlt">
                                <input id="phoneAlt" className="field-input" value={form.phoneAlt}
                                       onChange={(event) => set('phoneAlt', event.target.value)}
                                       placeholder="+94 77 312 6640"/>
                            </Field>
                            <Field label={t('temple.form.fEmail')} error={errors.email} htmlFor="email">
                                <input id="email" type="email" className="field-input" value={form.email}
                                       onChange={(event) => set('email', event.target.value)}
                                       placeholder="office@sambodhiviharaya.lk"/>
                            </Field>
                            <Field label={t('temple.form.fWebsite')} htmlFor="website">
                                <input id="website" className="field-input" value={form.website}
                                       onChange={(event) => set('website', event.target.value)}
                                       placeholder="sambodhiviharaya.lk"/>
                            </Field>
                        </Section>

                        {/* Co-Administrators - proposal 10.2.3 names two designations, but those are
                            starting suggestions: a temple may appoint any number of people and repeat a
                            designation. Only a role that may appoint Co-Administrators sees this section. */}
                        {mayAppointCoAdmins && (
                            <Section id="sec-coadmin" icon={<UserCog size={20}/>} title={t('temple.form.secCoadmin')}
                                     description={t('temple.form.secCoadminD')}
                                     optional open={!!openSections['sec-coadmin']}
                                     onToggle={() => toggleSection('sec-coadmin')}>
                                <div className="sm:col-span-2 flex flex-col gap-3">
                                    {form.coAdmins.length === 0 && (
                                        <p className="rounded-xl border border-dashed border-line bg-cream px-3 py-4 text-[0.84rem] text-muted">
                                            {t('temple.form.coEmpty')}
                                        </p>
                                    )}

                                    {form.coAdmins.map((admin) => (
                                        <div key={admin.id} className="rounded-xl border border-line bg-cream/50 p-3">
                                            <div className="mb-2.5 flex flex-wrap items-center gap-2">
                                                <span
                                                    className="badge badge-gold">{opt('roleShort', coAdminRoleShort(admin.role))}</span>
                                                <span
                                                    className={`badge ${admin.status === 'Active' ? 'badge-green' : 'badge-neutral'}`}>
                                                {opt('status', admin.status)}
                                            </span>
                                                <button type="button"
                                                        className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[0.78rem] font-semibold text-muted transition hover:bg-white hover:text-status-rose"
                                                        onClick={() => removeCoAdmin(admin.id)}>
                                                    <Trash2 size={13}/> {t('temple.form.remove')}
                                                </button>
                                            </div>
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                <Field label={t('temple.form.fFullName')} required
                                                       htmlFor={`${admin.id}-name`}>
                                                    <input id={`${admin.id}-name`} className="field-input"
                                                           value={admin.name}
                                                           placeholder={admin.role === 'Authorized Religious Representative'
                                                               ? t('temple.form.phCoNameThero')
                                                               : t('temple.form.phCoNameLay')}
                                                           onChange={(event) => setCoAdmin(admin.id, {name: event.target.value})}/>
                                                </Field>
                                                <Field label={t('temple.form.fNIC')} htmlFor={`${admin.id}-ref`}
                                                       hint={t('temple.form.hintNIC')}>
                                                    <input id={`${admin.id}-ref`} className="field-input mono"
                                                           value={admin.reference}
                                                           placeholder={t('temple.form.phNIC')}
                                                           onChange={(event) => setCoAdmin(admin.id, {reference: event.target.value})}/>
                                                </Field>
                                                <Field label={t('temple.form.fEmail')} htmlFor={`${admin.id}-email`}>
                                                    <input id={`${admin.id}-email`} type="email" className="field-input"
                                                           value={admin.email}
                                                           placeholder="name@example.lk"
                                                           onChange={(event) => setCoAdmin(admin.id, {email: event.target.value})}/>
                                                </Field>
                                                <Field label={t('temple.form.fPhone')} htmlFor={`${admin.id}-phone`}>
                                                    <input id={`${admin.id}-phone`} className="field-input"
                                                           value={admin.phone}
                                                           placeholder="+94 77 000 0000"
                                                           onChange={(event) => setCoAdmin(admin.id, {phone: event.target.value})}/>
                                                </Field>
                                                <SelectField id={`${admin.id}-status`}
                                                             label={t('temple.form.fAppStatus')}
                                                             icon={<BadgeCheck size={17}/>}
                                                             placeholder={t('temple.form.phStatus')}
                                                             optionLabel={(value) => opt('status', value)}
                                                             texts={selectTexts}
                                                             options={['Invited', 'Active', 'Suspended']}
                                                             value={admin.status}
                                                             onChange={(value) => setCoAdmin(admin.id, {status: value as CoAdministrator['status']})}/>
                                                <Field label={t('temple.form.fAppointedOn')}
                                                       htmlFor={`${admin.id}-date`}>
                                                    <input id={`${admin.id}-date`} type="date" className="field-input"
                                                           value={admin.appointedOn}
                                                           onChange={(event) => setCoAdmin(admin.id, {appointedOn: event.target.value})}/>
                                                </Field>
                                            </div>
                                        </div>
                                    ))}

                                    {/* The select and its button share one row on wide screens and stack on
                                    phones; the hint sits under the row so the two controls stay aligned. */}
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                                        <div className="min-w-0 sm:max-w-sm sm:flex-1">
                                            <SelectField id="appoint-role" label={t('temple.form.fDesignation')}
                                                         icon={<UserCog size={19}/>} creatable searchable
                                                         placeholder={t('temple.form.phDesignation')}
                                                         optionLabel={(value) => opt('role', value)} texts={selectTexts}
                                                         options={designationOptions}
                                                         value={appointRole}
                                                         onChange={setAppointRole}/>
                                        </div>
                                        <button type="button"
                                                className="btn btn-outline min-h-12 w-full flex-none sm:mb-0.5 sm:w-auto lg:min-h-10.5"
                                                disabled={!appointRole.trim()}
                                                onClick={() => {
                                                    addCoAdmin(appointRole.trim())
                                                    setAppointRole('')
                                                }}>
                                            <UserPlus size={18}/> {t('temple.form.appoint')}
                                        </button>
                                    </div>
                                    <p className="field-hint">
                                        {t('temple.form.coHintPick')} {t('temple.form.coHintAccess')}
                                    </p>
                                </div>
                            </Section>
                        )}

                        {/* Facilities - additions allowed */}
                        <Section id="sec-facilities" icon={<Building2 size={20}/>}
                                 title={t('temple.form.secFacilities')}
                                 description={t('temple.form.secFacilitiesD')}
                                 optional open={!!openSections['sec-facilities']}
                                 onToggle={() => toggleSection('sec-facilities')}>
                            <div className="sm:col-span-2">
                                <span className="field-label">{t('temple.form.fFacilities')}</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {Array.from(new Set([...FACILITY_SUGGESTIONS, ...form.facilities])).map((facility) => {
                                        const on = form.facilities.includes(facility)
                                        return (
                                            <button key={facility} type="button" aria-pressed={on}
                                                    onClick={() => toggle('facilities', facility)}
                                                    className={`chip transition ${
                                                        on ? 'border-accent-green bg-accent-green-50 font-semibold text-accent-green' : 'hover:border-accent-green/40'
                                                    }`}>
                                                {on && <CircleCheck size={12} className="text-accent-green"/>}
                                                {opt('facility', facility)}
                                            </button>
                                        )
                                    })}
                                </div>
                                <div className="mt-2.5 flex gap-2">
                                    <input className="field-input max-w-xs" value={newFacility}
                                           onChange={(event) => setNewFacility(event.target.value)}
                                           onKeyDown={(event) => {
                                               if (event.key === 'Enter') {
                                                   event.preventDefault()
                                                   addFacility()
                                               }
                                           }}
                                           placeholder={t('temple.form.phFacility')}/>
                                    <button type="button" className="btn btn-outline btn-sm" onClick={addFacility}>
                                        <Plus size={15}/> {t('temple.form.add')}
                                    </button>
                                </div>
                            </div>

                            <div className="sm:col-span-2">
                                <span className="field-label">{t('temple.form.capacity')}</span>
                                <div className="flex flex-col gap-2">
                                    {form.capacity.map((row) => (
                                        <div key={row.id} className="flex flex-wrap items-center gap-2">
                                            <input className="field-input max-w-[16rem] flex-1" value={row.label}
                                                   aria-label={t('temple.form.ariaSpace')}
                                                   placeholder={t('temple.form.phSpace')}
                                                   onChange={(event) => setCapacity(row.id, {label: event.target.value})}/>
                                            <input className="field-input max-w-32" value={row.seats}
                                                   inputMode="numeric" aria-label={t('temple.form.ariaSeats')}
                                                   placeholder={t('temple.form.phSeats')}
                                                   onChange={(event) => setCapacity(row.id, {seats: event.target.value})}/>
                                            <button type="button"
                                                    className="grid h-9 w-9 place-items-center rounded-lg border border-line text-muted hover:border-status-rose/40 hover:text-status-rose"
                                                    aria-label={t('temple.form.ariaRemoveRow', {label: row.label || t('temple.form.capacityRow')})}
                                                    onClick={() => removeCapacity(row.id)}>
                                                <Trash2 size={15}/>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <button type="button" className="btn btn-ghost btn-sm mt-2" onClick={addCapacity}>
                                    <Plus size={15}/> {t('temple.form.addCapacity')}
                                </button>
                                {errors.capacity && <p className="field-error">{errors.capacity}</p>}
                                <p className="field-hint">{t('temple.form.hintCapacity')}</p>
                            </div>

                            <Field label={t('temple.form.fLand')} htmlFor="landExtent">
                                <input id="landExtent" className="field-input" value={form.landExtent}
                                       onChange={(event) => set('landExtent', event.target.value)}
                                       placeholder={t('temple.form.phLand')}/>
                            </Field>
                        </Section>

                        {/* Dana + banking */}
                        <Section id="sec-dana" icon={<CalendarCheck size={20}/>} title={t('temple.form.secDana')}
                                 description={t('temple.form.secDanaD')}
                                 optional open={!!openSections['sec-dana']}
                                 onToggle={() => toggleSection('sec-dana')}>
                            <div className="sm:col-span-2">
                                <span className="field-label">{t('temple.form.danaSessions')}</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {DANA_SESSION_SUGGESTIONS.map((session) => {
                                        const on = form.danaSessions.includes(session)
                                        return (
                                            <button key={session} type="button" aria-pressed={on}
                                                    onClick={() => toggle('danaSessions', session)}
                                                    className={`chip transition ${
                                                        on ? 'border-accent-green bg-accent-green-50 font-semibold text-accent-green' : 'hover:border-accent-green/40'
                                                    }`}>
                                                {on && <CircleCheck size={12} className="text-accent-green"/>}
                                                {opt('dana', session)}
                                            </button>
                                        )
                                    })}
                                </div>
                                <p className="field-hint">{t('temple.form.hintDana')}</p>
                            </div>
                            <Field label={t('temple.form.fBank')} htmlFor="bank">
                                <input id="bank" className="field-input" value={form.bank}
                                       onChange={(event) => set('bank', event.target.value)}
                                       placeholder={t('temple.form.phBank')}/>
                            </Field>
                            <Field label={t('temple.form.fBranch')} htmlFor="branch">
                                <input id="branch" className="field-input" value={form.branch}
                                       onChange={(event) => set('branch', event.target.value)}
                                       placeholder={t('temple.form.phVillage')}/>
                            </Field>
                            <Field label={t('temple.form.fAccName')} htmlFor="accountName">
                                <input id="accountName" className="field-input" value={form.accountName}
                                       onChange={(event) => set('accountName', event.target.value)}
                                       placeholder={t('temple.form.phAccName')}/>
                            </Field>
                            <Field label={t('temple.form.fAccNo')} htmlFor="accountNumber">
                                <input id="accountNumber" className="field-input mono" value={form.accountNumber}
                                       onChange={(event) => set('accountNumber', event.target.value)}
                                       placeholder="0072456891"/>
                            </Field>
                        </Section>

                        {/* Media */}
                        <Section id="sec-media" icon={<ImagePlus size={20}/>} title={t('temple.form.secMedia')}
                                 description={t('temple.form.secMediaD')}
                                 optional open={!!openSections['sec-media']}
                                 onToggle={() => toggleSection('sec-media')}>
                            <div className="sm:col-span-2">
                                <label htmlFor="photo"
                                       className="flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border border-dashed border-line bg-cream px-4 py-6 text-center transition hover:border-accent-gold/50 hover:bg-accent-gold-50/40">
                                    <ImagePlus size={22} className="text-status-amber"/>
                                    <span className="text-[0.9rem] font-semibold text-ink">
                                        {photo ?? t('temple.form.photoChoose')}
                                    </span>
                                    <span className="text-[0.8rem] text-muted">{t('temple.form.photoNote')}</span>
                                    <input id="photo" type="file" accept="image/png,image/jpeg" className="hidden"
                                           onChange={(event) => setPhoto(event.target.files?.[0]?.name ?? null)}/>
                                </label>
                            </div>
                        </Section>
                    </div>

                    {/* Right rail */}
                    <div className="flex min-w-0 flex-col gap-4 xl:sticky xl:top-24">
                        <nav className="section-card px-2 py-2" aria-label={t('temple.form.navAria')}>
                            <ul className="m-0 flex list-none flex-wrap gap-1 p-0 xl:flex-col">
                                {FORM_SECTIONS.filter((item) => mayAppointCoAdmins || item.id !== 'sec-coadmin').map((item) => (
                                    <li key={item.id}>
                                        <a href={`#${item.id}`}
                                           onClick={() => setOpenSections((current) => ({...current, [item.id]: true}))}
                                           className="flex min-h-11 items-center gap-2.5 rounded-lg px-3 text-[1rem] font-medium text-ink-soft transition hover:bg-cream hover:text-ink">
                                            <span className="h-2 w-2 flex-none rounded-full bg-accent-gold"/>
                                            {t(item.labelKey)}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </nav>

                        <section className="section-card">
                            <div className="section-card-head">
                                <span
                                    className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-accent-gold-50 text-status-amber">
                                    <Info size={16}/>
                                </span>
                                <h2 className="font-temple text-[1.26rem] font-semibold text-ink">{t('temple.form.completeness')}</h2>
                            </div>
                            <div className="px-4 py-4 sm:px-5">
                                <div className="flex items-baseline justify-between">
                                    <span
                                        className="font-temple text-[1.4rem] font-semibold text-ink">{filled}%</span>
                                    <span className="text-[0.79rem] text-muted">{t('temple.form.filled')}</span>
                                </div>
                                <div className="progress-track mt-2">
                                    <div className="h-full rounded-full bg-accent-green" style={{width: `${filled}%`}}/>
                                </div>
                                <ul className="m-0 mt-3 flex list-none flex-col gap-1.5 p-0 text-[0.8rem]">
                                    {checklist.map((item) => (
                                        <li key={item.label} className="flex items-center gap-2">
                                            <CircleCheck size={14}
                                                         className={item.done ? 'text-accent-green' : 'text-muted/40'}/>
                                            <span
                                                className={item.done ? 'text-ink-soft' : 'text-muted'}>{item.label}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </section>

                        <section className="section-card">
                            <div className="section-card-head">
                                <span
                                    className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-accent-gold-50 text-status-amber">
                                    <ScrollText size={16}/>
                                </span>
                                <h2 className="font-temple text-[1.26rem] font-semibold text-ink">{t('temple.form.howApproval')}</h2>
                            </div>
                            <ul className="m-0 list-none space-y-2 px-4 py-4 text-[0.88rem] text-ink-soft sm:px-5">
                                <li className="flex gap-2"><ShieldCheck size={15}
                                                                        className="mt-0.5 flex-none text-status-amber"/>
                                    {t('temple.form.approval1')}
                                </li>
                                <li className="flex gap-2"><Users2 size={15}
                                                                   className="mt-0.5 flex-none text-status-amber"/>
                                    {t('temple.form.approval2')}
                                </li>
                                <li className="flex gap-2"><Banknote size={15}
                                                                     className="mt-0.5 flex-none text-status-amber"/>
                                    {t('temple.form.approval3')}
                                </li>
                            </ul>
                        </section>

                        <div className="flex flex-col gap-2 rounded-2xl border border-line bg-cream px-4 py-4">
                            <button type="submit" form="temple-form" className="btn btn-primary">
                                <Save size={16}/> {editing ? t('temple.form.save') : t('temple.form.submit')}
                            </button>
                            <Link to={adminRoutes.templeInformation}
                                  className="btn btn-outline">{t('common.cancel')}</Link>
                        </div>
                    </div>
                </form>

            </div>
        </AppShell>
    )
}