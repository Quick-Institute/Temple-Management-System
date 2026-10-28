import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

const quickAmounts = [100, 500, 1000, 5000];

export default function DonationPage() {
  const { t, language } = useLanguage();
  const [amount, setAmount] = useState('500');
  const [name, setName] = useState('');
  const [purpose, setPurpose] = useState('temple');

  const handleDonate = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = language === 'si' 
      ? `ස්තූතියි ${name}! Rs. ${amount} පරිත්‍යාගය සාර්ථකයි!`
      : `Thank you ${name}! Donation of Rs. ${amount} successful!`;
    alert(msg);
  };

  return (
    <div className="min-h-screen bg-[#f8f6f0] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-[#18382d] p-6 text-white text-center">
          <h1 className="text-2xl font-black">
            {language === 'si' ? 'විහාර පරිත්‍යාගය' : 'Temple Donation'}
          </h1>
          <p className="text-sm opacity-80 mt-1">
            {language === 'si' ? 'ඔබේ පරිත්‍යාගයෙන් විහාරය රැකේ' : 'Your donation preserves tradition'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleDonate} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              {language === 'si' ? 'නම' : 'Full Name'}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={language === 'si' ? 'ඔබේ නම' : 'Your Name'}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#18382d] focus:border-[#18382d] outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              {language === 'si' ? 'පරිත්‍යාග අරමුණ' : 'Donation Purpose'}
            </label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#18382d] outline-none"
            >
              <option value="temple">{language === 'si' ? 'විහාර නඩත්තුව' : 'Temple Maintenance'}</option>
              <option value="event">{language === 'si' ? 'පින්කම් උත්සව' : 'Religious Events'}</option>
              <option value="community">{language === 'si' ? 'ප්‍රජා සේවය' : 'Community Support'}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              {language === 'si' ? 'මුදල (රු.)' : 'Amount (Rs.)'}
            </label>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {quickAmounts.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setAmount(q.toString())}
                  className={`py-2.5 rounded-xl border-2 font-bold transition ${
                    amount === q.toString()
                      ? 'bg-[#18382d] text-white border-[#18382d]'
                      : 'border-gray-200 text-gray-600 hover:border-[#18382d] hover:text-[#18382d]'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
            <input
              type="number"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="500"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#18382d] outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#18382d] text-white py-3.5 rounded-xl font-black text-lg hover:bg-[#2a5a4a] transition shadow-lg"
          >
            {language === 'si' ? 'දැන් පරිත්‍යාග කරන්න' : 'Donate Now'} - Rs. {amount}
          </button>

          <p className="text-xs text-center text-gray-400">
            {language === 'si' ? 'ආරක්ෂිත ගෙවීම් | SSL Secured' : 'Secure Payment | SSL Secured'}
          </p>
        </form>
      </div>
    </div>
  );
}