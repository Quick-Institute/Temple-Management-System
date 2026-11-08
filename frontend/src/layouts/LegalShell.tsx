import type {ReactNode} from 'react'
import {Link} from 'react-router-dom'
import {LotusMark} from '../components/AuthIcons'
import {authRoutes} from '../routes/authRoutes'


export type LegalSection = { id: string; title: string; body: ReactNode }

const isTerms = (title: string) => title === 'Terms and Conditions'

/** Small gold calendar mark used by the "Last updated" chip. */
const CalendarMark = () => (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9}
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="5" width="18" height="16" rx="3"/>
        <path d="M3 10h18M8 3v4M16 3v4"/>
        <path d="M8 14.5h2m4 0h2M8 17.5h2"/>
    </svg>
)

/** Thin gold-to-sage rule that closes the hero block. */
const Ornament = () => (
    <span aria-hidden="true" className="flex items-center gap-2.5">
        <span className="h-px w-12 bg-[linear-gradient(90deg,#0284c7,transparent)]"/>
        <span className="h-1.25 w-1.25 rotate-45 bg-sage-600"/>
        <span className="h-px w-24 bg-[linear-gradient(90deg,#0284c7,transparent)]"/>
    </span>
)

export const LegalShell = ({title, subtitle, updated, sections}: {
    title: string
    subtitle: string
    updated: string
    sections: LegalSection[]
}) => (
    <div id="top" className="auth-scope min-h-svh min-w-[320px] bg-[#f4fbff] text-ink">
        <header className="border-b border-[#d6eaf6] bg-canvas/95 backdrop-blur-sm">
            <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
                <Link to={authRoutes.login} className="group flex items-center gap-2.5 text-sage-900">
                    <span
                        className="grid h-11 w-11 flex-none place-items-center rounded-full bg-[linear-gradient(145deg,#eff9ff,#eef4e6)] ring-1 ring-[#c7e5f5] transition group-hover:ring-sage-600">
                        <LotusMark width={28}/>
                    </span>
                    <span className="font-temple text-[1.02rem] leading-tight font-semibold">
                        Temple Management<br className="hidden sm:block"/> System
                    </span>
                </Link>
                <nav aria-label="Legal pages" className="ml-auto flex flex-wrap items-center gap-1.5 text-[0.86rem]">
                    <Link to={authRoutes.terms}
                          aria-current={isTerms(title) ? 'page' : undefined}
                          className={`rounded-full px-3 py-1.5 font-semibold transition ${isTerms(title)
                              ? 'bg-sage-900 text-[#eaf6ff] shadow-[0_6px_14px_-8px_rgba(12,74,110,.9)]'
                              : 'text-[#26543d] hover:bg-[#eaf6ff]'}`}>
                        Terms
                    </Link>
                    <Link to={authRoutes.privacy}
                          aria-current={isTerms(title) ? undefined : 'page'}
                          className={`rounded-full px-3 py-1.5 font-semibold transition ${isTerms(title)
                              ? 'text-[#26543d] hover:bg-[#eaf6ff]'
                              : 'bg-sage-900 text-[#eaf6ff] shadow-[0_6px_14px_-8px_rgba(12,74,110,.9)]'}`}>
                        Privacy
                    </Link>
                    <Link to={authRoutes.register}
                          className="ml-1 rounded-full border border-[#b9dbec] bg-white px-3 py-1.5 font-semibold text-[#26543d] transition hover:border-sage-600 hover:bg-canvas">
                        Back to sign up
                    </Link>
                </nav>
            </div>
        </header>

        {/* ------------------------------- hero ------------------------------- */}
        <section
            className="relative overflow-hidden border-b border-[#dcecf7] bg-[linear-gradient(135deg,#f7fcff_0%,#f2fbff_46%,#dff1fb_100%)]">
            <div aria-hidden="true"
                 className="pointer-events-none absolute -top-28 -right-20 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(174,138,46,.22),transparent_68%)]"/>
            <div aria-hidden="true"
                 className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(47,107,79,.16),transparent_70%)]"/>
            <div aria-hidden="true"
                 className="pointer-events-none absolute top-1/2 right-6 hidden -translate-y-1/2 opacity-[.13] lg:block">
                <LotusMark width={224}/>
            </div>

            <div className="relative mx-auto max-w-4xl px-4 py-9 sm:px-6 sm:py-12">
                <p className="inline-flex items-center gap-2 rounded-full border border-[#c7e5f5] bg-canvas px-3 py-1 text-[0.73rem] font-bold tracking-[0.16em] text-[#8a6a12] uppercase">
                    <span className="h-1.5 w-1.5 rounded-full bg-sage-600"/>
                    Legal · {isTerms(title) ? 'Terms' : 'Privacy'}
                </p>

                <h1 className="mt-4 font-display text-[clamp(2rem,4.8vw,2.95rem)] leading-[1.08] font-bold text-sage-900">
                    {title}
                </h1>
                <div className="mt-4"><Ornament/></div>

                <p className="mt-4 max-w-[62ch] text-[1.06rem] leading-relaxed text-[#33566c]">{subtitle}</p>

                <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-sage-900 px-3.5 py-1.5 text-[0.84rem] font-semibold text-[#eaf6ff]">
                    <span className="text-sage-400"><CalendarMark/></span>
                    Last updated {updated}
                </p>
            </div>
        </section>

        {/* ------------------------------ clauses ----------------------------- */}
        <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-11">
            <div className="space-y-4 sm:space-y-5">
                {sections.map((section, index) => (
                    <section key={section.id} id={section.id}
                             className="scroll-mt-24 rounded-2xl border border-[#d9ebf6] bg-canvas p-5 shadow-[0_1px_0_rgba(255,255,255,.9)_inset,0_12px_26px_-22px_rgba(18,60,46,.55)] transition duration-200 hover:-translate-y-px hover:border-[#a9cfe3] hover:shadow-[0_18px_34px_-24px_rgba(18,60,46,.6)] sm:p-7">
                        <div className="flex items-start gap-4">
                            <span aria-hidden="true"
                                  className="mt-0.5 grid h-10 w-10 flex-none place-items-center rounded-xl bg-[linear-gradient(150deg,#effaff,#dcf1fb)] font-display text-[1.02rem] font-bold text-gold-800 ring-1 ring-[#c7e5f5]">
                                {index + 1}
                            </span>
                            <div className="min-w-0">
                                <h2 className="font-display text-[1.22rem] leading-snug font-bold text-sage-900 sm:text-[1.34rem]">
                                    {section.title}
                                </h2>
                                <span aria-hidden="true"
                                      className="mt-2.5 block h-0.5 w-12 rounded-full bg-[linear-gradient(90deg,#0284c7,#bae6fd)]"/>
                                {/* break-words: a long email address or URL used to sit wider than its
                                    column and push the whole page into a horizontal scroll below 360px. */}
                                <div
                                    className="mt-3 space-y-3 text-[1rem] leading-[1.75] wrap-break-word text-[#33566c] sm:text-[1.02rem] [&_b]:font-semibold">
                                    {section.body}
                                </div>
                            </div>
                        </div>
                    </section>
                ))}
            </div>

            {/* --------------------------- closing card --------------------------- */}
            <div
                className="relative mt-8 overflow-hidden rounded-2xl border border-[#c7e5f5] bg-[linear-gradient(125deg,#effaff_0%,#e3f4fd_55%,#d3ebf8_100%)] p-5 sm:mt-10 sm:p-7">
                <div aria-hidden="true"
                     className="pointer-events-none absolute -top-16 -right-10 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(174,138,46,.2),transparent_70%)]"/>
                <div className="relative flex flex-wrap items-end justify-between gap-5">
                    <div className="min-w-0">
                        <p className="font-display text-[1.2rem] font-bold text-sage-900">
                            {isTerms(title) ? 'Read the Privacy Policy next' : 'Read the Terms and Conditions next'}
                        </p>
                        <p className="mt-1.5 max-w-[46ch] text-[0.95rem] leading-relaxed text-[#40657b]">
                            Both documents apply together. The consent you give at sign-up covers each of them.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <Link to={authRoutes.register}
                              className="inline-flex min-h-11 items-center justify-center rounded-[10px] border border-sage-700 bg-[linear-gradient(140deg,#0284c7,#0c4a6e)] px-5 text-[0.95rem] font-bold text-white shadow-[0_10px_22px_-14px_rgba(12,74,110,.9)] transition hover:-translate-y-px hover:shadow-[0_14px_26px_-14px_rgba(12,74,110,.9)]">
                            Back to sign up
                        </Link>
                        <Link to={isTerms(title) ? authRoutes.privacy : authRoutes.terms}
                              className="inline-flex min-h-11 items-center justify-center rounded-[10px] border border-[#a9cfe3] bg-canvas px-5 text-[0.95rem] font-bold text-gold-800 transition hover:border-sage-600 hover:bg-[#eff9ff]">
                            {isTerms(title) ? 'Read the Privacy Policy' : 'Read the Terms and Conditions'}
                        </Link>
                    </div>
                </div>
            </div>

            <div className="mt-6 text-center">
                <a href="#top"
                   className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-[0.86rem] font-semibold text-gold-800 transition hover:bg-[#eff9ff] hover:text-sage-900">
                    <span aria-hidden="true" className="text-sage-600">▲</span> Back to top
                </a>
            </div>
        </main>

        <footer className="border-t border-[#d6eaf6] bg-[linear-gradient(180deg,#f7fcff,#f2fafe)]">
            <div
                className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-5 text-[0.83rem] text-[#5b7b8f] sm:px-6">
                <span className="inline-flex items-center gap-2 font-semibold text-[#26543d]">
                    <LotusMark width={24}/> Quick Solutions (PVT) Ltd
                </span>
                <span className="hidden sm:inline" aria-hidden="true">·</span>
                <span>© 2026 Temple Management System</span>
                <span className="ml-auto flex items-center gap-3">
                    <Link to={authRoutes.terms}
                          className="font-semibold text-[#26543d] underline-offset-4 hover:text-sage-900 hover:underline">
                        Terms and Conditions
                    </Link>
                    <span aria-hidden="true">·</span>
                    <Link to={authRoutes.privacy}
                          className="font-semibold text-[#26543d] underline-offset-4 hover:text-sage-900 hover:underline">
                        Privacy Policy
                    </Link>
                </span>
            </div>
        </footer>
    </div>
)