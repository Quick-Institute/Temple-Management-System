import type {ReactNode} from 'react'
import {LotusMark} from '../components/AuthIcons'

type ShellIconName = 'calendar' | 'community' | 'donation' | 'temple'

type ShellIconProps = { name: ShellIconName; size?: number }

const ShellIcon = ({name, size = 38}: ShellIconProps) => {
    const paths = {
        temple: <>
            <path d="M3 10.5 12 3l9 7.5"/>
            <path d="M5.5 9.5V21h13V9.5"/>
            <path d="M9 21v-6h6v6"/>
        </>,
        community: <>
            <circle cx="12" cy="8" r="3.5"/>
            <path d="M4.5 21c.3-4.2 3-6.5 7.5-6.5s7.2 2.3 7.5 6.5"/>
            <path d="M18.3 5.4a3.2 3.2 0 0 1 0 5.9M22 19.4c-.2-2.7-1.4-4.5-3.7-5.3"/>
        </>,
        calendar: <>
            <rect x="4" y="5.5" width="16" height="15" rx="1.8"/>
            <path d="M8 3.5v4M16 3.5v4M4 10h16"/>
            <path d="M8 14h.01M12 14h.01M16 14h.01"/>
        </>,
        donation: <>
            <path
                d="M19.5 12.5c.1 4.8-2.5 7.5-7.5 7.5H8.7L3.5 16.3l2.7-2.7 2.2 1.8h4.3c1.8 0 2.6-.8 2.4-1.8-.1-.8-.8-1.3-1.9-1.3H10l-1.6-1.7c1.7-2.2 4-3.1 6.9-2.6 1.9.3 3.3 1.8 4.2 4.5Z"/>
            <path d="m15.5 4.2.8-1.3.8 1.3 1.5.4-1 .9.1 1.5-1.4-.5-1.4.5.1-1.5-1-.9 1.5-.4Z"/>
        </>,
    }

    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.45"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

const features: { icon: ShellIconName; title: string; description: string }[] = [
    {icon: 'temple', title: 'Manage\nTemples', description: 'Keep temple details organised'},
    {icon: 'community', title: 'Support\nCommunity', description: 'Bring communities together'},
    {icon: 'calendar', title: 'Organize\nEvents', description: 'Plan every temple event'},
    {icon: 'donation', title: 'Enable\nDonations', description: 'Make giving simple and secure'},
]

type AuthVariant = 'login' | 'signup'

const BRAND = 'Temple Management System'

const COPY: Record<AuthVariant, { desktop: string[]; subtitle: string }> = {
    login: {
        desktop: ['Temple Management', 'System'],
        subtitle: 'Connecting Temples || Supporting Communities || Preserving Tradition',
    },
    signup: {
        desktop: ['Join Our', 'Temple', 'Community'],
        subtitle: 'Register your temple or become a member of our group',
    },
}

/**
 * Shared shell for the sign-in, sign-up, reset and forgot-password screens.
 *
 * Mobile first: stacked, hero above the card. The two-column split starts at `lg` (1024px).
 *
 * The hero itself has two sizes. Below `xl` (1280px) it is only the lotus mark and the temple name -
 * on a tablet or a small laptop the full headline, tagline and capability icons pushed the form too
 * far down the page. From `xl` up there is room for the whole hero beside the card.
 *
 * From `2xl` (1536px) the layout is capped and centred so a 2K or 4K screen does not stretch the
 * headline and the card to opposite edges - the photograph stays full bleed behind it.
 */
export const AuthShell = ({children, variant = 'login'}: { children: ReactNode; variant?: AuthVariant }) => {
    const copy = COPY[variant]
    return (
        <main
            className={`auth-scope relative isolate min-h-svh min-w-[320px] overflow-x-hidden bg-[#18382d] 2xl:mx-auto 2xl:max-w-[1800px] ${
                variant === 'signup'
                    ? 'lg:grid lg:items-start lg:grid-cols-[minmax(0,.82fr)_minmax(0,1.18fr)]'
                    : 'lg:grid lg:items-start lg:grid-cols-[minmax(0,1.02fr)_minmax(0,.98fr)]'
            }`}
        >
            {/*
          The photograph sits in a viewport-fixed layer instead of on <main>. Previously the image was
          a background of <main>, whose height grows with the form inside the card - so the long Temple
          Admin form scaled and re-cropped the photo compared with the shorter Committee Member and
          Family User forms. Anchored to the viewport, all three tabs frame the temple identically.
          The srcSet picks the smallest file that still covers the screen (480/768/1024/1253 px wide).
        */}
            <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-20 overflow-hidden bg-[#18382d]">
                <img
                    src="/images/temple-bg-1253.jpg"
                    srcSet="/images/temple-bg-480.jpg 480w, /images/temple-bg-768.jpg 768w, /images/temple-bg-1024.jpg 1024w, /images/temple-bg-1253.jpg 1253w"
                    sizes="100vw"
                    alt=""
                    decoding="async"
                    fetchPriority="high"
                    className="auth-photo h-full w-full object-cover"
                />
            </div>

            {/* Flat 20% black over the photograph - shared by the login and registration screens,
            so the temple reads slightly darker and the white hero copy keeps its contrast.
            The green-gradient layer below still sits on top of it. */}
            <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 bg-black/20"/>

            <div
                className="pointer-events-none fixed inset-0 -z-10 bg-[#061c1360] lg:bg-[linear-gradient(90deg,rgba(8,31,21,.15)_0%,rgba(9,35,23,.04)_46%,rgba(25,20,14,.03)_100%)]"/>

            {/* TOP HEADER SECTION */}
            <section
                className="block bg-linear-to-b from-[#0619103d] to-transparent px-4 pt-6 pb-4 sm:px-6 sm:pt-9 sm:pb-6 lg:sticky lg:top-0 lg:flex lg:h-svh lg:items-center lg:self-start lg:bg-none lg:px-[3.8vw] lg:py-[7.5vw]">
                <div className="w-full min-w-0 max-w-172.5 text-white lg:mt-[4vh]">
                    {/* COMPACT HERO - everything below xl (1280px): lotus mark and the temple name */}
                    <h1 className="m-0 flex items-center justify-center gap-3 font-display text-[1.15rem] font-bold leading-tight tracking-tight text-white [text-shadow:0_2px_5px_rgba(0,0,0,.8)] sm:gap-4 sm:text-[1.4rem] lg:justify-start lg:text-[1.6rem] xl:hidden">
                        <LotusMark width={48} className="flex-none"/>
                        <span className="text-balance">{BRAND}</span>
                    </h1>

                    {/* FULL HERO - from xl (1280px) up, beside the card */}
                    <h1 className="m-0 hidden font-arial text-[3.1rem] font-black leading-[.95] tracking-[-.035em] text-balance text-white [text-shadow:0_3px_0_rgba(0,0,0,.35),0_7px_12px_rgba(0,0,0,.68)] xl:block 2xl:text-[3.5rem]">
                        {copy.desktop.map((line, index) => (
                            <span key={line} className={index === 0 ? 'block' : 'mt-1 block'}>{line}</span>
                        ))}
                    </h1>

                    <p className={`ml-0.75 mt-6 hidden font-arial text-[1.1rem] font-bold leading-[1.65] text-white [text-shadow:0_2px_5px_rgba(0,0,0,.8)] xl:block ${
                        variant === 'signup' ? 'max-w-108' : ''
                    }`}>
                        {copy.subtitle.split('||').map((part, index) => (
                            <span key={part}>
                            {index > 0 &&
                                <b className="px-[.15em] text-[.94em]">||</b>}{part.trim()}{index < copy.subtitle.split('||').length - 1 ? ' ' : ''}
                        </span>
                        ))}
                    </p>

                    <ul className={variant === 'signup'
                        ? 'hidden'
                        : 'm-0 hidden list-none p-0 xl:mt-[10vh] xl:flex xl:gap-10 2xl:mt-[13vh] 2xl:gap-[3.2vw]'}
                        aria-label="System capabilities">
                        {features.map((feature) => (
                            <li className="group relative w-27.5 flex-none text-center text-[clamp(.78rem,1.05vw,1.06rem)] font-bold leading-[1.4] [text-shadow:0_2px_5px_rgba(0,0,0,.55)] after:absolute after:-right-7 after:top-0 after:h-36 after:w-px after:bg-white/80 after:content-[''] last:after:hidden xl:w-24 2xl:w-27.5"
                                key={feature.icon}>
                            <span
                                className="pointer-events-none absolute -top-12 left-1/2 w-40 -translate-x-1/2 rounded-md bg-[#123c2e]/95 px-2 py-1.5 text-[.62rem] font-normal leading-snug text-white opacity-0 shadow-lg transition-all duration-200 group-hover:-translate-y-1 group-hover:opacity-100">{feature.description}</span>
                                <span
                                    className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full border-2 border-white text-white transition-all duration-300 ease-out group-hover:-translate-y-1.5 group-hover:scale-110 group-hover:border-[#f9d77b] group-hover:bg-white/20 group-hover:text-[#fff4c9] group-hover:shadow-[0_9px_18px_rgba(0,0,0,.3)] xl:h-16 xl:w-16 2xl:mb-5 2xl:h-17.5 2xl:w-17.5"><ShellIcon
                                    name={feature.icon}/></span>
                                <span
                                    className="transition-colors duration-200 group-hover:text-[#fff4c9]">{feature.title.split('\n').map((line) =>
                                    <span className="block" key={line}>{line}</span>)}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* FORM SECTION */}
            <section
                className="grid w-full min-w-0 items-center justify-items-center px-4 pb-10 pt-1 sm:px-6 lg:py-[6vh] lg:pr-[5.4vw] lg:pl-[.4vw]">
                {children}
            </section>
        </main>
    )
}