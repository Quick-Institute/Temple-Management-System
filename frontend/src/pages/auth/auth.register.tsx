import type {FormEvent, ReactNode} from 'react'
import {useEffect, useId, useRef, useState} from 'react'
import {Link, useNavigate} from 'react-router-dom'
import {LotusMark, TempleMark} from '../../components/AuthIcons'
import {AuthShell} from '../../layouts/AuthShell'
import {authRoutes} from '../../routes/authRoutes'

/* ------------------------------------------------------------------ */
/* Icons — hand-drawn to match the line icons used on the login screen */
/* ------------------------------------------------------------------ */

type IconName =
    | 'briefcase' | 'chevron' | 'eye' | 'eyeOff' | 'hash' | 'home' | 'key' | 'mail'
    | 'check' | 'map' | 'pin' | 'mailbox' | 'person' | 'phone' | 'temple' | 'user' | 'userPlus' | 'users'

const Icon = ({name, size = 18}: { name: IconName; size?: number }) => {
    /* The Temple Admin tab and the Temple Code field use the supplied temple mark. */
    if (name === 'temple') return <TempleMark size={size}/>

    const paths: Record<IconName, ReactNode> = {
        person: <>
            <circle cx="12" cy="8" r="3.4"/>
            <path d="M5 20.2v-1.1c0-3.2 3.1-5.2 7-5.2s7 2 7 5.2v1.1"/>
        </>,
        user: <>
            <circle cx="12" cy="12" r="9"/>
            <circle cx="12" cy="10" r="3"/>
            <path d="M6.4 19.2a6.1 6.1 0 0 1 11.2 0"/>
        </>,
        users: <>
            <circle cx="9.5" cy="8.5" r="3.2"/>
            <path d="M3 20v-1.1c0-3 2.9-4.9 6.5-4.9s6.5 1.9 6.5 4.9V20"/>
            <path d="M17 5.6a3.2 3.2 0 0 1 0 5.8M18.3 20v-1.1a5 5 0 0 0-1.5-3.5"/>
        </>,
        temple: <>
            <path d="M3 10.5 12 3.5l9 7"/>
            <path d="M5.5 9.8V20.5h13V9.8"/>
            <path d="M9.5 20.5v-5.7h5v5.7"/>
        </>,
        mail: <>
            <rect x="2.8" y="5" width="18.4" height="14" rx="2"/>
            <path d="m3.5 6.5 8.5 6 8.5-6"/>
        </>,
        phone: <>
            <path
                d="M6.5 3.8h3l1.5 3.8-2 1.4a11 11 0 0 0 5.6 5.6l1.4-2 3.8 1.5v3a2 2 0 0 1-2.2 2A16.6 16.6 0 0 1 4.5 6a2 2 0 0 1 2-2.2Z"/>
        </>,
        briefcase: <>
            <rect x="3" y="7.5" width="18" height="12" rx="2"/>
            <path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5M3 12.5h18"/>
        </>,
        key: <>
            <circle cx="8.5" cy="15.5" r="3.5"/>
            <path d="m11 13 8-8M16 5h3v3M14 7l3 3"/>
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
        hash: <>
            <path d="M9 3.5 7.5 20.5M16.5 3.5 15 20.5M3.5 9h17M3 15h17"/>
        </>,
        home: <>
            <path d="M3.5 10.5 12 3.5l8.5 7"/>
            <path d="M5.5 9.8V20.5h13V9.8"/>
        </>,
        pin: <>
            <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z"/>
            <circle cx="12" cy="10" r="2.6"/>
        </>,
        map: <>
            <path d="m3 6.5 6-2.5 6 2.5 6-2.5v13.5l-6 2.5-6-2.5-6 2.5V6.5Z"/>
            <path d="M9 4v14M15 6.5v14"/>
        </>,
        mailbox: <>
            <rect x="3" y="8" width="18" height="11" rx="2"/>
            <path d="M3 12.5h18M7 8V5.5h10V8"/>
        </>,
        chevron: <path d="m6 9.5 6 6 6-6"/>,
        check: <path d="m5 12.5 4.5 4.5L19 7.5"/>,
        userPlus: <>
            <circle cx="9" cy="8" r="3"/>
            <path d="M3.5 20v-1.5C3.5 15.9 5.9 14 9 14s5.5 1.9 5.5 4.5V20M18 8v7M14.5 11.5h7"/>
        </>,
    }

    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.55}
             strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="flex-none">
            {paths[name]}
        </svg>
    )
}


const GoogleIcon = () => (
    <svg className="h-6 w-6 flex-none" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#fff"
              d="M21.35 12.24c0-.71-.06-1.39-.18-2.04H12v3.86h5.24a4.48 4.48 0 0 1-1.94 2.94v2.5h3.14c1.84-1.7 2.91-4.2 2.91-7.26Z"/>
        <path fill="#fff" opacity=".85"
              d="M12 21.75c2.63 0 4.84-.87 6.45-2.36L15.3 16.9c-.87.59-1.98.94-3.3.94-2.54 0-4.69-1.72-5.46-4.03H3.3v2.58A9.75 9.75 0 0 0 12 21.75Z"/>
        <path fill="#fff" opacity=".7"
              d="M6.54 13.81A5.86 5.86 0 0 1 6.24 12c0-.63.11-1.24.3-1.81V7.61H3.3A9.75 9.75 0 0 0 2.25 12c0 1.58.38 3.08 1.05 4.39l3.24-2.58Z"/>
        <path fill="#fff" opacity=".9"
              d="M12 6.16c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.27 14.63 2.25 12 2.25a9.75 9.75 0 0 0-8.7 5.36l3.24 2.58C7.31 7.88 9.46 6.16 12 6.16Z"/>
    </svg>
)

const FacebookIcon = () => (
    <svg className="h-6 w-6 flex-none" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="10" fill="#1877F2"/>
        <path fill="#fff"
              d="M13.28 19v-6.1h2.05l.31-2.37h-2.36V9.02c0-.69.19-1.16 1.18-1.16h1.26V5.74a16.91 16.91 0 0 0-1.84-.1c-1.82 0-3.07 1.11-3.07 3.15v1.74H8.75v2.37h2.06V19h2.47Z"/>
    </svg>
)

/* ------------------------------------------------------------------ */
/* Roles + options                                                     */
/* ------------------------------------------------------------------ */

type Role = 'temple-admin' | 'committee-member' | 'family-user'

const ROLES: { key: Role; label: string; icon: IconName; blurb: string }[] = [
    {
        key: 'temple-admin',
        label: 'Temple Admin',
        icon: 'temple',
        blurb: 'Registers the temple and becomes its Main Admin.'
    },
    {
        key: 'committee-member',
        label: 'Committee Member',
        icon: 'users',
        blurb: 'Joins a temple that has already registered.'
    },
    {
        key: 'family-user',
        label: 'Family User',
        icon: 'user',
        blurb: 'Books Dana and follows temple news with your family.'
    },
]

const ADMIN_DESIGNATIONS = ['Chief Incumbent Monk', 'Authorized Religious Representative', 'Designated Technical Administrator']

const COMMITTEES = ['Dayaka Sabhawa', 'Event or Programme Committee', 'Other']

const COMMITTEE_DESIGNATIONS = [
    'President', 'Vice-President', 'Secretary', 'Assistant Secretary', 'Treasurer', 'Committee Member', 'Other',
]

const DISTRICTS = [
    'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 'Galle', 'Gampaha', 'Hambantota', 'Jaffna',
    'Kalutara', 'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar', 'Matale', 'Matara', 'Monaragala',
    'Mullaitivu', 'Nuwara Eliya', 'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya',
]

/* ------------------------------------------------------------------ */
/* Field primitives                                                    */
/* ------------------------------------------------------------------ */

const labelClass = 'mb-2 block text-[1.02rem] leading-none text-[#16241c]'
const boxClass =
    'flex h-[42px] items-center gap-3 rounded-[8px] border border-[#2b3a30] bg-white px-3 text-[#2b3a30] transition ' +
    'focus-within:shadow-[0_0_0_3px_rgba(27,98,75,.14)]'
const inputClass =
    'w-px min-w-0 flex-1 border-0 bg-transparent p-0 text-[1rem] text-[#1f2d26] outline-none placeholder:text-[#8b8b8b] sm:text-[0.86rem]'

type TextFieldProps = {
    id: string
    label: string
    icon: IconName
    placeholder: string
    type?: 'text' | 'email' | 'tel' | 'password'
    autoComplete?: string
    value: string
    onChange: (value: string) => void
    error?: string
    full?: boolean
}

const FieldError = ({id, message}: { id: string; message?: string }) =>
    message ? <span id={`${id}-error`} role="alert"
                    className="mt-1.5 block text-[0.72rem] leading-snug text-status-rose">{message}</span> : null

const TextField = ({
                       id,
                       label,
                       icon,
                       placeholder,
                       type = 'text',
                       autoComplete,
                       value,
                       onChange,
                       error,
                       full
                   }: TextFieldProps) => (
    <div className={full ? 'sm:col-span-2' : undefined}>
        <label className={labelClass} htmlFor={id}>{label}</label>
        <div className={`${boxClass} ${error ? 'border-status-rose shadow-[0_0_0_3px_rgba(173,28,3,.12)]' : ''}`}>
            <Icon name={icon} size={17}/>
            <input
                id={id}
                name={id}
                type={type}
                className={inputClass}
                placeholder={placeholder}
                autoComplete={autoComplete}
                value={value}
                aria-invalid={Boolean(error) || undefined}
                aria-describedby={error ? `${id}-error` : undefined}
                onChange={(event) => onChange(event.target.value)}
            />
        </div>
        <FieldError id={id} message={error}/>
    </div>
)

const PasswordField = ({id, label, placeholder, value, onChange, autoComplete, error, newRow}: {
    id: string
    label: string
    placeholder: string
    value: string
    onChange: (value: string) => void
    autoComplete: string
    error?: string
    newRow?: boolean
}) => {
    const [visible, setVisible] = useState(false)
    return (
        <div className={newRow ? 'sm:col-start-1' : undefined}>
            <label className={labelClass} htmlFor={id}>{label}</label>
            <div className={`${boxClass} ${error ? 'border-status-rose shadow-[0_0_0_3px_rgba(173,28,3,.12)]' : ''}`}>
                <Icon name="key" size={17}/>
                <input
                    id={id}
                    name={id}
                    type={visible ? 'text' : 'password'}
                    className={inputClass}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    value={value}
                    aria-invalid={Boolean(error) || undefined}
                    aria-describedby={error ? `${id}-error` : undefined}
                    onChange={(event) => onChange(event.target.value)}
                />
                <button
                    type="button"
                    onClick={() => setVisible((current) => !current)}
                    className="grid place-items-center rounded p-0.5 text-[#2b3a30] hover:text-[#14512f]"
                    aria-label={visible ? 'Hide password' : 'Show password'}
                    aria-pressed={visible}>
                    <Icon name={visible ? 'eye' : 'eyeOff'} size={17}/>
                </button>
            </div>
            <FieldError id={id} message={error}/>
        </div>
    )
}

/**
 * Padded, responsive replacement for a native <select>.
 *
 * A native select popup is painted by the operating system, so its row padding, width and z-order
 * cannot be styled — on Windows it renders tight, borderless rows that overhang the field. This
 * listbox draws the panel itself: 10px panel padding, 14px/10px option padding, a scroll area
 * capped at 16rem, and it flips above the field when there is not enough room below.
 */
const SelectField = ({id, label, icon, placeholder, options, value, onChange, error, full}: {
    id: string
    label: string
    icon: IconName
    placeholder: string
    options: string[]
    value: string
    onChange: (value: string) => void
    error?: string
    full?: boolean
}) => {
    const [open, setOpen] = useState(false)
    const [flipUp, setFlipUp] = useState(false)
    const [active, setActive] = useState(-1)
    const wrapRef = useRef<HTMLDivElement>(null)
    const buttonRef = useRef<HTMLButtonElement>(null)
    const listRef = useRef<HTMLDivElement>(null)
    const listId = useId()
    const all = [placeholder, ...options]

    /* Close on an outside press or Escape, exactly like the dashboard popovers. */
    useEffect(() => {
        if (!open) return
        const onPointerDown = (event: PointerEvent) => {
            if (!wrapRef.current?.contains(event.target as Node)) setOpen(false)
        }
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setOpen(false)
                buttonRef.current?.focus()
            }
        }
        document.addEventListener('pointerdown', onPointerDown)
        document.addEventListener('keydown', onKeyDown)
        return () => {
            document.removeEventListener('pointerdown', onPointerDown)
            document.removeEventListener('keydown', onKeyDown)
        }
    }, [open])

    /* Keep the highlighted row visible inside the scroll area. */
    useEffect(() => {
        if (!open || active < 0) return
        document.getElementById(`${listId}-${active}`)?.scrollIntoView({block: 'nearest'})
    }, [open, active, listId])

    const openList = () => {
        const box = wrapRef.current?.getBoundingClientRect()
        /* Flip above when the field sits too low for a 16rem panel to fit under it. */
        if (box) setFlipUp(box.bottom + 288 > window.innerHeight && box.top > window.innerHeight - box.bottom)
        setActive(Math.max(0, all.indexOf(value)))
        setOpen(true)
    }

    const choose = (option: string) => {
        onChange(option === placeholder ? '' : option)
        setOpen(false)
        buttonRef.current?.focus()
    }

    const onKeyDown = (event: React.KeyboardEvent) => {
        if (!open) {
            if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
                event.preventDefault()
                openList()
            }
            return
        }
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            setActive((index) => {
                const next = event.key === 'ArrowDown' ? index + 1 : index - 1
                return (next + all.length) % all.length
            })
        } else if (event.key === 'Home' || event.key === 'End') {
            event.preventDefault()
            setActive(event.key === 'Home' ? 0 : all.length - 1)
        } else if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            choose(all[active] ?? placeholder)
        } else if (event.key === 'Tab') {
            setOpen(false)
        }
    }

    return (
        <div className={full ? 'sm:col-span-2' : undefined}>
            <label className={labelClass} htmlFor={id}>{label}</label>
            <div className="relative" ref={wrapRef}>
                <div
                    className={`${boxClass} ${error ? 'border-status-rose shadow-[0_0_0_3px_rgba(173,28,3,.12)]' : ''} ${open ? 'border-[#14512f] shadow-[0_0_0_3px_rgba(27,98,75,.14)]' : ''}`}>
                    <Icon name={icon} size={17}/>
                    <button
                        id={id}
                        ref={buttonRef}
                        type="button"
                        role="combobox"
                        aria-haspopup="listbox"
                        aria-expanded={open}
                        aria-controls={open ? listId : undefined}
                        aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
                        aria-invalid={Boolean(error) || undefined}
                        aria-describedby={error ? `${id}-error` : undefined}
                        onClick={() => (open ? setOpen(false) : openList())}
                        onKeyDown={onKeyDown}
                        className={`flex w-full min-w-0 cursor-pointer items-center justify-between gap-2 bg-transparent p-0 text-left text-[1rem] outline-none sm:text-[0.86rem] ${value ? 'text-[#1f2d26]' : 'text-[#8b8b8b]'}`}>
                        <span className="truncate">{value || placeholder}</span>
                        <Icon name="chevron" size={16}/>
                    </button>
                </div>

                {open && (
                    <div
                        id={listId}
                        role="listbox"
                        aria-label={label}
                        ref={listRef}
                        onKeyDown={onKeyDown}
                        className={`absolute inset-x-0 z-50 max-h-64 overflow-y-auto overscroll-contain rounded-[10px] border border-[#2b3a30]/30 bg-white p-2.5 shadow-[0_18px_38px_rgba(9,20,13,.20)] ${
                            flipUp ? 'bottom-[calc(100%+8px)]' : 'top-[calc(100%+8px)]'
                        }`}>
                        {all.map((option, index) => {
                            const isPlaceholder = index === 0
                            const isSelected = option === value || (isPlaceholder && !value)
                            return (
                                <div
                                    id={`${listId}-${index}`}
                                    key={option}
                                    role="option"
                                    aria-selected={isSelected}
                                    onMouseEnter={() => setActive(index)}
                                    onMouseDown={(event) => event.preventDefault()}
                                    onClick={() => choose(option)}
                                    className={`flex cursor-pointer items-center justify-between gap-3 rounded-[7px] px-3 py-2.5 text-[1rem] leading-snug sm:text-[0.9rem] ${
                                        index === active ? 'bg-[#eef4ee]' : 'bg-transparent'
                                    } ${isPlaceholder ? 'text-[#6f7d74]' : 'text-[#1f2d26]'} ${
                                        isSelected ? 'font-semibold' : 'font-normal'
                                    }`}>
                                    <span className="min-w-0 truncate">{option}</span>
                                    {isSelected && !isPlaceholder &&
                                        <span className="flex-none text-[#14512f]"><Icon name="check"
                                                                                         size={16}/></span>}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
            <FieldError id={id} message={error}/>
        </div>
    )
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

type Form = {
    templeName: string
    templeCode: string
    firstName: string
    lastName: string
    email: string
    phone: string
    designation: string
    committee: string
    committeeOther: string
    designationOther: string
    address: string
    village: string
    district: string
    postalCode: string
    password: string
    confirmPassword: string
}

const EMPTY: Form = {
    templeName: '', templeCode: '', firstName: '', lastName: '', email: '', phone: '', designation: '',
    committee: '', committeeOther: '', designationOther: '', address: '', village: '', district: '',
    postalCode: '', password: '', confirmPassword: '',
}

export const RegisterPage = () => {
    const navigate = useNavigate()
    const [role, setRole] = useState<Role>('temple-admin')
    const [form, setForm] = useState<Form>(EMPTY)
    const [agreed, setAgreed] = useState(false)
    const [errors, setErrors] = useState<Partial<Record<keyof Form | 'terms', string>>>({})
    const [submitting, setSubmitting] = useState(false)

    const set = (key: keyof Form) => (value: string) => {
        setForm((current) => ({...current, [key]: value}))
        setErrors((current) => ({...current, [key]: undefined}))
    }

    const switchRole = (next: Role) => {
        setRole(next)
        setErrors({})
    }

    const validate = () => {
        const next: Partial<Record<keyof Form | 'terms', string>> = {}
        const required = (key: keyof Form, message: string) => {
            if (!form[key].trim()) next[key] = message
        }

        if (role !== 'temple-admin') {
            required('templeName', 'Enter the name of your temple.')
            required('templeCode', 'Enter the temple code given by the temple office.')
        }

        required('firstName', 'Enter your first name.')
        required('lastName', 'Enter your last name.')
        if (!form.email.trim()) next.email = 'Enter your email address.'
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid email address.'
        required('phone', 'Enter your phone number.')

        if (role === 'temple-admin') {
            required('designation', 'Select your designation.')
            if (form.designation === 'Other') required('designationOther', 'Enter your designation.')
        }

        if (role === 'committee-member') {
            required('committee', 'Select your committee.')
            if (form.committee === 'Other') required('committeeOther', 'Enter the committee name.')
            required('designation', 'Select your designation.')
            if (form.designation === 'Other') required('designationOther', 'Enter your designation.')
        }

        if (role === 'family-user') {
            required('address', 'Enter your address.')
            required('village', 'Enter your village.')
            required('district', 'Select your district.')
            if (!form.postalCode.trim()) next.postalCode = 'Enter your postal code.'
            else if (!/^\d{5}$/.test(form.postalCode.trim())) next.postalCode = 'Postal codes have five digits.'
        }

        if (!form.password) next.password = 'Create a password.'
        else if (form.password.length < 8) next.password = 'Use at least 8 characters.'
        if (!form.confirmPassword) next.confirmPassword = 'Confirm your password.'
        else if (form.password !== form.confirmPassword) next.confirmPassword = 'Passwords do not match.'

        if (!agreed) next.terms = 'Please accept the terms and the privacy policy.'

        setErrors(next)
        return Object.keys(next).length === 0
    }

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (!validate()) return

        // Demo build: no account is created — the details are not sent anywhere.
        setSubmitting(true)
        window.setTimeout(() => {
            setSubmitting(false)
            navigate(authRoutes.login)
        }, 700)
    }

    return (
        <AuthShell variant="signup">
            <div
                className="mt-2 w-full max-w-236 rounded-[26px] border border-white/30 bg-[#fffdf4] px-6 pb-8 pt-8 shadow-[0_22px_42px_rgba(9,20,13,.15)] max-[1023px]:mx-auto max-[1023px]:mt-0 max-[640px]:rounded-[22px] max-[640px]:px-5 max-[640px]:pb-7 sm:px-8 sm:pt-9 lg:px-11 lg:pb-9">

                <header className="text-center">
                    <LotusMark width={112} className="mx-auto mb-0"/>
                    <h2 className="mt-1 font-display text-[clamp(2rem,2.4vw,2.55rem)] leading-tight font-bold tracking-tight text-[#123c2e]">
                        Create Your Account
                    </h2>
                    <p className="mt-2 text-[1.02rem] text-[#2c3a31]">
                        Register to manage your temple or join as a community member.
                    </p>
                </header>

                {/* Role selector */}
                <div role="tablist" aria-label="Account type"
                     className="mt-7 grid gap-2.5 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                    {ROLES.map(({key, label, icon}) => (
                        <button
                            key={key}
                            type="button"
                            role="tab"
                            aria-selected={role === key}
                            onClick={() => switchRole(key)}
                            className={`flex min-h-13.5 items-center justify-center gap-2.5 rounded-[10px] border px-3 text-center text-[0.95rem] leading-tight transition ${
                                role === key
                                    ? 'border-[#14512f] bg-[#14512f] text-white shadow-sm'
                                    : 'border-[#2b3a30] bg-white text-[#1f2d26] hover:border-[#14512f] hover:bg-[#f6faf6]'
                            }`}>
                            <Icon name={icon} size={19}/>
                            {label}
                        </button>
                    ))}
                </div>
                <p className="mt-2.5 text-center text-[0.82rem] text-[#5d6b62]">
                    {ROLES.find((item) => item.key === role)!.blurb}
                </p>

                <form className="mt-6" onSubmit={handleSubmit} noValidate>
                    <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:gap-x-10 xl:gap-x-14">
                        {/* Committee member / family user join an existing temple */}
                        {role !== 'temple-admin' && (
                            <>
                                <TextField id="templeName" label="Temple Name" icon="temple"
                                           placeholder="Enter temple name"
                                           autoComplete="organization" value={form.templeName}
                                           onChange={set('templeName')}
                                           error={errors.templeName}/>
                                <TextField id="templeCode" label="Temple Code" icon="temple"
                                           placeholder="Enter temple code"
                                           value={form.templeCode} onChange={set('templeCode')}
                                           error={errors.templeCode}/>
                            </>
                        )}

                        <TextField id="firstName" label="First Name" icon="person" placeholder="Enter your first name"
                                   autoComplete="given-name" value={form.firstName} onChange={set('firstName')}
                                   error={errors.firstName}/>
                        <TextField id="lastName" label="Last Name" icon="person" placeholder="Enter your last name"
                                   autoComplete="family-name" value={form.lastName} onChange={set('lastName')}
                                   error={errors.lastName}/>

                        <TextField id="email" label="Email Address" icon="mail" placeholder="Enter your email address"
                                   type="email" autoComplete="email" value={form.email} onChange={set('email')}
                                   error={errors.email}/>
                        <TextField id="phone" label={role === 'family-user' ? 'Phone No.' : 'Phone Number'} icon="phone"
                                   placeholder="Enter your phone number" type="tel" autoComplete="tel"
                                   value={form.phone} onChange={set('phone')} error={errors.phone}/>

                        {/* Committee Member — committee name and designation */}
                        {role === 'committee-member' && (
                            <>
                                <SelectField id="committee" label="Committee Name" icon="users"
                                             placeholder="Select committee"
                                             options={COMMITTEES} value={form.committee} onChange={set('committee')}
                                             error={errors.committee}/>
                                <SelectField id="designation" label="Designation" icon="briefcase"
                                             placeholder="Select designation"
                                             options={COMMITTEE_DESIGNATIONS} value={form.designation}
                                             onChange={set('designation')} error={errors.designation}/>
                                {form.committee === 'Other' && (
                                    <TextField id="committeeOther" label="Committee Name (specify)" icon="users"
                                               placeholder="Enter the committee name" value={form.committeeOther}
                                               onChange={set('committeeOther')} error={errors.committeeOther}/>
                                )}
                                {form.designation === 'Other' && (
                                    <TextField id="designationOther" label="Designation (specify)" icon="briefcase"
                                               placeholder="Enter your designation" value={form.designationOther}
                                               onChange={set('designationOther')} error={errors.designationOther}/>
                                )}
                            </>
                        )}

                        {/* Temple Admin — designation only */}
                        {role === 'temple-admin' && (
                            <>
                                <SelectField id="designation" label="Designation" icon="briefcase"
                                             placeholder="Select designation"
                                             options={ADMIN_DESIGNATIONS} value={form.designation}
                                             onChange={set('designation')} error={errors.designation}/>
                                {form.designation === 'Other' && (
                                    <TextField id="designationOther" label="Designation (specify)" icon="briefcase"
                                               placeholder="Enter your designation" value={form.designationOther}
                                               onChange={set('designationOther')} error={errors.designationOther}/>
                                )}
                            </>
                        )}

                        {/* Family User — address block */}
                        {role === 'family-user' && (
                            <>
                                <TextField id="address" label="Address" icon="pin" placeholder="Enter your address"
                                           autoComplete="street-address" value={form.address} onChange={set('address')}
                                           error={errors.address} full/>
                                <TextField id="village" label="Village" icon="home" placeholder="Enter your village"
                                           value={form.village} onChange={set('village')} error={errors.village}/>
                                <SelectField id="district" label="District" icon="map" placeholder="Select district"
                                             options={DISTRICTS} value={form.district} onChange={set('district')}
                                             error={errors.district}/>
                                <TextField id="postalCode" label="Postal Code" icon="mailbox"
                                           placeholder="Enter postal code"
                                           autoComplete="postal-code" value={form.postalCode}
                                           onChange={set('postalCode')}
                                           error={errors.postalCode}/>
                            </>
                        )}

                        <PasswordField id="password" label="Password" placeholder="Create a password" newRow
                                       autoComplete="new-password" value={form.password} onChange={set('password')}
                                       error={errors.password}/>
                        <PasswordField id="confirmPassword" label="Confirm Password" placeholder="Confirm your password"
                                       autoComplete="new-password" value={form.confirmPassword}
                                       onChange={set('confirmPassword')} error={errors.confirmPassword}/>
                    </div>

                    <div className="mt-5">
                        <label
                            className="flex cursor-pointer items-start gap-2.5 text-[0.95rem] leading-snug text-[#1f2d26]">
                            <input
                                type="checkbox"
                                checked={agreed}
                                onChange={(event) => {
                                    setAgreed(event.target.checked)
                                    setErrors((current) => ({...current, terms: undefined}))
                                }}
                                aria-invalid={Boolean(errors.terms) || undefined}
                                aria-describedby={errors.terms ? 'terms-error' : undefined}
                                className="mt-0.5 h-4.5 w-4.5 flex-none cursor-pointer rounded-[3px] border-[#2b3a30] accent-[#14512f]"/>
                            <span>
                                I agree to the{' '}
                                <Link
                                    to={authRoutes.terms}
                                    className="font-bold text-[#14512f] no-underline transition-colors hover:text-[#0f4226]">
                                    Terms and Conditions
                                </Link>{' '}
                                and{' '}
                                <Link
                                    to={authRoutes.privacy}
                                    className="font-bold text-[#14512f] no-underline transition-colors hover:text-[#0f4226]">
                                    Privacy Policy
                                </Link>
                            </span>
                        </label>
                        {errors.terms && <span id="terms-error"
                                               className="mt-1.5 block text-[0.72rem] text-status-rose">{errors.terms}</span>}
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="mt-6 flex min-h-15 w-full items-center justify-center gap-3 rounded-[10px] border border-[#14512f] bg-[#14512f] text-[1.05rem] font-bold text-white transition hover:-translate-y-px hover:bg-[#0f4226] hover:shadow-[0_8px_16px_rgba(20,81,47,.24)] disabled:cursor-wait disabled:opacity-80">
                        <Icon name="userPlus" size={21}/>
                        {submitting ? 'Creating your account…' : 'Register'}
                    </button>

                    <div className="my-4 text-center text-[0.95rem] font-bold tracking-wide text-[#5d6b62]">OR</div>

                    <Link to={authRoutes.google}
                          className="flex min-h-14.5 w-full items-center justify-center gap-3 rounded-[10px] border border-[#4157f4] bg-[#4157f4] text-[1.02rem] font-bold text-white transition hover:-translate-y-px hover:bg-[#3349e8] hover:shadow-[0_8px_16px_rgba(50,65,220,.25)]">
                        <GoogleIcon/> Continue with Google
                    </Link>

                    <Link to={authRoutes.facebook}
                          className="mt-3.5 flex min-h-14.5 w-full items-center justify-center gap-3 rounded-[10px] border border-[#c9cfd6] bg-white text-[1.02rem] font-bold text-[#1f2d26] transition hover:-translate-y-px hover:border-[#1877F2] hover:bg-[#f8fbff] hover:text-[#1877F2]">
                        <FacebookIcon/> Continue with Facebook
                    </Link>

                    <div className="mt-5 text-center text-[0.96rem] text-[#1f2d26]">
                        Already have an account?{' '}
                        <Link to={authRoutes.login} className="font-bold text-[#14512f] hover:underline">Login</Link>
                    </div>
                </form>
            </div>
        </AuthShell>
    )
}