import {Icon} from '@iconify/react';
import type {ComponentProps} from 'react';
import {danaIcons} from './icons';
import type {DanaSlot} from './danaService';

/* A fixed-width column: label (with optional icon) centred over its number, both on the column's centre line. */
function Stat({label, value, icon}: {
    label: string;
    value: string | number | undefined;
    icon?: ComponentProps<typeof Icon>['icon']
}) {
    return (
        <div className="flex w-full flex-col items-center text-center">
            <p className="inline-flex items-center justify-center gap-1 whitespace-nowrap text-[13px] font-bold leading-5 text-[#17323f]">
                {icon && <Icon icon={icon} aria-hidden="true" className="size-3.5 shrink-0 text-[#7A8780]"/>}
                {label}
            </p>
            <p className="mt-0.5 text-[18px] font-bold leading-6 text-[#17323f]">{value}</p>
        </div>
    );
}

/* One Dana slot. Columns line up across rows because both rows share the same grid template. */
export default function DanaSlotRow({slot, onBook}: { slot: DanaSlot; onBook: (slot: DanaSlot) => void }) {
    const full = slot.available <= 0;
    return (
        <article
            aria-label={slot.name}
            className="grid w-full min-w-0 grid-cols-[76px_minmax(0,1fr)] items-center gap-x-3 gap-y-2.5 py-3 sm:grid-cols-[92px_minmax(0,1fr)] sm:gap-x-4 lg:grid-cols-[92px_minmax(150px,1.3fr)_84px_84px_148px_112px] lg:gap-x-5"
        >
            <img src={slot.image} alt={slot.alt}
                 className="h-13.5 w-19 rounded-lg object-cover sm:h-15.5 sm:w-23"/>

            <div className="min-w-0 overflow-hidden">
                <h3 className="wrap-break-word text-[17px] font-bold leading-6 text-[#17323f]">{slot.name}</h3>
                <p className="mt-0.5 wrap-break-word text-[14px] leading-5 text-[#2d424c]">{slot.time}</p>
            </div>

            <div className="col-span-2 grid grid-cols-2 gap-4 lg:contents">
                <Stat label="Capacity" value={slot.capacity} icon={danaIcons.users}/>
                <Stat label="Booked" value={slot.booked}/>
            </div>

            <div className="col-span-2 flex items-center gap-3 lg:contents">
        <span
            className={`flex h-9 flex-1 items-center justify-center rounded-lg px-2.5 text-center text-[13.5px] font-bold whitespace-nowrap lg:flex-none ${
                full ? 'bg-[#FDE7E4] text-[#B3281C]' : 'bg-[#cce8f6] text-[#234e64]'
            }`}
        >
          {full ? 'Fully Booked' : `${slot.available} ${slot.available === 1 ? 'Slot' : 'Slots'} Available`}
        </span>
                <button
                    type="button"
                    onClick={() => onBook(slot)}
                    disabled={full}
                    aria-label={`Book ${slot.name}`}
                    className="h-9 shrink-0 rounded-lg bg-[#143d52] px-4 text-[14px] font-bold text-white transition-colors hover:bg-[#0e2f3f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3997b9] disabled:cursor-not-allowed lg:w-full"
                >
                    Book Now
                </button>
            </div>
        </article>
    );
}