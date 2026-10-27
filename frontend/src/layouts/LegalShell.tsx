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
        <span className="h-px w-12 bg-[linear-gradient(90deg,#AE8A2E,transparent)]"/>
        <span className="h-1.25 w-1.25 rotate-45 bg-[#AE8A2E]"/>
        <span className="h-px w-24 bg-[linear-gradient(90deg,#AE8A2E,transparent)]"/>
    </span>
)

export const LegalShell = ({title, subtitle, updated, sections}: {
    title: string
    subtitle: string
    updated: string
    sections: LegalSection[]
}) => (
    <div id="top" className="auth-scope min-h-svh min-w-[320px] bg-[#fdfaf0] text-[#1f2d26]">
        <header className="border-b border-[#e6dfc6] bg-[#fffdf4]/95 backdrop-blur-sm">
            <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
                <Link to={authRoutes.login} className="group flex items-center gap-2.5 text-[#123c2e]">
                    <span
                        className="grid h-11 w-11 flex-none place-items-center rounded-full bg-[linear-gradient(145deg,#fdf8e6,#eef4e6)] ring-1 ring-[#e2d6a8] transition group-hover:ring-[#AE8A2E]">
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
                              ? 'bg-[#123c2e] text-[#f7f2df] shadow-[0_6px_14px_-8px_rgba(18,60,46,.9)]'
                              : 'text-[#26543d] hover:bg-[#f1f5e7]'}`}>
                        Terms
                    </Link>
                    <Link to={authRoutes.privacy}
                          aria-current={isTerms(title) ? undefined : 'page'}
                          className={`rounded-full px-3 py-1.5 font-semibold transition ${isTerms(title)
                              ? 'text-[#26543d] hover:bg-[#f1f5e7]'
                              : 'bg-[#123c2e] text-[#f7f2df] shadow-[0_6px_14px_-8px_rgba(18,60,46,.9)]'}`}>
                        Privacy
                    </Link>
                    <Link to={authRoutes.register}
                          className="ml-1 rounded-full border border-[#d8cf9f] bg-white px-3 py-1.5 font-semibold text-[#26543d] transition hover:border-[#AE8A2E] hover:bg-[#fffdf4]">
                        Back to sign up
                    </Link>
                </nav>
            </div>
        </header>

        {/* ------------------------------- hero ------------------------------- */}
        <section
            className="relative overflow-hidden border-b border-[#ece6cf] bg-[linear-gradient(135deg,#fffdf4_0%,#f9f9ec_46%,#edf4e4_100%)]">
            <div aria-hidden="true"
                 className="pointer-events-none absolute -top-28 -right-20 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(174,138,46,.22),transparent_68%)]"/>
            <div aria-hidden="true"
                 className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(47,107,79,.16),transparent_70%)]"/>
            <div aria-hidden="true"
                 className="pointer-events-none absolute top-1/2 right-6 hidden -translate-y-1/2 opacity-[.13] lg:block">
                <LotusMark width={224}/>
            </div>

            <div className="relative mx-auto max-w-4xl px-4 py-9 sm:px-6 sm:py-12">
                <p className="inline-flex items-center gap-2 rounded-full border border-[#e2d6a8] bg-[#fffdf4] px-3 py-1 text-[0.73rem] font-bold tracking-[0.16em] text-[#8a6a12] uppercase">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#AE8A2E]"/>
                    Legal · {isTerms(title) ? 'Terms' : 'Privacy'}
                </p>

                <h1 className="mt-4 font-display text-[clamp(2rem,4.8vw,2.95rem)] leading-[1.08] font-bold text-[#123c2e]">
                    {title}
                </h1>
                <div className="mt-4"><Ornament/></div>

                <p className="mt-4 max-w-[62ch] text-[1.06rem] leading-relaxed text-[#2c3a31]">{subtitle}</p>

                <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#123c2e] px-3.5 py-1.5 text-[0.84rem] font-semibold text-[#f7f2df]">
                    <span className="text-[#e0bd62]"><CalendarMark/></span>
                    Last updated {updated}
                </p>
            </div>
        </section>

        {/* ------------------------------ clauses ----------------------------- */}
        <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-11">
            <div className="space-y-4 sm:space-y-5">
                {sections.map((section, index) => (
                    <section key={section.id} id={section.id}
                             className="scroll-mt-24 rounded-2xl border border-[#e8e2cb] bg-[#fffdf4] p-5 shadow-[0_1px_0_rgba(255,255,255,.9)_inset,0_12px_26px_-22px_rgba(18,60,46,.55)] transition duration-200 hover:-translate-y-px hover:border-[#dccfa0] hover:shadow-[0_18px_34px_-24px_rgba(18,60,46,.6)] sm:p-7">
                        <div className="flex items-start gap-4">
                            <span aria-hidden="true"
                                  className="mt-0.5 grid h-10 w-10 flex-none place-items-center rounded-xl bg-[linear-gradient(150deg,#fdf7e2,#f1e5bd)] font-display text-[1.02rem] font-bold text-[#7d6114] ring-1 ring-[#e3d6a5]">
                                {index + 1}
                            </span>
                            <div className="min-w-0">
                                <h2 className="font-display text-[1.22rem] leading-snug font-bold text-[#123c2e] sm:text-[1.34rem]">
                                    {section.title}
                                </h2>
                                <span aria-hidden="true"
                                      className="mt-2.5 block h-0.5 w-12 rounded-full bg-[linear-gradient(90deg,#AE8A2E,#cfe0bf)]"/>
                                {/* break-words: a long email address or URL used to sit wider than its
                                    column and push the whole page into a horizontal scroll below 360px. */}
                                <div
                                    className="mt-3 space-y-3 text-[1rem] leading-[1.75] wrap-break-word text-[#2a3b31] sm:text-[1.02rem] [&_b]:font-semibold">
                                    {section.body}
                                </div>
                            </div>
                        </div>
                    </section>
                ))}
            </div>

            {/* --------------------------- closing card --------------------------- */}
            <div
                className="relative mt-8 overflow-hidden rounded-2xl border border-[#e2d6a8] bg-[linear-gradient(125deg,#fdf9e9_0%,#f4f8ec_55%,#e9f2e0_100%)] p-5 sm:mt-10 sm:p-7">
                <div aria-hidden="true"
                     className="pointer-events-none absolute -top-16 -right-10 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(174,138,46,.2),transparent_70%)]"/>
                <div className="relative flex flex-wrap items-end justify-between gap-5">
                    <div className="min-w-0">
                        <p className="font-display text-[1.2rem] font-bold text-[#123c2e]">
                            {isTerms(title) ? 'Read the Privacy Policy next' : 'Read the Terms and Conditions next'}
                        </p>
                        <p className="mt-1.5 max-w-[46ch] text-[0.95rem] leading-relaxed text-[#3d5245]">
                            Both documents apply together. The consent you give at sign-up covers each of them.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <Link to={authRoutes.register}
                              className="inline-flex min-h-11 items-center justify-center rounded-[10px] border border-[#14512f] bg-[linear-gradient(140deg,#1d5c46,#123c2e)] px-5 text-[0.95rem] font-bold text-white shadow-[0_10px_22px_-14px_rgba(18,60,46,.9)] transition hover:-translate-y-px hover:shadow-[0_14px_26px_-14px_rgba(18,60,46,.9)]">
                            Back to sign up
                        </Link>
                        <Link to={isTerms(title) ? authRoutes.privacy : authRoutes.terms}
                              className="inline-flex min-h-11 items-center justify-center rounded-[10px] border border-[#c9b884] bg-[#fffdf4] px-5 text-[0.95rem] font-bold text-[#6f5510] transition hover:border-[#AE8A2E] hover:bg-[#fdf8e6]">
                            {isTerms(title) ? 'Read the Privacy Policy' : 'Read the Terms and Conditions'}
                        </Link>
                    </div>
                </div>
            </div>

            <div className="mt-6 text-center">
                <a href="#top"
                   className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-[0.86rem] font-semibold text-[#6f5510] transition hover:bg-[#fdf8e6] hover:text-[#123c2e]">
                    <span aria-hidden="true" className="text-[#AE8A2E]">▲</span> Back to top
                </a>
            </div>
        </main>

        <footer className="border-t border-[#e6dfc6] bg-[linear-gradient(180deg,#fffdf4,#f7f7e9)]">
            <div
                className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-5 text-[0.83rem] text-[#5d6b62] sm:px-6">
                <span className="inline-flex items-center gap-2 font-semibold text-[#26543d]">
                    <LotusMark width={24}/> Quick Solutions (PVT) Ltd
                </span>
                <span className="hidden sm:inline" aria-hidden="true">·</span>
                <span>© 2026 Temple Management System</span>
                <span className="ml-auto flex items-center gap-3">
                    <Link to={authRoutes.terms}
                          className="font-semibold text-[#26543d] underline-offset-4 hover:text-[#123c2e] hover:underline">
                        Terms and Conditions
                    </Link>
                    <span aria-hidden="true">·</span>
                    <Link to={authRoutes.privacy}
                          className="font-semibold text-[#26543d] underline-offset-4 hover:text-[#123c2e] hover:underline">
                        Privacy Policy
                    </Link>
                </span>
            </div>
        </footer>
    </div>
)