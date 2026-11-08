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
import {adminRoutes} from '../../routes/adminRoutes'

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
    {id: 'sec-basic', label: 'Basic information'},
    {id: 'sec-location', label: 'Location & contact'},
    {id: 'sec-contact', label: 'Contact details'},
    {id: 'sec-coadmin', label: 'Co-Administrators'},
    {id: 'sec-facilities', label: 'Facilities & capacity'},
    {id: 'sec-dana', label: 'Dana & banking'},
    {id: 'sec-media', label: 'Photos & documents'},
]

type Errors = Partial<Record<keyof FormState, string>>

/* The registration ID is issued on approval, so it is not collected here. */
const REQUIRED: (keyof FormState)[] = ['name', 'type', 'village', 'district', 'phone', 'chiefIncumbent']

const validate = (form: FormState): Errors => {
    const errors: Errors = {}
    REQUIRED.forEach((field) => {
        const value = form[field]
        if (typeof value === 'string' && value.trim() === '') errors[field] = 'This field is required'
    })
    if (form.type === 'Other' && form.otherType.trim() === '') {
        errors.otherType = 'Please type the temple type'
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Enter a valid email address'
    if (form.phone && !/^\+?[0-9\s-]{9,}$/.test(form.phone)) errors.phone = 'Enter a valid phone number'
    if (form.established && !/^(18|19|20)\d{2}$/.test(form.established)) errors.established = 'Use a four-digit year'
    if (form.capacity.some((row) => row.seats && !/^\d+$/.test(row.seats))) {
        errors.capacity = 'Seats must be numbers only'
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
    const expanded = !optional || open
    const head = (
        <>
            <span
                className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-gold-50 text-gold-700">{icon}</span>
            <div className="min-w-0 flex-1 text-left">
                <h2 className="font-temple text-[1.3rem] font-semibold text-sage-900">
                    {title}
                    {optional && (
                        <span className="ml-2 align-middle text-[0.85rem] font-semibold text-muted">(optional)</span>
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
                        className="flex w-full items-center gap-3 px-4 py-4 text-left transition hover:bg-sage-50/50 sm:px-5">
                    {head}
                    <ChevronDown size={22}
                                 className={`flex-none text-sage-700 transition ${expanded ? 'rotate-180' : ''}`}/>
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
    const {createRequest, updateRecord, getRecord} = useTemples()

    const editId = params.get('id')
    const editing = params.get('mode') === 'edit' && Boolean(editId)
    const record = editing && editId ? getRecord(editId) : undefined

    const [form, setForm] = useState<FormState>(record ? fromRecord(record) : EMPTY)
    const [errors, setErrors] = useState<Errors>({})
    const [saved, setSaved] = useState<'created' | 'updated' | null>(null)
    const [photo, setPhoto] = useState<string | null>(null)
    const [newFacility, setNewFacility] = useState('')
    /* The role chosen in the "Appoint a Co-Administrator" dropdown. */
    const [appointRole, setAppointRole] = useState('')
    /* Optional sections are closed until asked for - a short form reads as a simple form. */
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({})
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

    /* One appointment per role: adding a role that is already taken is blocked in the UI. */
    /* A temple may appoint more than two Co-Administrators and repeat a designation (an assistant
       representative, a second technical contact), so the list is never filtered down. */
    const designationOptions = CO_ADMIN_ROLES

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
        {label: 'Temple name', done: form.name !== ''},
        {label: 'Temple type', done: form.type !== ''},
        {label: 'Chief incumbent', done: form.chiefIncumbent !== ''},
        {label: 'Location', done: form.village !== '' && form.district !== ''},
        {label: 'Phone', done: form.phone !== ''},
        {label: 'Capacity', done: form.capacity.some((row) => row.seats !== '')},
        {label: 'Co-Administrators', done: form.coAdmins.length > 0},
        {label: 'Dana & banking', done: form.accountNumber !== ''},
    ]), [form])

    const filled = Math.round((checklist.filter((item) => item.done).length / checklist.length) * 100)

    /* An edit link for a record that has since been dropped lands back on the list. The guard sits
       after every hook so the hook order never changes between renders. */
    if (editing && !record) return <Navigate to={adminRoutes.templeInformation} replace/>

    const onSubmit = (event: FormEvent) => {
        event.preventDefault()
        const nextErrors = validate(form)
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
            coAdmins: form.coAdmins,
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
        <AppShell>
            <div className="mx-auto flex max-w-[105rem] flex-col gap-4">

                <header className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <Link to={adminRoutes.templeInformation}
                              className="inline-flex items-center gap-1.5 text-[0.78rem] font-semibold text-muted hover:text-sage-800">
                            <ArrowLeft size={14}/> Back to temple information
                        </Link>
                        <h1 className="mt-1 font-temple text-[1.6rem] leading-tight font-semibold text-sage-900 sm:text-[1.9rem]">
                            {editing ? 'Edit temple' : 'Add New Temple'}
                        </h1>
                        <p className="mt-1 max-w-[76ch] text-[0.9rem] text-ink-soft">
                            {editing
                                ? 'Changes to an active temple are saved straight away. A request that is still waiting for approval stays in the queue.'
                                : 'Submit the temple for registration. Quick Solutions (PVT) Ltd. reviews the request and assigns the registration ID.'}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link to={adminRoutes.templeInformation} className="btn btn-outline btn-sm">Cancel</Link>
                        <button type="submit" form="temple-form" className="btn btn-primary btn-sm">
                            <Save size={15}/> {editing ? 'Save changes' : 'Submit for approval'}
                        </button>
                    </div>
                </header>

                {/* Registration ID is issued by the system, never typed here. */}
                <div className="info-note items-start">
                    <ShieldCheck size={17} className="mt-0.5 flex-none text-gold-700"/>
                    <span>
                        {assignedId
                            ? <>Registration ID <strong className="mono">{assignedId}</strong> was assigned by the
                                system
                                administrator on approval. It cannot be edited here.</>
                            : <>The <strong>Registration ID is generated when Quick Solutions (PVT) Ltd.
                                approves</strong> this
                                request. Until then the temple stays editable, and you can drop the request from the
                                temple information list.</>}
                    </span>
                </div>

                {record?.status === 'Pending approval' && (
                    <div
                        className="flex items-start gap-2.5 rounded-xl border border-accent-gold/40 bg-accent-gold-50 px-4 py-3 text-[0.86rem] text-status-amber">
                        <CircleAlert size={17} className="mt-0.5 flex-none"/>
                        <span>This request is still pending approval. You can edit it or drop it until the system
                            administrator reviews it.</span>
                    </div>
                )}

                {record?.status === 'Changes requested' && record.reviewNote && (
                    <div role="alert"
                         className="flex items-start gap-2.5 rounded-xl border border-accent-blue/30 bg-accent-blue-50 px-4 py-3 text-[0.86rem] text-accent-blue">
                        <Info size={17} className="mt-0.5 flex-none"/>
                        <span><strong className="font-semibold">Quick Solutions (PVT) Ltd.:</strong> {record.reviewNote}
                            <span className="mt-0.5 block text-ink-soft">Saving puts the request back in the approval queue.</span></span>
                    </div>
                )}

                {saved && (
                    <div role="status"
                         className="flex items-start gap-2.5 rounded-xl border border-accent-green/30 bg-accent-green-50 px-4 py-3 text-[0.86rem] text-accent-green">
                        <CircleCheck size={17} className="mt-0.5 flex-none"/>
                        <div>
                            <strong className="block font-semibold">
                                {saved === 'updated' ? 'Temple details updated' : 'Registration request submitted'}
                            </strong>
                            <span className="text-ink-soft">Saved in this browser session only - the backend has no
                                temple endpoints yet.</span>
                        </div>
                    </div>
                )}

                {Object.keys(errors).length > 0 && (
                    <div role="alert"
                         className="flex items-start gap-2.5 rounded-xl border border-status-rose/30 bg-lotus-50 px-4 py-3 text-[0.86rem] text-status-rose">
                        <CircleAlert size={17} className="mt-0.5 flex-none"/>
                        <span>{Object.keys(errors).length} field(s) still need attention before this can be
                            saved.</span>
                    </div>
                )}

                <form id="temple-form" onSubmit={onSubmit} noValidate
                      className="grid items-start gap-4 xl:grid-cols-[1.55fr_1fr]">

                    <div className="flex min-w-0 flex-col gap-4">
                        {/* Basic information */}
                        <Section id="sec-basic" icon={<Landmark size={20}/>} title="Basic Information"
                                 description="Temple name, type and chief incumbent. The registration ID is added on approval.">
                            <Field label="Temple Name" required error={errors.name} htmlFor="name">
                                <input id="name" className="field-input" value={form.name}
                                       onChange={(event) => set('name', event.target.value)}
                                       placeholder="Sri Sambodhi Maha Viharaya"/>
                            </Field>
                            {/* Open list: temples use many types, so anything can be typed. */}
                            <SelectField id="type" label="Temple type" creatable searchable
                                         icon={<Landmark size={17}/>}
                                         placeholder="Select or type a temple type"
                                         options={TEMPLE_TYPES} value={form.type}
                                         onChange={(value) => set('type', value)} error={errors.type}
                                         hint="Choose “Other” to type a type that is not in the list."/>
                            {form.type === 'Other' && (
                                <Field label="Other temple type" required error={errors.otherType}
                                       htmlFor="otherType" hint="For example: Sri Maha Bodhi Viharaya">
                                    <input id="otherType" className="field-input" value={form.otherType}
                                           onChange={(event) => set('otherType', event.target.value)}
                                           placeholder="Type the temple type"/>
                                </Field>
                            )}
                            <Field label="Chief Incumbent" required error={errors.chiefIncumbent}
                                   htmlFor="chiefIncumbent">
                                <input id="chiefIncumbent" className="field-input" value={form.chiefIncumbent}
                                       onChange={(event) => set('chiefIncumbent', event.target.value)}
                                       placeholder="Ven. Kamburugamuwa Dhammika Thero"/>
                            </Field>
                            <Field label="Established" error={errors.established} htmlFor="established"
                                   hint="Year the temple was established">
                                <input id="established" className="field-input" inputMode="numeric" maxLength={4}
                                       value={form.established}
                                       onChange={(event) => set('established', event.target.value)} placeholder="1892"/>
                            </Field>
                            <div className="sm:col-span-2">
                                <Field label="About the temple" htmlFor="description">
                                    <textarea id="description" className="field-input min-h-24 resize-y"
                                              value={form.description}
                                              onChange={(event) => set('description', event.target.value)}
                                              placeholder="Short history of the temple, its bodhiya and regular programmes."/>
                                </Field>
                            </div>
                        </Section>

                        {/* Location */}
                        <Section id="sec-location" icon={<MapPin size={20}/>} title="Location & Contact"
                                 description="Used for the Divisional Secretariat reports and the public temple list.">
                            <div className="sm:col-span-2">
                                <Field label="Address" htmlFor="address">
                                    <input id="address" className="field-input" value={form.address}
                                           onChange={(event) => set('address', event.target.value)}
                                           placeholder="Temple Road, Kadolkele"/>
                                </Field>
                            </div>
                            <Field label="Village" required error={errors.village} htmlFor="village">
                                <input id="village" className="field-input" value={form.village}
                                       onChange={(event) => set('village', event.target.value)}
                                       placeholder="Kadolkele"/>
                            </Field>
                            <Field label="Grama Niladhari division" htmlFor="gnDivision">
                                <input id="gnDivision" className="field-input" value={form.gnDivision}
                                       onChange={(event) => set('gnDivision', event.target.value)}/>
                            </Field>
                            <Field label="Divisional Secretariat" htmlFor="dsDivision">
                                <input id="dsDivision" className="field-input" value={form.dsDivision}
                                       onChange={(event) => set('dsDivision', event.target.value)}
                                       placeholder="Biyagama"/>
                            </Field>
                            <Field label="Postal code" htmlFor="postalCode">
                                <input id="postalCode" className="field-input" inputMode="numeric" maxLength={5}
                                       value={form.postalCode}
                                       onChange={(event) => set('postalCode', event.target.value)} placeholder="11500"/>
                            </Field>
                            <SelectField id="district" label="District" searchable
                                         icon={<MapPin size={17}/>}
                                         placeholder="Select district" options={DISTRICTS_EN}
                                         value={form.district} onChange={(value) => set('district', value)}
                                         error={errors.district}/>
                            <SelectField id="province" label="Province"
                                         icon={<MapPin size={17}/>}
                                         placeholder="Select province" options={PROVINCES}
                                         value={form.province} onChange={(value) => set('province', value)}/>
                        </Section>

                        {/* Contact */}
                        <Section id="sec-contact" icon={<Phone size={20}/>} title="Contact Details"
                                 description="Where devotees and the divisional office reach the temple.">
                            <Field label="Phone" required error={errors.phone} htmlFor="phone">
                                <input id="phone" className="field-input" value={form.phone}
                                       onChange={(event) => set('phone', event.target.value)}
                                       placeholder="+94 31 223 4478"/>
                            </Field>
                            <Field label="Secondary phone" htmlFor="phoneAlt">
                                <input id="phoneAlt" className="field-input" value={form.phoneAlt}
                                       onChange={(event) => set('phoneAlt', event.target.value)}
                                       placeholder="+94 77 312 6640"/>
                            </Field>
                            <Field label="Email" error={errors.email} htmlFor="email">
                                <input id="email" type="email" className="field-input" value={form.email}
                                       onChange={(event) => set('email', event.target.value)}
                                       placeholder="office@sambodhiviharaya.lk"/>
                            </Field>
                            <Field label="Website" htmlFor="website">
                                <input id="website" className="field-input" value={form.website}
                                       onChange={(event) => set('website', event.target.value)}
                                       placeholder="sambodhiviharaya.lk"/>
                            </Field>
                        </Section>

                        {/* Co-Administrators - proposal 10.2.3 names two designations, but a temple may
                            appoint more than two people and repeat a designation. */}
                        <Section id="sec-coadmin" icon={<UserCog size={20}/>} title="Co-Administrators"
                                 description="Appoint the Authorized Religious Representative and the Designated Technical Administrator, plus anyone else who helps run the temple.">
                            <div className="sm:col-span-2 flex flex-col gap-3">
                                {form.coAdmins.length === 0 && (
                                    <p className="rounded-xl border border-dashed border-line bg-cream px-3 py-4 text-[0.84rem] text-muted">
                                        No Co-Administrators appointed yet. Start with the Authorized Religious
                                        Representative and the Designated Technical Administrator, then add anyone else
                                        who helps run the temple.
                                    </p>
                                )}

                                {form.coAdmins.map((admin) => (
                                    <div key={admin.id} className="rounded-xl border border-line bg-cream/50 p-3">
                                        <div className="mb-2.5 flex flex-wrap items-center gap-2">
                                            <span className="badge badge-gold">{coAdminRoleShort(admin.role)}</span>
                                            <span
                                                className={`badge ${admin.status === 'Active' ? 'badge-green' : 'badge-neutral'}`}>
                                                {admin.status}
                                            </span>
                                            <button type="button"
                                                    className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[0.78rem] font-semibold text-muted transition hover:bg-white hover:text-status-rose"
                                                    onClick={() => removeCoAdmin(admin.id)}>
                                                <Trash2 size={13}/> Remove
                                            </button>
                                        </div>
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            <Field label="Full name" required htmlFor={`${admin.id}-name`}>
                                                <input id={`${admin.id}-name`} className="field-input"
                                                       value={admin.name}
                                                       placeholder={admin.role === 'Authorized Religious Representative'
                                                           ? 'Ven. … Thero'
                                                           : 'Mr./Mrs. …'}
                                                       onChange={(event) => setCoAdmin(admin.id, {name: event.target.value})}/>
                                            </Field>
                                            <Field label="NIC / reference" htmlFor={`${admin.id}-ref`}
                                                   hint="NIC, or the office reference the temple keeps">
                                                <input id={`${admin.id}-ref`} className="field-input mono"
                                                       value={admin.reference}
                                                       placeholder="NIC 198512304567"
                                                       onChange={(event) => setCoAdmin(admin.id, {reference: event.target.value})}/>
                                            </Field>
                                            <Field label="Email" htmlFor={`${admin.id}-email`}>
                                                <input id={`${admin.id}-email`} type="email" className="field-input"
                                                       value={admin.email}
                                                       placeholder="name@example.lk"
                                                       onChange={(event) => setCoAdmin(admin.id, {email: event.target.value})}/>
                                            </Field>
                                            <Field label="Phone" htmlFor={`${admin.id}-phone`}>
                                                <input id={`${admin.id}-phone`} className="field-input"
                                                       value={admin.phone}
                                                       placeholder="+94 77 000 0000"
                                                       onChange={(event) => setCoAdmin(admin.id, {phone: event.target.value})}/>
                                            </Field>
                                            <SelectField id={`${admin.id}-status`} label="Appointment status"
                                                         icon={<BadgeCheck size={17}/>}
                                                         placeholder="Select status"
                                                         options={['Invited', 'Active', 'Suspended']}
                                                         value={admin.status}
                                                         onChange={(value) => setCoAdmin(admin.id, {status: value as CoAdministrator['status']})}/>
                                            <Field label="Appointed on" htmlFor={`${admin.id}-date`}>
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
                                        <SelectField id="appoint-role" label="Designation"
                                                     icon={<UserCog size={19}/>} creatable searchable
                                                     placeholder="Choose or type a designation"
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
                                        <UserPlus size={18}/> Appoint
                                    </button>
                                </div>
                                <p className="field-hint">
                                    Pick the two named roles, or type another designation.
                                </p>
                                <p className="field-hint">
                                    Co-Administrators get temple-level access only. They never receive platform
                                    (platform administrator) privileges.
                                </p>
                            </div>
                        </Section>

                        {/* Facilities - additions allowed */}
                        <Section id="sec-facilities" icon={<Building2 size={20}/>} title="Facilities & Capacity"
                                 description="Tick what is on the premises, then record the seating for each hall."
                                 optional open={!!openSections['sec-facilities']}
                                 onToggle={() => toggleSection('sec-facilities')}>
                            <div className="sm:col-span-2">
                                <span className="field-label">Facilities</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {Array.from(new Set([...FACILITY_SUGGESTIONS, ...form.facilities])).map((facility) => {
                                        const on = form.facilities.includes(facility)
                                        return (
                                            <button key={facility} type="button" aria-pressed={on}
                                                    onClick={() => toggle('facilities', facility)}
                                                    className={`chip transition ${
                                                        on ? 'border-sage-600 bg-sage-50 font-semibold text-sage-800' : 'hover:border-sage-300'
                                                    }`}>
                                                {on && <CircleCheck size={12} className="text-accent-green"/>}
                                                {facility}
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
                                           placeholder="Add another facility"/>
                                    <button type="button" className="btn btn-outline btn-sm" onClick={addFacility}>
                                        <Plus size={15}/> Add
                                    </button>
                                </div>
                            </div>

                            <div className="sm:col-span-2">
                                <span className="field-label">Capacity</span>
                                <div className="flex flex-col gap-2">
                                    {form.capacity.map((row) => (
                                        <div key={row.id} className="flex flex-wrap items-center gap-2">
                                            <input className="field-input max-w-[16rem] flex-1" value={row.label}
                                                   aria-label="Space name" placeholder="e.g. Dana hall"
                                                   onChange={(event) => setCapacity(row.id, {label: event.target.value})}/>
                                            <input className="field-input max-w-32" value={row.seats}
                                                   inputMode="numeric" aria-label="Seats"
                                                   placeholder="Seats"
                                                   onChange={(event) => setCapacity(row.id, {seats: event.target.value})}/>
                                            <button type="button"
                                                    className="grid h-9 w-9 place-items-center rounded-lg border border-line text-muted hover:border-status-rose/40 hover:text-status-rose"
                                                    aria-label={`Remove ${row.label || 'capacity row'}`}
                                                    onClick={() => removeCapacity(row.id)}>
                                                <Trash2 size={15}/>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <button type="button" className="btn btn-ghost btn-sm mt-2" onClick={addCapacity}>
                                    <Plus size={15}/> Add capacity field
                                </button>
                                {errors.capacity && <p className="field-error">{errors.capacity}</p>}
                                <p className="field-hint">One row per hall or space. Seats are numbers only.</p>
                            </div>

                            <Field label="Land extent" htmlFor="landExtent">
                                <input id="landExtent" className="field-input" value={form.landExtent}
                                       onChange={(event) => set('landExtent', event.target.value)}
                                       placeholder="2 acres, 1 rood, 12 perches"/>
                            </Field>
                        </Section>

                        {/* Dana + banking */}
                        <Section id="sec-dana" icon={<CalendarCheck size={20}/>} title="Dana & Banking"
                                 description="Which dana sessions this temple offers, and where donations are banked."
                                 optional open={!!openSections['sec-dana']}
                                 onToggle={() => toggleSection('sec-dana')}>
                            <div className="sm:col-span-2">
                                <span className="field-label">Dana sessions</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {DANA_SESSION_SUGGESTIONS.map((session) => {
                                        const on = form.danaSessions.includes(session)
                                        return (
                                            <button key={session} type="button" aria-pressed={on}
                                                    onClick={() => toggle('danaSessions', session)}
                                                    className={`chip transition ${
                                                        on ? 'border-sage-600 bg-sage-50 font-semibold text-sage-800' : 'hover:border-sage-300'
                                                    }`}>
                                                {on && <CircleCheck size={12} className="text-accent-green"/>}
                                                {session}
                                            </button>
                                        )
                                    })}
                                </div>
                                <p className="field-hint">Session times are configured later under Dana Management.</p>
                            </div>
                            <Field label="Bank" htmlFor="bank">
                                <input id="bank" className="field-input" value={form.bank}
                                       onChange={(event) => set('bank', event.target.value)}
                                       placeholder="Bank of Ceylon"/>
                            </Field>
                            <Field label="Branch" htmlFor="branch">
                                <input id="branch" className="field-input" value={form.branch}
                                       onChange={(event) => set('branch', event.target.value)} placeholder="Kadolkele"/>
                            </Field>
                            <Field label="Account name" htmlFor="accountName">
                                <input id="accountName" className="field-input" value={form.accountName}
                                       onChange={(event) => set('accountName', event.target.value)}
                                       placeholder="Sri Sambodhi Maha Viharaya - Dayaka Sabha"/>
                            </Field>
                            <Field label="Account number" htmlFor="accountNumber">
                                <input id="accountNumber" className="field-input mono" value={form.accountNumber}
                                       onChange={(event) => set('accountNumber', event.target.value)}
                                       placeholder="0072456891"/>
                            </Field>
                        </Section>

                        {/* Media */}
                        <Section id="sec-media" icon={<ImagePlus size={20}/>} title="Photos & Documents"
                                 description="One photo of the Buddha Mandiraya for the temple directory."
                                 optional open={!!openSections['sec-media']}
                                 onToggle={() => toggleSection('sec-media')}>
                            <div className="sm:col-span-2">
                                <label htmlFor="photo"
                                       className="flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border border-dashed border-line bg-cream px-4 py-6 text-center transition hover:border-sage-400 hover:bg-sage-50/40">
                                    <ImagePlus size={22} className="text-gold-700"/>
                                    <span className="text-[0.85rem] font-semibold text-sage-900">
                                        {photo ?? 'Choose a photo (JPG or PNG, up to 4 MB)'}
                                    </span>
                                    <span className="text-[0.74rem] text-muted">Nothing is uploaded yet - the file name
                                        is only kept in this form.</span>
                                    <input id="photo" type="file" accept="image/png,image/jpeg" className="hidden"
                                           onChange={(event) => setPhoto(event.target.files?.[0]?.name ?? null)}/>
                                </label>
                            </div>
                        </Section>
                    </div>

                    {/* Right rail */}
                    <div className="flex min-w-0 flex-col gap-4 xl:sticky xl:top-24">
                        <nav className="section-card px-2 py-2" aria-label="Form sections">
                            <ul className="m-0 flex list-none flex-wrap gap-1 p-0 xl:flex-col">
                                {FORM_SECTIONS.map((item) => (
                                    <li key={item.id}>
                                        <a href={`#${item.id}`}
                                           onClick={() => setOpenSections((current) => ({...current, [item.id]: true}))}
                                           className="flex min-h-11 items-center gap-2.5 rounded-lg px-3 text-[1rem] font-medium text-ink-soft transition hover:bg-sage-50 hover:text-sage-900">
                                            <span className="h-2 w-2 flex-none rounded-full bg-gold-500"/>
                                            {item.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </nav>

                        <section className="section-card">
                            <div className="section-card-head">
                                <span
                                    className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-gold-50 text-gold-700">
                                    <Info size={16}/>
                                </span>
                                <h2 className="font-temple text-[1.2rem] font-semibold text-sage-900">Profile
                                    completeness</h2>
                            </div>
                            <div className="px-4 py-4 sm:px-5">
                                <div className="flex items-baseline justify-between">
                                    <span
                                        className="font-temple text-[1.4rem] font-semibold text-sage-900">{filled}%</span>
                                    <span className="text-[0.73rem] text-muted">filled so far</span>
                                </div>
                                <div className="progress-track mt-2">
                                    <div className="h-full rounded-full bg-sage-600" style={{width: `${filled}%`}}/>
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
                                    className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-sage-50 text-sage-700">
                                    <ScrollText size={16}/>
                                </span>
                                <h2 className="font-temple text-[1.2rem] font-semibold text-sage-900">How approval
                                    works</h2>
                            </div>
                            <ul className="m-0 list-none space-y-2 px-4 py-4 text-[0.82rem] text-ink-soft sm:px-5">
                                <li className="flex gap-2"><ShieldCheck size={15}
                                                                        className="mt-0.5 flex-none text-gold-700"/>
                                    Quick Solutions (PVT) Ltd. reviews every new temple and assigns its
                                    registration ID.
                                </li>
                                <li className="flex gap-2"><Users2 size={15}
                                                                   className="mt-0.5 flex-none text-gold-700"/>
                                    While the request is pending you can edit it or drop it from the temple list.
                                </li>
                                <li className="flex gap-2"><Banknote size={15}
                                                                     className="mt-0.5 flex-none text-gold-700"/>
                                    Deleting an approved temple needs Quick Solutions (PVT) Ltd. to agree, so it
                                    becomes a deletion request.
                                </li>
                            </ul>
                        </section>

                        <div className="flex flex-col gap-2 rounded-2xl border border-line bg-cream px-4 py-4">
                            <button type="submit" form="temple-form" className="btn btn-primary">
                                <Save size={16}/> {editing ? 'Save changes' : 'Submit for approval'}
                            </button>
                            <Link to={adminRoutes.templeInformation} className="btn btn-outline">Cancel</Link>
                        </div>
                    </div>
                </form>
            </div>
        </AppShell>
    )
}