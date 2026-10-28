import {useMemo, useState} from 'react'
import {ChevronLeft, ChevronRight} from 'lucide-react'
import {danaDays, prettyDate} from '../data/demo'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const iso = (year: number, month: number, day: number) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

/**
 * Month grid for the temple dashboard. Each day carries the booked / capacity count for the
 * morning and afternoon Dana sessions, plus a gold dot when the day has a special programme.
 */
export const DanaCalendar = ({selected, onSelect, today}: {
    selected: string
    onSelect: (date: string) => void
    today: string
}) => {
    const [year0, month0] = today.split('-').map(Number)
    const [cursor, setCursor] = useState({year: year0, month: month0 - 1})

    const map = useMemo(
        () => Object.fromEntries(danaDays.map((d) => [d.date, d])),
        [],
    )

    const first = new Date(cursor.year, cursor.month, 1)
    const startOffset = (first.getDay() + 6) % 7 // Monday first
    const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate()
    const cells: (string | null)[] = [
        ...Array.from({length: startOffset}, () => null),
        ...Array.from({length: daysInMonth}, (_, i) => iso(cursor.year, cursor.month, i + 1)),
    ]
    while (cells.length % 7 !== 0) cells.push(null)

    const label = first.toLocaleDateString('en-GB', {month: 'long', year: 'numeric'})

    return (
        <div>
            <div className="mb-2.5 flex items-center justify-between">
                <div className="font-temple text-[1rem] text-sage-900">{label}</div>
                <div className="flex gap-1.5">
                    <button type="button" aria-label="Previous month"
                            className="grid h-8 w-8 place-items-center rounded-lg border border-line bg-white text-sage-800 hover:bg-cream"
                            onClick={() => setCursor(({year, month}) => month === 0 ? {
                                year: year - 1,
                                month: 11
                            } : {year, month: month - 1})}>
                        <ChevronLeft size={15}/>
                    </button>
                    <button type="button" aria-label="Next month"
                            className="grid h-8 w-8 place-items-center rounded-lg border border-line bg-white text-sage-800 hover:bg-cream"
                            onClick={() => setCursor(({year, month}) => month === 11 ? {
                                year: year + 1,
                                month: 0
                            } : {year, month: month + 1})}>
                        <ChevronRight size={15}/>
                    </button>
                </div>
            </div>

            <div
                className="grid grid-cols-7 gap-1 text-center text-[0.66rem] font-bold tracking-wide text-muted uppercase">
                {WEEKDAYS.map((day) => <div key={day} className="py-1">{day}</div>)}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {cells.map((date, index) => {
                    if (!date) return <div key={`empty-${index}`} className="min-h-14.5 rounded-lg"/>
                    const entry = map[date]
                    const isToday = date === today
                    const isSelected = date === selected
                    const morning = entry?.sessions.find((s) => s.key === 'morning')
                    const afternoon = entry?.sessions.find((s) => s.key === 'afternoon')
                    return (
                        <button key={date} type="button" disabled={!entry} onClick={() => onSelect(date)}
                                aria-label={`${prettyDate(date)}${entry ? '' : ' - no Dana scheduled'}`}
                                aria-pressed={isSelected}
                                className={`min-h-14.5 rounded-lg border px-1 py-1 text-left transition ${
                                    entry ? 'border-line bg-white hover:border-sage-400 hover:bg-sage-50' : 'border-transparent bg-cream-deep/40'
                                } ${isSelected ? 'border-sage-700 bg-sage-50 ring-2 ring-sage-200' : ''} ${
                                    isToday && !isSelected ? 'border-gold-400' : ''
                                }`}>
                            <div className={`flex items-center justify-between text-[0.7rem] font-bold ${
                                isToday ? 'text-gold-700' : entry ? 'text-sage-900' : 'text-muted/60'}`}>
                                <span>{Number(date.slice(-2))}</span>
                                {entry?.note &&
                                    <span className="h-1.5 w-1.5 rounded-full bg-gold-500" title={entry.note}/>}
                            </div>
                            {entry && morning && afternoon && (
                                <div className="mt-1 flex flex-col gap-0.5">
                                    <span className={`rounded px-1 text-[0.62rem] font-bold ${
                                        morning.families.length >= morning.capacity ? 'bg-gold-100 text-gold-700' : 'bg-sage-100 text-sage-800'}`}>
                                        M {morning.families.length}/{morning.capacity}
                                    </span>
                                    <span className={`rounded px-1 text-[0.62rem] font-bold ${
                                        afternoon.families.length >= afternoon.capacity ? 'bg-gold-100 text-gold-700' : 'bg-sky-50 text-status-blue'}`}>
                                        A {afternoon.families.length}/{afternoon.capacity}
                                    </span>
                                </div>
                            )}
                        </button>
                    )
                })}
            </div>

            <div className="mt-2.5 flex flex-wrap items-center gap-3 text-[0.7rem] text-muted">
                <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded bg-sage-200"/>M - Morning</span>
                <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded bg-sky-100"/>A - Afternoon</span>
                <span className="inline-flex items-center gap-1.5"><i className="h-1.5 w-1.5 rounded-full bg-gold-500"/>Programme</span>
            </div>
        </div>
    )
}