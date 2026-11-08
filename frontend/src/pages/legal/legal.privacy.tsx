import {useTranslation} from 'react-i18next'
import {LegalShell} from '../../layouts/LegalShell'
import {privacyDoc} from '../../data/legal/privacy'
import type {Locale} from '../../i18n/locales'

export const PrivacyPage = () => {
    const {i18n} = useTranslation()
    const locale = (i18n.resolvedLanguage || i18n.language || 'en') as Locale

    return <LegalShell kind="privacy" doc={privacyDoc[locale] ?? privacyDoc.en}/>
}