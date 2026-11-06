import { useTranslation } from "react-i18next";

export default function LanguageToggle() {
const { t, i18n } = useTranslation();

const language = i18n.resolvedLanguage || i18n.language;

const changeLang = (lang: 'en' | 'si') => {
    i18n.changeLanguage(lang);
    localStorage.setItem('temple_lang', lang);
};

return (
    <div className="flex items-center gap-3">
        <span className="text-sm font-medium">
            {t('language')}:
        </span>

        <div className="flex gap-2 bg-gray-100 p-1 rounded-full">

            <button
                onClick={() => changeLang('en')}
                className={`px-4 py-1 rounded-full text-sm transition-all ${
                    language === 'en'
                        ? 'bg-orange-500 text-white shadow'
                        : 'bg-transparent text-gray-600 hover:bg-white'
                }`}
            >
                English
            </button>

            <button
                onClick={() => changeLang('si')}
                className={`px-4 py-1 rounded-full text-sm transition-all ${
                    language === 'si'
                        ? 'bg-orange-500 text-white shadow'
                        : 'bg-transparent text-gray-600 hover:bg-white'
                }`}
            >
                සිංහල
            </button>

        </div>
    </div>
);


}
