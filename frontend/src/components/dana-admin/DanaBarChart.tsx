import {useTranslation} from 'react-i18next'
import type {Bucket, ChartGranularity} from '../../data/danaAdminStore'

/*
 * Dana bar chart.
 *
 * One bar per bucket (a day, a week or a month). Each bar is the whole capacity of those offerings,
 * so it is split three ways: the places taken in the morning, the places taken at midday, and the
 * places still free. That is why the pale top of a bar *is* the "2 left" the admin is looking for.
 *
 * Hovering or focusing a bar opens a small panel with the exact numbers for that bucket. The panel,
 * the legend, the range total and the axis labels all come from the translation files, so the chart
 * reads the same in English and in Sinhala.
 *
 * Plain CSS bars: no chart library, no canvas, and it re-renders from the same store the calendar uses.
 */

/* Deep enough to stay readable on the cream cards, and distinguishable in greyscale. */
const MORNING = '#c4741b'
const MIDDAY = '#2f6f52'
const AVAILABLE = '#e4ebe4'

export const DanaBarChart = ({
                                 buckets,
                                 granularity,
                                 activeKey,
                                 onPick,
                             }: {
    buckets: Bucket[]
    granularity: ChartGranularity
    activeKey?: string
    onPick?: (key: string) => void
}) => {
    const {t} = useTranslation()

    if (buckets.length === 0) {
        return <p className="py-12 text-center text-[1rem] text-ink-soft">{t('danaAdmin.chartEmpty')}</p>
    }

    const scale = Math.max(1, ...buckets.map((bucket) => bucket.capacity))
    const totals = buckets.reduce(
        (sum, bucket) => ({
            booked: sum.booked + bucket.booked,
            capacity: sum.capacity + bucket.capacity,
            available: sum.available + bucket.available,
        }),
        {booked: 0, capacity: 0, available: 0},
    )

    return (
        <div>
            {/* Legend + the aggregate for the visible range. */}
            <div className="mb-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-[0.95rem]">
                <span className="inline-flex items-center gap-2 text-ink-soft">
                    <span className="h-3 w-3 rounded-sm" style={{background: MORNING}}/>
                    {t('danaAdmin.morning')}
                </span>
                <span className="inline-flex items-center gap-2 text-ink-soft">
                    <span className="h-3 w-3 rounded-sm" style={{background: MIDDAY}}/>
                    {t('danaAdmin.midday')}
                </span>
                <span className="inline-flex items-center gap-2 text-ink-soft">
                    <span className="h-3 w-3 rounded-sm border border-[#c6d2c8]" style={{background: AVAILABLE}}/>
                    {t('danaAdmin.available')}
                </span>
                <span className="ml-auto text-[0.98rem] font-bold text-sage-900">
                    {t('danaAdmin.chartTotals', {
                        booked: totals.booked,
                        capacity: totals.capacity,
                        available: totals.available,
                    })}
                </span>
            </div>

            <div className="flex items-end gap-2 sm:gap-3">
                {buckets.map((bucket) => {
                    const empty = bucket.capacity === 0
                    const active = activeKey === bucket.key
                    const morningHeight = (bucket.morning.booked / scale) * 100
                    const middayHeight = (bucket.midday.booked / scale) * 100
                    const freeHeight = (bucket.available / scale) * 100

                    return (
                        <div key={bucket.key} className="group relative flex min-w-0 flex-1 flex-col items-center">
                            {/* Hover / focus panel with the exact numbers for this bar. */}
                            <div
                                role="tooltip"
                                className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1 hidden w-52 -translate-x-1/2 rounded-xl bg-sage-900 px-3 py-2 text-left text-white shadow-xl group-hover:block group-focus-within:block">
                                <p className="text-[0.86rem] font-bold">{bucket.label} {bucket.sublabel}</p>
                                <p className="mt-1 flex items-center justify-between gap-2 text-[0.82rem]">
                                    <span className="inline-flex items-center gap-1.5">
                                        <span className="h-2 w-2 rounded-sm" style={{background: MORNING}}/>
                                        {t('danaAdmin.morning')}
                                    </span>
                                    <span
                                        className="font-semibold">{bucket.morning.booked}/{bucket.morning.capacity}</span>
                                </p>
                                <p className="mt-0.5 flex items-center justify-between gap-2 text-[0.82rem]">
                                    <span className="inline-flex items-center gap-1.5">
                                        <span className="h-2 w-2 rounded-sm" style={{background: MIDDAY}}/>
                                        {t('danaAdmin.midday')}
                                    </span>
                                    <span
                                        className="font-semibold">{bucket.midday.booked}/{bucket.midday.capacity}</span>
                                </p>
                                <p className="mt-1 border-t border-white/20 pt-1 text-[0.82rem] font-bold text-lotus-100">
                                    {empty
                                        ? t('danaAdmin.noSlots')
                                        : t('danaAdmin.tooltipLeft', {n: bucket.available})}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => onPick?.(bucket.key)}
                                title={t('danaAdmin.barTooltip', {
                                    label: `${bucket.label} ${bucket.sublabel}`,
                                    morning: bucket.morning.booked,
                                    midday: bucket.midday.booked,
                                    left: bucket.available,
                                })}
                                className={`flex w-full flex-col items-center gap-2 rounded-xl px-1 pt-1 pb-2 transition ${
                                    active ? 'bg-lotus-50 ring-1 ring-sage-300' : 'hover:bg-cream'
                                }`}>
                                {/* Numbers above the bar. */}
                                <span className="text-[0.86rem] leading-none font-bold text-sage-900">
                                    {bucket.booked}/{bucket.capacity}
                                </span>
                                <span className="text-[0.8rem] leading-none font-semibold"
                                      style={{color: empty ? '#9aa39d' : bucket.available === 0 ? '#a3231c' : MIDDAY}}>
                                    {empty ? t('danaAdmin.noSlots') : t('danaAdmin.leftCount', {n: bucket.available})}
                                </span>

                                {/* The bar itself: capacity tall, morning + midday taken, the rest free. */}
                                <span className="flex h-40 w-full flex-col justify-end overflow-hidden rounded-md">
                                    <span className="w-full transition-all"
                                          style={{
                                              background: AVAILABLE,
                                              height: `${freeHeight}%`,
                                              borderTop: freeHeight > 0 ? '1px dashed #b3c4b6' : undefined,
                                          }}/>
                                    <span className="w-full transition-all"
                                          style={{background: MIDDAY, height: `${middayHeight}%`}}/>
                                    <span className="w-full rounded-b-md transition-all"
                                          style={{background: MORNING, height: `${morningHeight}%`}}/>
                                    {empty && <span className="h-px w-full bg-line"/>}
                                </span>

                                <span
                                    className="w-full truncate text-center text-[0.85rem] leading-tight font-bold text-sage-900">
                                    {bucket.label}
                                </span>
                                <span className="w-full truncate text-center text-[0.78rem] leading-none text-muted">
                                    {bucket.sublabel}
                                </span>
                            </button>
                        </div>
                    )
                })}
            </div>

            <p className="mt-4 text-center text-[0.88rem] text-muted">
                {granularity === 'day' && t('danaAdmin.chartHintDay')}
                {granularity === 'week' && t('danaAdmin.chartHintWeek')}
                {granularity === 'month' && t('danaAdmin.chartHintMonth')}
            </p>
        </div>
    )
}