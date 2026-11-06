export const MIN_PASSWORD_LENGTH = 8
export const MAX_PASSWORD_LENGTH = 64

export type PasswordRule = {
    /** Short wording for the checklist. */
    label: string
    /** Longer wording used in the error message under the field. */
    hint: string
    met: (value: string) => boolean
}

export const PASSWORD_RULES: PasswordRule[] = [
    {
        label: `${MIN_PASSWORD_LENGTH} to ${MAX_PASSWORD_LENGTH} characters`,
        hint: `Use between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters.`,
        met: (value) => value.length >= MIN_PASSWORD_LENGTH && value.length <= MAX_PASSWORD_LENGTH,
    },
    {
        label: 'Upper and lower case',
        hint: 'Include both upper case and lower case letters.',
        met: (value) => /[a-z]/.test(value) && /[A-Z]/.test(value),
    },
    {
        label: 'A number',
        hint: 'Include at least one number.',
        met: (value) => /\d/.test(value),
    },
    {
        label: 'A symbol',
        hint: 'Include at least one symbol, such as ! ? @ # $ %.',
        met: (value) => /[^A-Za-z0-9\s]/.test(value),
    },
    {
        label: 'No spaces',
        hint: 'Do not use spaces.',
        met: (value) => value.length > 0 && !/\s/.test(value),
    },
]

/** True when every rule is satisfied - shown as "Strong" and used to tint the panel. Never blocks. */
export const passwordMeetsPolicy = (value: string) =>
    PASSWORD_RULES.every((rule) => rule.met(value))

/**
 * The only hard check. Returns the message to show under the field, or null when the length is
 * acceptable. Everything else in the list is advice.
 */
export const passwordLengthError = (value: string): string | null => {
    if (value.length < MIN_PASSWORD_LENGTH) return `Use at least ${MIN_PASSWORD_LENGTH} characters.`
    if (value.length > MAX_PASSWORD_LENGTH) return `Use no more than ${MAX_PASSWORD_LENGTH} characters.`
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
    if (!value) return {label: 'Empty', bars: 0, color: '#8b8b8b', tone: 'idle' as const}

    const tooShort = value.length < MIN_PASSWORD_LENGTH
    if (tooShort) return {label: 'Too short', bars: 1, color: '#ad1c03', tone: 'weak' as const}

    const passed = PASSWORD_RULES.filter((rule) => rule.met(value)).length
    const points = passed + (value.length >= 12 ? 1 : 0)

    if (points <= 2) return {label: 'Weak', bars: 1, color: '#ad1c03', tone: 'weak' as const}
    if (points <= 4) return {label: 'Medium', bars: 2, color: '#a26a0c', tone: 'medium' as const}
    return {label: 'Strong', bars: 3, color: '#1d5c46', tone: 'strong' as const}
}