import '../../components/dashboard/dashboard-fonts.css';
import {useCallback, useEffect, useState} from 'react';
import {Icon} from '@iconify/react';
import {useLocation, useNavigate} from 'react-router-dom';
import PageBanner from '../../components/layout/PageBanner';
import SelectionCard from '../../components/dana-schedule/SelectionCard';
import DanaSlotRow from '../../components/dana-schedule/DanaSlotRow';
import InfoNote from '../../components/dana-schedule/InfoNote';
import BookingDialog from '../../components/dana-schedule/BookingDialog';
import {danaIcons} from '../../components/dana-schedule/icons';
import type {UserPageProps} from '../../types';
import {
    bookDanaSlot,
    DEFAULT_DATE,
    DEFAULT_TEMPLE_ID,
    formatDanaDate,
    getDanaAvailability,
    TEMPLES,
} from '../../components/dana-schedule/danaService';

const queryKey = ({templeId, date}) => `${templeId}|${date}`;

function DanaSchedulePage({user}: UserPageProps) {
    const navigate = useNavigate();
    const {state: returnState} = useLocation();
    // Draft values follow the controls; `query` only changes when Check Availability is pressed.
    // When returning from the booking form, restore the temple/date the user had selected.
    const [draft, setDraft] = useState({
        templeId: returnState?.templeId ?? DEFAULT_TEMPLE_ID,
        date: returnState?.date ?? DEFAULT_DATE,
    });
    const [query, setQuery] = useState(draft);
    const [result, setResult] = useState({key: null, slots: [], error: ''});
    const [bookingRequest, setBookingRequest] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [bookingError, setBookingError] = useState('');
    const [notice, setNotice] = useState(returnState?.notice ?? '');

    const currentKey = queryKey(query);
    const loading = result.key !== currentKey;

    useEffect(() => {
        let ignore = false;
        getDanaAvailability(query)
            .then((slots) => {
                if (!ignore) setResult({key: queryKey(query), slots, error: ''});
            })
            .catch((error) => {
                if (!ignore) setResult({key: queryKey(query), slots: [], error: error.message});
            });
        return () => {
            ignore = true;
        };
    }, [query]);

    const handleCheck = () => {
        setNotice('');
        setQuery({...draft});
    };

    const handleBook = (slot) => {
        // Open the Dana Booking request form with the chosen slot.
        navigate('/dana-schedule/booking', {
            state: {booking: {slot, temple: TEMPLES.find((t) => t.id === query.templeId), date: query.date}},
        });
    };

    const handleConfirm = useCallback(async () => {
        if (!bookingRequest) return;
        setSubmitting(true);
        setBookingError('');
        try {
            await bookDanaSlot({
                templeId: query.templeId, date: query.date, slotId: bookingRequest.slot.id, familyId: user?.id,
                familyName: user?.familyName ?? user?.name ?? 'Family', contactNumber: '', participants: 1,
            });
            setNotice(`${bookingRequest.slot.name} booked at ${bookingRequest.temple.name} for ${formatDanaDate(query.date)}. Your request is pending approval.`);
            setBookingRequest(null);
        } catch (error) {
            setBookingError(error.message);
        } finally {
            // Always re-read availability so the cards reflect the true count (also if the slot just filled up).
            try {
                const slots = await getDanaAvailability(query);
                setResult({key: queryKey(query), slots, error: ''});
            } catch { /* keep the previous data */
            }
            setSubmitting(false);
        }
    }, [bookingRequest, query, user]);

    // -m-5 cancels MainLayout's <main> p-5 so the banner runs edge to edge; the content wrapper re-insets the rest.
    return (
        <div
            className="family-dana-schedule [&>section>img]:[mask-image:linear-gradient(to_right,transparent_0%,rgba(0,0,0,0.55)_22%,#000_48%)] -mx-3 -mt-3 flex min-w-0 flex-col font-lora text-[#284553] sm:-mx-4 sm:-mt-4 lg:-m-5">
            <PageBanner
                title="Dana Schedule"
                description="View available Dana (almsgiving) slots and make a booking."
                image="/dana-booking-banner.png"
            />

            <div className="relative z-10 -mt-6 flex min-w-0 flex-col gap-4 px-5 pb-5 sm:-mt-8">
                <SelectionCard
                    temples={TEMPLES}
                    templeId={draft.templeId}
                    date={draft.date}
                    onTempleChange={(templeId) => setDraft((d) => ({...d, templeId}))}
                    onDateChange={(date) => setDraft((d) => ({...d, date}))}
                    onCheck={handleCheck}
                    checking={loading}
                />

                <section aria-labelledby="dana-slots-heading"
                         className="min-w-0 w-full rounded-[14px] border border-[#dbe5e8] bg-white px-4 pb-0.5 pt-3.5 shadow-[0_2px_10px_rgba(35, 60, 73,0.06)] sm:px-5">
                    <h2 id="dana-slots-heading"
                        className="flex items-center gap-2.5 border-b border-[#dfe9ec] pb-2.5 text-[17px] font-bold leading-6 text-[#143d52] sm:text-[19px]">
                        <Icon icon={danaIcons.calendar} aria-hidden="true" className="size-5 shrink-0"/>
                        Available Dana Slots - {formatDanaDate(query.date)}
                    </h2>

                    <div aria-live="polite" className="divide-y divide-[#dfe9ec]">
                        {loading && <p className="py-8 text-center text-[15px] text-[#567c8f]">Loading Dana slots…</p>}
                        {!loading && result.error &&
                            <p role="alert" className="py-8 text-center text-[15px] text-[#B3281C]">{result.error}</p>}
                        {!loading && !result.error && result.slots.map((slot) => <DanaSlotRow key={slot.id} slot={slot}
                                                                                              onBook={handleBook}/>)}
                    </div>

                    {notice && <p role="status"
                                  className="mb-3 rounded-lg bg-[#e8f1f5] px-3 py-2.5 text-[14px] text-[#234e64]">{notice}</p>}
                </section>

                <InfoNote>Note: Capacity is the maximum number of family bookings for each Dana slot.</InfoNote>
            </div>

            <BookingDialog
                request={bookingRequest}
                submitting={submitting}
                error={bookingError}
                onConfirm={handleConfirm}
                onCancel={() => setBookingRequest(null)}
            />
        </div>
    );
}

export default DanaSchedulePage;