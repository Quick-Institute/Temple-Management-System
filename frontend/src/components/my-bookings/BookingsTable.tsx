import { Icon } from '@iconify/react';
import { canCancelBooking, formatDanaDate } from '../dana-schedule/danaService';
import { ICON, STATUS_STYLES } from './bookingStatus';

/*
 * Responsive presentation, driven by the width of the page's content area (the `@container` in MyBookingsPage),
 * so it also reacts correctly when the tablet sidebar rail is expanded:
 *   >= 56rem  full table (unchanged desktop styling)
 *   >= 40rem  compact table (tighter padding / type, details and actions wrap) - every column stays visible
 *   <  40rem  one card per booking with the same six pieces of information
 */

/* Header and body cells share the same padding so columns always line up. `@min-[56rem]:` restores the desktop values. */
const th = 'px-2 py-2.5 text-[11px] font-bold leading-5 text-[#173F31] whitespace-nowrap first:pl-4 @min-[56rem]:px-3 @min-[56rem]:text-[12.5px] @min-[56rem]:first:pl-5';
const td = 'px-2 py-2.5 align-middle text-[12px] leading-5 text-[#173F31] first:pl-4 @min-[56rem]:px-3 @min-[56rem]:text-[12.5px] @min-[56rem]:first:pl-5';
/* Per-column alignment shared by header and body cells so they always line up. */
const COL = { left: 'text-left', center: 'text-center' };
const actionBtn =
  'inline-flex h-8 shrink-0 items-center justify-center gap-1 rounded-lg px-2 text-[12.5px] font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B99A39]';
const viewTone = 'bg-[#F1F1EF] text-[#173F31] hover:bg-[#E6E5E0]';
const cancelTone = 'bg-[#FDE7E4] text-[#B3281C] hover:bg-[#FAD3CE]';

export function StatusBadge({ status, className = 'min-w-[88px] px-3' }) {
  const style = STATUS_STYLES[status];
  return (
    <span className={`inline-block whitespace-nowrap rounded-lg py-1 text-center text-[12px] font-bold leading-5 ${className} ${style?.badge ?? ''}`}>
      {status}
    </span>
  );
}

/* View / Cancel buttons shared by the table and the cards; `sizing` sets the button width, `layout` the arrangement.
   Font size comes from the wrapper (`layout`) because index.css sets `button { font: inherit }`. */
function BookingActions({ booking, onView, onCancel, sizing, layout }) {
  return (
    <div className={layout}>
      <button
        type="button"
        onClick={() => onView(booking)}
        aria-label={`View booking ${booking.reference}`}
        className={`${actionBtn} ${viewTone} ${sizing}`}
      >
        <Icon icon={ICON.view} aria-hidden="true" className="size-[15px]" />
        View
      </button>
      {canCancelBooking(booking) && (
        <button
          type="button"
          onClick={() => onCancel(booking)}
          aria-label={`Cancel booking ${booking.reference}`}
          className={`${actionBtn} ${cancelTone} ${sizing}`}
        >
          <Icon icon={ICON.cancel} aria-hidden="true" className="size-[15px]" />
          Cancel
        </button>
      )}
    </div>
  );
}

function Row({ booking, onView, onCancel }) {
  return (
    <tr className="border-t border-[#ECE9DF]">
      <td className={`${td} ${COL.left} whitespace-nowrap text-[12.5px] font-bold @min-[56rem]:text-[13px]`}>{booking.reference}</td>
      <td className={`${td} ${COL.left}`}>
        <p className="break-words text-[12.5px] font-bold leading-5 @min-[56rem]:whitespace-nowrap @min-[56rem]:text-[13px]">{booking.danaType}</p>
        <p className="break-words leading-5 text-[#2F4A40] @min-[56rem]:whitespace-nowrap">{booking.templeName}</p>
      </td>
      <td className={`${td} ${COL.left}`}>
        <p className="flex items-center gap-1.5 whitespace-nowrap leading-5 @min-[56rem]:gap-2">
          <Icon icon={ICON.calendar} aria-hidden="true" className="size-[14px] shrink-0 text-[#5D6B65] @min-[56rem]:size-[15px]" />
          {formatDanaDate(booking.date)}
        </p>
        <p className="flex items-center gap-1.5 whitespace-nowrap leading-5 @min-[56rem]:gap-2">
          <Icon icon={ICON.clock} aria-hidden="true" className="size-[14px] shrink-0 text-[#5D6B65] @min-[56rem]:size-[15px]" />
          {booking.time}
        </p>
      </td>
      <td className={`${td} ${COL.center}`}>
        <span className="inline-flex items-center justify-center gap-1.5 font-bold" aria-label={`${booking.participants} participants`}>
          <Icon icon={ICON.participants} aria-hidden="true" className="size-4 shrink-0 text-[#14523B]" />
          {booking.participants}
        </span>
      </td>
      <td className={`${td} ${COL.center}`}>
        <StatusBadge status={booking.status} className="min-w-[72px] px-1.5 @min-[56rem]:min-w-[88px] @min-[56rem]:px-3" />
      </td>
      <td className={`${td} ${COL.center}`}>
        {/* Compact: buttons stack so the column stays narrow. Full: side by side, as before. */}
        <BookingActions
          booking={booking}
          onView={onView}
          onCancel={onCancel}
          sizing="w-[72px] @min-[56rem]:w-[76px]"
          layout="flex w-full flex-col items-center justify-center gap-1.5 @min-[56rem]:flex-row @min-[56rem]:gap-2"
        />
      </td>
    </tr>
  );
}

/* Phone layout: the same data as a table row, regrouped into one labelled card. */
const cardLabel = 'text-[11.5px] font-bold leading-4 text-[#5D6B65]';

function BookingCard({ booking, onView, onCancel }) {
  return (
    <li className="overflow-hidden rounded-xl border border-[#ECE9DF] bg-white">
      <div className="flex items-start justify-between gap-3 bg-[#FBF3DF] px-3.5 py-2.5">
        <div className="min-w-0">
          <p className={cardLabel}>Booking Ref.</p>
          <p className="break-words text-[14px] font-bold leading-5 text-[#173F31]">{booking.reference}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className={cardLabel}>Status</p>
          <StatusBadge status={booking.status} className="mt-0.5 min-w-[84px] px-2.5" />
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-x-3 gap-y-3 px-3.5 py-3 text-[12.5px] leading-5 text-[#173F31]">
        <div className="col-span-2 min-w-0">
          <dt className={cardLabel}>Dana Details</dt>
          <dd>
            <p className="break-words text-[13px] font-bold">{booking.danaType}</p>
            <p className="break-words text-[#2F4A40]">{booking.templeName}</p>
          </dd>
        </div>
        <div className="min-w-0">
          <dt className={cardLabel}>Date &amp; Time</dt>
          <dd>
            <p className="flex items-center gap-1.5">
              <Icon icon={ICON.calendar} aria-hidden="true" className="size-[15px] shrink-0 text-[#5D6B65]" />
              <span className="min-w-0">{formatDanaDate(booking.date)}</span>
            </p>
            <p className="flex items-center gap-1.5">
              <Icon icon={ICON.clock} aria-hidden="true" className="size-[15px] shrink-0 text-[#5D6B65]" />
              <span className="min-w-0">{booking.time}</span>
            </p>
          </dd>
        </div>
        <div className="min-w-0">
          <dt className={cardLabel}>Participants</dt>
          <dd className="flex items-center gap-1.5 font-bold" aria-label={`${booking.participants} participants`}>
            <Icon icon={ICON.participants} aria-hidden="true" className="size-4 shrink-0 text-[#14523B]" />
            {booking.participants}
          </dd>
        </div>
      </dl>

      <BookingActions
        booking={booking}
        onView={onView}
        onCancel={onCancel}
        sizing="h-9 flex-1"
        layout="flex gap-2 border-t border-[#ECE9DF] px-3.5 py-2.5 text-[13px]"
      />
    </li>
  );
}

export default function BookingsTable({ bookings, loading, error, emptyLabel, onView, onCancel }) {
  const message = loading ? 'Loading your bookings…' : error || (bookings.length === 0 ? emptyLabel : '');
  const messageTone = error ? 'text-[#B3281C]' : 'text-[#6B7A72]';

  return (
    <section aria-label="My Dana bookings" className="min-w-0">
      {/* Tablet and desktop: table. The wrapper only scrolls if a cell is forced wider than the page (e.g. an unbroken
          very long name); at every supported width the columns fit, so it stays static. */}
      <div className="hidden overflow-x-auto rounded-[14px] border border-[#E8E5DB] bg-white shadow-[0_2px_10px_rgba(35,73,54,0.06)] @min-[40rem]:block">
        <table className="w-full table-fixed border-collapse">
          <colgroup>
            <col className="w-[20%] @min-[56rem]:w-[15%]" />
            <col className="w-[16.5%] @min-[56rem]:w-[17%]" />
            <col className="w-[23%] @min-[56rem]:w-[20%]" />
            <col className="w-[12.5%] @min-[56rem]:w-[12%]" />
            <col className="w-[14.5%] @min-[56rem]:w-[14%]" />
            <col className="w-[13.5%] @min-[56rem]:w-[22%]" />
          </colgroup>
          <thead>
            <tr className="bg-[#FBF3DF]">
              <th scope="col" className={`${th} ${COL.left}`}>Booking Ref.</th>
              <th scope="col" className={`${th} ${COL.left}`}>Dana Details</th>
              <th scope="col" className={`${th} ${COL.left}`}>Date &amp; Time</th>
              <th scope="col" className={`${th} ${COL.center}`}>Participants</th>
              <th scope="col" className={`${th} ${COL.center}`}>Status</th>
              <th scope="col" className={`${th} ${COL.center}`}>Actions</th>
            </tr>
          </thead>
          <tbody aria-live="polite">
            {message ? (
              <tr className="border-t border-[#ECE9DF]">
                <td colSpan={6} role={error ? 'alert' : undefined} className={`px-4 py-8 text-center text-[14px] ${messageTone}`}>
                  {message}
                </td>
              </tr>
            ) : (
              bookings.map((booking) => <Row key={booking.id} booking={booking} onView={onView} onCancel={onCancel} />)
            )}
          </tbody>
        </table>
      </div>

      {/* Phones: cards. `hidden` removes whichever layout is not showing from the accessibility tree too. */}
      <div className="@min-[40rem]:hidden">
        {message ? (
          <p
            role={error ? 'alert' : 'status'}
            className={`rounded-[14px] border border-[#E8E5DB] bg-white px-4 py-8 text-center text-[14px] shadow-[0_2px_10px_rgba(35,73,54,0.06)] ${messageTone}`}
          >
            {message}
          </p>
        ) : (
          <ul aria-label="My Dana bookings" className="grid grid-cols-1 gap-3 @min-[36rem]:grid-cols-2">
            {bookings.map((booking) => <BookingCard key={booking.id} booking={booking} onView={onView} onCancel={onCancel} />)}
          </ul>
        )}
      </div>
    </section>
  );
}
