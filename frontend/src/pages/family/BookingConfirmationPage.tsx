import '../../components/dashboard/dashboard-fonts.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { formatDanaDate } from '../../components/dana-schedule/danaService';

const STORAGE_KEY = 'danaBookingConfirmation';

const ICON = {
  success: 'material-symbols:check-circle',
  chevron: 'material-symbols:chevron-right',
  ticket: 'mdi:ticket-confirmation-outline',
  copy: 'material-symbols:content-copy-outline',
  copied: 'material-symbols:check',
  clock: 'material-symbols:schedule-outline',
  calendar: 'material-symbols:calendar-month',
  temple: 'material-symbols:temple-buddhist',
  dana: 'material-symbols:volunteer-activism',
  participants: 'material-symbols:groups',
  home: 'material-symbols:home',
};

/* The booking arrives through router state; sessionStorage keeps it across a page refresh. */
function readConfirmation(state) {
  if (state?.confirmation) {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state.confirmation)); } catch { /* storage unavailable */ }
    return state.confirmation;
  }
  try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? 'null'); } catch { return null; }
}

function DetailItem({ icon, label, children }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon icon={icon} aria-hidden="true" className="mt-0.5 size-[26px] shrink-0 text-[#5D6B65]" />
      <div className="min-w-0">
        <p className="text-[14px] font-bold leading-[18px] text-[#173F31]">{label}</p>
        <div className="text-[16px] font-semibold leading-[22px] text-[#173F31]">{children}</div>
      </div>
    </div>
  );
}

const actionBase =
  'inline-flex h-11 min-w-[190px] items-center justify-center gap-2 rounded-xl border-2 border-[#0F4D34] px-6 text-[15.5px] font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B99A39]';

export default function BookingConfirmationPage() {
  const location = useLocation();
  const booking = useMemo(() => readConfirmation(location.state), [location.state]);
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  if (!booking?.reference) return <Navigate to="/dana-schedule" replace />;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(booking.reference);
    } catch {
      /* Clipboard API can be unavailable (e.g. non-secure origin): fall back to a temporary textarea. */
      const field = document.createElement('textarea');
      field.value = booking.reference;
      field.setAttribute('readonly', '');
      field.style.position = 'fixed';
      field.style.opacity = '0';
      document.body.appendChild(field);
      field.select();
      try { document.execCommand('copy'); } catch { /* ignore */ }
      document.body.removeChild(field);
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="font-lora flex flex-col text-[#28533F] lg:min-h-[calc(100vh-104px)]">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[14px] font-bold text-[#173F31]">
        <Link to="/dana-schedule" className="hover:underline">Dana Schedule</Link>
        <Icon icon={ICON.chevron} aria-hidden="true" className="size-4" />
        <span aria-current="page">Booking Confirmation</span>
      </nav>

      <div className="mx-auto flex w-full max-w-[920px] flex-1 flex-col justify-center gap-3">
        {/* Success heading */}
        <header className="flex flex-col items-center text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-[#E4F3D8] shadow-[0_0_0_6px_rgba(228,243,216,0.55)]">
            <Icon icon={ICON.success} aria-hidden="true" className="size-12 text-[#2F9A1B]" />
          </span>
          <h1 className="mt-2 text-[28px] font-bold leading-9 text-[#0F5236] xl:text-[30px] xl:leading-9">
            Booking Request Submitted!
          </h1>
          <p className="mt-1 max-w-[820px] text-[16px] font-medium leading-6 text-[#1E3A5F]">
            Your Dana booking request has been successfully submitted and is pending temple approval.
          </p>
        </header>

        {/* Booking reference + status */}
        <section
          aria-label="Booking reference and status"
          className="mx-auto grid w-full max-w-[860px] rounded-2xl border border-[#E9DFC0] bg-[#FFFCF2] px-4 py-2.5 shadow-[0_2px_10px_rgba(35,73,54,0.08)] sm:grid-cols-[1.2fr_1px_1fr] sm:items-center sm:gap-5 sm:px-5"
        >
          <div className="flex items-center gap-3">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#FBEFCB]">
              <Icon icon={ICON.ticket} aria-hidden="true" className="size-7 text-[#B8860B]" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-bold leading-[18px] text-[#173F31]">Booking Reference</p>
              <p className="whitespace-nowrap text-[21px] font-bold leading-6 tracking-wide text-[#173F31]">{booking.reference}</p>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              aria-label={copied ? 'Booking reference copied' : 'Copy booking reference'}
              title={copied ? 'Copied!' : 'Copy booking reference'}
              className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#E8EEF6] text-[#1E3A5F] transition-colors hover:bg-[#D6E1F0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B99A39]"
            >
              <Icon icon={copied ? ICON.copied : ICON.copy} aria-hidden="true" className="size-5" />
            </button>
            <span role="status" aria-live="polite" className="sr-only">{copied ? 'Booking reference copied' : ''}</span>
          </div>

          <div aria-hidden="true" className="my-2.5 h-px bg-[#E3C770] sm:my-0 sm:h-12 sm:w-px" />

          <div className="flex items-center gap-3">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#FBEFCB]">
              <Icon icon={ICON.clock} aria-hidden="true" className="size-7 text-[#B8860B]" />
            </span>
            <div className="min-w-0">
              <p className="text-[14px] font-bold leading-[18px] text-[#173F31]">Status</p>
              <p className="mt-0.5 inline-block rounded-md bg-[#FBE9A8] px-3 py-0.5 text-[16px] font-bold leading-5 text-[#8A5A00]">
                {booking.status}
              </p>
            </div>
          </div>
        </section>

        {/* Booking details */}
        <section aria-labelledby="booking-details-heading" className="mx-auto w-full max-w-[860px] overflow-hidden rounded-2xl bg-white shadow-[0_2px_10px_rgba(35,73,54,0.10)]">
          <header className="flex h-11 items-center gap-2.5 bg-linear-to-r from-[#0F5236] to-[#14633F] px-5">
            <Icon icon={ICON.calendar} aria-hidden="true" className="size-6 shrink-0 text-white" />
            <h2 id="booking-details-heading" className="text-[18px] font-bold text-white">Booking Details</h2>
          </header>

          <div className="grid gap-3 px-5 py-3 sm:grid-cols-[1fr_1px_1fr] sm:gap-7 sm:px-8">
            <div className="flex flex-col justify-center gap-4">
              <DetailItem icon={ICON.temple} label="Temple">{booking.templeName}</DetailItem>
              <DetailItem icon={ICON.calendar} label="Date">{formatDanaDate(booking.date)}</DetailItem>
            </div>

            <div aria-hidden="true" className="hidden bg-[#E3C770]/70 sm:block" />

            <div className="flex flex-col gap-2.5">
              <DetailItem icon={ICON.dana} label="Dana Type">
                <span className="inline-block rounded-md bg-[#E2F6CC] px-2 py-px text-[#2C6423]">{booking.danaType}</span>
              </DetailItem>
              <DetailItem icon={ICON.clock} label="Time">{booking.time}</DetailItem>
              <DetailItem icon={ICON.participants} label="Participants">{booking.participants}</DetailItem>
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-0.5">
          <Link to="/my-bookings" className={`${actionBase} bg-white text-[#0F4D34] hover:bg-[#EEF5F0]`}>
            <Icon icon={ICON.calendar} aria-hidden="true" className="size-5" />
            View My Bookings
          </Link>
          <Link to="/dashboard" className={`${actionBase} bg-[#0F4D34] text-white shadow-[0_2px_6px_rgba(15,77,52,0.3)] hover:bg-[#0A3A27]`}>
            <Icon icon={ICON.home} aria-hidden="true" className="size-5" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
