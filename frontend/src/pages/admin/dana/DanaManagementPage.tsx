import {useMemo, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {AssignedFamiliesPanel} from '../../../components/dana-admin/AssignedFamiliesPanel'
import {DanaAdminHelp} from '../../../components/dana-admin/DanaAdminHelp'
import {useShellFooter} from '../../../layouts/useShellFooter'
import TempleFooterWave from '../../../components/TempleFooterWave'
import {DanaBarChart} from '../../../components/dana-admin/DanaBarChart'
import {useActiveTemple} from '../../../hooks/useActiveTemple'
import {
    addDays,
    addMonths,
    type BookingStatus,
    chartBuckets,
    type ChartGranularity,
    createSlot,
    DANA_KINDS,
    type DanaKind,
    dayLabel,
    daysInMonth,
    daySummary,
    deleteSlot,
    findSlot,
    fromIso,
    KIND_META,
    monthLabel,
    slotId,
    startOfMonth,
    startOfWeek,
    today,
    updateSlot,
    useDanaAdmin,
    weekdayShort,
} from '../../../data/danaAdminStore'

/*
 * Dana management - Temple Admin only.
 *
 * One screen, three parts:
 *
 *   1. a month calendar where every day shows the morning and midday offering with how many places
 *      are taken and how many are left,
 *   2. the selected day, where the admin creates, edits, closes and deletes a slot and manages the
 *      families assigned to it - choosing them from the temple's family list, editing the number of
 *      people, approving, rejecting or cancelling. Only the name, village and a masked contact
 *      number are ever shown for a family,
 *   3. a bar chart per day, week or month with the booked places and the places left.
 *
 * The data lives in data/danaAdminStore.ts (localStorage) until the API is wired up.
 */

const KIND_COLOR: Record<DanaKind, { dot: string; chip: string }> = {
    morning: {dot: '#c4741b', chip: 'bg-[#fbf0e0] text-[#8a4f12] border-[#e6cba9]'},
    midday: {dot: '#2f6f52', chip: 'bg-[#e8f2ec] text-[#245640] border-[#b9d2c3]'},
}

const STATUS_STYLE: Record<BookingStatus, string> = {
    Approved: 'bg-[#e8f2ec] text-[#245640] border-[#b9d2c3]',
    Pending: 'bg-[#fff6e0] text-[#8a5c0f] border-[#ecd39c]',
    Rejected: 'bg-[#fdeeee] text-[#a3231c] border-[#f1c2c2]',
    Cancelled: 'bg-[#f3f3f0] text-[#5b5b52] border-line',
}

const INPUT = 'h-11 w-full rounded-lg border border-line bg-white px-3 text-[0.98rem] text-ink outline-none focus:border-sage-600 focus:ring-2 focus:ring-sage-200'
const BUTTON_BASE = 'inline-flex items-center justify-center gap-1.5 rounded-lg border px-3.5 py-2 text-[0.92rem] font-bold transition'
const BTN_PRIMARY = `${BUTTON_BASE} border-sage-800 bg-sage-800 text-white hover:bg-sage-700`
const BTN_GHOST = `${BUTTON_BASE} border-line bg-white text-ink-soft hover:border-sage-600 hover:text-sage-900`
const BTN_DANGER = `${BUTTON_BASE} border-[#e2b3b3] bg-white text-[#a3231c] hover:bg-[#fdeeee]`

export const DanaManagementPage = () => {
    const {t, i18n} = useTranslation()
    const locale = (i18n.language === 'si' ? 'si' : 'en') as 'en' | 'si'
    const {temple} = useActiveTemple()
    const {slots, bookings} = useDanaAdmin()

    /* The wave ribbon goes into the shell's own footer slot - full width, under the padded content. */
    useShellFooter(TempleFooterWave)

    const [month, setMonth] = useState(() => startOfMonth(today()))
    const [selectedDate, setSelectedDate] = useState(() => today())
    const [granularity, setGranularity] = useState<ChartGranularity>('day')
    const [openSlot, setOpenSlot] = useState<{ date: string; kind: DanaKind } | null>(null)
    const [editing, setEditing] = useState<{ id: string; value: string } | null>(null)
    const [armedDelete, setArmedDelete] = useState<string | null>(null)
    const [adding, setAdding] = useState<DanaKind | null>(null)
    const [newCapacity, setNewCapacity] = useState('10')
    const [error, setError] = useState('')
    const [flash, setFlash] = useState('')

    /*
     * The memos below read module state (`slots`, `bookings`, `families` above are the store
     * snapshot), so listing the snapshot is what makes them recompute after a change. ESLint cannot
     * see that read.
     */
    /* eslint-disable react-hooks/exhaustive-deps */
    const monthDays = useMemo(() => {
        const total = daysInMonth(month)
        const firstWeekday = (fromIso(month).getDay() + 6) % 7
        return {total, firstWeekday}
    }, [month])

    const monthSummaries = useMemo(() => {
        const map = new Map<string, ReturnType<typeof daySummary>>()
        for (let day = 1; day <= monthDays.total; day += 1) {
            const date = `${month.slice(0, 7)}-${String(day).padStart(2, '0')}`
            map.set(date, daySummary(date))
        }
        return map
    }, [month, monthDays.total, slots, bookings])

    const daySlots = useMemo(() => daySummary(selectedDate), [selectedDate, slots, bookings])
    const buckets = useMemo(
        () => chartBuckets(
            granularity,
            granularity === 'day' ? startOfWeek(selectedDate) : granularity === 'week' ? month : selectedDate,
            locale,
        ),
        [granularity, selectedDate, month, locale, slots, bookings],
    )

    /* eslint-enable react-hooks/exhaustive-deps */

    const clearMessages = () => {
        setError('')
        setFlash('')
    }

    const guard = (action: () => void) => {
        clearMessages()
        try {
            action()
        } catch (problem) {
            setError(problem instanceof Error ? problem.message : String(problem))
        }
    }

    /* ------------------------------ day actions ------------------------------ */

    const onAddSlot = (kind: DanaKind) => {
        guard(() => {
            createSlot({date: selectedDate, kind, capacity: Number(newCapacity) || KIND_META[kind].defaultCapacity})
            setAdding(null)
            setFlash(t('danaAdmin.slotCreated', {kind: t(`danaAdmin.${kind}`), date: dayLabel(selectedDate, locale)}))
        })
    }

    const onSaveCapacity = (id: string) => {
        guard(() => {
            updateSlot(id, {capacity: Number(editing?.value ?? 0)})
            setEditing(null)
            setFlash(t('danaAdmin.capacitySaved'))
        })
    }

    const onToggleClosed = (id: string, closed: boolean) => {
        guard(() => {
            updateSlot(id, {closed: !closed})
            setFlash(closed ? t('danaAdmin.slotReopened') : t('danaAdmin.slotClosed'))
        })
    }

    const onDeleteSlot = (id: string) => {
        guard(() => {
            deleteSlot(id)
            setArmedDelete(null)
            if (openSlot && slotId(openSlot.date, openSlot.kind) === id) setOpenSlot(null)
            setFlash(t('danaAdmin.slotDeleted'))
        })
    }

    const goMonth = (step: number) => {
        const next = addMonths(month, step)
        setMonth(next)
        setSelectedDate(next)
        setOpenSlot(null)
    }

    const pickCell = (date: string) => {
        clearMessages()
        setSelectedDate(date)
        setOpenSlot(null)
        setAdding(null)
        if (date.slice(0, 7) !== month.slice(0, 7)) setMonth(startOfMonth(date))
    }

    /** Clicking a slot in the calendar: select the day and show who is assigned to that offering. */
    const openSlotFor = (date: string, kind: DanaKind) => {
        pickCell(date)
        setOpenSlot({date, kind})
    }

    return (
        <div className="mx-auto max-w-344 pb-10 text-[1rem]">
            {/* ------------------------------- header ------------------------------- */}
            <div className="card p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <p className="text-[0.8rem] font-bold tracking-[0.16em] text-sage-700 uppercase">
                            {t('danaAdmin.eyebrow')}
                        </p>
                        <div className="mt-1 flex items-center gap-2.5">
                            <h1 className="font-temple text-[1.85rem] leading-tight text-sage-900">
                                {t('danaAdmin.title')}
                            </h1>
                            <DanaAdminHelp/>
                        </div>
                        <p className="mt-1 text-[1rem] text-ink-soft">
                            {temple ? t('danaAdmin.subtitleTemple', {temple: temple.name}) : t('danaAdmin.subtitle')}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button type="button" className={BTN_GHOST} onClick={() => goMonth(-1)}
                                aria-label={t('danaAdmin.prevMonth')}>←
                        </button>
                        <span className="min-w-44 text-center text-[1.05rem] font-bold text-sage-900">
                            {monthLabel(month, locale)}
                        </span>
                        <button type="button" className={BTN_GHOST} onClick={() => goMonth(1)}
                                aria-label={t('danaAdmin.nextMonth')}>→
                        </button>
                        <button type="button" className={`${BTN_GHOST} ml-2`}
                                onClick={() => {
                                    setMonth(startOfMonth(today()))
                                    setSelectedDate(today())
                                    setOpenSlot(null)
                                }}>
                            {t('danaAdmin.today')}
                        </button>
                    </div>
                </div>

                {(error || flash) && (
                    <p className={`mt-4 rounded-lg border px-3.5 py-2.5 text-[0.95rem] font-semibold ${
                        error ? 'border-[#f1c2c2] bg-[#fdeeee] text-[#a3231c]' : 'border-[#b9d2c3] bg-[#e8f2ec] text-[#245640]'
                    }`} role={error ? 'alert' : 'status'}>
                        {error || flash}
                    </p>
                )}
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
                {/* ------------------------------ calendar ------------------------------ */}
                <section className="card p-4 sm:p-5">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <h2 className="font-temple text-[1.3rem] text-sage-900">{t('danaAdmin.calendar')}</h2>
                        <div className="flex flex-wrap items-center gap-4 text-[0.88rem] text-ink-soft">
                            {DANA_KINDS.map((kind) => (
                                <span key={kind} className="inline-flex items-center gap-1.5">
                                    <span className="h-3 w-3 rounded-full" style={{background: KIND_COLOR[kind].dot}}/>
                                    {t(`danaAdmin.${kind}`)}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div
                        className="grid grid-cols-7 gap-1 text-center text-[0.8rem] font-bold tracking-wide text-muted uppercase">
                        {[0, 1, 2, 3, 4, 5, 6].map((offset) => (
                            <span key={offset}>{weekdayShort(addDays(startOfWeek(month), offset), locale)}</span>
                        ))}
                    </div>

                    <div className="mt-1.5 grid grid-cols-7 gap-1.5">
                        {Array.from({length: monthDays.firstWeekday}).map((_, index) => (
                            <div key={`blank-${index}`} className="min-h-26 rounded-lg bg-cream/40"/>
                        ))}

                        {Array.from({length: monthDays.total}, (_, index) => {
                            const day = index + 1
                            const date = `${month.slice(0, 7)}-${String(day).padStart(2, '0')}`
                            const summaries = monthSummaries.get(date) ?? []
                            const isSelected = date === selectedDate
                            const isToday = date === today()

                            /* The day is a plain block so its two offerings can be buttons of their
                               own - clicking one opens that slot straight away. */
                            return (
                                <div
                                    key={date}
                                    className={`min-h-26 rounded-lg border p-1.5 transition ${
                                        isSelected
                                            ? 'border-sage-600 bg-lotus-50 ring-2 ring-sage-300'
                                            : 'border-line bg-white hover:border-sage-400'
                                    }`}>
                                    <button
                                        type="button"
                                        onClick={() => pickCell(date)}
                                        aria-pressed={isSelected}
                                        className="block w-full rounded px-0.5 text-left">
                                        <span
                                            className={`text-[0.95rem] font-bold ${isToday ? 'text-sage-700' : 'text-ink-soft'}`}>
                                            {day}{isToday && ' •'}
                                        </span>
                                    </button>

                                    <div className="mt-1 space-y-1">
                                        {DANA_KINDS.map((kind) => {
                                            const summary = summaries.find((item) => item.kind === kind)
                                            if (!summary) {
                                                return (
                                                    <span key={kind}
                                                          className="block truncate rounded border border-dashed border-line px-1.5 py-0.5 text-[0.8rem] text-muted">
                                                        {t('danaAdmin.noSlots')}
                                                    </span>
                                                )
                                            }
                                            const full = summary.available === 0
                                            const isOpenSlot = openSlot?.date === date && openSlot.kind === kind
                                            return (
                                                <button
                                                    key={kind}
                                                    type="button"
                                                    onClick={() => openSlotFor(date, kind)}
                                                    aria-label={t('danaAdmin.openSlot', {
                                                        kind: t(`danaAdmin.${kind}`),
                                                        date: dayLabel(date, locale),
                                                    })}
                                                    title={`${t(`danaAdmin.${kind}`)} · ${summary.booked}/${summary.capacity} · ${
                                                        summary.closed
                                                            ? t('danaAdmin.closedShort')
                                                            : t('danaAdmin.leftShort', {n: summary.available})
                                                    }`}
                                                    className={`block w-full cursor-pointer truncate rounded border px-1.5 py-0.5 text-left text-[0.8rem] leading-5 font-semibold transition hover:brightness-95 ${
                                                        isOpenSlot ? 'ring-2 ring-sage-600' : ''
                                                    } ${
                                                        summary.closed
                                                            ? STATUS_STYLE.Cancelled
                                                            : full ? STATUS_STYLE.Rejected : KIND_COLOR[kind].chip
                                                    }`}>
                                                    {t(`danaAdmin.${kind}Short`)} {summary.booked}/{summary.capacity}
                                                    {' · '}
                                                    {summary.closed
                                                        ? t('danaAdmin.closedShort')
                                                        : t('danaAdmin.leftShort', {n: summary.available})}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </section>

                {/* ---------------------------- selected day ---------------------------- */}
                <section className="card p-4 sm:p-5">
                    <div>
                        <h2 className="font-temple text-[1.3rem] text-sage-900">{t('danaAdmin.dayTitle')}</h2>
                        <p className="text-[1rem] text-ink-soft">{dayLabel(selectedDate, locale)}</p>
                    </div>

                    <div className="mt-4 space-y-3">
                        {DANA_KINDS.map((kind) => {
                            const record = findSlot(selectedDate, kind)
                            const summary = daySlots.find((item) => item.kind === kind)
                            const isOpen = openSlot?.date === selectedDate && openSlot.kind === kind

                            if (!record || !summary) {
                                return (
                                    <div key={kind} className="rounded-xl border border-dashed border-line p-3.5">
                                        <p className="text-[1rem] font-semibold text-ink-soft">
                                            {t('danaAdmin.noSlotFor', {kind: t(`danaAdmin.${kind}`)})}
                                        </p>
                                        {adding === kind ? (
                                            <div className="mt-2 flex flex-wrap items-end gap-2">
                                                <label className="text-[0.9rem] font-semibold text-ink-soft">
                                                    {t('danaAdmin.capacity')}
                                                    <input className={`${INPUT} mt-1 w-28`} type="number" min={1}
                                                           max={200}
                                                           value={newCapacity}
                                                           onChange={(event) => setNewCapacity(event.target.value)}/>
                                                </label>
                                                <button type="button" className={BTN_PRIMARY}
                                                        onClick={() => onAddSlot(kind)}>
                                                    {t('danaAdmin.add')}
                                                </button>
                                                <button type="button" className={BTN_GHOST}
                                                        onClick={() => setAdding(null)}>
                                                    {t('common.cancel')}
                                                </button>
                                            </div>
                                        ) : (
                                            <button type="button" className={`${BTN_PRIMARY} mt-2`}
                                                    onClick={() => {
                                                        setAdding(kind)
                                                        setNewCapacity(String(KIND_META[kind].defaultCapacity))
                                                        clearMessages()
                                                    }}>
                                                {t('danaAdmin.addSlot', {kind: t(`danaAdmin.${kind}`)})}
                                            </button>
                                        )}
                                    </div>
                                )
                            }

                            return (
                                <div key={kind}
                                     className={`rounded-xl border p-3.5 transition ${isOpen ? 'border-sage-500 ring-2 ring-sage-200' : 'border-line'}`}>
                                    <div className="flex flex-wrap items-start justify-between gap-2">
                                        <div>
                                            <p className="flex items-center gap-2 text-[1.08rem] font-bold text-sage-900">
                                                <span className="h-3 w-3 rounded-full"
                                                      style={{background: KIND_COLOR[kind].dot}}/>
                                                {t(`danaAdmin.${kind}`)}
                                                {record.closed && (
                                                    <span
                                                        className={`rounded border px-1.5 text-[0.78rem] ${STATUS_STYLE.Cancelled}`}>
                                                        {t('danaAdmin.closed')}
                                                    </span>
                                                )}
                                            </p>
                                            <p className="text-[0.9rem] text-muted">
                                                {KIND_META[kind].startTime} – {KIND_META[kind].endTime}
                                            </p>
                                        </div>

                                        <button type="button" className={BTN_GHOST}
                                                onClick={() => {
                                                    setOpenSlot(isOpen ? null : {date: selectedDate, kind})
                                                    clearMessages()
                                                }}>
                                            {isOpen ? t('danaAdmin.hideDevotees') : t('danaAdmin.devotees', {n: summary.booked})}
                                        </button>
                                    </div>

                                    <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                                        <div className="rounded-lg bg-cream px-2 py-2">
                                            <p className="text-[0.8rem] font-semibold tracking-wide text-muted uppercase">
                                                {t('danaAdmin.booked')}
                                            </p>
                                            <p className="text-[1.35rem] font-bold text-sage-900">{summary.booked}</p>
                                        </div>
                                        <div className="rounded-lg bg-cream px-2 py-2">
                                            <p className="text-[0.8rem] font-semibold tracking-wide text-muted uppercase">
                                                {t('danaAdmin.capacity')}
                                            </p>
                                            <p className="text-[1.35rem] font-bold text-sage-900">{summary.capacity}</p>
                                        </div>
                                        <div className="rounded-lg bg-cream px-2 py-2">
                                            <p className="text-[0.8rem] font-semibold tracking-wide text-muted uppercase">
                                                {t('danaAdmin.available')}
                                            </p>
                                            <p className={`text-[1.35rem] font-bold ${summary.available === 0 ? 'text-[#a3231c]' : 'text-[#245640]'}`}>
                                                {summary.available}
                                            </p>
                                        </div>
                                    </div>

                                    {/* CRUD: capacity, open/close, delete */}
                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                        {editing?.id === record.id ? (
                                            <>
                                                <input className={`${INPUT} w-28`} type="number" min={1} max={200}
                                                       value={editing.value}
                                                       onChange={(event) => setEditing({
                                                           id: record.id,
                                                           value: event.target.value
                                                       })}/>
                                                <button type="button" className={BTN_PRIMARY}
                                                        onClick={() => onSaveCapacity(record.id)}>
                                                    {t('common.save')}
                                                </button>
                                                <button type="button" className={BTN_GHOST}
                                                        onClick={() => setEditing(null)}>
                                                    {t('common.cancel')}
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button type="button" className={BTN_GHOST}
                                                        onClick={() => setEditing({
                                                            id: record.id,
                                                            value: String(record.capacity)
                                                        })}>
                                                    {t('danaAdmin.editCapacity')}
                                                </button>
                                                <button type="button" className={BTN_GHOST}
                                                        onClick={() => onToggleClosed(record.id, record.closed)}>
                                                    {record.closed ? t('danaAdmin.reopen') : t('danaAdmin.close')}
                                                </button>
                                                {armedDelete === record.id ? (
                                                    <>
                                                        <button type="button" className={BTN_DANGER}
                                                                onClick={() => onDeleteSlot(record.id)}>
                                                            {t('danaAdmin.confirmDelete')}
                                                        </button>
                                                        <button type="button" className={BTN_GHOST}
                                                                onClick={() => setArmedDelete(null)}>
                                                            {t('common.cancel')}
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button type="button" className={BTN_DANGER}
                                                            onClick={() => setArmedDelete(record.id)}>
                                                        {t('danaAdmin.delete')}
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                </section>
            </div>

            {/* Assigned families: full width, so the table has room for every column. */}
            {openSlot && (
                <section className="card mt-5 p-4 sm:p-6">
                    <AssignedFamiliesPanel
                        slot={openSlot}
                        locale={locale}
                        templeRef={temple?.id ?? ''}
                        onMessage={(text, isError) => {
                            setError(isError ? text : '')
                            setFlash(isError ? '' : text)
                        }}
                        onClose={() => setOpenSlot(null)}
                    />
                </section>
            )}

            {/* -------------------------------- chart -------------------------------- */}
            <section className="card mt-5 p-4 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="font-temple text-[1.3rem] text-sage-900">{t('danaAdmin.chartTitle')}</h2>
                    <div className="flex flex-wrap gap-1 rounded-lg border border-line bg-cream p-1">
                        {(['day', 'week', 'month'] as ChartGranularity[]).map((option) => (
                            <button
                                key={option}
                                type="button"
                                onClick={() => setGranularity(option)}
                                aria-pressed={granularity === option}
                                className={`rounded-md px-3.5 py-1.5 text-[0.95rem] font-bold transition ${
                                    granularity === option ? 'bg-white text-sage-900 shadow-sm' : 'text-ink-soft hover:text-sage-900'
                                }`}>
                                {t(`danaAdmin.per${option === 'day' ? 'Day' : option === 'week' ? 'Week' : 'Month'}`)}
                            </button>
                        ))}
                    </div>
                </div>

                <p className="mt-1.5 text-[0.95rem] text-ink-soft">
                    {granularity === 'day' && t('danaAdmin.chartScopeWeek', {from: dayLabel(startOfWeek(selectedDate), locale)})}
                    {granularity === 'week' && t('danaAdmin.chartScopeMonth', {month: monthLabel(month, locale)})}
                    {granularity === 'month' && t('danaAdmin.chartScopeYear', {year: selectedDate.slice(0, 4)})}
                </p>

                <div className="mt-5">
                    <DanaBarChart
                        buckets={buckets}
                        granularity={granularity}
                        activeKey={granularity === 'day' ? selectedDate : undefined}
                        onPick={(key) => {
                            if (granularity === 'day') {
                                pickCell(key)
                                return
                            }
                            setSelectedDate(key)
                            setMonth(startOfMonth(key))
                            setOpenSlot(null)
                        }}
                    />
                </div>
            </section>
        </div>
    )
}