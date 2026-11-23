import type {FormEvent} from 'react'
import {useState} from 'react'
import {useTranslation} from 'react-i18next'
import {SelectField} from '../SelectField'
import {
    assigneesFor,
    type BookingStatus,
    createBooking,
    type DanaKind,
    dayLabel,
    familyChoices,
    findSlot,
    updateBooking,
    updateBookingStatus,
} from '../../data/danaAdminStore'

/*
 * The families assigned to one Dana offering.
 *
 * The admin sees three things per family and nothing more: the family name, the village and a masked
 * contact number (077****567). No address, no identity number, no full phone number leaves the store.
 *
 * Assigning follows the registration rule: the picker only offers the families registered under the
 * temple in the top bar, and it is searchable. For a special Dana the admin can also place a
 * *temporary* family from outside the temple - that family is kept on the booking alone and never
 * written into the temple's family list.
 */

const STATUS_STYLE: Record<BookingStatus, string> = {
    Approved: 'bg-[#e8f2ec] text-[#245640] border-[#b9d2c3]',
    Pending: 'bg-[#fff6e0] text-[#8a5c0f] border-[#ecd39c]',
    Rejected: 'bg-[#fdeeee] text-[#a3231c] border-[#f1c2c2]',
    Cancelled: 'bg-[#f3f3f0] text-[#5b5b52] border-line',
}

const INPUT = 'h-11 w-full rounded-lg border border-line bg-white px-3 text-[0.98rem] text-ink outline-none focus:border-sage-600 focus:ring-2 focus:ring-sage-200'
const BUTTON_BASE = 'inline-flex items-center justify-center gap-1.5 rounded-lg border px-3.5 py-2 text-[0.92rem] font-bold transition'
const BTN_PRIMARY = `${BUTTON_BASE} border-sage-800 bg-sage-800 text-white hover:bg-sage-700`
const BTN_GHOST = `${BUTTON_BASE} border-line bg-white text-ink-soft hover:border-sage-600 hover:text-sage-900`
const BTN_SMALL = 'inline-flex items-center justify-center rounded-md border px-2.5 py-1 text-[0.85rem] font-bold transition'

type Draft = {
    familyId: string
    participants: string
    /** A one-off family from outside the temple, for a special Dana. */
    temporary: boolean
    name: string
    village: string
    contact: string
}

const emptyDraft = (): Draft => ({
    familyId: '',
    participants: '2',
    temporary: false,
    name: '',
    village: '',
    contact: '',
})

export const AssignedFamiliesPanel = ({
                                          slot,
                                          locale,
                                          templeRef,
                                          onMessage,
                                          onClose,
                                      }: {
    slot: { date: string; kind: DanaKind }
    locale: 'en' | 'si'
    /** The temple whose families may be assigned (the one in the top bar). */
    templeRef: string
    onMessage: (text: string, isError: boolean) => void
    onClose: () => void
}) => {
    const {t} = useTranslation()
    const [assigning, setAssigning] = useState(false)
    const [editing, setEditing] = useState<{ id: string; familyId: string; participants: string } | null>(null)

    /* Reading the store here keeps the table live and the picker tied to the current temple. */
    const record = findSlot(slot.date, slot.kind)
    const assignees = assigneesFor(slot.date, slot.kind)
    const choices = familyChoices(templeRef)
    const dateText = dayLabel(slot.date, locale)

    const run = (action: () => string) => {
        try {
            onMessage(action(), false)
        } catch (problem) {
            onMessage(problem instanceof Error ? problem.message : String(problem), true)
        }
    }

    const onSaveEdit = (event: FormEvent) => {
        event.preventDefault()
        if (!editing) return
        run(() => {
            updateBooking(editing.id, {
                familyId: editing.familyId || undefined,
                participants: Number(editing.participants) || 1,
            })
            setEditing(null)
            return t('danaAdmin.assignmentUpdated')
        })
    }

    const onStatus = (bookingId: string, status: BookingStatus) => {
        run(() => {
            updateBookingStatus(bookingId, status)
            return t('danaAdmin.statusChanged', {status: t(`danaAdmin.status${status}`)})
        })
    }

    return (
        <div className="rounded-xl border border-line">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
                <div>
                    <p className="text-[1.1rem] font-bold text-sage-900">
                        {t('danaAdmin.assignedTitle', {kind: t(`danaAdmin.${slot.kind}`), date: dateText})}
                    </p>
                    <p className="text-[0.9rem] text-ink-soft">
                        {t('danaAdmin.assignedCount', {
                            booked: assignees.filter((person) => person.status !== 'Cancelled').length,
                            capacity: record?.capacity ?? 0,
                        })}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button type="button" className={BTN_PRIMARY}
                            onClick={() => setAssigning(!assigning)}>
                        {t('danaAdmin.assignNew')}
                    </button>
                    <button type="button" className={BTN_GHOST} onClick={onClose} aria-label={t('common.close')}>
                        ✕
                    </button>
                </div>
            </div>

            <p className="px-4 pt-3 text-[0.88rem] text-muted">{t('danaAdmin.limitedNote')}</p>

            {assigning && (
                <AssignFamilyForm
                    slot={slot}
                    templeRef={templeRef}
                    onDone={(message, isError) => {
                        onMessage(message, isError)
                        if (!isError) setAssigning(false)
                    }}
                    onCancel={() => setAssigning(false)}
                />
            )}

            {assignees.length === 0 ? (
                <p className="px-4 py-5 text-[1rem] text-ink-soft">{t('danaAdmin.noAssignees')}</p>
            ) : (
                <div className="mt-3 overflow-x-auto">
                    <table className="w-full min-w-176 border-collapse text-left text-[1rem]">
                        <thead>
                        <tr className="border-y border-line bg-cream/60 text-[0.82rem] tracking-wide text-muted uppercase">
                            <th className="px-4 py-2.5 font-bold">{t('danaAdmin.tableFamily')}</th>
                            <th className="px-3 py-2.5 font-bold">{t('danaAdmin.tableVillage')}</th>
                            <th className="px-3 py-2.5 font-bold">{t('danaAdmin.tableContact')}</th>
                            <th className="px-3 py-2.5 font-bold">{t('danaAdmin.tableStatus')}</th>
                            <th className="px-4 py-2.5 text-right font-bold">{t('danaAdmin.tableActions')}</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-line">
                        {assignees.map((person) => {
                            const isEditing = editing?.id === person.id
                            const busy = person.status === 'Cancelled'

                            return (
                                <tr key={person.id} className={busy ? 'bg-[#fafaf8] text-muted' : 'text-ink'}>
                                    <td className="px-4 py-3 font-semibold text-sage-900">
                                        <span className="flex flex-wrap items-center gap-2">
                                            <span title={person.familyName}>{person.familyName}</span>
                                            {person.temporary && (
                                                <span
                                                    className="rounded border border-[#ddd2bd] bg-[#fbf4e6] px-1.5 py-0.5 text-[0.72rem] font-bold tracking-wide text-[#8a5c0f] uppercase">
                                                    {t('danaAdmin.temporaryBadge')}
                                                </span>
                                            )}
                                        </span>
                                    </td>
                                    <td className="px-3 py-3">{person.village}</td>
                                    <td className="px-3 py-3 whitespace-nowrap tabular-nums">{person.contactMasked}</td>
                                    <td className="px-3 py-3">
                                        <span
                                            className={`inline-block rounded border px-2 py-0.5 text-[0.85rem] font-bold ${STATUS_STYLE[person.status]}`}>
                                            {t(`danaAdmin.status${person.status}`)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        {isEditing ? (
                                            <form className="flex flex-wrap items-center justify-end gap-1.5"
                                                  onSubmit={onSaveEdit}>
                                                {!person.temporary && (
                                                    <select aria-label={t('danaAdmin.chooseFamily')}
                                                            className="h-9 max-w-52 rounded-md border border-line bg-white px-2 text-[0.9rem]"
                                                            value={editing.familyId}
                                                            onChange={(event) => setEditing({
                                                                ...editing,
                                                                familyId: event.target.value
                                                            })}>
                                                        {choices.map((family) => (
                                                            <option key={family.id} value={family.id}>
                                                                {family.name} · {family.village}
                                                            </option>
                                                        ))}
                                                    </select>
                                                )}
                                                <input type="number" min={1} max={20}
                                                       aria-label={t('danaAdmin.participants')}
                                                       className="h-9 w-16 rounded-md border border-line bg-white px-2 text-[0.9rem]"
                                                       value={editing.participants}
                                                       onChange={(event) => setEditing({
                                                           ...editing,
                                                           participants: event.target.value
                                                       })}/>
                                                <button type="submit"
                                                        className={`${BTN_SMALL} border-sage-800 bg-sage-800 text-white`}>
                                                    {t('common.save')}
                                                </button>
                                                <button type="button"
                                                        className={`${BTN_SMALL} border-line bg-white text-ink-soft`}
                                                        onClick={() => setEditing(null)}>
                                                    {t('common.cancel')}
                                                </button>
                                            </form>
                                        ) : (
                                            <div className="flex flex-wrap items-center justify-end gap-1.5">
                                                {person.status !== 'Approved' && (
                                                    <button type="button"
                                                            className={`${BTN_SMALL} border-[#b9d2c3] bg-[#e8f2ec] text-[#245640] hover:brightness-95`}
                                                            onClick={() => onStatus(person.id, 'Approved')}>
                                                        {t('danaAdmin.approve')}
                                                    </button>
                                                )}
                                                {person.status !== 'Rejected' && (
                                                    <button type="button"
                                                            className={`${BTN_SMALL} border-line bg-white text-ink-soft hover:border-sage-600`}
                                                            onClick={() => onStatus(person.id, 'Rejected')}>
                                                        {t('danaAdmin.reject')}
                                                    </button>
                                                )}
                                                <button type="button"
                                                        className={`${BTN_SMALL} border-line bg-white text-ink-soft hover:border-sage-600`}
                                                        onClick={() => setEditing({
                                                            id: person.id,
                                                            familyId: person.familyId,
                                                            participants: String(person.participants),
                                                        })}>
                                                    {t('danaAdmin.edit')}
                                                </button>
                                                <button type="button"
                                                        className={`${BTN_SMALL} border-[#e2b3b3] bg-white text-[#a3231c] hover:bg-[#fdeeee]`}
                                                        onClick={() => onStatus(person.id, 'Cancelled')}>
                                                    {t('danaAdmin.cancelBooking')}
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

/**
 * The "assign a family" form.
 *
 * The family field is the same searchable dropdown the registration screens use (`SelectField`), and
 * it is fed only with the families registered under `templeRef`. A checkbox switches the form to a
 * temporary family - someone from outside the temple, for a special Dana - which is typed in here and
 * never added to the temple's list.
 */
export const AssignFamilyForm = ({
                                     slot,
                                     templeRef,
                                     onDone,
                                     onCancel,
                                 }: {
    slot: { date: string; kind: DanaKind }
    templeRef: string
    onDone: (message: string, isError: boolean) => void
    onCancel: () => void
}) => {
    const {t} = useTranslation()
    const [draft, setDraft] = useState<Draft>(emptyDraft)

    const choices = familyChoices(templeRef)
    const byId = new Map(choices.map((family) => [family.id, family]))
    const familyLabel = (familyId: string) => {
        const family = byId.get(familyId)
        return family ? `${family.name} · ${family.village} · ${family.contactMasked}` : familyId
    }

    const onSubmit = (event: FormEvent) => {
        event.preventDefault()
        try {
            createBooking({
                date: slot.date,
                kind: slot.kind,
                participants: Number(draft.participants) || 1,
                ...(draft.temporary
                    ? {temporary: {name: draft.name, village: draft.village, contact: draft.contact}}
                    : {familyId: draft.familyId}),
            })
            onDone(t('danaAdmin.assigneeAdded'), false)
        } catch (problem) {
            onDone(problem instanceof Error ? problem.message : String(problem), true)
        }
    }

    return (
        <form className="mt-3 border-t border-line bg-cream/50 px-4 py-4" onSubmit={onSubmit}>
            <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                    <SelectField
                        id="dana-assign-family"
                        label={t('danaAdmin.chooseFamily')}
                        placeholder={choices.length
                            ? t('danaAdmin.chooseFamilyPlaceholder')
                            : t('danaAdmin.noTempleFamilies')}
                        options={choices.map((family) => family.id)}
                        optionLabel={familyLabel}
                        value={draft.familyId}
                        onChange={(familyId) => setDraft({...draft, familyId})}
                        disabled={draft.temporary || choices.length === 0}
                        searchable
                        hint={t('danaAdmin.chooseFamilyHint')}
                        texts={{
                            search: t('danaAdmin.searchFamily'),
                            searchAria: t('danaAdmin.searchFamilyAria'),
                            noMatch: t('danaAdmin.noFamilyMatch'),
                        }}
                    />
                </div>

                <label className="text-[0.92rem] font-semibold text-ink-soft sm:max-w-40">
                    {t('danaAdmin.participants')}
                    <input className={`${INPUT} mt-1`} type="number" min={1} max={20}
                           value={draft.participants}
                           onChange={(event) => setDraft({...draft, participants: event.target.value})}/>
                </label>
            </div>

            {/*
             * The temporary switch is its own full-width row: a checkbox floating in a grid cell sat
             * away from the fields it controls, and clicking the words did not always reach it.
             */}
            <label
                className={`mt-3 flex min-h-11 w-full cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 text-[0.92rem] font-semibold transition sm:w-fit sm:min-w-96 ${
                    draft.temporary
                        ? 'border-sage-600 bg-[#eef6f0] text-[#245640]'
                        : 'border-line bg-white text-ink-soft hover:border-sage-600'
                }`}>
                <input type="checkbox" className="h-4 w-4 flex-none accent-[#2f6f52]" checked={draft.temporary}
                       onChange={(event) => setDraft({...draft, temporary: event.target.checked, familyId: ''})}/>
                <span>{t('danaAdmin.temporaryToggle')}</span>
            </label>

            {draft.temporary && (
                <div className="mt-3 rounded-lg border border-dashed border-line bg-white p-3">
                    <p className="text-[0.88rem] text-muted">{t('danaAdmin.temporaryHint')}</p>
                    <div className="mt-2 grid gap-3 sm:grid-cols-3">
                        <label className="text-[0.92rem] font-semibold text-ink-soft">
                            {t('danaAdmin.familyName')}
                            <input className={`${INPUT} mt-1`} value={draft.name}
                                   onChange={(event) => setDraft({...draft, name: event.target.value})}/>
                        </label>
                        <label className="text-[0.92rem] font-semibold text-ink-soft">
                            {t('danaAdmin.village')}
                            <input className={`${INPUT} mt-1`} value={draft.village}
                                   onChange={(event) => setDraft({...draft, village: event.target.value})}/>
                        </label>
                        <label className="text-[0.92rem] font-semibold text-ink-soft">
                            {t('danaAdmin.contact')}
                            <input className={`${INPUT} mt-1`} inputMode="tel" placeholder="0771234567"
                                   value={draft.contact}
                                   onChange={(event) => setDraft({...draft, contact: event.target.value})}/>
                        </label>
                    </div>
                </div>
            )}

            <div className="mt-3 flex gap-2">
                <button type="submit" className={BTN_PRIMARY}>{t('danaAdmin.assign')}</button>
                <button type="button" className={BTN_GHOST} onClick={onCancel}>{t('common.cancel')}</button>
            </div>
        </form>
    )
}