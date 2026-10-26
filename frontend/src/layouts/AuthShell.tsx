import type {ReactNode} from 'react'

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

const COPY: Record<AuthVariant, { desktop: string[]; mobile: string[]; subtitle: string }> = {
    login: {
        desktop: ['Temple Management', 'System'],
        mobile: ['Temple', 'Management', 'System'],
        subtitle: 'Connecting Temples || Supporting Communities || Preserving Tradition',
    },
    signup: {
        desktop: ['Join Our', 'Temple', 'Community'],
        mobile: ['Join Our', 'Temple', 'Community'],
        subtitle: 'Register your temple or become a member of our group',
    },
}

export const AuthShell = ({children, variant = 'login'}: { children: ReactNode; variant?: AuthVariant }) => {
    const copy = COPY[variant]
    return (
        <main
            className={`auth-scope relative isolate min-h-svh min-w-[320px] overflow-x-hidden bg-[#18382d] max-[840px]:block ${
                variant === 'signup'
                    ? 'lg:grid lg:items-start lg:grid-cols-[minmax(0,.82fr)_minmax(0,1.18fr)]'
                    : 'lg:grid lg:items-start lg:grid-cols-[minmax(0,1.02fr)_minmax(0,.98fr)]'
            }`}
        >
            {/*
          The photograph sits in a viewport-fixed layer instead of on <main>. Previously the image was
          a background of <main>, whose height grows with the form inside the card — so the long Temple
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

            {/* Flat 20% black over the photograph — shared by the login and registration screens,
            so the temple reads slightly darker and the white hero copy keeps its contrast.
            The green-gradient layer below still sits on top of it. */}
            <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 bg-black/20"/>

            <div
                className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(90deg,rgba(8,31,21,.15)_0%,rgba(9,35,23,.04)_46%,rgba(25,20,14,.03)_100%)] max-[1023px]:bg-[#061c1360]"/>

            {/* TOP HEADER SECTION */}
            <section
                className="flex items-start px-[3.8vw] py-[7.5vw] max-[1023px]:block max-[1023px]:bg-linear-to-b max-[1023px]:from-[#0619103d] max-[1023px]:to-transparent max-[1023px]:px-7 max-[1023px]:pt-10 max-[1023px]:pb-5 max-[640px]:px-5.5 max-[640px]:pt-8 max-[640px]:pb-4 max-[450px]:px-4.5 max-[450px]:pt-6 max-[450px]:pb-3 lg:sticky lg:top-0 lg:h-svh lg:self-start lg:items-center">
                <div className="w-full min-w-0 max-w-172.5 text-white lg:mt-[4vh]">
                    <div>
                        {/* DESKTOP VERSION - Hidden on mobile (<= 640px) */}
                        <h1 className="m-0 hidden font-arial text-[clamp(2.3rem,3.85vw,4.5rem)] font-black leading-[.9] tracking-[-.035em] text-balance text-white [text-shadow:0_3px_0_rgba(0,0,0,.35),0_7px_12px_rgba(0,0,0,.68)] max-[1300px]:text-[clamp(2.05rem,3.25vw,3.1rem)] max-[1023px]:text-[clamp(2.4rem,6.4vw,3.4rem)] min-[641px]:block">
                            {copy.desktop.map((line, index) => (
                                <span key={line} className={index === 0 ? 'block' : 'mt-1 block'}>{line}</span>
                            ))}
                        </h1>

                        {/* MOBILE VERSION */}
                        <h1 className="m-0 flex flex-col items-center text-center gap-0.5 font-arial font-black leading-[1.05] text-white [text-shadow:0_3px_0_rgba(0,0,0,.35),0_7px_12px_rgba(0,0,0,.68)] max-[640px]:text-[clamp(2rem,8vw,2.6rem)] max-[450px]:text-[2.1rem] min-[641px]:hidden">
                            {copy.mobile.map((line) => <span key={line}>{line}</span>)}
                        </h1>
                    </div>

                    {/* SUBTITLE - Hidden on <= 640px */}
                    <p className={`ml-0.75 font-arial font-bold leading-[1.65] text-white [text-shadow:0_2px_5px_rgba(0,0,0,.8)] mt-6 max-[1300px]:text-[.8rem] max-[1023px]:mt-4 max-[1023px]:max-w-120 max-[640px]:hidden ${
                        variant === 'signup'
                            ? 'max-w-108 text-[clamp(.85rem,1.15vw,1.15rem)]'
                            : 'text-[clamp(.8rem,1.18vw,1.2rem)] min-[1301px]:whitespace-nowrap'
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
                        : 'm-0 mt-[clamp(5rem,16vh,13rem)] flex list-none gap-[clamp(1.5rem,3.4vw,5rem)] p-0 max-[1300px]:gap-[1.1rem] max-[1023px]:hidden'}
                        aria-label="System capabilities">
                        {features.map((feature) => (
                            <li className="group relative w-27.5 flex-none text-center text-[clamp(.78rem,1.05vw,1.06rem)] font-bold leading-[1.4] [text-shadow:0_2px_5px_rgba(0,0,0,.55)] after:absolute after:-right-7 after:top-0 after:h-36 after:w-px after:bg-white/80 after:content-[''] last:after:hidden max-[1300px]:w-21"
                                key={feature.icon}>
                            <span
                                className="pointer-events-none absolute -top-12 left-1/2 w-40 -translate-x-1/2 rounded-md bg-[#123c2e]/95 px-2 py-1.5 text-[.62rem] font-normal leading-snug text-white opacity-0 shadow-lg transition-all duration-200 group-hover:-translate-y-1 group-hover:opacity-100">{feature.description}</span>
                                <span
                                    className="mx-auto mb-5 grid h-17.5 w-17.5 place-items-center rounded-full border-2 border-white text-white transition-all duration-300 ease-out group-hover:-translate-y-1.5 group-hover:scale-110 group-hover:border-[#f9d77b] group-hover:bg-white/20 group-hover:text-[#fff4c9] group-hover:shadow-[0_9px_18px_rgba(0,0,0,.3)]"><ShellIcon
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
                className="grid w-full min-w-0 items-center justify-items-center px-4 py-[6vh] max-[1023px]:block max-[1023px]:px-5 max-[1023px]:pt-1 max-[1023px]:pb-10 max-[640px]:px-4 max-[450px]:px-3 lg:pr-[5.4vw] lg:pl-[.4vw]">
                {children}
            </section>
        </main>
    )
}