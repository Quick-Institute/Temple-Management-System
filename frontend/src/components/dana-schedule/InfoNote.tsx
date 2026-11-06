import { Icon } from '@iconify/react';
import { danaIcons } from './icons';

export default function InfoNote({ children }) {
  return (
    <div role="note" className="flex items-center gap-3 rounded-[14px] border border-[#E8E5DB] bg-white p-1 shadow-[0_2px_10px_rgba(35,73,54,0.04)]">
      <p className="flex w-full items-center gap-3 rounded-[10px] bg-[#EAF1FE] px-3.5 py-2.5 text-[13.5px] leading-5 text-[#1E3A34]">
        <Icon icon={danaIcons.info} aria-hidden="true" className="size-5 shrink-0 text-[#2F6FE0]" />
        <span>{children}</span>
      </p>
    </div>
  );
}
