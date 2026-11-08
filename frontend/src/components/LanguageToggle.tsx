import {useTranslation} from 'react-i18next'
import {useCallback} from 'react'
import type {Locale} from '../i18n/locales'

/*
 * English / සිංහල switch, in the same shape wherever it appears: one pill, two halves, the chosen
 * language filled in. It is the same control the client's reference build uses, restyled for this
 * app's sky palette.
 *
 *   tone="bar"  - the top bar on every signed-in page, on a light surface
 *   tone="card" - inside an auth card, top corner
 *   tone="rail" - on the dark side menu, should it ever be needed there
 */
type Tone = 'bar' | 'card' | 'rail'

const TONE: Record<Tone, { shell: string; idle: string; active: string }> = {
    bar: {
        shell: 'border-line bg-cream/80',
        idle: 'text-ink-soft hover:bg-white hover:text-sage-800',
        active: 'bg-sage-800 text-white shadow-sm',
    },
    card: {
        shell: 'border-[#9dc2d6] bg-white/90 backdrop-blur',
        idle: 'text-[#2c5468] hover:bg-[#eff8ff]',
        active: 'bg-[#0369a1] text-white shadow-sm',
    },
    rail: {
        shell: 'border-white/25 bg-white/10',
        idle: 'text-sage-100 hover:bg-white/15 hover:text-white',
        active: 'bg-white text-sage-900 shadow-sm',
    },
}

export const LanguageToggle = ({tone = 'bar', className = '', label = true}: {
    tone?: Tone
    className?: string
    /** Show the small "Language" caption before the pill. */
    label?: boolean
}) => {
    const {t, i18n} = useTranslation()
    const current = (i18n.resolvedLanguage || i18n.language || 'en') as Locale
    const skin = TONE[tone]

    const change = useCallback((next: Locale) => {
        if (next !== current) void i18n.changeLanguage(next)
    }, [current, i18n])

    const options: { key: Locale; text: string; aria: string }[] = [
        {key: 'en', text: 'English', aria: 'English'},
        {key: 'si', text: 'සිංහල', aria: 'Sinhala'},
    ]

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {label && (
                <span className={`text-[0.78rem] font-semibold ${tone === 'rail' ? 'text-sage-200' : 'text-muted'}`}>
                    {t('language')}
                </span>
            )}
            <div role="group" aria-label={t('language')}
                 className={`flex items-center gap-0.5 rounded-full border p-0.5 ${skin.shell}`}>
                {options.map((option) => {
                    const selected = current === option.key
                    return (
                        <button
                            key={option.key}
                            type="button"
                            lang={option.key}
                            onClick={() => change(option.key)}
                            aria-pressed={selected}
                            title={option.aria}
                            className={`min-h-8 cursor-pointer rounded-full px-3 text-[0.8rem] font-bold whitespace-nowrap transition ${
                                selected ? skin.active : skin.idle
                            }`}>
                            {option.text}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}