import '../../components/dashboard/dashboard-fonts.css';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import PageBanner from '../../components/layout/PageBanner';
import StatusFilterCards from '../../components/my-bookings/StatusFilterCards';
import BookingsTable from '../../components/my-bookings/BookingsTable';
import {BookingDetailsDialog, CancelBookingDialog} from '../../components/my-bookings/BookingDialogs';
import {ALL_BOOKINGS, FILTER_ORDER, STATUS_STYLES} from '../../components/my-bookings/bookingStatus';
import {cancelDanaBooking, getMyBookings} from '../../components/dana-schedule/danaService';

function MyBookingsPage({user}) {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [filter, setFilter] = useState(ALL_BOOKINGS);
    const [viewing, setViewing] = useState(null);
    const [cancelling, setCancelling] = useState(null);
    const [cancelBusy, setCancelBusy] = useState(false);
    const [cancelError, setCancelError] = useState('');
    const [toast, setToast] = useState('');
    const toastTimer = useRef(null);

    useEffect(() => {
        let ignore = false;
        getMyBookings({familyId: user?.id})
            .then((list) => {
                if (!ignore) setBookings(list);
            })
            .catch((error) => {
                if (!ignore) setLoadError(error.message || 'Unable to load your bookings.');
            })
            .finally(() => {
                if (!ignore) setLoading(false);
            });
        return () => {
            ignore = true;
        };
    }, [user?.id]);

    useEffect(() => () => clearTimeout(toastTimer.current), []);

    // Counts are derived from the records, so the cards can never disagree with the table.
    const counts = useMemo(() => {
        const result = Object.fromEntries(FILTER_ORDER.map((key) => [key, 0]));
        result[ALL_BOOKINGS] = bookings.length;
        bookings.forEach((booking) => {
            if (booking.status in result) result[booking.status] += 1;
        });
        return result;
    }, [bookings]);

    const visible = useMemo(
        () => (filter === ALL_BOOKINGS ? bookings : bookings.filter((booking) => booking.status === filter)),
        [bookings, filter],
    );

    const closeCancel = useCallback(() => {
        setCancelling(null);
        setCancelError('');
    }, []);

    const confirmCancel = async () => {
        if (!cancelling) return;
        setCancelBusy(true);
        setCancelError('');
        try {
            const updated = await cancelDanaBooking(cancelling.id);
            setBookings((list) => list.map((booking) => (booking.id === updated.id ? updated : booking)));
            setToast(`Booking ${updated.reference} has been cancelled.`);
            clearTimeout(toastTimer.current);
            toastTimer.current = setTimeout(() => setToast(''), 4000);
            closeCancel();
        } catch (error) {
            setCancelError(error.message);
        } finally {
            setCancelBusy(false);
        }
    };

    const emptyLabel = filter === ALL_BOOKINGS
        ? 'You have not made any Dana bookings yet.'
        : `No ${STATUS_STYLES[filter].label.toLowerCase()} bookings.`;

    // The negative margin must mirror MainLayout's <main> padding at every breakpoint (p-3 / sm:p-4 / lg:p-5).
    // A fixed -m-5 over-shot the padding below 1024px and made the whole page wider than its scroll container.
    return (
        <div className="family-my-bookings [&>section>img]:[mask-image:linear-gradient(to_right,transparent_0%,rgba(0,0,0,0.55)_22%,#000_48%)] -m-3 flex min-w-0 flex-col font-lora text-[#284553] sm:-m-4 lg:-m-5">
            <PageBanner
                title="My Bookings"
                description="View and manage your Dana booking requests."
                image="/my-booking-banner.png"
            />

            {/* @container lets the filters and the table adapt to the width this area really gets (the tablet rail and
          the expanded tablet sidebar change it), rather than to the viewport width. */}
            <div className="@container relative z-10 -mt-6 flex min-w-0 flex-col gap-3 px-4 pb-4 sm:-mt-8 sm:px-5">
                <StatusFilterCards counts={counts} selected={filter} onSelect={setFilter}/>

                <BookingsTable
                    bookings={visible}
                    loading={loading}
                    error={loadError}
                    emptyLabel={emptyLabel}
                    onView={setViewing}
                    onCancel={(booking) => {
                        setCancelError('');
                        setCancelling(booking);
                    }}
                />
            </div>

            {toast && (
                <p role="status"
                   className="fixed bottom-5 right-5 z-40 max-w-[calc(100vw-2.5rem)] rounded-lg bg-[#143d52] px-4 py-2.5 text-[14px] font-bold text-white shadow-lg">
                    {toast}
                </p>
            )}

            <BookingDetailsDialog booking={viewing} onClose={() => setViewing(null)}/>
            <CancelBookingDialog booking={cancelling} submitting={cancelBusy} error={cancelError}
                                 onConfirm={confirmCancel} onClose={closeCancel}/>
        </div>
    );
}

export default MyBookingsPage;