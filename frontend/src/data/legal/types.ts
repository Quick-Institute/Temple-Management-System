import type {Locale} from '../../i18n/locales'

export type LegalBlock =
    | { kind: 'p'; text: string }
    | { kind: 'list'; items: string[] }
    | { kind: 'table'; head: string[]; rows: string[][] }

export type LegalSection = {
    /** Anchor id, used by the "on this page" list. */
    id: string
    title: string
    blocks: LegalBlock[]
}

export type LegalDoc = {
    title: string
    subtitle: string
    /** Shown in the gold "last updated" chip; already formatted for its language. */
    updated: string
    sections: LegalSection[]
}

export type LegalDocSet = Record<Locale, LegalDoc>