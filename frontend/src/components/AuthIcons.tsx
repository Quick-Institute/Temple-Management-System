export const TempleMark = ({size = 18, className = ''}: { size?: number; className?: string }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 31 31"
        fill="none"
        stroke="currentColor"
        strokeWidth={1}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={`flex-none ${className}`}
    >
        <circle cx="27.7727" cy="4.6380" r="0.55" fill="currentColor" stroke="none"/>
        <circle cx="1.04545" cy="13.4311" r="0.55" fill="currentColor" stroke="none"/>
        <path
            d="M0.5 30.5C0.5 29.9513 0.729869 29.425 1.13904 29.037C1.54821 28.649 2.10316 28.431 2.68182 28.431H28.3182C28.8968 28.431 29.4518 28.649 29.861 29.037C30.2701 29.425 30.5 29.9513 30.5 30.5"/>
        <path d="M5.95459 28.2712V18.0034"/>
        <path d="M25.0454 18.0862V28.2712"/>
        <path d="M2.5 23.3015H28.8329"/>
        <path
            d="M25.1665 13.9482H6.16673C5.54655 15.7332 3.30364 16.5862 0.5 17.122C10.3915 19.0974 20.6085 19.0974 30.5 17.122C27.3129 16.4682 25.3144 15.4736 25.1665 13.9482Z"/>
        <path d="M6.5 13.8153V12.3965H25.0455V13.8298"/>
        <path d="M8.13623 12.1896V9.29309H22.8635V12.2191"/>
        <path
            d="M13.4509 4.72998C13.0391 5.24153 10.0555 8.65119 4.5 7.57481C4.5 7.57481 5.51945 9.78912 12.3202 9.19119C14.4356 9.00498 16.5647 9.00498 18.6802 9.19119C25.4809 9.78912 26.5004 7.57481 26.5004 7.57481C21.024 8.63619 18.0458 5.33774 17.5685 4.75377"/>
        <path d="M13.0454 3.08618H17.9545V4.66687H13.0454V3.08618Z"/>
        <path d="M19.5908 23.3015V28.431"/>
        <path d="M21.7727 23.3015V28.431"/>
        <path d="M5.95459 25.8665H25.0455"/>
        <path d="M14.1362 2.90879V0.5H16.8635V2.89431"/>
        <path d="M5.36488 1.32031L3.34888 3.23152"/>
        <path d="M3.34888 1.32031L5.36488 3.23152"/>
        <path d="M18.5 23.2587V18.6035"/>
        <path d="M22.8638 23.2587V18.6035"/>
        <path d="M8.13623 23.2587V18.6035"/>
        <path d="M12.5 23.2587V18.6035"/>
        <path d="M17.4092 9.29309V12.3965"/>
        <path d="M13.5908 9.29309V12.3965"/>
    </svg>
)

/**
 * The repository's own lotus artwork (`public/SVG/lotus_main.svg`), used on the sign-in, sign-up,
 * reset, forgot-password and legal screens. 1774 x 887, so the width alone decides the size and the
 * height follows the artwork's own ratio. A soft drop shadow keeps the pale-blue petals legible on
 * the near-white auth cards.
 */
export const LotusMark = ({width = 111, className = ''}: { width?: number; className?: string }) => (
    <img
        src="/SVG/lotus_main.svg"
        alt=""
        aria-hidden="true"
        width={width}
        style={{width, height: 'auto'}}
        className={`block flex-none object-contain drop-shadow-[0_2px_6px_rgba(2,132,199,0.25)] ${className}`}
    />
)


/* ------------------------------------------------------------------ */
/* Capability marks - the four items under the hero headline.          */
/*                                                                     */
/* Supplied artwork on a 100x100 grid. Strokes use currentColor so the  */
/* circles tint the marks on hover, the same way the other auth icons   */
/* behave. Each drawing fills a different share of its 100x100 box, so  */
/* they are sized per icon in AuthShell to land at the same optical     */
/* size inside the circle.                                             */
/* ------------------------------------------------------------------ */

export const DonationMark = ({size = 46, className = ''}: { size?: number; className?: string }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={`flex-none ${className}`}
    >
        {/* Coins floating above */}
        <circle cx="36" cy="27" r="6"/>
        <text x="36" y="30" fontSize="7" fill="currentColor" textAnchor="middle" fontWeight="bold"
              fontFamily="sans-serif" stroke="none">$
        </text>
        <circle cx="50" cy="18" r="6"/>
        <text x="50" y="21" fontSize="7" fill="currentColor" textAnchor="middle" fontWeight="bold"
              fontFamily="sans-serif" stroke="none">$
        </text>
        <circle cx="64" cy="27" r="6"/>
        <text x="64" y="30" fontSize="7" fill="currentColor" textAnchor="middle" fontWeight="bold"
              fontFamily="sans-serif" stroke="none">$
        </text>

        {/* Offering bowl */}
        <path d="M 24 44 L 76 44 L 70 59 C 64 68, 36 68, 30 59 Z" strokeWidth={2.5}/>
        <line x1="22" y1="47" x2="78" y2="47" strokeWidth={1.5} strokeDasharray="3 2"/>

        {/* Hand offering the bowl */}
        <path
            d="M 28 72 L 56 72 C 64 72, 70 69, 78 66 C 84 64, 86 70, 78 74 L 58 82 C 48 86, 36 84, 28 72 Z"
            strokeWidth={2}/>
        <path d="M 28 72 C 24 64, 30 59, 36 60" strokeWidth={2}/>
    </svg>
)

export const EventsMark = ({size = 56, className = ''}: { size?: number; className?: string }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={`flex-none ${className}`}
    >
        {/* Top scroll roll */}
        <path d="M 28 22 C 24 22, 24 29, 28 29 C 32 29, 32 22, 28 22 Z"/>
        <path d="M 28 22 L 58 22 C 62 22, 62 29, 58 29"/>

        {/* Scroll body and bottom roll */}
        <path d="M 24 25.5 L 24 67 C 24 73, 30 73, 30 67 C 30 61, 24 61, 24 67"/>
        <path d="M 30 67 L 54 67"/>
        <path d="M 58 29 L 58 56"/>

        {/* Scroll text lines */}
        <line x1="33" y1="36" x2="50" y2="36" strokeWidth={2}/>
        <line x1="33" y1="43" x2="48" y2="43" strokeWidth={2}/>
        <line x1="33" y1="50" x2="45" y2="50" strokeWidth={2}/>

        {/* Diya (oil lamp) */}
        <path d="M 54 67 C 54 75, 78 75, 78 67 Z"/>
        <path d="M 52 67 L 80 67" strokeWidth={2}/>
        <path d="M 66 61 C 60 55, 66 45, 66 45 C 66 45, 72 55, 66 61 Z" fill="currentColor"/>

        {/* Incense smoke */}
        <path d="M 62 41 C 60 37, 64 34, 62 30" strokeWidth={1.5}/>
        <path d="M 66 38 C 64 34, 68 31, 66 27" strokeWidth={1.5}/>
        <path d="M 70 41 C 68 37, 72 34, 70 30" strokeWidth={1.5}/>
    </svg>
)

export const CommunityMark = ({size = 48, className = ''}: { size?: number; className?: string }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={`flex-none ${className}`}
    >
        {/* Light rays above the wheel */}
        <line x1="50" y1="12" x2="50" y2="15"/>
        <line x1="40" y1="14" x2="42" y2="17"/>
        <line x1="60" y1="14" x2="58" y2="17"/>
        <line x1="31" y1="20" x2="34" y2="22"/>
        <line x1="69" y1="20" x2="66" y2="22"/>
        <line x1="25" y1="29" x2="28" y2="30"/>
        <line x1="75" y1="29" x2="72" y2="30"/>

        {/* Dharmachakra */}
        <circle cx="50" cy="33" r="13" strokeWidth={2}/>
        <circle cx="50" cy="33" r="11" strokeWidth={1.5}/>
        <circle cx="50" cy="33" r="3" fill="currentColor"/>

        {/* Eight spokes */}
        <line x1="50" y1="20" x2="50" y2="46" strokeWidth={1.5}/>
        <line x1="37" y1="33" x2="63" y2="33" strokeWidth={1.5}/>
        <line x1="41" y1="24" x2="59" y2="42" strokeWidth={1.5}/>
        <line x1="59" y1="24" x2="41" y2="42" strokeWidth={1.5}/>

        {/* Hands */}
        <path d="M 28 67 C 28 53, 36 49, 44 49 C 46 49, 48 53, 48 57 C 45 57, 42 54, 40 50" strokeWidth={2}/>
        <path d="M 28 67 C 32 78, 44 80, 50 80" strokeWidth={2}/>
        <path d="M 28 67 C 25 61, 30 54, 37 52" strokeWidth={1.5}/>
        <path d="M 72 67 C 72 53, 64 49, 56 49 C 54 49, 52 53, 52 57 C 55 57, 58 54, 60 50" strokeWidth={2}/>
        <path d="M 72 67 C 68 78, 56 80, 50 80" strokeWidth={2}/>
        <path d="M 72 67 C 75 61, 70 54, 63 52" strokeWidth={1.5}/>
    </svg>
)