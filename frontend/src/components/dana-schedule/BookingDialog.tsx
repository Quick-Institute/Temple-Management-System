import {useEffect, useRef} from 'react';
import {formatDanaDate} from './danaService';

/* Confirmation step before a booking is submitted. Uses the native <dialog> for focus trapping + Esc. */
export default function BookingDialog({request, submitting, error, onConfirm, onCancel}) {
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
            onCancel={(event) => {
                event.preventDefault();
                if (!submitting) onCancel();
            }}
            onClick={(event) => {
                if (event.target === ref.current && !submitting) onCancel();
            }}
            aria-labelledby="dana-dialog-title"
            className="m-auto w-[min(92vw,420px)] rounded-2xl border border-[#dbe5e8] bg-white p-0 text-[#17323f] shadow-2xl"
        >
            {request && (
                <div className="p-6">
                    <h2 id="dana-dialog-title" className="font-georgia text-[22px] font-bold text-[#143d52]">Confirm
                        Dana Booking</h2>
                    <dl className="mt-4 grid grid-cols-[96px_1fr] gap-x-3 gap-y-2 text-[15px]">
                        <dt className="text-[#567c8f]">Temple</dt>
                        <dd className="font-bold">{request.temple.name}</dd>
                        <dt className="text-[#567c8f]">Date</dt>
                        <dd className="font-bold">{formatDanaDate(request.date)}</dd>
                        <dt className="text-[#567c8f]">Dana</dt>
                        <dd className="font-bold">{request.slot.name}</dd>
                        <dt className="text-[#567c8f]">Time</dt>
                        <dd className="font-bold">{request.slot.time}</dd>
                        <dt className="text-[#567c8f]">Availability</dt>
                        <dd className="font-bold">{request.slot.available} of {request.slot.capacity} slots left</dd>
                    </dl>
                    {error && <p role="alert"
                                 className="mt-4 rounded-lg bg-[#FDE7E4] px-3 py-2 text-[14px] text-[#B3281C]">{error}</p>}
                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={onCancel} disabled={submitting}
                                className="h-10 rounded-lg border border-[#CBD5E1] px-5 text-[15px] font-bold hover:bg-[#f0f4f6] disabled:opacity-60">Cancel
                        </button>
                        <button type="button" onClick={onConfirm} disabled={submitting}
                                className="h-10 rounded-lg bg-[#143d52] px-5 text-[15px] font-bold text-white hover:bg-[#0e2f3f] disabled:opacity-60">
                            {submitting ? 'Booking…' : 'Confirm Booking'}
                        </button>
                    </div>
                </div>
            )}
        </dialog>
    );
}