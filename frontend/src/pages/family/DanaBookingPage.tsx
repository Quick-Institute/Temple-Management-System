import type {FormEvent, ReactNode} from 'react';
import {useEffect, useMemo, useState} from 'react';
import '../../components/dashboard/dashboard-fonts.css';
import {Link, Navigate, useLocation, useNavigate} from 'react-router-dom';
import {Icon} from '@iconify/react';
import {bookDanaSlot, formatDanaDate, getDanaAvailability} from '../../components/dana-schedule/danaService';
import type {UserPageProps} from '../../types';

const STORAGE_KEY = 'danaBookingSelection';
const PHONE_PATTERN = /^\+?[0-9][0-9\s-]{7,16}$/;
const LOTUS_SRC = '/SVG/lotus_main.svg';

const ICON = {
    calendar: 'material-symbols:calendar-month',
    clock: 'material-symbols:schedule-outline',
    users: 'material-symbols:groups',
    user: 'material-symbols:person',
    phone: 'material-symbols:call',
    edit: 'material-symbols:edit',
    info: 'material-symbols:info',
    check: 'material-symbols:check-circle',
    close: 'material-symbols:close',
    minus: 'material-symbols:remove',
    plus: 'material-symbols:add',
    chevron: 'material-symbols:chevron-right',
};

/* The selection arrives through router state; sessionStorage keeps it across a page refresh. */
function readSelection(state) {
    if (state?.booking) {
        try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state.booking));
        } catch { /* storage unavailable */
        }
        return state.booking;
    }
    try {
        return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? 'null');
    } catch {
        return null;
    }
}

/* Participants are people attending; the limit follows the selected slot's capacity (e.g. 15 for Midday). */
const getMaxParticipants = (slot) => Math.max(1, slot?.capacity ?? 1);

const inputBox = 'flex h-9 items-center gap-2.5 rounded-lg border bg-white px-3 text-[14px] font-semibold text-[#17323f] transition-shadow focus-within:ring-2 focus-within:ring-[#46a6c9]/50';
const stepBtn = 'flex w-10 items-center justify-center text-[#143d52] hover:bg-[#edf2f3] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#3997b9] disabled:cursor-not-allowed disabled:text-[#aec4cf]';

function Field({label, required = false, error, htmlFor, children}: {
    label: string;
    required?: boolean;
    error?: string;
    htmlFor: string;
    children: ReactNode
}) {
    return (
        <div>
            <label htmlFor={htmlFor} className="mb-1 block text-[14px] font-bold leading-5 text-[#143d52]">
                {label}{required && <span className="ml-0.5 text-status-rose" aria-hidden="true">*</span>}
            </label>
            {children}
            {error && <p role="alert" className="mt-0.5 text-[12px] leading-4 text-[#B3281C]">{error}</p>}
        </div>
    );
}

function DetailRow({icon, label, value}) {
    return (
        <div className="grid grid-cols-[20px_68px_1fr] items-center gap-x-2.5 text-[14px] leading-5 text-[#17323f]">
            <Icon icon={icon} aria-hidden="true" className="size-5 text-[#143d52]"/>
            <span className="font-bold">{label}</span>
            <span className="font-medium text-[#2d424c]">{value}</span>
        </div>
    );
}

interface BookingErrors {
    familyName?: string;
    contact?: string;
    participants?: string;
}

export default function DanaBookingPage({user}: UserPageProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const selection = useMemo(() => readSelection(location.state), [location.state]);

    const [available, setAvailable] = useState(selection?.slot?.available ?? 0);
    const [familyName] = useState(user?.familyName ?? user?.name ?? 'Perera Family');
    const [contact, setContact] = useState('');
    const [participants, setParticipants] = useState(1);
    const [notes, setNotes] = useState('');
    const [errors, setErrors] = useState<BookingErrors>({});
    const [submitError, setSubmitError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const slot = selection?.slot;
    const templeId = selection?.temple?.id;
    const date = selection?.date;
    const maxParticipants = getMaxParticipants(slot);

    /* Re-read availability so the count is current even if the page was opened a while ago. */
    useEffect(() => {
        if (!templeId || !date || !slot) return undefined;
        let ignore = false;
        getDanaAvailability({templeId, date})
            .then((slots) => {
                const fresh = slots.find((s) => s.id === slot.id);
                if (!ignore && fresh) setAvailable(fresh.available);
            })
            .catch(() => { /* keep the count passed from the schedule page */
            });
        return () => {
            ignore = true;
        };
    }, [templeId, date, slot]);

    if (!selection?.slot || !selection?.temple || !selection?.date) return <Navigate to="/dana-schedule" replace/>;

    const full = available <= 0;
    const clamp = (n: number) => Math.min(maxParticipants, Math.max(1, Number.isFinite(n) ? n : 1));

    const validate = () => {
        const next: BookingErrors = {};
        if (!familyName.trim()) next.familyName = 'Family name is required.';
        if (!contact.trim()) next.contact = 'Contact number is required.';
        else if (!PHONE_PATTERN.test(contact.trim())) next.contact = 'Enter a valid contact number.';
        if (!Number.isInteger(participants) || participants < 1) next.participants = 'At least 1 participant is required.';
        else if (participants > maxParticipants) next.participants = `Maximum ${maxParticipants} participants allowed.`;
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitError('');
        if (full) {
            setSubmitError('Sorry, this Dana slot has reached its maximum capacity.');
            return;
        }
        if (!validate()) return;
        setSubmitting(true);
        try {
            const booking = await bookDanaSlot({
                templeId, date, slotId: slot.id, familyId: user?.id,
                familyName: familyName.trim(), contactNumber: contact.trim(), participants, notes: notes.trim(),
            });
            try {
                sessionStorage.removeItem(STORAGE_KEY);
            } catch { /* ignore */
            }
            navigate('/dana-schedule/confirmation', {
                replace: true,
                state: {
                    confirmation: {
                        reference: booking.reference,
                        status: 'Pending Approval',
                        templeName: selection.temple.name,
                        date,
                        danaType: slot.name,
                        time: slot.time,
                        participants: booking.participants,
                    },
                },
            });
        } catch (error) {
            setSubmitError(error.message);
            setSubmitting(false);
        }
    };

    const goBack = () => navigate('/dana-schedule', {state: {templeId, date}});

    return (
        <div className="family-dana-booking font-lora text-[#284553]">
            {/* Heading */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px] font-bold text-[#17323f]">
                <Link to="/dana-schedule" className="hover:underline">Dana Schedule</Link>
                <Icon icon={ICON.chevron} aria-hidden="true" className="size-4"/>
                <span aria-current="page">Dana Booking</span>
            </nav>
            <h1 className="mt-1.5 text-[26px] font-bold leading-8 text-[#143d52] xl:text-[30px] xl:leading-9">Dana
                Booking - Request Form</h1>
            <p className="mt-1.5 text-[14px] font-medium leading-5 text-[#1E3A5F]">
                Please provide the required details to book the selected Dana slot.
            </p>

            <form onSubmit={handleSubmit} noValidate
                  className="mt-4 grid items-start gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-5">
                {/* Left column */}
                <div className="flex flex-col gap-3">
                    <section aria-labelledby="selected-dana-heading"
                             className="overflow-hidden rounded-2xl bg-white shadow-[0_2px_10px_rgba(35, 60, 73,0.10)]">
                        <header className="relative flex h-12 items-center gap-3 overflow-hidden bg-[#0f3c52] px-4">
                            <Icon icon={ICON.calendar} aria-hidden="true" className="size-6 shrink-0 text-[#4abbe4]"/>
                            <h2 id="selected-dana-heading" className="text-[18px] font-bold text-white">Selected Dana
                                Details</h2>
                            <img src={LOTUS_SRC} alt="" aria-hidden="true"
                                 className="pointer-events-none absolute right-3 top-1/2 h-9 w-auto -translate-y-1/2"/>
                        </header>

                        <div className="p-4">
                            <div className="flex flex-col gap-4 sm:flex-row">
                                <img
                                    src={slot.image}
                                    alt={slot.alt}
                                    className="aspect-3/2 w-full rounded-lg object-cover shadow-sm sm:aspect-auto sm:h-37.5 sm:w-35 sm:shrink-0"
                                />
                                <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                                    <p className="w-fit rounded-lg bg-[#c4eaf8] px-4 py-1.5 text-[20px] font-bold leading-7 text-[#143d52]">{slot.name}</p>
                                    <div className="flex flex-col gap-2.5">
                                        <DetailRow icon={ICON.calendar} label="Date" value={formatDanaDate(date)}/>
                                        <DetailRow icon={ICON.clock} label="Time" value={slot.time}/>
                                        <DetailRow icon={ICON.users} label="Capacity"
                                                   value={`${slot.capacity} Bookings`}/>
                                    </div>
                                </div>
                            </div>

                            <hr className="my-3 border-[#dfe9ec]"/>
                            <div className="flex justify-center">
                                <p
                                    role="status"
                                    className={`inline-flex h-10 items-center gap-2 rounded-full px-6 text-[16px] font-bold ${full ? 'bg-[#FDE7E4] text-[#B3281C]' : 'bg-[#cce8f6] text-[#234e64]'}`}
                                >
                                    <Icon icon={ICON.check} aria-hidden="true"
                                          className={`size-6 ${full ? 'text-[#B3281C]' : 'text-[#143d52]'}`}/>
                                    {full ? 'Fully Booked' : `Available Slots: ${available}`}
                                </p>
                            </div>
                        </div>
                    </section>

                    <div role="note"
                         className="flex items-center gap-3 rounded-xl border border-[#c2d8e3] bg-[#e6f1f7] px-4 py-2.5">
                        <Icon icon={ICON.info} aria-hidden="true" className="size-6 shrink-0 text-[#143d52]"/>
                        <p className="text-[14px] font-medium leading-5 text-[#17323f]">
                            Please make sure the details are correct before submitting your booking request.
                        </p>
                    </div>
                </div>

                {/* Right column */}
                <div className="flex flex-col gap-3">
                    <section aria-labelledby="booking-info-heading"
                             className="overflow-hidden rounded-2xl border border-[#6ec3e2] bg-[#f2fcff] shadow-[0_2px_10px_rgba(35, 60, 73,0.08)]">
                        <header
                            className="flex h-12 items-center gap-2.5 border-b border-[#aedeef] bg-linear-to-b from-[#d2f0fb] to-[#e8f7fd] px-4">
                            <Icon icon={ICON.user} aria-hidden="true" className="size-6 text-[#2f617a]"/>
                            <h2 id="booking-info-heading" className="text-[18px] font-bold text-[#143d52]">Booking
                                Information</h2>
                        </header>

                        <div className="flex flex-col gap-3 p-4">
                            <Field label="Family Name" required htmlFor="family-name" error={errors.familyName}>
                                <div className={`${inputBox} border-[#c3d3db] bg-[#f3f6f8]`}>
                                    <Icon icon={ICON.users} aria-hidden="true"
                                          className="size-5 shrink-0 text-[#4b6c7d]"/>
                                    <input id="family-name" value={familyName} readOnly aria-required="true"
                                           className="w-full min-w-0 bg-transparent outline-none"/>
                                </div>
                            </Field>

                            <Field label="Contact Number" required htmlFor="contact-number" error={errors.contact}>
                                <div
                                    className={`${inputBox} ${errors.contact ? 'border-[#B3281C]' : 'border-[#c3d3db]'}`}>
                                    <Icon icon={ICON.phone} aria-hidden="true"
                                          className="size-5 shrink-0 text-[#4b6c7d]"/>
                                    <input
                                        id="contact-number" type="tel" inputMode="tel" autoComplete="tel"
                                        value={contact}
                                        onChange={(e) => setContact(e.target.value)} placeholder="07X XXX XXXX"
                                        aria-required="true"
                                        aria-invalid={Boolean(errors.contact)}
                                        className="w-full min-w-0 bg-transparent outline-none placeholder:font-normal placeholder:text-[#8A968F]"
                                    />
                                </div>
                            </Field>

                            <Field label="Number of Participants" required htmlFor="participants"
                                   error={errors.participants}>
                                <div className="flex flex-wrap items-center gap-2.5">
                                    <div
                                        className={`flex h-9 w-40 items-stretch overflow-hidden rounded-lg border bg-white ${errors.participants ? 'border-[#B3281C]' : 'border-[#c3d3db]'}`}>
                                        <button type="button" aria-label="Decrease participants"
                                                disabled={participants <= 1}
                                                onClick={() => setParticipants((n) => clamp(n - 1))}
                                                className={stepBtn}>
                                            <Icon icon={ICON.minus} className="size-5"/>
                                        </button>
                                        <input
                                            id="participants" type="text" inputMode="numeric"
                                            value={Number.isNaN(participants) ? '' : participants}
                                            onChange={(e) => {
                                                const digits = e.target.value.replace(/\D/g, '');
                                                setParticipants(digits === '' ? NaN : Math.min(maxParticipants, Number(digits)));
                                            }}
                                            onBlur={() => setParticipants((n) => clamp(n))}
                                            aria-label="Number of participants"
                                            className="w-full min-w-0 border-x border-[#c3d3db] bg-transparent text-center text-[15px] font-bold text-[#17323f] outline-none"
                                        />
                                        <button type="button" aria-label="Increase participants"
                                                disabled={participants >= maxParticipants}
                                                onClick={() => setParticipants((n) => clamp(n + 1))}
                                                className={stepBtn}>
                                            <Icon icon={ICON.plus} className="size-5"/>
                                        </button>
                                    </div>
                                    <span
                                        className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#c4eaf8] px-3 text-[13px] font-medium text-[#17323f]">
                    <Icon icon={ICON.users} aria-hidden="true" className="size-4.5"/>
                    (Max: {maxParticipants})
                  </span>
                                </div>
                            </Field>

                            <Field label="Additional Notes (Optional)" htmlFor="notes">
                                <div className="relative">
                                    <Icon icon={ICON.edit} aria-hidden="true"
                                          className="pointer-events-none absolute left-3 top-2.5 size-5 text-[#4b6c7d]"/>
                                    <textarea
                                        id="notes" rows={3} value={notes} maxLength={300}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="e.g., Special arrangements, if any..."
                                        className="block h-19 w-full resize-none rounded-lg border border-[#c3d3db] bg-white py-2 pl-10 pr-3 text-[14px] outline-none placeholder:font-normal placeholder:text-[#3e5966] focus:ring-2 focus:ring-[#46a6c9]/50"
                                    />
                                </div>
                            </Field>
                        </div>
                    </section>

                    {submitError && <p role="alert"
                                       className="rounded-lg bg-[#FDE7E4] px-3 py-2 text-[13px] text-[#B3281C]">{submitError}</p>}

                    <div className="flex flex-wrap justify-end gap-3">
                        <button type="button" onClick={goBack} disabled={submitting}
                                className="inline-flex h-11 min-w-32.5 items-center justify-center gap-2 rounded-xl border-2 border-[#143d52] bg-white px-5 text-[16px] font-bold text-[#143d52] transition-colors hover:bg-[#eef3f5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3997b9] disabled:opacity-60">
                            <Icon icon={ICON.close} aria-hidden="true" className="size-5"/> Cancel
                        </button>
                        <button type="submit" disabled={submitting || full}
                                className="inline-flex h-11 min-w-45 items-center justify-center gap-2 rounded-xl bg-[#0f384d] px-6 text-[16px] font-bold text-white shadow-[0_2px_6px_rgba(15, 56, 77,0.3)] transition-colors hover:bg-[#0a2a3a] active:bg-[#07202c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3997b9] disabled:cursor-not-allowed disabled:shadow-none">
                            <Icon icon={ICON.check} aria-hidden="true" className="size-5"/>
                            {submitting ? 'Submitting…' : 'Submit Booking'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}