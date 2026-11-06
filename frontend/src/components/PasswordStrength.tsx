import {PASSWORD_RULES, passwordStrength} from './PasswordRules'

const TONE = {
    idle: {text: 'text-[#8b8b7f]', icon: 'text-[#b6b6a8]'},
    unmet: {text: 'text-[#a8442c]', icon: 'text-[#c4634a]'},
    met: {text: 'text-[#1d5c46]', icon: 'text-[#1d5c46]'},
} as const

/** Hollow circle (idle), crossed circle (not met yet), filled tick (met). */
const StatusIcon = ({state}: { state: keyof typeof TONE }) => (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor"
         strokeWidth={state === 'met' ? 2.2 : 1.7} strokeLinecap="round" strokeLinejoin="round"
         aria-hidden="true" className="flex-none">
        <circle cx="10" cy="10" r="7.4" fill={state === 'met' ? 'currentColor' : 'none'}
                opacity={state === 'met' ? 0.14 : 1}/>
        {state === 'met' && <path d="m6.4 10.3 2.4 2.4 4.8-5.2" stroke="#1d5c46" strokeWidth={2.2}/>}
        {state === 'unmet' && <path d="m7.6 7.6 4.8 4.8M12.4 7.6l-4.8 4.8"/>}
    </svg>
)

type Row = {
    label: string
    met: boolean
    /** Only true once the user has had a chance to satisfy this row, so nothing nags at them. */
    showUnmet: boolean
}

export const PasswordStrength = ({
                                     id,
                                     value,
                                     touched = false,
                                     confirm,
                                     className = '',
                                 }: {
    /** Id of the password input, so the checklist is announced as part of that field. */
    id: string
    value: string
    /** Show the rose "not yet" colours only once the user has left the field. */
    touched?: boolean
    /** When given, a "passwords match" row is added to the list. */
    confirm?: string
    className?: string
}) => {
    const level = passwordStrength(value)

    const rows: Row[] = PASSWORD_RULES.map((rule) => ({
        label: rule.label,
        met: rule.met(value),
        showUnmet: touched,
    }))

    /* The match row only turns rose once something has actually been typed into the confirm
       field - before that the user simply has not got there yet. */
    if (confirm !== undefined) {
        rows.push({
            label: 'Both passwords match',
            met: value.length > 0 && confirm === value,
            showUnmet: confirm.length > 0,
        })
    }

    const allMet = rows.every((row) => row.met)
    const typed = value.length > 0

    return (
        <div
            id={`${id}-rules`}
            data-state={allMet ? 'complete' : typed ? 'typing' : 'empty'}
            className={`rounded-[10px] border px-3.5 py-3 transition-colors duration-200 sm:px-4 sm:py-3.5 ${allMet ? 'border-[#1d5c46]/35 bg-[#f1f8f3]' : 'border-[#e5e0d2] bg-[#faf8f1]'} ${className}`}>

            {/* Meter: three bars plus the word for it. Decorative - the list below carries the detail. */}
            <div className="flex items-center gap-3">
                <span className="flex flex-1 gap-1.5" aria-hidden="true">
                    {[0, 1, 2].map((index) => (
                        <span
                            key={index}
                            className="h-1.5 flex-1 rounded-full transition-colors duration-300"
                            style={{backgroundColor: index < level.bars ? level.color : '#e6e1d3'}}/>
                    ))}
                </span>
                <span
                    className="w-16 flex-none text-right text-[.76rem] font-bold tracking-wide transition-colors duration-300"
                    style={{color: typed ? level.color : '#9a9a8f'}}>
                    {typed ? level.label : '—'}
                </span>
            </div>

            <p className="mt-2.5 mb-0 text-[.76rem] font-bold uppercase tracking-[.06em] text-[#8b8b7f]">
                A stronger password has
            </p>

            <ul /* One rule per row on phones, two columns once there is width for it. The card is at its
   narrowest between lg and xl (the split plus the wider card padding), so it drops back to
   one column there rather than letting the labels wrap mid-sentence. */
                className="mt-1.5 grid list-none grid-cols-1 gap-x-5 gap-y-1.5 p-0 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {rows.map((row) => {
                    const state = row.met ? 'met' : row.showUnmet ? 'unmet' : 'idle'
                    const tone = TONE[state]

                    return (
                        <li key={row.label}
                            className={`flex items-start gap-2 text-[.8rem] leading-snug transition-colors duration-200 ${tone.text}`}>
                            <span className={`mt-[.1rem] ${tone.icon}`}>
                                <StatusIcon state={state}/>
                            </span>
                            <span>
                                <span className="sr-only">{row.met ? 'Requirement met: ' : 'Still needed: '}</span>
                                {row.label}
                            </span>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}