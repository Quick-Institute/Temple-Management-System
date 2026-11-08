import {type RefObject, useEffect, useRef, useState} from 'react';

// A compact thumb tracks the native navigation scroll position without
// moving the links, branding, or footer into a new scrolling container.
interface AdminNavigationScrollbarProps {
    navigationRef: RefObject<HTMLElement | null>;
}

export default function AdminNavigationScrollbar({navigationRef}: AdminNavigationScrollbarProps) {
    const [metrics, setMetrics] = useState({top: 0, height: 0, max: 0, scroll: 0});
    const drag = useRef(null);

    useEffect(() => {
        const nav = navigationRef.current;
        if (!nav) return;
        const update = () => setMetrics({
            top: nav.offsetTop,
            height: nav.clientHeight,
            max: Math.max(0, nav.scrollHeight - nav.clientHeight),
            scroll: nav.scrollTop,
        });
        const observer = new ResizeObserver(update);
        observer.observe(nav);
        for (const child of nav.children) observer.observe(child);
        nav.addEventListener('scroll', update, {passive: true});
        window.addEventListener('resize', update);
        update();
        return () => {
            observer.disconnect();
            nav.removeEventListener('scroll', update);
            window.removeEventListener('resize', update);
        };
    }, [navigationRef]);

    if (metrics.max <= 0) return null;
    const height = Math.min(48, metrics.height / 3);
    const travel = metrics.height - height;
    const top = metrics.top + (metrics.scroll / metrics.max) * travel;

    const handleKeyDown = (event) => {
        const nav = navigationRef.current;
        const positions = {
            ArrowDown: nav.scrollTop + 40,
            ArrowUp: nav.scrollTop - 40,
            PageDown: nav.scrollTop + nav.clientHeight,
            PageUp: nav.scrollTop - nav.clientHeight,
            Home: 0,
            End: metrics.max,
        };
        if (event.key in positions) {
            event.preventDefault();
            nav.scrollTop = positions[event.key];
        }
    };

    return (
        <div
            role="scrollbar"
            aria-label="Scroll sidebar navigation"
            aria-controls="temple-admin-navigation"
            aria-orientation="vertical"
            aria-valuemin={0}
            aria-valuemax={Math.round(metrics.max)}
            aria-valuenow={Math.round(metrics.scroll)}
            tabIndex={0}
            className="absolute right-0 z-20 w-2 touch-none cursor-grab rounded-full focus-visible:outline-1 focus-visible:outline-[#50bde4]"
            style={{top, height}}
            onKeyDown={handleKeyDown}
            onPointerDown={(event) => {
                drag.current = {y: event.clientY, scroll: navigationRef.current.scrollTop};
                event.currentTarget.setPointerCapture(event.pointerId);
            }}
            onPointerMove={(event) => {
                if (!drag.current || travel <= 0) return;
                navigationRef.current.scrollTop = drag.current.scroll
                    + ((event.clientY - drag.current.y) / travel) * metrics.max;
            }}
            onPointerUp={(event) => {
                drag.current = null;
                event.currentTarget.releasePointerCapture(event.pointerId);
            }}
            onLostPointerCapture={() => {
                drag.current = null;
            }}
        >
            <span className="absolute inset-y-0 right-px w-1 rounded-full bg-white/25 hover:bg-white/40"/>
        </div>
    );
}