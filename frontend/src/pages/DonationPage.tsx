import {type FormEvent, useState} from 'react';
import {useTranslation} from 'react-i18next';

const quickAmounts = [100, 500, 1000, 5000];

export default function DonationPage() {
    const {t, i18n} = useTranslation();

    const [amount, setAmount] = useState('500');
    const [name, setName] = useState('');
    const [purpose, setPurpose] = useState('temple');
    const [message, setMessage] = useState('');

    const language = i18n.resolvedLanguage || i18n.language;

    const changeLang = (lang: 'en' | 'si') => {
        void i18n.changeLanguage(lang);
        localStorage.setItem('temple_lang', lang);
    };

    const handleDonate = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const donationAmount = Number(amount);

        if (!Number.isFinite(donationAmount) || donationAmount <= 0) {
            setMessage(t('invalidAmount'));
            return;
        }

        if (!name.trim()) {
            setMessage(t('enterName'));
            return;
        }

        // Payment gateway integration will be implemented later.
        // No payment has been processed at this stage.
        setMessage(t('paymentNotIntegrated'));
    };

    return (
        <div className="min-h-screen bg-canvas flex items-center justify-center p-4">

            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">

                {/* Language Selector */}
                <div className="flex justify-end px-5 pt-5">

                    <div className="flex items-center gap-2">

            <span className="text-sm font-medium text-ink-soft">
              {t('language')}:
            </span>

                        <div className="flex gap-1 bg-cream p-1 rounded-full">

                            <button
                                type="button"
                                onClick={() => changeLang('en')}
                                aria-pressed={language === 'en'}
                                className={`px-3 py-1 rounded-full text-sm transition-all ${
                                    language === 'en'
                                        ? 'bg-sky-600 text-white shadow'
                                        : 'text-ink-soft hover:bg-white'
                                }`}
                            >
                                English
                            </button>

                            <button
                                type="button"
                                onClick={() => changeLang('si')}
                                aria-pressed={language === 'si'}
                                className={`px-3 py-1 rounded-full text-sm transition-all ${
                                    language === 'si'
                                        ? 'bg-sky-600 text-white shadow'
                                        : 'text-ink-soft hover:bg-white'
                                }`}
                            >
                                සිංහල
                            </button>

                        </div>

                    </div>

                </div>

                {/* Header */}
                <div className="bg-sage-900 p-6 text-white text-center">

                    <h1 className="text-2xl font-black">
                        {t('donationTitle')}
                    </h1>

                    <p className="text-sm opacity-80 mt-1">
                        {t('donationDescription')}
                    </p>

                </div>

                {/* Donation Form */}
                <form
                    onSubmit={handleDonate}
                    className="p-6 space-y-5"
                >

                    {/* Donor Name */}
                    <div>

                        <label className="block text-sm font-bold text-ink-soft mb-1.5">
                            {t('donorName')}
                        </label>

                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t('namePlaceholder')}
                            className="w-full border border-line rounded-xl px-4 py-3 focus:ring-2 focus:ring-sage-900 outline-none"
                        />

                    </div>

                    {/* Donation Purpose */}
                    <div>

                        <label className="block text-sm font-bold text-ink-soft mb-1.5">
                            {t('donationPurpose')}
                        </label>

                        <select
                            value={purpose}
                            onChange={(e) => setPurpose(e.target.value)}
                            className="w-full border border-line rounded-xl px-4 py-3 focus:ring-2 focus:ring-sage-500 outline-none"
                        >

                            <option value="temple">
                                {t('templeMaintenance')}
                            </option>

                            <option value="event">
                                {t('religiousEvents')}
                            </option>

                            <option value="community">
                                {t('communitySupport')}
                            </option>

                        </select>

                    </div>

                    {/* Donation Amount */}
                    <div>

                        <label className="block text-sm font-bold text-ink-soft mb-1.5">
                            {t('donationAmount')}
                        </label>

                        {/* Quick Amount Buttons */}
                        <div className="grid grid-cols-4 gap-2 mb-3">

                            {quickAmounts.map((q) => (

                                <button
                                    key={q}
                                    type="button"
                                    onClick={() => {
                                        setAmount(q.toString());
                                        setMessage('');
                                    }}
                                    className={`py-2.5 rounded-xl border-2 font-bold transition ${
                                        amount === q.toString()
                                            ? 'bg-sage-900 text-white border-sage-900'
                                            : 'border-line text-ink-soft hover:border-sage-900 hover:text-sage-900'
                                    }`}
                                >
                                    {q}
                                </button>

                            ))}

                        </div>

                        {/* Custom Amount */}
                        <input
                            type="number"
                            required
                            min="1"
                            step="1"
                            value={amount}
                            onChange={(e) => {
                                setAmount(e.target.value);
                                setMessage('');
                            }}
                            placeholder="500"
                            className="w-full border border-line rounded-xl px-4 py-3 focus:ring-2 focus:ring-sage-500 outline-none"
                        />

                    </div>

                    {/* Payment Integration Message */}
                    {message && (
                        <div
                            role="status"
                            className="bg-sky-50 border border-sky-200 text-sky-900 rounded-xl p-3 text-sm"
                        >
                            {message}
                        </div>
                    )}

                    {/* Donate Button */}
                    <button
                        type="submit"
                        className="w-full bg-sage-900 text-white py-3.5 rounded-xl font-black text-lg hover:bg-sage-700 transition shadow-lg"
                    >
                        {t('donateNow')} - Rs. {amount || '0'}
                    </button>

                    {/* Security Information */}
                    <p className="text-xs text-center text-muted">
                        {t('securePayment')}
                    </p>

                </form>

            </div>

        </div>
    );
}