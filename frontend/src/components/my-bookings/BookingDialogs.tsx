import { useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import { formatDanaDate } from '../dana-schedule/danaService';
import { StatusBadge } from './BookingsTable';
import { ICON } from './bookingStatus';

/* Native <dialog> (focus trap + Esc), same approach as the Dana Schedule BookingDialog. */
function useModal(open) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  return ref;
}

const shell = 'm-auto w-[min(92vw,440px)] rounded-2xl border border-[#E8E5DB] bg-white p-0 font-lora text-[#173F31] shadow-2xl backdrop:bg-[#063F32]/40';

export function BookingDetailsDialog({ booking, onClose }) {
  const ref = useModal(Boolean(booking));
  const rows = booking && [
    [ICON.temple, 'Temple', booking.templeName],
    [ICON.dana, 'Dana Type', booking.danaType],
    [ICON.calendar, 'Date', formatDanaDate(booking.date)],
    [ICON.clock, 'Time', booking.time],
    [ICON.participants, 'Participants', booking.participants],
    ...(booking.contactNumber ? [['material-symbols:call', 'Contact', booking.contactNumber]] : []),
  ];

  return (
    <dialog
      ref={ref}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === ref.current) onClose(); }}
      aria-labelledby="booking-details-title"
      className={shell}
    >
      {booking && (
        <div className="p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 id="booking-details-title" className="font-georgia text-[21px] font-bold text-[#14523B]">Booking Details</h2>
              <p className="mt-0.5 text-[15px] font-bold">{booking.reference}</p>
            </div>
            <StatusBadge status={booking.status} />
          </div>

          <dl className="mt-4 grid grid-cols-[22px_104px_1fr] items-center gap-x-2 gap-y-2.5 text-[15px]">
            {rows.map(([icon, label, value]) => (
              <div key={label} className="contents">
                <dt className="contents">
                  <Icon icon={icon} aria-hidden="true" className="size-5 text-[#14523B]" />
                  <span className="text-[#6B7A72]">{label}</span>
                </dt>
                <dd className="font-bold">{value}</dd>
              </div>
            ))}
          </dl>

          {booking.notes && (
            <p className="mt-4 rounded-lg bg-[#F6F5F0] px-3 py-2 text-[14px] text-[#2F4A40]">{booking.notes}</p>
          )}

          <div className="mt-6 flex justify-end">
            <button type="button" onClick={onClose} className="h-10 rounded-lg bg-[#14523B] px-5 text-[15px] font-bold text-white hover:bg-[#0E3F2C]">Close</button>
          </div>
        </div>
      )}
    </dialog>
  );
}

export function CancelBookingDialog({ booking, submitting, error, onConfirm, onClose }) {
  const ref = useModal(Boolean(booking));

  return (
    <dialog
      ref={ref}
      onCancel={(event) => { event.preventDefault(); if (!submitting) onClose(); }}
      onClick={(event) => { if (event.target === ref.current && !submitting) onClose(); }}
      aria-labelledby="cancel-booking-title"
      className={shell}
    >
      {booking && (
        <div className="p-6">
          <h2 id="cancel-booking-title" className="font-georgia text-[21px] font-bold text-[#14523B]">Cancel this booking?</h2>
          <p className="mt-3 text-[15px] leading-6 text-[#2F4A40]">
            <span className="font-bold">{booking.reference}</span> – {booking.danaType} at {booking.templeName} on {formatDanaDate(booking.date)}.
            The Dana slot will be released for other families.
          </p>
          {error && <p role="alert" className="mt-4 rounded-lg bg-[#FDE7E4] px-3 py-2 text-[14px] text-[#B3281C]">{error}</p>}
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} disabled={submitting} className="h-10 rounded-lg border border-[#CBD5E1] px-5 text-[15px] font-bold hover:bg-[#F6F5F0] disabled:opacity-60">Keep Booking</button>
            <button type="button" onClick={onConfirm} disabled={submitting} className="h-10 rounded-lg bg-[#B3281C] px-5 text-[15px] font-bold text-white hover:bg-[#962016] disabled:opacity-60">
              {submitting ? 'Cancelling…' : 'Cancel Booking'}
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}
