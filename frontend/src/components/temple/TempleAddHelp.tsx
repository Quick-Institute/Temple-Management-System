import {useEffect, useState} from 'react'
import {CircleHelp, X} from 'lucide-react'
import {useTranslation} from 'react-i18next'

/**
 * A small "?" beside the Add New Temple action. Hovering shows a one-line hint; clicking opens a
 * step-by-step guide for registering a temple. The guide is translated, so it reads in English or
 * Sinhala depending on the language switch in the top bar.
 */
const STEP_TONES = [
    'bg-accent-gold-50 text-status-amber',
    'bg-accent-green-50 text-accent-green',
    'bg-accent-purple-50 text-accent-purple',
    'bg-accent-gold-50 text-status-amber',
    'bg-accent-green-50 text-accent-green',
]

export const TempleAddHelp = () => {
    const {t} = useTranslation()
    const [open, setOpen] = useState(false)

    useEffect(() => {
        if (!open) return
        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setOpen(false)
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [open])

    const steps = [1, 2, 3, 4, 5].map((n) => ({
        title: t(`temple.help.s${n}t`),
        body: t(`temple.help.s${n}b`),
    }))

    return (
        <>
            <span className="group relative inline-flex">
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    aria-haspopup="dialog"
                    aria-expanded={open}
                    aria-label={t('temple.help.tooltip')}
                    className="grid h-10 w-10 flex-none cursor-pointer place-items-center rounded-full border border-line bg-white text-sage-800 transition hover:border-sage-300 hover:bg-cream hover:text-sage-900">
                    <CircleHelp size={19} strokeWidth={1.9}/>
                </button>
                {/* Hover / focus hint. On phones it hangs off the button's right edge and wraps,
                    so a long Sinhala label cannot push the page into horizontal scroll. */}
                <span
                    role="tooltip"
                    className="pointer-events-none absolute top-full right-0 z-40 mt-2 max-w-[70vw] rounded-lg bg-ink px-3 py-1.5 text-center text-[0.8rem] font-medium whitespace-normal text-white opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-within:opacity-100 sm:right-auto sm:left-1/2 sm:max-w-none sm:-translate-x-1/2 sm:whitespace-nowrap">
                    {t('temple.help.tooltip')}
                </span>
            </span>

            {open && (
                <div
                    className="fixed inset-0 z-50 flex items-end justify-center bg-sage-950/45 p-0 sm:items-center sm:p-4"
                    role="dialog" aria-modal="true" aria-label={t('temple.help.title')}
                    onClick={() => setOpen(false)}>
                    <div
                        className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl border border-line bg-paper p-5 shadow-2xl sm:max-w-xl sm:rounded-2xl"
                        onClick={(event) => event.stopPropagation()}>
                        <div className="flex items-start gap-3">
                            <span
                                className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-accent-gold-50 text-status-amber">
                                <CircleHelp size={22}/>
                            </span>
                            <div className="min-w-0 flex-1">
                                <h2 className="font-temple text-[1.3rem] leading-tight font-semibold text-sage-900">
                                    {t('temple.help.title')}
                                </h2>
                                <p className="mt-1 text-[0.92rem] leading-relaxed text-ink-soft">
                                    {t('temple.help.intro')}
                                </p>
                            </div>
                            <button
                                className="rounded-lg p-1.5 text-muted transition hover:bg-cream hover:text-sage-900"
                                onClick={() => setOpen(false)} aria-label={t('common.close')}>
                                <X size={18}/>
                            </button>
                        </div>

                        <ol className="m-0 mt-4 flex list-none flex-col gap-2.5 p-0">
                            {steps.map((step, index) => (
                                <li key={step.title}
                                    className="flex items-start gap-3 rounded-xl border border-line-soft bg-cream/50 px-3.5 py-3">
                                    <span
                                        className={`grid h-8 w-8 flex-none place-items-center rounded-full text-[0.9rem] font-bold ${STEP_TONES[index]}`}>
                                        {index + 1}
                                    </span>
                                    <div className="min-w-0">
                                        <div className="text-[1rem] font-semibold text-sage-900">{step.title}</div>
                                        <p className="mt-0.5 text-[0.9rem] leading-relaxed text-ink-soft">{step.body}</p>
                                    </div>
                                </li>
                            ))}
                        </ol>

                        <p className="mt-4 rounded-xl border border-accent-gold/40 bg-accent-gold-50 px-3.5 py-2.5 text-[0.88rem] leading-relaxed text-status-amber">
                            {t('temple.help.tip')}
                        </p>

                        <div className="mt-4 flex justify-end">
                            <button className="btn btn-primary btn-sm" onClick={() => setOpen(false)}>
                                {t('common.close')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}