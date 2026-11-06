import { Icon } from '@iconify/react';
import type { ComponentProps } from 'react';
import { danaIcons } from './icons';
import type { DanaSlot } from './danaService';

/* A fixed-width column: label (with optional icon) centred over its number, both on the column's centre line. */
function Stat({ label, value, icon }: { label: string; value: string | number | undefined; icon?: ComponentProps<typeof Icon>['icon'] }) {
  return (
    <div className="flex w-full flex-col items-center text-center">
      <p className="inline-flex items-center justify-center gap-1 whitespace-nowrap text-[13px] font-bold leading-5 text-[#173F31]">
        {icon && <Icon icon={icon} aria-hidden="true" className="size-3.5 shrink-0 text-[#7A8780]" />}
        {label}
      </p>
      <p className="mt-0.5 text-[18px] font-bold leading-6 text-[#173F31]">{value}</p>
    </div>
  );
}

/* One Dana slot. Columns line up across rows because both rows share the same grid template. */
export default function DanaSlotRow({ slot, onBook }: { slot: DanaSlot; onBook: (slot: DanaSlot) => void }) {
  const full = slot.available <= 0;
  return (
    <article
      aria-label={slot.name}
      className="grid w-full min-w-0 grid-cols-[76px_minmax(0,1fr)] items-center gap-x-3 gap-y-2.5 py-3 sm:grid-cols-[92px_minmax(0,1fr)] sm:gap-x-4 lg:grid-cols-[92px_minmax(150px,1.3fr)_84px_84px_148px_112px] lg:gap-x-5"
    >
      <img src={slot.image} alt={slot.alt} className="h-[54px] w-[76px] rounded-lg object-cover sm:h-[62px] sm:w-[92px]" />

      <div className="min-w-0 overflow-hidden">
        <h3 className="break-words text-[17px] font-bold leading-6 text-[#173F31]">{slot.name}</h3>
        <p className="mt-0.5 break-words text-[14px] leading-5 text-[#2F4A40]">{slot.time}</p>
      </div>

      <div className="col-span-2 grid grid-cols-2 gap-4 lg:contents">
        <Stat label="Capacity" value={slot.capacity} icon={danaIcons.users} />
        <Stat label="Booked" value={slot.booked} />
      </div>

      <div className="col-span-2 flex items-center gap-3 lg:contents">
        <span
          className={`flex h-9 flex-1 items-center justify-center rounded-lg px-2.5 text-center text-[13.5px] font-bold whitespace-nowrap lg:flex-none ${
            full ? 'bg-[#FDE7E4] text-[#B3281C]' : 'bg-[#E2F6CC] text-[#2C6423]'
          }`}
        >
          {full ? 'Fully Booked' : `${slot.available} ${slot.available === 1 ? 'Slot' : 'Slots'} Available`}
        </span>
        <button
          type="button"
          onClick={() => onBook(slot)}
          disabled={full}
          aria-label={`Book ${slot.name}`}
          className="h-9 shrink-0 rounded-lg bg-[#14523B] px-4 text-[14px] font-bold text-white transition-colors hover:bg-[#0E3F2C] active:bg-[#0A3022] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B99A39] disabled:cursor-not-allowed disabled:bg-[#B9C4BE] lg:w-full"
        >
          Book Now
        </button>
      </div>
    </article>
  );
}
