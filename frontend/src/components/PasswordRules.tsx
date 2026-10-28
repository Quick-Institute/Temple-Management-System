export type PasswordRule = {
    /** Short wording for the checklist. */
    label: string
    /** Longer wording used in the error message under the field. */
    hint: string
    met: (value: string) => boolean
}

export const PASSWORD_RULES: PasswordRule[] = [
    {
        label: '8 to 64 characters',
        hint: 'Use between 8 and 64 characters.',
        met: (value) => value.length >= 8 && value.length <= 64,
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

/** Every rule must hold before the form can be submitted. */
export const passwordMeetsPolicy = (value: string) =>
    PASSWORD_RULES.every((rule) => rule.met(value))

/** The first rule that is not satisfied yet, or null when the password is acceptable. */
export const firstUnmetRule = (value: string): PasswordRule | null =>
    PASSWORD_RULES.find((rule) => !rule.met(value)) ?? null

/**
 * Advisory strength: how many rules are satisfied, plus a bonus for a long password.
 * A longer password with every rule met is the only way to reach "Strong".
 */
export const passwordStrength = (value: string) => {
    if (!value) return {label: 'Empty', bars: 0, color: '#8b8b8b', tone: 'idle' as const}

    const passed = PASSWORD_RULES.filter((rule) => rule.met(value)).length
    const points = passed + (value.length >= 12 ? 1 : 0)

    if (points <= 2) return {label: 'Weak', bars: 1, color: '#ad1c03', tone: 'weak' as const}
    if (points <= 4) return {label: 'Medium', bars: 2, color: '#a26a0c', tone: 'medium' as const}
    return {label: 'Strong', bars: 3, color: '#1d5c46', tone: 'strong' as const}
}