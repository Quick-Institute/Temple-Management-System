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

export const AuthShell = ({children}: { children: ReactNode }) => (
    <main
        className="relative isolate min-h-svh min-w-[320px] overflow-x-hidden bg-[#18382d] bg-position-[18%_center] bg-cover bg-no-repeat lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(500px,.9fr)] max-[840px]:block max-[840px]:bg-position-[41%_center]"
        style={{backgroundImage: "url('/images/temple-bg.jpg')"}}
    >
        <div
            className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(8,31,21,.15)_0%,rgba(9,35,23,.04)_46%,rgba(25,20,14,.03)_100%)] max-[840px]:bg-[#061c1360]"/>

        {/* TOP HEADER SECTION */}
        <section
            className="flex items-center px-[3.8vw] py-[7.5vw] max-[840px]:items-start max-[840px]:bg-linear-to-b max-[840px]:from-[#0619103d] max-[840px]:to-transparent max-[840px]:px-7.5 max-[840px]:pt-12 max-[840px]:pb-4 max-[640px]:min-h-0 max-[640px]:px-6 max-[640px]:pt-8 max-[640px]:pb-3 max-[450px]:pt-6 max-[450px]:pb-2">
            <div className="mt-[4vh] w-full max-w-172.5 text-white max-[840px]:mt-0">
                <div>
                    {/* DESKTOP VERSION - Hidden on mobile (<= 640px) */}
                    <h1 className="m-0 hidden font-arial text-[clamp(3rem,4.45vw,5rem)] font-black leading-[.84] tracking-[-.04em] text-white [text-shadow:0_3px_0_rgba(0,0,0,.35),0_7px_12px_rgba(0,0,0,.68)] min-[641px]:block min-[641px]:whitespace-nowrap max-[840px]:text-[clamp(2.8rem,9vw,4rem)]">
                        <span className="block min-[641px]:whitespace-nowrap">Temple Management</span>
                        <span className="block mt-1">System</span>
                    </h1>

                    {/* MOBILE VERSION */}
                    <h1 className="m-0 flex flex-col items-center text-center gap-0.5 font-arial font-black leading-[1.05] text-white [text-shadow:0_3px_0_rgba(0,0,0,.35),0_7px_12px_rgba(0,0,0,.68)] max-[640px]:text-[clamp(2rem,8vw,2.6rem)] max-[450px]:text-[2.1rem] min-[641px]:hidden">
                        <span>Temple</span>
                        <span>Management</span>
                        <span>System</span>
                    </h1>
                </div>

                {/* SUBTITLE - Hidden on <= 640px */}
                <p className="ml-0.75 mt-8 whitespace-nowrap font-arial text-[clamp(.8rem,1.18vw,1.2rem)] font-bold leading-[1.65] text-white [text-shadow:0_2px_5px_rgba(0,0,0,.8)] max-[1090px]:text-[.74rem] max-[840px]:mt-6 max-[840px]:max-w-120 max-[840px]:whitespace-normal max-[840px]:text-[.83rem] max-[640px]:hidden">
                    Connecting Temples <b className="px-[.15em] text-[.94em]">||</b> Supporting Communities <b
                    className="px-[.15em] text-[.94em]">||</b> Preserving Tradition
                </p>

                <ul className="m-0 mt-[clamp(9rem,24vh,17rem)] flex list-none gap-[clamp(1.8rem,4vw,5rem)] p-0 max-[1090px]:gap-[1.4rem] max-[840px]:hidden"
                    aria-label="System capabilities">
                    {features.map((feature) => (
                        <li className="group relative w-27.5 flex-none text-center text-[clamp(.78rem,1.05vw,1.06rem)] font-bold leading-[1.4] [text-shadow:0_2px_5px_rgba(0,0,0,.55)] after:absolute after:-right-7 after:top-0 after:h-36 after:w-px after:bg-white/80 after:content-[''] last:after:hidden max-[1090px]:w-23"
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
            className="grid items-center justify-items-center py-[7vh] pr-[5.4vw] pl-[.4vw] max-[1090px]:pr-[3vw] max-[840px]:block max-[840px]:px-5 max-[840px]:pt-2 max-[840px]:pb-8 max-[640px]:px-4 max-[450px]:px-3">
            {children}
        </section>
    </main>
)