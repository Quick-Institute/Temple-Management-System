import {type ReactNode, useEffect, useId, useRef, useState} from 'react'
import {suggestTemples, type Temple} from '../data/temples'

/** Same matching as `suggestTemples`, but over a list the caller supplies. */
const filterTemples = (pool: Temple[], query: string): Temple[] => {
    const q = query.trim().toLowerCase()
    if (!q) return pool
    return pool.filter((temple) =>
        temple.name.en.toLowerCase().includes(q)
        || temple.name.si.includes(query.trim())
        || temple.code.toLowerCase().includes(q)
        || temple.village.en.toLowerCase().includes(q)
        || temple.district.en.toLowerCase().includes(q),
    )
}

export const TempleCombobox = ({
                                   id,
                                   label,
                                   icon,
                                   placeholder,
                                   value,
                                   onChange,
                                   onPick,
                                   onCommit,
                                   error,
                                   language,
                                   options,
                               }: {
    id: string
    label: string
    icon: ReactNode
    placeholder: string
    value: string
    onChange: (value: string) => void
    /** A temple was chosen from the list. */
    onPick: (temple: Temple) => void
    /** The field was left - try to resolve whatever was typed. */
    onCommit: (value: string) => void
    error?: string
    /** Which script the option labels use: Sinhala names for 'si', English for 'en'. */
    language: 'si' | 'en'
    /**
     * The temples to offer. Defaults to the built-in register; pass your own list (for example the
     * temples that are actually registered) and the box behaves exactly the same.
     */
    options?: Temple[]
}) => {
    const [open, setOpen] = useState(false)
    const [active, setActive] = useState(-1)
    const wrapRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const listId = useId()

    const pool = options
    const suggestions = open
        ? pool
            ? filterTemples(pool, value)
            : suggestTemples(value)
        : []

    useEffect(() => {
        if (!open) return
        const onPointerDown = (event: PointerEvent) => {
            if (!wrapRef.current?.contains(event.target as Node)) {
                setOpen(false)
                onCommit(value)
            }
        }
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setOpen(false)
                setActive(-1)
            }
        }
        document.addEventListener('pointerdown', onPointerDown)
        document.addEventListener('keydown', onKeyDown)
        return () => {
            document.removeEventListener('pointerdown', onPointerDown)
            document.removeEventListener('keydown', onKeyDown)
        }
    }, [open, onCommit, value])

    const choose = (temple: Temple) => {
        onPick(temple)
        setOpen(false)
        setActive(-1)
        inputRef.current?.focus()
    }

    const onKeyDown = (event: React.KeyboardEvent) => {
        if (!open) {
            if (['ArrowDown', 'ArrowUp'].includes(event.key)) {
                event.preventDefault()
                setOpen(true)
                setActive(0)
            }
            return
        }
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            setActive((index) => {
                const next = event.key === 'ArrowDown' ? index + 1 : index - 1
                const count = suggestions.length
                return count ? (next + count) % count : -1
            })
        } else if (event.key === 'Enter') {
            event.preventDefault()
            const temple = suggestions[active]
            if (temple) choose(temple)
        } else if (event.key === 'Tab') {
            setOpen(false)
        }
    }

    return (
        <div>
            <label className="mb-2 block text-[1.02rem] leading-none text-ink" htmlFor={id}>{label}</label>
            <div className="relative" ref={wrapRef}>
                <div
                    className={`flex h-12 items-center gap-3 rounded-lg border border-[#6f9db8] bg-white px-3 text-ink transition focus-within:shadow-[0_0_0_3px_rgba(2,132,199,.16)] lg:h-10.5 ${
                        error ? 'border-status-rose shadow-[0_0_0_3px_rgba(173,28,3,.12)]' : ''
                    } ${open ? 'border-sage-700 shadow-[0_0_0_3px_rgba(2,132,199,.16)]' : ''}`}>
                    {icon}
                    <input
                        id={id}
                        name={id}
                        ref={inputRef}
                        type="text"
                        role="combobox"
                        aria-expanded={open}
                        aria-controls={open ? listId : undefined}
                        aria-autocomplete="list"
                        aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
                        autoComplete="off"
                        className="w-px min-w-0 flex-1 self-stretch border-0 bg-transparent p-0 text-[1rem] text-ink outline-none lg:text-[0.86rem]"
                        placeholder={placeholder}
                        value={value}
                        aria-invalid={Boolean(error) || undefined}
                        aria-describedby={error ? `${id}-error` : undefined}
                        onChange={(event) => {
                            onChange(event.target.value)
                            setOpen(true)
                            setActive(-1)
                        }}
                        onFocus={() => setOpen(true)}
                        onBlur={() => onCommit(value)}
                        onKeyDown={onKeyDown}
                    />
                </div>

                {open && suggestions.length > 0 && (
                    <div
                        id={listId}
                        role="listbox"
                        aria-label={label}
                        className="absolute inset-x-0 z-50 top-[calc(100%+8px)] max-h-64 overflow-y-auto overscroll-contain rounded-[10px] border border-[#6f9db8]/30 bg-white p-2.5 shadow-[0_18px_38px_rgba(8,47,73,.20)]">
                        {suggestions.map((temple, index) => (
                            <div
                                id={`${listId}-${index}`}
                                key={temple.code}
                                role="option"
                                aria-selected={value.trim() === temple.name[language].trim()}
                                onMouseEnter={() => setActive(index)}
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={() => choose(temple)}
                                className={`cursor-pointer rounded-[7px] px-3 py-2.5 ${
                                    index === active ? 'bg-[#eef4ee]' : 'bg-transparent'
                                }`}>
                                <span className="block text-[1rem] leading-snug text-ink sm:text-[0.9rem]">
                                    {temple.name[language]}
                                </span>
                                <span className="block text-[0.78rem] leading-snug text-[#6f7d74]">
                                    {temple.village[language]} · {temple.district[language]} · {temple.code}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {error && <span id={`${id}-error`} role="alert"
                            className="mt-1.5 block text-[0.72rem] leading-snug text-status-rose">{error}</span>}
        </div>
    )
}