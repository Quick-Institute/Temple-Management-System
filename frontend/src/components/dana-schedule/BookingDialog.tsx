import { useEffect, useRef } from 'react';
import { formatDanaDate } from './danaService';

/* Confirmation step before a booking is submitted. Uses the native <dialog> for focus trapping + Esc. */
export default function BookingDialog({ request, submitting, error, onConfirm, onCancel }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (request && !dialog.open) dialog.showModal();
    if (!request && dialog.open) dialog.close();
  }, [request]);

  return (
    <dialog
      ref={ref}
      onCancel={(event) => { event.preventDefault(); if (!submitting) onCancel(); }}
      onClick={(event) => { if (event.target === ref.current && !submitting) onCancel(); }}
      aria-labelledby="dana-dialog-title"
      className="m-auto w-[min(92vw,420px)] rounded-2xl border border-[#E8E5DB] bg-white p-0 text-[#173F31] shadow-2xl backdrop:bg-[#063F32]/40"
    >
      {request && (
        <div className="p-6">
          <h2 id="dana-dialog-title" className="font-georgia text-[22px] font-bold text-[#14523B]">Confirm Dana Booking</h2>
          <dl className="mt-4 grid grid-cols-[96px_1fr] gap-x-3 gap-y-2 text-[15px]">
            <dt className="text-[#6B7A72]">Temple</dt><dd className="font-bold">{request.temple.name}</dd>
            <dt className="text-[#6B7A72]">Date</dt><dd className="font-bold">{formatDanaDate(request.date)}</dd>
            <dt className="text-[#6B7A72]">Dana</dt><dd className="font-bold">{request.slot.name}</dd>
            <dt className="text-[#6B7A72]">Time</dt><dd className="font-bold">{request.slot.time}</dd>
            <dt className="text-[#6B7A72]">Availability</dt><dd className="font-bold">{request.slot.available} of {request.slot.capacity} slots left</dd>
          </dl>
          {error && <p role="alert" className="mt-4 rounded-lg bg-[#FDE7E4] px-3 py-2 text-[14px] text-[#B3281C]">{error}</p>}
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onCancel} disabled={submitting} className="h-10 rounded-lg border border-[#CBD5E1] px-5 text-[15px] font-bold hover:bg-[#F6F5F0] disabled:opacity-60">Cancel</button>
            <button type="button" onClick={onConfirm} disabled={submitting} className="h-10 rounded-lg bg-[#14523B] px-5 text-[15px] font-bold text-white hover:bg-[#0E3F2C] disabled:opacity-60">
              {submitting ? 'Booking…' : 'Confirm Booking'}
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}
