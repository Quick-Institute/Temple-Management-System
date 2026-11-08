import type {ReactNode} from 'react';
import {useTranslation} from 'react-i18next';
import {CommunityMark, DonationMark, EventsMark, TempleMark} from '../components/AuthIcons';

type ShellIconName = 'calendar' | 'community' | 'donation' | 'temple'
/*
 * The temple mark is shared with the "Temple Admin" tab on the register screen, so the two read as
 * the same temple. It is drawn on a finer 31x31 grid and fills more of its box than the other three
 * icons do, so it is rendered slightly smaller to sit at the same optical size inside the circle.
 */
const TEMPLE_MARK_SIZE = 30

/*
 * The three supplied marks are drawn on a 100x100 grid and each fills a different share of it, so
 * they are sized per icon to land at the same optical size as the temple inside the circle. Measured
 * at 1440px, the artwork of all four comes out between 28px and 31px wide inside the 64px circle.
 */
const COMMUNITY_MARK_SIZE = 44
const EVENTS_MARK_SIZE = 56
const DONATION_MARK_SIZE = 40
type ShellIconProps = { name: ShellIconName; size?: number }

const ShellIcon = ({name}: ShellIconProps) => {
    if (name === 'temple') return <TempleMark size={TEMPLE_MARK_SIZE}/>
    if (name === 'community') return <CommunityMark size={COMMUNITY_MARK_SIZE}/>
    if (name === 'calendar') return <EventsMark size={EVENTS_MARK_SIZE}/>
    if (name === 'donation') return <DonationMark size={DONATION_MARK_SIZE}/>
    return null
}

const FEATURES: { icon: ShellIconName; titleKey: string; noteKey: string }[] = [
    {icon: 'temple', titleKey: 'auth.feature.temple', noteKey: 'auth.feature.templeNote'},
    {icon: 'community', titleKey: 'auth.feature.community', noteKey: 'auth.feature.communityNote'},
    {icon: 'calendar', titleKey: 'auth.feature.events', noteKey: 'auth.feature.eventsNote'},
    {icon: 'donation', titleKey: 'auth.feature.donation', noteKey: 'auth.feature.donationNote'},
]

/*
 * The one heading and one subtitle size used by every auth card - login, register, forgot
 * password and reset password. They live here so the four screens cannot drift apart again.
 */
export const AUTH_HEADING =
    'mb-2.5 mt-1 font-display text-[1.9rem] leading-tight font-bold tracking-tight text-[#0c4a6e] sm:text-[clamp(2rem,2.6vw,2.7rem)]'
export const AUTH_SUBTITLE = 'mt-0 text-[1.02rem] leading-relaxed text-[#33566c]'

type AuthVariant = 'login' | 'signup'

const COPY: Record<AuthVariant, { desktop: string[]; mobile: string[]; subtitleKey: string }> = {
    login: {
        desktop: ['Temple Management', 'System'],
        mobile: ['Temple', 'Management', 'System'],
        subtitleKey: 'auth.heroLogin',
    },
    signup: {
        desktop: ['Join Our', 'Temple', 'Community'],
        mobile: ['Join Our', 'Temple', 'Community'],
        subtitleKey: 'auth.heroSignup',
    },
}

export const AuthShell = ({children, variant = 'login'}: { children: ReactNode; variant?: AuthVariant }) => {
    const {t} = useTranslation()
    const copy = COPY[variant]
    const subtitle = t(copy.subtitleKey)
    /* The sign-up headline is a sentence, so it is translated as one; the login headline is the
       product name and stays as it is. */
    const headline = variant === 'signup' ? t('auth.heroSignupTitle') : null
    return (
        <main
            className={`auth-scope relative isolate min-h-svh min-w-[320px] overflow-x-hidden bg-sage-900 2xl:mx-auto 2xl:max-w-[1800px] ${
                variant === 'signup'
                    ? 'lg:grid lg:items-start lg:grid-cols-[minmax(0,.82fr)_minmax(0,1.18fr)]'
                    : 'lg:grid lg:items-start lg:grid-cols-[minmax(0,1.02fr)_minmax(0,.98fr)]'
            }`}
        >
            {/* No language switch: the client asked for English-only temple admin screens.
            i18n stays wired (src/i18n.ts) so a toggle can be dropped back in later. */}

            {/*
          The photograph sits in a viewport-fixed layer instead of on <main>. Previously the image was
          a background of <main>, whose height grows with the form inside the card - so the long Temple
          Admin form scaled and re-cropped the photo compared with the shorter Committee Member and
          Family User forms. Anchored to the viewport, all three tabs frame the temple identically.
          The srcSet picks the smallest file that still covers the screen (480/768/1024/1253 px wide).
        */}
            <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-20 overflow-hidden bg-[#0b2d4a]">
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

            {/* Flat 20% black over the photograph - shared by every auth screen, so the temple reads
            slightly darker and the white hero copy keeps its contrast. */}
            <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 bg-sage-950/22"/>

            {/* Green wash, below lg only - this is the layer that darkens the stacked screens. */}
            <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 bg-[#04182bcc] lg:hidden"/>

            {/* Light left-to-right gradient, every width. Above lg this is the only overlay, which is
            why the split screens look as bright as they did before. */}
            <div aria-hidden="true"
                 className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(90deg,rgba(6,30,50,.52)_0%,rgba(8,40,66,.26)_44%,rgba(9,42,68,.04)_72%,rgba(9,42,68,.02)_100%)]"/>

            {/* TOP HEADER SECTION */}
            <section
                className="block bg-linear-to-b from-[#0619103d] to-transparent px-4 pt-8 pb-4 text-center sm:px-6 sm:pt-10 sm:pb-5 lg:sticky lg:top-0 lg:flex lg:h-svh lg:flex-col lg:items-center lg:justify-start lg:self-start lg:bg-none lg:px-6 lg:py-[5vh] roomy:px-[3.8vw] roomy:py-[7.5vw]">
                <div className="mx-auto w-full min-w-0 max-w-172.5 text-white lg:my-auto roomy:mx-0">
                    <div>
                        {/* TABLET AND DESKTOP VERSION - from sm (640px) up */}
                        <h1 className="m-0 hidden text-center font-arial text-[2.35rem] font-black leading-[.95] tracking-[-.035em] text-balance text-white [text-shadow:0_3px_0_rgba(0,0,0,.35),0_7px_12px_rgba(0,0,0,.68)] sm:block md:text-[2.9rem] lg:text-[2.5rem] xl:text-[3.1rem] 2xl:text-[3.5rem] roomy:text-left">
                            {headline
                                ? <span className="block">{headline}</span>
                                : copy.desktop.map((line, index) => (
                                    <span key={line} className={index === 0 ? 'block' : 'mt-1 block'}>{line}</span>
                                ))}
                        </h1>

                        {/* PHONE VERSION - the original three centred lines, exactly as before */}
                        <h1 className="m-0 flex flex-col items-center gap-0.5 text-center font-arial text-[clamp(2.1rem,8vw,2.6rem)] font-black leading-[1.05] text-white [text-shadow:0_3px_0_rgba(0,0,0,.35),0_7px_12px_rgba(0,0,0,.68)] sm:hidden">
                            {headline ? <span>{headline}</span> : copy.mobile.map((line) => <span
                                key={line}>{line}</span>)}
                        </h1>
                    </div>

                    {/* SUBTITLE - from sm (640px) up. Capped at 480px until lg so it does not stretch
                        across a whole tablet, then allowed to run full width beside the card. */}
                    <p className={`mx-auto mt-4 hidden text-center font-arial font-bold leading-[1.65] text-white [text-shadow:0_2px_5px_rgba(0,0,0,.8)] sm:mt-6 sm:block sm:max-w-120 sm:text-[.85rem] md:text-[.95rem] lg:max-w-none lg:text-[1rem] xl:text-[1.1rem] roomy:mx-0 roomy:text-left ${
                        variant === 'signup' ? 'max-w-108' : ''
                    }`}>
                        {subtitle.split('||').map((part, index) => (
                            <span key={part}>
                            {index > 0 &&
                                <b className="px-[.15em] text-[.94em]">||</b>}{part.trim()}{index < subtitle.split('||').length - 1 ? ' ' : ''}
                        </span>
                        ))}
                    </p>

                    {/* The four capability items. Hidden only while the layout is stacked, where the
                        card sits underneath - from lg they fill the lower half of the hero on both
                        the login and the register screens. */}
                    <ul className="m-0 hidden list-none justify-center p-0 lg:mt-[4vh] lg:flex lg:gap-8 roomy:mt-[6vh] roomy:justify-start xl:gap-10 2xl:gap-[3.2vw]"
                        aria-label={t('nav.capabilities')}
                        style={{paddingBottom: '4.4rem'}}>
                        {FEATURES.map((feature) => (
                            <li className="group relative w-27.5 text-center first:[&>span:first-child]:left-0 last:[&>span:first-child]:right-0 last:[&>span:first-child]:translate-x-0 text-[clamp(.78rem,1.05vw,1.06rem)] font-bold leading-[1.4] [text-shadow:0_2px_5px_rgba(0,0,0,.55)] after:absolute after:-right-7 after:top-0 after:h-36 after:w-px after:bg-white/80 after:content-[''] last:after:hidden lg:w-auto lg:min-w-0 lg:flex-1 lg:max-w-21 xl:max-w-24 2xl:max-w-27.5"
                                key={feature.icon}>
                                {/*
                              * The note used to float ABOVE the icon, where it landed on the headline
                              * and the subtitle and read as part of them. It now drops BELOW the label
                              * into the empty space under the row: a solid navy card with white text,
                              * a sky border, a shadow and a pointer, so it is unmistakable over the
                              * photograph. It opens on hover and on keyboard focus, and the reserved
                              * space means nothing on the page moves when it appears.
                              */}
                                <span
                                    role="tooltip"
                                    className="pointer-events-none absolute top-full left-1/2 z-30 mt-2.5 w-48 -translate-x-1/2 rounded-xl border-2 border-white bg-[#041e33] px-3.5 py-2.5 text-center text-[.86rem] leading-snug font-bold text-white whitespace-normal opacity-0 shadow-[0_14px_34px_rgba(0,0,0,.85)] transition-opacity duration-100 text-shadow-none group-hover:opacity-100 before:absolute before:bottom-full before:left-1/2 before:-mb-0.5 before:-translate-x-1/2 before:border-[7px] before:border-transparent before:border-b-white before:content-['']">{t(feature.noteKey)}</span>
                                <span
                                    className="mx-auto mb-5 grid h-17.5 w-17.5 place-items-center rounded-full border-2 border-white text-white transition-all duration-300 ease-out group-hover:-translate-y-1.5 group-hover:scale-110 group-hover:border-sage-300 group-hover:bg-white/20 group-hover:text-sage-100 group-hover:shadow-[0_9px_18px_rgba(0,0,0,.3)] lg:mb-4 lg:h-14 lg:w-14 xl:h-16 xl:w-16 2xl:mb-5 2xl:h-17.5 2xl:w-17.5"><ShellIcon
                                    name={feature.icon}/></span>
                                <span
                                    className="transition-colors duration-200 group-hover:text-sage-100">{t(feature.titleKey).split('\n').map((line) =>
                                    <span className="block" key={line}>{line}</span>)}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* FORM SECTION - a viewport-tall flex box from lg so a short card is centred vertically.
                `my-auto` on the card (not `items-center`) keeps a tall card reachable: when it is
                taller than the window the auto margins collapse and it simply starts at the top. */}
            <section
                className="grid w-full min-w-0 justify-items-center px-4 pb-10 pt-1 sm:px-6 lg:flex lg:min-h-svh lg:flex-col lg:items-center lg:py-[6vh] lg:pr-[5.4vw] lg:pl-[.4vw]">
                {children}
            </section>
        </main>
    )
}