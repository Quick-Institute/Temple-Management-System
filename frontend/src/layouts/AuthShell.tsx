import type { ReactNode } from 'react';
import LanguageToggle from '../components/LanguageToggle';

type ShellIconName = 'calendar' | 'community' | 'donation' | 'temple'
type ShellIconProps = { name: ShellIconName; size?: number }

const ShellIcon = ({name, size = 38}: ShellIconProps) => {
    const paths = {
        temple: <><path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.5V21h13V9.5"/><path d="M9 21v-6h6v6"/></>,
        community: <><circle cx="12" cy="8" r="3.5"/><path d="M4.5 21c.3-4.2 3-6.5 7.5-6.5s7.2 2.3 7.5 6.5"/><path d="M18.3 5.4a3.2 3.2 0 0 1 0 5.9M22 19.4c-.2-2.7-1.4-4.5-3.7-5.3"/></>,
        calendar: <><rect x="4" y="5.5" width="16" height="15" rx="1.8"/><path d="M8 3.5v4M16 3.5v4M4 10h16"/><path d="M8 14h.01M12 14h.01M16 14h.01"/></>,
        donation: <><path d="M19.5 12.5c.1 4.8-2.5 7.5-7.5 7.5H8.7L3.5 16.3l2.7-2.7 2.2 1.8h4.3c1.8 0 2.6-.8 2.4-1.8-.1-.8-.8-1.3-1.9-1.3H10l-1.6-1.7c1.7-2.2 4-3.1 6.9-2.6 1.9.3 3.3 1.8 4.2 4.5Z"/><path d="m15.5 4.2.8-1.3.8 1.3 1.5.4-1 .9.1 1.5-1.4-.5-1.4.5.1-1.5-1-.9 1.5-.4Z"/></>,
    }
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

const features: { icon: ShellIconName; title: string; description: string }[] = [
    {icon: 'temple', title: 'Manage\nTemples', description: 'Keep temple details organised'},
    {icon: 'community', title: 'Support\nCommunity', description: 'Bring communities together'},
    {icon: 'calendar', title: 'Organize\nEvents', description: 'Plan every temple event'},
    {icon: 'donation', title: 'Enable\nDonations', description: 'Make giving simple and secure'},
]

export const AuthShell = ({children}: { children: ReactNode }) => (
    <main
        className="relative isolate min-h-screen w-full overflow-x-hidden bg-[#18382d] bg-cover bg-center bg-no-repeat flex flex-col lg:grid lg:grid-cols-[1.1fr_480px]"
        style={{backgroundImage: "url('/images/temple-bg.jpg')"}}
    >
        {/* Language Toggle - Fixed Top Right */}
        <div className="absolute top-4 right-4 z-20 lg:top-6 lg:right-8">
            <LanguageToggle />
        </div>

        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#081f15]/60 to-transparent lg:from-[#081f15]/90 lg:via-[#081f15]/20 lg:to-transparent"/>

        {/* LEFT - TOP HEADER */}
        <section className="flex flex-col px-6 pt-12 pb-4 sm:px-8 lg:px-[3.8vw] lg:py-[3vw]">
            <div className="w-full max-w-2xl text-white">
                <h1 className="m-0 hidden font-black leading-[0.9] tracking-[-.04em] [text-shadow:0_3px_0_rgba(0,0,0,.35),0_7px_12px_rgba(0,0,0,.68)] lg:block text-[clamp(2.8rem,4.2vw,4.5rem)]">
                    <span className="block">Temple Management</span>
                    <span className="block mt-1">System</span>
                </h1>

                {/* MOBILE TITLE - Center */}
                <h1 className="m-0 flex flex-col items-center text-center gap-0.5 font-black leading-[1.05] [text-shadow:0_3px_0_rgba(0,0,0,.35),0_7px_12px_rgba(0,0,0,.68)] lg:hidden text-[clamp(2rem,8vw,2.6rem)]">
                    <span>Temple</span>
                    <span>Management</span>
                    <span>System</span>
                </h1>

                <p className="mt-6 hidden font-bold leading-[1.6] text-white [text-shadow:0_2px_5px_rgba(0,0,0,.8)] lg:block text-[clamp(.8rem,1.1vw,1.1rem)]">
                    Connecting Temples <b className="px-1">||</b> Supporting Communities <b className="px-1">||</b> Preserving Tradition
                </p>

                <ul className="mt-[clamp(6rem,18vh,14rem)] hidden list-none gap-10 p-0 lg:flex" aria-label="System capabilities">
                    {features.map((feature) => (
                        <li className="group relative w-[110px] flex-none text-center text-[0.95rem] font-bold leading-[1.4] [text-shadow:0_2px_5px_rgba(0,0,0,.55)] after:absolute after:-right-5 after:top-0 after:h-28 after:w-px after:bg-white/80 after:content-[''] last:after:hidden" key={feature.icon}>
                            <span className="pointer-events-none absolute -top-12 left-1/2 w-40 -translate-x-1/2 rounded-md bg-[#123c2e]/95 px-2 py-1.5 text-[.62rem] font-normal leading-snug text-white opacity-0 shadow-lg transition-all duration-200 group-hover:-translate-y-1 group-hover:opacity-100">{feature.description}</span>
                            <span className="mx-auto mb-4 grid h-[70px] w-[70px] place-items-center rounded-full border-2 border-white text-white transition-all duration-300 group-hover:-translate-y-1.5 group-hover:scale-110 group-hover:border-[#f9d77b] group-hover:bg-white/20">
                                <ShellIcon name={feature.icon}/>
                            </span>
                            <span className="block group-hover:text-[#fff4c9]">{feature.title.split('\n').map((line) => <span className="block" key={line}>{line}</span>)}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </section>

        {/* RIGHT - FORM - Full width on mobile */}
        <section className="flex w-full flex-1 items-start justify-center px-4 pb-8 pt-2 sm:px-6 sm:py-10 lg:items-center lg:px-8">
            <div className="w-full max-w-[5000px]">
                {children}
            </div>
        </section>
    </main>
);