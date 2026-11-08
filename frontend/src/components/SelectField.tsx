import type {ReactNode} from 'react'
import {useEffect, useId, useRef, useState} from 'react'

/**
 * Padded, responsive replacement for a native <select>.
 *
 * This is the dropdown the register screen uses, lifted into a shared component so the temple
 * information forms are pixel-identical: a native select popup is painted by the operating
 * system, so its row padding, width and z-order cannot be styled - on Windows it renders tight,
 * borderless rows that overhang the field. This listbox draws the panel itself: 10px panel
 * padding, 14px/10px option padding, a scroll area capped at 16rem, and it flips above the field
 * when there is not enough room below.
 *
 * `creatable` turns the search box into a "type a value that is not in the list" entry - used by
 * Temple type, which the proposal deliberately leaves open rather than fixed.
 */
export type SelectFieldProps = {
    id: string
    label: string
    icon?: ReactNode
    placeholder: string
    options: string[]
    value: string
    onChange: (value: string) => void
    error?: string
    hint?: string
    full?: boolean
    disabled?: boolean
    /** Force the search box on or off. Left unset it appears once a list is long enough to scroll. */
    searchable?: boolean
    /** Let the user keep a value that is not in `options`. */
    creatable?: boolean
}

const labelClass = 'mb-2 block text-[0.92rem] leading-none font-semibold text-[#0f2b3d]'
const boxClass =
    'flex h-12 items-center gap-3 rounded-[8px] border border-[#6f9db8] bg-white px-3 text-[#0f2b3d] transition placeholder:text-[#8299a8] ' +
    'focus-within:shadow-[0_0_0_3px_rgba(2,132,199,.16)] lg:h-[42px]'

const Chevron = () => (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.55}
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="flex-none">
        <path d="m6 9.5 6 6 6-6"/>
    </svg>
)

const Check = () => (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9}
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="flex-none">
        <path d="m5 12.5 4.5 4.5L19 7.5"/>
    </svg>
)

const SearchIcon = () => (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7}
         strokeLinecap="round" aria-hidden="true" className="flex-none">
        <circle cx="11" cy="11" r="6.4"/>
        <path d="M15.9 15.9 20.4 20.4"/>
    </svg>
)

export const SelectField = ({
                                id,
                                label,
                                icon,
                                placeholder,
                                options,
                                value,
                                onChange,
                                error,
                                hint,
                                full,
                                disabled,
                                searchable,
                                creatable,
                            }: SelectFieldProps) => {
    const [open, setOpen] = useState(false)
    const [flipUp, setFlipUp] = useState(false)
    const [active, setActive] = useState(-1)
    const [query, setQuery] = useState('')
    const wrapRef = useRef<HTMLDivElement>(null)
    const buttonRef = useRef<HTMLButtonElement>(null)
    const searchRef = useRef<HTMLInputElement>(null)
    const listRef = useRef<HTMLDivElement>(null)
    const listId = useId()
    const all = [placeholder, ...options]
    /* A three-item list reads better without a search box; a long list does not. */
    const searchOn = searchable ?? options.length > 8
    const needle = query.trim().toLowerCase()

    /* A typed value that is not already an option becomes a row at the top of the panel. */
    const custom = creatable && needle && !options.some((option) => option.toLowerCase() === needle)
    const customRow = custom ? query.trim() : null

    /* Rows keep their index in `all`, so the highlighted row keeps its id while the list filters. */
    const visible = needle && searchOn
        ? all.map((option, index) => ({option, index}))
            .filter(({option, index}) => index > 0 && option.toLowerCase().includes(needle))
        : all.map((option, index) => ({option, index}))

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

    /* Put the caret in the search box as the panel opens, so typing filters straight away. */
    useEffect(() => {
        if (open && searchOn) searchRef.current?.focus()
    }, [open, searchOn])

    const openList = () => {
        if (disabled) return
        const box = wrapRef.current?.getBoundingClientRect()
        /* Flip above when the field sits too low for a 16rem panel to fit under it. */
        if (box) setFlipUp(box.bottom + 288 > window.innerHeight && box.top > window.innerHeight - box.bottom)
        setQuery('')
        setActive(Math.max(0, all.indexOf(value)))
        setOpen(true)
    }

    const choose = (option: string) => {
        onChange(option === placeholder ? '' : option)
        setOpen(false)
        buttonRef.current?.focus()
    }

    /* Walk the rows that are on screen, not the full list, so arrows skip the filtered-out ones. */
    const move = (delta: number) => {
        if (!visible.length) return
        setActive((index) => {
            const position = visible.findIndex((row) => row.index === index)
            const next = position < 0 ? 0 : (position + delta + visible.length) % visible.length
            return visible[next].index
        })
    }

    const onSearchChange = (text: string) => {
        setQuery(text)
        const wanted = text.trim().toLowerCase()
        /* +1 because `all` leads with the placeholder. */
        const first = wanted ? options.findIndex((option) => option.toLowerCase().includes(wanted)) : -1
        setActive(first < 0 ? -1 : first + 1)
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
            move(event.key === 'ArrowDown' ? 1 : -1)
        } else if (event.key === 'Home' || event.key === 'End') {
            event.preventDefault()
            const row = event.key === 'Home' ? visible[0] : visible[visible.length - 1]
            setActive(row ? row.index : -1)
        } else if (event.key === 'Enter') {
            event.preventDefault()
            if (customRow) choose(customRow)
            else if (active >= 0 && all[active] !== undefined) choose(all[active])
        } else if (event.key === ' ') {
            /* A space belongs in the search term; only a plain space picks the active row. */
            if (!searchOn) {
                event.preventDefault()
                if (active >= 0 && all[active] !== undefined) choose(all[active])
            }
        } else if (event.key === 'Tab') {
            setOpen(false)
        }
    }

    return (
        <div className={full ? 'sm:col-span-2' : undefined}>
            <label className={labelClass} htmlFor={id}>{label}</label>
            <div className="relative" ref={wrapRef}>
                <div
                    className={`${boxClass} ${error ? 'border-status-rose shadow-[0_0_0_3px_rgba(173,28,3,.12)]' : ''} ${open ? 'border-sage-700 shadow-[0_0_0_3px_rgba(2,132,199,.16)]' : ''} ${disabled ? 'cursor-not-allowed bg-cream opacity-70' : ''}`}>
                    {icon}
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
                        disabled={disabled}
                        onClick={() => (open ? setOpen(false) : openList())}
                        onKeyDown={onKeyDown}
                        className={`flex w-full min-w-0 flex-1 cursor-pointer items-center justify-between gap-2 self-stretch bg-transparent p-0 text-left text-[1rem] outline-none lg:text-[0.86rem] ${value ? 'text-ink' : 'text-[#8ba3b0]'} ${disabled ? 'cursor-not-allowed' : ''}`}>
                        <span className="truncate">{value || placeholder}</span>
                        <Chevron/>
                    </button>
                </div>

                {open && (
                    <div
                        id={listId}
                        role="listbox"
                        aria-label={label}
                        ref={listRef}
                        className={`absolute inset-x-0 z-50 max-h-64 overflow-y-auto overscroll-contain rounded-[10px] border border-[#6f9db8]/30 bg-white p-2.5 shadow-[0_18px_38px_rgba(8,47,73,.20)] ${
                            flipUp ? 'bottom-[calc(100%+8px)]' : 'top-[calc(100%+8px)]'
                        }`}>
                        {searchOn && (
                            <div
                                className="sticky top-0 z-10 mb-1.5 flex items-center gap-2 rounded-lg border border-[#6f9db8]/20 bg-[#f5faf6] px-2.5 py-2">
                                <span className="flex-none text-[#6f7d74]"><SearchIcon/></span>
                                <input
                                    ref={searchRef}
                                    type="text"
                                    value={query}
                                    onChange={(event) => onSearchChange(event.target.value)}
                                    onKeyDown={onKeyDown}
                                    placeholder={creatable ? `Search or type a new ${label.toLowerCase()}...` : `Search ${label.toLowerCase()}...`}
                                    aria-label={`Search ${label}`}
                                    autoComplete="off"
                                    className="min-w-0 flex-1 bg-transparent text-[0.92rem] text-ink outline-none"/>
                            </div>
                        )}

                        {/* A typed value that is not in the list - only when `creatable` is on. */}
                        {customRow && (
                            <button
                                type="button"
                                id={`${listId}-custom`}
                                role="option"
                                aria-selected={false}
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={() => choose(customRow)}
                                className="mb-1 flex w-full cursor-pointer items-center justify-between gap-3 rounded-[7px] bg-[#eef4ee] px-3 py-3 text-left text-[1rem] leading-snug text-sage-700 sm:text-[0.9rem] lg:py-2.5">
                                <span className="min-w-0 truncate">
                                    Use “{customRow}”
                                </span>
                                <span
                                    className="flex-none text-[0.72rem] font-semibold tracking-wide uppercase">New</span>
                            </button>
                        )}

                        {visible.map(({option, index}) => {
                            const isPlaceholder = index === 0
                            const isSelected = option === value || (isPlaceholder && !value)
                            return (
                                <div
                                    key={option}
                                    id={`${listId}-${index}`}
                                    role="option"
                                    aria-selected={isSelected}
                                    tabIndex={-1}
                                    onMouseEnter={() => setActive(index)}
                                    onMouseDown={(event) => event.preventDefault()}
                                    onClick={() => choose(option)}
                                    className={`flex cursor-pointer items-center justify-between gap-3 rounded-[7px] px-3 py-3 text-[1rem] leading-snug sm:text-[0.9rem] lg:py-2.5 ${
                                        index === active ? 'bg-[#eef4ee]' : 'bg-transparent'
                                    } ${isPlaceholder ? 'text-[#6f7d74]' : 'text-ink'} ${
                                        isSelected ? 'font-semibold' : 'font-normal'
                                    }`}>
                                    <span className="min-w-0 truncate">{option}</span>
                                    {isSelected && !isPlaceholder &&
                                        <span className="flex-none text-sage-700"><Check/></span>}
                                </div>
                            )
                        })}

                        {!visible.length && !customRow && (
                            <div className="px-3 py-6 text-center text-[0.92rem] text-[#6f7d74]">
                                Nothing matches “{query}”.
                            </div>
                        )}
                    </div>
                )}
            </div>
            {error
                ? <span id={`${id}-error`} role="alert"
                        className="mt-1.5 block text-[0.72rem] leading-snug text-status-rose">{error}</span>
                : hint
                    ? <p className="mt-1.5 text-[0.73rem] text-muted">{hint}</p>
                    : null}
        </div>
    )
}