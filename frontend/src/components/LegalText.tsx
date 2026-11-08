import type {ReactNode} from 'react'

/*
 * Renders the two inline marks the legal documents use:
 *   **bold**   -> <strong>
 *   `mono`     -> <code>
 * Everything else is plain text. Keeping the markup out of JSX is what lets the same sentence be
 * translated in the data files without touching a component.
 */
const TOKEN = /(\*\*[^*]+\*\*|`[^`]+`)/g

export const LegalText = ({text}: { text: string }) => {
    const parts = text.split(TOKEN).filter((part) => part !== '')

    return (
        <>
            {parts.map((part, index): ReactNode => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return (
                        <strong key={index} className="font-semibold text-sage-900">
                            {part.slice(2, -2)}
                        </strong>
                    )
                }
                if (part.startsWith('`') && part.endsWith('`')) {
                    return (
                        <code key={index}
                              className="rounded-md border border-line bg-[#f1f8fd] px-1.5 py-0.5 font-mono text-[0.88em] break-all text-sage-800">
                            {part.slice(1, -1)}
                        </code>
                    )
                }
                return <span key={index}>{part}</span>
            })}
        </>
    )
}