export const MIN_PASSWORD_LENGTH = 8
export const MAX_PASSWORD_LENGTH = 64

/*
 * The rules are data, not markup, so they carry translation keys instead of finished sentences.
 * Every screen that shows them is bilingual, and a hard-coded label here used to leave the
 * checklist in English on the Sinhala register and reset-password cards.
 */
export type PasswordRule = {
    /** Short wording for the checklist. */
    labelKey: string
    /** Longer wording used in the error message under the field. */
    hintKey: string
    met: (value: string) => boolean
}

export const PASSWORD_RULES: PasswordRule[] = [
    {
        labelKey: 'auth.pw.len',
        hintKey: 'auth.pw.lenHint',
        met: (value) => value.length >= MIN_PASSWORD_LENGTH && value.length <= MAX_PASSWORD_LENGTH,
    },
    {
        labelKey: 'auth.pw.case',
        hintKey: 'auth.pw.caseHint',
        met: (value) => /[a-z]/.test(value) && /[A-Z]/.test(value),
    },
    {
        labelKey: 'auth.pw.number',
        hintKey: 'auth.pw.numberHint',
        met: (value) => /\d/.test(value),
    },
    {
        labelKey: 'auth.pw.symbol',
        hintKey: 'auth.pw.symbolHint',
        met: (value) => /[^A-Za-z0-9\s]/.test(value),
    },
    {
        labelKey: 'auth.pw.spaces',
        hintKey: 'auth.pw.spacesHint',
        met: (value) => value.length > 0 && !/\s/.test(value),
    },
]

/**
 * Puts the length limits into an already translated sentence. Single braces are used on purpose:
 * i18next interpolates `{{...}}`, so plain `{min}` / `{max}` travel untouched through `t()`.
 */
export const withLimits = (text: string) =>
    text
        .replaceAll('{min}', String(MIN_PASSWORD_LENGTH))
        .replaceAll('{max}', String(MAX_PASSWORD_LENGTH))

/** True when every rule is satisfied - shown as "Strong" and used to tint the panel. Never blocks. */
export const passwordMeetsPolicy = (value: string) =>
    PASSWORD_RULES.every((rule) => rule.met(value))

/**
 * The only hard check. Returns the translation key of the message to show under the field, or
 * null when the length is acceptable. Everything else in the list is advice.
 */
export const passwordLengthError = (value: string): string | null => {
    if (value.length < MIN_PASSWORD_LENGTH) return 'auth.pw.errTooShort'
    if (value.length > MAX_PASSWORD_LENGTH) return 'auth.pw.errTooLong'
    return null
}

/** The first rule that is not satisfied yet, or null when the password is acceptable. */
export const firstUnmetRule = (value: string): PasswordRule | null =>
    PASSWORD_RULES.find((rule) => !rule.met(value)) ?? null

/**
 * Advisory strength: how many rules are satisfied, plus a bonus for a long password.
 * A longer password with every rule met is the only way to reach "Strong".
 */
export const passwordStrength = (value: string) => {
    if (!value) return {labelKey: 'auth.pw.empty', bars: 0, color: '#8ba3b0', tone: 'idle' as const}

    const tooShort = value.length < MIN_PASSWORD_LENGTH
    if (tooShort) return {labelKey: 'auth.pw.tooShort', bars: 1, color: '#ad1c03', tone: 'weak' as const}

    const passed = PASSWORD_RULES.filter((rule) => rule.met(value)).length
    const points = passed + (value.length >= 12 ? 1 : 0)

    if (points <= 2) return {labelKey: 'auth.pw.weak', bars: 1, color: '#ad1c03', tone: 'weak' as const}
    if (points <= 4) return {labelKey: 'auth.pw.medium', bars: 2, color: '#a26a0c', tone: 'medium' as const}
    return {labelKey: 'auth.pw.strong', bars: 3, color: '#0284c7', tone: 'strong' as const}
}