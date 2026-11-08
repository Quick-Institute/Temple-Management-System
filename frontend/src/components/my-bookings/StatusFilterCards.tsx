import {Icon} from '@iconify/react';
import {FILTER_ORDER, STATUS_STYLES} from './bookingStatus';

/* Six compact status cards that double as filters. The active one gets a soft shadow with a subtle bottom accent and `aria-pressed`. */
export default function StatusFilterCards({counts, selected, onSelect}) {
    return (
        <div
            role="group"
            aria-label="Filter bookings by status"
            className="grid grid-cols-2 gap-2.5 rounded-[14px] border border-[#dbe5e8] bg-white p-2.5 shadow-[0_2px_10px_rgba(35, 60, 73,0.06)] @min-[30rem]:grid-cols-3 @min-[58rem]:grid-cols-6"
        >
            {FILTER_ORDER.map((key) => {
                const style = STATUS_STYLES[key];
                const active = selected === key;
                return (
                    <button
                        key={key}
                        type="button"
                        aria-pressed={active}
                        onClick={() => onSelect(key)}
                        className={`flex h-13.5 min-w-0 transform-gpu items-center justify-center gap-2 rounded-xl border px-2 text-left @max-[19rem]:gap-1.5 @max-[19rem]:px-1.5 outline-none transition-[transform,box-shadow,opacity] duration-200 ease-out motion-reduce:transition-none motion-reduce:hover:transform-none focus-visible:-translate-y-0.5 focus-visible:shadow-[0_4px_10px_rgba(35, 60, 73,0.14)] ${style.card} ${
                            active
                                ? 'opacity-100 shadow-[0_4px_12px_rgba(35, 60, 73,0.2),inset_0_-3px_0_rgba(0, 0, 0,0.12)]'
                                : 'opacity-90 hover:-translate-y-0.5 hover:shadow-[0_4px_10px_rgba(35, 60, 73,0.12)] active:translate-y-0 active:shadow-[0_1px_4px_rgba(35, 60, 73,0.1)]'
                        }`}
                    >
                        <Icon icon={style.icon} aria-hidden="true" className="size-6 shrink-0 @max-[19rem]:size-5"/>
                        <span
                            className="flex flex-col items-center text-[14px] font-bold leading-4.5 @max-[19rem]:text-[13px] @min-[62rem]:text-[15px]">
              <span className="whitespace-nowrap">{style.label}</span>
              <span>({counts[key] ?? 0})</span>
            </span>
                    </button>
                );
            })}
        </div>
    );
}