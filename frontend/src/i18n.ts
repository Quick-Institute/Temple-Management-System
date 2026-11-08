import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import {en, type Locale, si} from './i18n/locales';

/*
 * The donation screens arrived with their own keys, kept here so those pages keep working.
 * Everything newer lives in src/i18n/locales.ts, one key list for English and Sinhala.
 */
const DONATION = {
    en: {
        donationTitle: 'Temple Donation',
        donationDescription: 'Your donation preserves tradition',
        donorName: 'Full Name',
        namePlaceholder: 'Your Name',
        donationPurpose: 'Donation Purpose',
        templeMaintenance: 'Temple Maintenance',
        religiousEvents: 'Religious Events',
        communitySupport: 'Community Support',
        donationAmount: 'Amount (Rs.)',
        donateNow: 'Donate Now',
        securePayment: 'Secure Payment | SSL Secured',
        invalidAmount: 'Please enter a valid donation amount.',
        enterName: 'Please enter your name.',
        paymentNotIntegrated: 'Payment gateway integration is not available yet. No donation has been processed.',
        receiptTitle: 'Donation Receipt',
        donationSuccessful: 'Donation Successful!',
        donationPending: 'Payment Verification Pending',
        successMessage: 'Thank you for your generous contribution. Your donation has been verified successfully. Your support helps maintain the temple and its religious and community activities.',
        pendingMessage: 'Your payment has not yet been verified. Please wait for confirmation.',
        donationAmountLabel: 'Donation Amount',
        transactionReference: 'Transaction Reference',
        donationPurposeLabel: 'Donation Purpose',
        paymentDate: 'Payment Date',
        paymentStatus: 'Payment Status',
        verified: 'Verified',
        pending: 'Pending',
        blessings: 'May your generosity bring blessings.',
        backToHome: 'Back to Home',
        anotherDonation: 'Make Another Donation',
        securityNote: 'Please keep your transaction reference for future inquiries. This confirmation should be displayed only after the payment has been verified by the server.',
    },
    si: {
        donationTitle: 'විහාර පරිත්‍යාගය',
        donationDescription: 'ඔබේ පරිත්‍යාගයෙන් විහාරය රැකේ',
        donorName: 'සම්පූර්ණ නම',
        namePlaceholder: 'ඔබේ නම',
        donationPurpose: 'පරිත්‍යාගයේ අරමුණ',
        templeMaintenance: 'විහාර නඩත්තුව',
        religiousEvents: 'ආගමික උත්සව',
        communitySupport: 'ප්‍රජා සේවය',
        donationAmount: 'මුදල (රු.)',
        donateNow: 'දැන් පරිත්‍යාග කරන්න',
        securePayment: 'ආරක්ෂිත ගෙවීම් | SSL ආරක්ෂිතයි',
        invalidAmount: 'කරුණාකර නිවැරදි පරිත්‍යාග මුදලක් ඇතුළත් කරන්න.',
        enterName: 'කරුණාකර ඔබේ නම ඇතුළත් කරන්න.',
        paymentNotIntegrated: 'ගෙවීම් පද්ධතිය තවම සම්බන්ධ කර නැත. කිසිදු පරිත්‍යාගයක් සිදු කර නොමැත.',
        receiptTitle: 'පරිත්‍යාග රිසිට්පත',
        donationSuccessful: 'පරිත්‍යාගය සාර්ථකයි!',
        donationPending: 'ගෙවීම් තහවුරු කිරීම අපේක්ෂාවෙන්',
        successMessage: 'ඔබගේ වටිනා පරිත්‍යාගයට ස්තුතියි. ඔබගේ පරිත්‍යාගය සාර්ථකව තහවුරු කර ඇත. විහාරය සහ එහි ආගමික හා ප්‍රජා කටයුතු පවත්වාගෙන යාමට ඔබගේ සහයෝගය උපකාරී වේ.',
        pendingMessage: 'ඔබගේ ගෙවීම තවමත් තහවුරු කර නැත. කරුණාකර තහවුරු කිරීම ලැබෙන තෙක් රැඳී සිටින්න.',
        donationAmountLabel: 'පරිත්‍යාග මුදල',
        transactionReference: 'ගනුදෙනු යොමු අංකය',
        donationPurposeLabel: 'පරිත්‍යාගයේ අරමුණ',
        paymentDate: 'ගෙවීම් දිනය',
        paymentStatus: 'ගෙවීම් තත්ත්වය',
        verified: 'තහවුරු කරන ලදී',
        pending: 'තහවුරු වෙමින් පවතී',
        blessings: 'ඔබගේ පරිත්‍යාගශීලීත්වයට ආශීර්වාද ලැබේවා!',
        backToHome: 'මුල් පිටුවට',
        anotherDonation: 'තවත් පරිත්‍යාගයක් කරන්න',
        securityNote: 'අනාගත විමසීම් සඳහා ඔබගේ ගනුදෙනු යොමු අංකය සුරක්ෂිතව තබා ගන්න. මෙම තහවුරු කිරීම පෙන්විය යුත්තේ සේවාදායකය මඟින් ගෙවීම තහවුරු කළ පසුව පමණි.',
    },
};

/* The login screen used to read these names; they stay as aliases of the auth.* keys. */
const ALIASES = {
    en: {
        welcomeBack: en['auth.welcomeBack'], loginTitle: en['auth.loginTitle'],
        email: en['auth.email'], emailPlaceholder: en['auth.emailPlaceholder'],
        password: en['auth.password'], passwordPlaceholder: en['auth.passwordPlaceholder'],
        remember: en['auth.remember'], forgot: en['auth.forgot'],
        signIn: en['auth.signIn'], signingIn: en['auth.signingIn'],
        continueGoogle: en['auth.continueGoogle'], continueFacebook: en['auth.continueFacebook'],
        createAccount: en['auth.createAccount'],
    },
    si: {
        welcomeBack: si['auth.welcomeBack'], loginTitle: si['auth.loginTitle'],
        email: si['auth.email'], emailPlaceholder: si['auth.emailPlaceholder'],
        password: si['auth.password'], passwordPlaceholder: si['auth.passwordPlaceholder'],
        remember: si['auth.remember'], forgot: si['auth.forgot'],
        signIn: si['auth.signIn'], signingIn: si['auth.signingIn'],
        continueGoogle: si['auth.continueGoogle'], continueFacebook: si['auth.continueFacebook'],
        createAccount: si['auth.createAccount'],
    },
};

const resources = {
    en: {translation: {...DONATION.en, ...ALIASES.en, ...en}},
    si: {translation: {...DONATION.si, ...ALIASES.si, ...si}},
};

/** Where the chosen language is remembered, shared with the older screens. */
export const LANGUAGE_KEY = 'temple_lang';

export const readLanguage = (): Locale => {
    try {
        return localStorage.getItem(LANGUAGE_KEY) === 'si' ? 'si' : 'en';
    } catch {
        return 'en';
    }
};

/*
 * Sinhala needs its own face: Petrona only carries Latin letters, so the browser falls back to a
 * Sinhala font for those glyphs. Setting `lang` on <html> is what tells it to.
 */
const applyLanguage = (language: string) => {
    const next: Locale = language === 'si' ? 'si' : 'en';
    document.documentElement.lang = next;
    document.documentElement.dataset.lang = next;
    try {
        localStorage.setItem(LANGUAGE_KEY, next);
    } catch {
        /* private mode - the choice still applies for this session */
    }
};

i18n.use(initReactI18next).init({
    resources,
    lng: readLanguage(),
    fallbackLng: 'en',
    interpolation: {escapeValue: false},
});

applyLanguage(i18n.language);
i18n.on('languageChanged', applyLanguage);

export default i18n;