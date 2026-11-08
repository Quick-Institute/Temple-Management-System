import {useId, useRef} from 'react';
import {Icon} from '@iconify/react';
import {danaIcons} from './icons';
import {formatDanaDate} from './danaService';

const control =
    'relative flex h-11 w-full items-center rounded-lg border border-[#CBD5E1] bg-white text-[15px] text-[#1e313a] transition-colors focus-within:border-[#143d52] focus-within:ring-2 focus-within:ring-[#143d52]/20 hover:border-[#93b0be]';

function Field({icon, label, htmlFor, children}) {
    return (
        <div className="flex min-w-0 flex-1 items-end gap-3">
      <span aria-hidden="true"
            className="hidden h-11 w-14 shrink-0 items-center justify-center rounded-lg bg-[#edf2f3] text-[#5F6B66] sm:flex">
        <Icon icon={icon} className="size-6"/>
      </span>
            <div className="min-w-0 flex-1">
                <label htmlFor={htmlFor}
                       className="mb-1 block text-[15px] font-bold leading-5 text-[#17323f]">{label}</label>
                {children}
            </div>
        </div>
    );
}

export default function SelectionCard({temples, templeId, date, onTempleChange, onDateChange, onCheck, checking}) {
    const templeInputId = useId();
    const dateInputId = useId();
    const dateRef = useRef(null);

    const openPicker = () => {
        try {
            dateRef.current?.showPicker();
        } catch { /* picker unavailable; native input still works */
        }
    };

    return (
        <form
            aria-label="Find Dana slots"
            onSubmit={(event) => {
                event.preventDefault();
                onCheck();
            }}
            className="flex flex-col gap-4 rounded-[14px] border border-[#dbe5e8] bg-white px-4 py-4 shadow-[0_2px_10px_rgba(35, 60, 73,0.06)] sm:px-5 lg:flex-row lg:items-end lg:gap-6"
        >
            <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:gap-6">
                <Field icon={danaIcons.temple} label="Select Temple" htmlFor={templeInputId}>
                    <div className={control}>
                        <select
                            id={templeInputId}
                            value={templeId}
                            onChange={(event) => onTempleChange(event.target.value)}
                            className="h-full w-full cursor-pointer appearance-none truncate rounded-lg bg-transparent pl-3.5 pr-10 outline-none"
                        >
                            {temples.map((temple) => <option key={temple.id} value={temple.id}>{temple.name}</option>)}
                        </select>
                        <Icon icon={danaIcons.chevronDown} aria-hidden="true"
                              className="pointer-events-none absolute right-3 size-5 text-[#1e313a]"/>
                    </div>
                </Field>

                <Field icon={danaIcons.calendar} label="Select Date" htmlFor={dateInputId}>
                    <div className={control}>
                        <span className="pointer-events-none pl-3.5 pr-10"
                              aria-hidden="true">{formatDanaDate(date) || 'Choose a date'}</span>
                        <Icon icon={danaIcons.calendar} aria-hidden="true"
                              className="pointer-events-none absolute right-3 size-4.5 text-[#143d52]"/>
                        {/* Native date input sits invisibly on top so the OS picker, keyboard and a11y all work. */}
                        <input
                            ref={dateRef}
                            id={dateInputId}
                            type="date"
                            value={date}
                            required
                            onClick={openPicker}
                            onChange={(event) => onDateChange(event.target.value)}
                            className="absolute inset-0 h-full w-full cursor-pointer rounded-lg opacity-0"
                        />
                    </div>
                </Field>
            </div>

            <button
                type="submit"
                disabled={checking || !date}
                className="h-11 shrink-0 rounded-lg bg-[#143d52] px-6 text-[15px] font-bold text-white shadow-sm transition-colors hover:bg-[#0e2f3f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3997b9] disabled:cursor-not-allowed disabled:opacity-60 lg:min-w-50"
            >
                {checking ? 'Checking…' : 'Check Availability'}
            </button>
        </form>
    );
}