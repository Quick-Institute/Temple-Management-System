import {useTranslation} from 'react-i18next'
import {LegalShell} from '../../layouts/LegalShell'
import {termsDoc} from '../../data/legal/terms'
import type {Locale} from '../../i18n/locales'


export const TermsPage = () => {
    const {i18n} = useTranslation()
    const locale = (i18n.resolvedLanguage || i18n.language || 'en') as Locale

    return <LegalShell kind="terms" doc={termsDoc[locale] ?? termsDoc.en}/>
}