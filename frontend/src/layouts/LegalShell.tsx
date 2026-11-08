import {useEffect, useMemo, useRef, useState} from 'react'
import {Link} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import {LotusMark} from '../components/AuthIcons'
import {LanguageToggle} from '../components/LanguageToggle'
import {LegalText} from '../components/LegalText'
import type {LegalBlock, LegalDoc, LegalSection} from '../data/legal/types'
import {authRoutes} from '../routes/authRoutes'

type Kind = 'terms' | 'privacy'

/* Small gold-ish calendar mark used by the "last updated" chip. */
const CalendarMark = () => (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9}
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="5" width="18" height="16" rx="3"/>
        <path d="M3 10h18M8 3v4M16 3v4"/>
        <path d="M8 14.5h2m4 0h2M8 17.5h2"/>
    </svg>
)

const ScalesMark = () => (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 3v18M7 21h10M12 6 4 8m8-2 8 2"/>
        <path d="M4 8 1.8 14a2.6 2.6 0 0 0 4.4 0L4 8ZM20 8l-2.2 6a2.6 2.6 0 0 0 4.4 0L20 8Z"/>
    </svg>
)

const ShieldMark = () => (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 21c4.4-1.9 7-5.2 7-9.4V5.6L12 3 5 5.6v6c0 4.2 2.6 7.5 7 9.4Z"/>
        <path d="m9 12 2.2 2.2L15.4 10"/>
    </svg>
)

/** One clause body block. Tables scroll sideways on phones instead of stretching the page. */
const Block = ({block}: { block: LegalBlock }) => {
    if (block.kind === 'p') {
        return (
            <p className="m-0 text-[1rem] leading-[1.8] text-[#33566c] sm:text-[1.02rem]">
                <LegalText text={block.text}/>
            </p>
        )
    }

    if (block.kind === 'list') {
        return (
            <ul className="m-0 list-none space-y-2.5 p-0">
                {block.items.map((item, index) => (
                    <li key={index} className="flex gap-3 text-[1rem] leading-[1.75] text-[#33566c] sm:text-[1.02rem]">
                        <span aria-hidden="true"
                              className="mt-[0.62rem] h-1.5 w-1.5 flex-none rotate-45 rounded-[1px] bg-sage-500"/>
                        <span className="min-w-0"><LegalText text={item}/></span>
                    </li>
                ))}
            </ul>
        )
    }

    return (
        <div className="-mx-1 overflow-x-auto rounded-xl border border-line">
            <table className="w-full min-w-140 border-collapse text-left text-[0.9rem]">
                <thead className="bg-[linear-gradient(180deg,#eaf6ff,#e0f1fb)] text-sage-900">
                <tr>
                    {block.head.map((cell) => (
                        <th key={cell} scope="col"
                            className="border-b border-[#cfe6f4] px-3 py-3 align-bottom text-[0.82rem] font-bold tracking-wide uppercase">
                            {cell}
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {block.rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className={rowIndex % 2 ? 'bg-canvas' : 'bg-white'}>
                        {row.map((cell, cellIndex) => (
                            <td key={cellIndex}
                                className={`border-b border-[#e6f2fa] px-3 py-2.5 align-top ${cellIndex === 0 ? 'font-semibold text-sage-900' : 'text-[#40657b]'}`}>
                                {cell}
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    )
}

/** The "on this page" list. Used twice: folded away on phones, sticky on wider screens. */
const Contents = ({sections, active}: { sections: LegalSection[]; active: string }) => (
    <ol className="m-0 mt-2 list-none space-y-0.5 p-0">
        {sections.map((section, index) => {
            const current = active === section.id
            return (
                <li key={section.id}>
                    <a href={`#${section.id}`}
                       aria-current={current ? 'true' : undefined}
                       className={`flex items-start gap-2.5 rounded-lg px-2 py-1.5 text-[0.86rem] leading-snug transition ${
                           current
                               ? 'bg-[#e8f5fe] font-bold text-sage-900'
                               : 'text-[#40657b] hover:bg-[#f1f9ff] hover:text-sage-900'
                       }`}>
                        <span aria-hidden="true"
                              className={`mt-px w-4 flex-none text-right text-[0.72rem] font-bold tabular-nums ${current ? 'text-sage-600' : 'text-[#9db4c2]'}`}>
                            {index + 1}
                        </span>
                        <span className="min-w-0">{section.title}</span>
                    </a>
                </li>
            )
        })}
    </ol>
)

export const LegalShell = ({kind, doc}: { kind: Kind; doc: LegalDoc }) => {
    const {t} = useTranslation()
    const isTerms = kind === 'terms'

    const [active, setActive] = useState(doc.sections[0]?.id ?? '')
    const [progress, setProgress] = useState(0)
    const sectionRefs = useRef<Record<string, HTMLElement | null>>({})

    /* Reading progress for the hairline under the header. */
    useEffect(() => {
        const onScroll = () => {
            const root = document.documentElement
            const total = root.scrollHeight - root.clientHeight
            setProgress(total > 0 ? Math.min(1, Math.max(0, root.scrollTop / total)) : 0)
        }
        onScroll()
        window.addEventListener('scroll', onScroll, {passive: true})
        window.addEventListener('resize', onScroll)
        return () => {
            window.removeEventListener('scroll', onScroll)
            window.removeEventListener('resize', onScroll)
        }
    }, [])

    /* Which clause is in view - drives the highlight in "on this page". */
    useEffect(() => {
        const nodes = Object.values(sectionRefs.current).filter((node): node is HTMLElement => Boolean(node))
        if (!nodes.length) return
        const observer = new IntersectionObserver((entries) => {
            const visible = entries
                .filter((entry) => entry.isIntersecting)
                .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
            if (visible?.target.id) setActive(visible.target.id)
        }, {rootMargin: '-96px 0px -65% 0px', threshold: [0, 1]})
        nodes.forEach((node) => observer.observe(node))
        return () => observer.disconnect()
    }, [doc])

    const next = useMemo(() => isTerms
        ? {href: authRoutes.privacy, label: t('legal.readPrivacy'), title: t('legal.readPrivacyNext')}
        : {href: authRoutes.terms, label: t('legal.readTerms'), title: t('legal.readTermsNext')}, [isTerms, t])

    const navLink = (to: string, current: boolean, label: string) => (
        <Link to={to} aria-current={current ? 'page' : undefined}
              className={`inline-flex min-h-9 items-center rounded-full px-3.5 text-[0.85rem] font-bold whitespace-nowrap transition ${
                  current
                      ? 'bg-sage-900 text-[#eaf6ff] shadow-[0_8px_18px_-12px_rgba(12,74,110,.95)]'
                      : 'text-[#26543d] hover:bg-[#eaf6ff]'
              }`}>
            {label}
        </Link>
    )

    return (
        <div id="top" className="auth-scope min-h-svh min-w-[320px] bg-[#f4fbff] text-ink">
            {/* ------------------------------- header ------------------------------- */}
            {/* Sticky from lg up only - on a phone a three-row sticky header would eat a third of the
                screen while reading. */}
            <header className="z-30 border-b border-[#d6eaf6] bg-[#f4fbff]/92 backdrop-blur-md lg:sticky lg:top-0">
                <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2.5 sm:px-6">
                    <Link to={authRoutes.login} className="group flex items-center gap-2.5 text-sage-900">
                        <span
                            className="grid h-10 w-10 flex-none place-items-center rounded-full bg-[linear-gradient(145deg,#eff9ff,#e6f4ff)] ring-1 ring-[#c7e5f5] transition group-hover:ring-sage-600">
                            <LotusMark width={26}/>
                        </span>
                        <span className="font-temple text-[1rem] leading-tight font-semibold">
                            {t('legal.brandLine1')}
                            <span
                                className="block text-[0.82rem] font-normal text-[#40657b]">{t('legal.brandLine2')}</span>
                        </span>
                    </Link>

                    <nav aria-label={t('legal.navLabel')} className="ml-auto flex flex-wrap items-center gap-1.5">
                        <span className="flex items-center gap-0.5">
                            {navLink(authRoutes.terms, isTerms, t('legal.termsShort'))}
                            {navLink(authRoutes.privacy, !isTerms, t('legal.privacyShort'))}
                        </span>
                        <LanguageToggle tone="card" label={false} className="ml-1"/>
                        <Link to={authRoutes.register}
                              className="inline-flex min-h-9 items-center rounded-full border border-[#b9dbec] bg-white px-3.5 text-[0.85rem] font-bold text-[#26543d] transition hover:border-sage-600 hover:bg-white">
                            {t('legal.backToSignUp')}
                        </Link>
                    </nav>
                </div>
                <span aria-hidden="true" className="block h-0.5 w-full bg-[#dcecf7]">
                    <span
                        className="block h-full bg-[linear-gradient(90deg,#0284c7,#22d3ee)] transition-[width] duration-150"
                        style={{width: `${Math.round(progress * 100)}%`}}/>
                </span>
            </header>

            {/* -------------------------------- hero -------------------------------- */}
            <section
                className="relative overflow-hidden border-b border-[#dcecf7] bg-[linear-gradient(135deg,#f9fdff_0%,#eef9ff_48%,#d9effc_100%)]">
                <div aria-hidden="true"
                     className="pointer-events-none absolute -top-24 -right-16 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,.20),transparent_68%)]"/>
                <div aria-hidden="true"
                     className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(2,132,199,.16),transparent_70%)]"/>
                <div aria-hidden="true"
                     className="pointer-events-none absolute top-1/2 right-8 hidden -translate-y-1/2 opacity-[.1] lg:block">
                    <LotusMark width={210}/>
                </div>

                <div className="relative mx-auto max-w-6xl px-4 py-9 sm:px-6 sm:py-12">
                    <div className="flex flex-wrap items-center gap-2.5">
                        <p className="inline-flex items-center gap-2 rounded-full border border-[#bfe0f2] bg-white/85 px-3 py-1 text-[0.72rem] font-bold tracking-[0.16em] text-gold-700 uppercase">
                            <span className="text-sage-700">{isTerms ? <ScalesMark/> : <ShieldMark/>}</span>
                            {t('legal.badge')}
                        </p>
                        <p className="inline-flex items-center gap-2 rounded-full bg-sage-900 px-3 py-1 text-[0.76rem] font-semibold text-[#eaf6ff]">
                            <span className="text-sage-300"><CalendarMark/></span>
                            {t('legal.updated')} {doc.updated}
                        </p>
                    </div>

                    <h1 className="mt-4 max-w-[22ch] font-display text-[clamp(2rem,4.6vw,3rem)] leading-[1.06] font-bold text-sage-900">
                        {doc.title}
                    </h1>

                    <p className="mt-4 max-w-[68ch] text-[1.04rem] leading-relaxed text-[#33566c]">{doc.subtitle}</p>

                    <div
                        className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.85rem] font-semibold text-[#40657b]">
                        <span className="inline-flex items-center gap-2">
                            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-sage-500"/>
                            {t('legal.sectionCount').replace('%%', String(doc.sections.length))}
                        </span>
                        <span aria-hidden="true" className="hidden h-4 w-px bg-[#c7e5f5] sm:block"/>
                        <span>{t('legal.languageNote')}</span>
                    </div>
                </div>
            </section>

            {/* -------------------------------- body -------------------------------- */}
            <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-11">
                <div className="lg:grid lg:grid-cols-[15.5rem_minmax(0,1fr)] lg:items-start lg:gap-8">
                    {/*
                      * Phones get the contents list folded away - twenty entries would otherwise push
                      * the first clause a whole screen down. Tablets and desktops get the sticky rail.
                      */}
                    <details className="mb-5 rounded-2xl border border-[#d9ebf6] bg-white/85 px-3.5 py-3 lg:hidden">
                        <summary
                            className="cursor-pointer list-none text-[0.72rem] font-bold tracking-[0.14em] text-muted uppercase">
                            {t('legal.onThisPage')}
                        </summary>
                        <Contents sections={doc.sections} active={active}/>
                    </details>

                    <nav aria-label={t('legal.onThisPage')}
                         className="hidden lg:sticky lg:top-24 lg:block lg:max-h-[calc(100svh-8rem)] lg:overflow-y-auto">
                        <div
                            className="rounded-2xl border border-[#d9ebf6] bg-white/85 p-3.5 shadow-[0_10px_26px_-24px_rgba(18,60,46,.6)]">
                            <p className="m-0 px-1 pb-2 text-[0.72rem] font-bold tracking-[0.14em] text-muted uppercase">
                                {t('legal.onThisPage')}
                            </p>
                            <Contents sections={doc.sections} active={active}/>
                        </div>
                    </nav>

                    {/* clauses */}
                    <div className="min-w-0 space-y-4 sm:space-y-5">
                        {doc.sections.map((section, index) => (
                            <section key={section.id} id={section.id}
                                     ref={(node) => {
                                         sectionRefs.current[section.id] = node
                                     }}
                                     className="scroll-mt-28 rounded-2xl border border-[#d9ebf6] bg-white p-5 shadow-[0_14px_30px_-26px_rgba(18,60,46,.55)] transition duration-200 hover:border-[#b3d7ea] hover:shadow-[0_18px_36px_-26px_rgba(18,60,46,.6)] sm:p-7">
                                <div className="flex items-start gap-4">
                                    <span aria-hidden="true"
                                          className="mt-0.5 grid h-10 w-10 flex-none place-items-center rounded-xl bg-[linear-gradient(150deg,#eaf7ff,#d8eefb)] font-display text-[1.02rem] font-bold text-gold-800 ring-1 ring-[#c7e5f5]">
                                        {index + 1}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <h2 className="font-display text-[1.2rem] leading-snug font-bold text-sage-900 sm:text-[1.32rem]">
                                            {section.title}
                                        </h2>
                                        <span aria-hidden="true"
                                              className="mt-2.5 block h-0.5 w-12 rounded-full bg-[linear-gradient(90deg,#0284c7,#bae6fd)]"/>
                                        <div className="mt-3.5 space-y-3.5">
                                            {section.blocks.map((block, blockIndex) => (
                                                <Block key={blockIndex} block={block}/>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>
                        ))}

                        {/* ---------------------------- closing card ---------------------------- */}
                        <div
                            className="relative overflow-hidden rounded-2xl border border-[#bfe0f2] bg-[linear-gradient(125deg,#eef9ff_0%,#e0f2fd_55%,#cfeafa_100%)] p-5 sm:p-7">
                            <div aria-hidden="true"
                                 className="pointer-events-none absolute -top-16 -right-10 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,.22),transparent_70%)]"/>
                            <div className="relative flex flex-wrap items-end justify-between gap-5">
                                <div className="min-w-0">
                                    <p className="font-display text-[1.18rem] font-bold text-sage-900">{next.title}</p>
                                    <p className="mt-1.5 max-w-[46ch] text-[0.95rem] leading-relaxed text-[#40657b]">
                                        {t('legal.bothApply')}
                                    </p>
                                </div>
                                <div className="flex flex-wrap items-center gap-3">
                                    <Link to={next.href}
                                          className="inline-flex min-h-11 items-center justify-center rounded-[10px] border border-sage-700 bg-[linear-gradient(140deg,#0284c7,#0c4a6e)] px-5 text-[0.95rem] font-bold text-white shadow-[0_10px_22px_-14px_rgba(12,74,110,.9)] transition hover:-translate-y-px hover:shadow-[0_14px_26px_-14px_rgba(12,74,110,.9)]">
                                        {next.label}
                                    </Link>
                                    <Link to={authRoutes.register}
                                          className="inline-flex min-h-11 items-center justify-center rounded-[10px] border border-[#a9cfe3] bg-white px-5 text-[0.95rem] font-bold text-gold-800 transition hover:border-sage-600 hover:bg-[#eff9ff]">
                                        {t('legal.backToSignUp')}
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                            <a href="#top"
                               className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-[0.86rem] font-semibold text-gold-800 transition hover:bg-[#eff9ff] hover:text-sage-900">
                                <span aria-hidden="true" className="text-sage-600">▲</span> {t('legal.backToTop')}
                            </a>
                            <LanguageToggle tone="card" className="text-[#40657b]"/>
                        </div>
                    </div>
                </div>
            </main>

            {/* ------------------------------- footer ------------------------------- */}
            <footer className="border-t border-[#d6eaf6] bg-[linear-gradient(180deg,#f7fcff,#f2fafe)]">
                <div
                    className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-5 text-[0.83rem] text-[#5b7b8f] sm:px-6">
                    <span className="inline-flex items-center gap-2 font-semibold text-[#26543d]">
                        <LotusMark width={24}/> {t('legal.company')}
                    </span>
                    <span className="hidden sm:inline" aria-hidden="true">·</span>
                    <span>{t('legal.copyright')}</span>
                    <span className="ml-auto flex items-center gap-3">
                        <Link to={authRoutes.terms}
                              className="font-semibold text-[#26543d] underline-offset-4 hover:text-sage-900 hover:underline">
                            {t('legal.termsShort')}
                        </Link>
                        <span aria-hidden="true">·</span>
                        <Link to={authRoutes.privacy}
                              className="font-semibold text-[#26543d] underline-offset-4 hover:text-sage-900 hover:underline">
                            {t('legal.privacyShort')}
                        </Link>
                        <span aria-hidden="true">·</span>
                        <Link to={authRoutes.login}
                              className="font-semibold text-[#26543d] underline-offset-4 hover:text-sage-900 hover:underline">
                            {t('legal.signIn')}
                        </Link>
                    </span>
                </div>
            </footer>
        </div>
    )
}

/** Kept for the pages: the document types this shell renders. */
export type {LegalDoc, LegalSection, LegalBlock} from '../data/legal/types'