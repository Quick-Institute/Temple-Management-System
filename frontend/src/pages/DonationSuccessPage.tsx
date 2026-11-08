import {Link, useSearchParams} from 'react-router-dom';
import {useTranslation} from 'react-i18next';

const DonationSuccessPage = () => {
    const [searchParams] = useSearchParams();
    const {t, i18n} = useTranslation();

    const language = i18n.resolvedLanguage || i18n.language;

    const changeLang = (lang: 'en' | 'si') => {
        void i18n.changeLanguage(lang);
        localStorage.setItem('temple_lang', lang);
    };

// Transaction details from URL
    const amount = searchParams.get('amount') || '0.00';
    const txnRef = searchParams.get('ref') || 'Not Available';
    const purpose = searchParams.get('purpose') || 'Not Available';
    const date = searchParams.get('date') || 'Not Available';

// Payment status must come from server verification.
// URL parameters alone cannot establish successful payment.
    const isVerified = false;

    return (
        <>
            <style>{`
* { box-sizing: border-box; }
    .dsp-body {
      font-family: Arial, Helvetica, sans-serif;
      background-color: #f7fcff;
      color: #0c4a6e;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .dsp-header {
      background-color: #0c4a6e;
      color: white;
      padding: 20px 8%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 15px;
    }

    .dsp-logo {
      font-size: 22px;
      font-weight: bold;
      white-space: nowrap;
    }

    .dsp-logo span { color: #38bdf8; }

    .dsp-header-right {
      display: flex;
      align-items: center;
      gap: 18px;
    }

    .dsp-header-label {
      font-size: 14px;
      color: #e5e7eb;
    }

    .dsp-language-buttons {
      display: flex;
      gap: 6px;
    }

    .dsp-language-button {
      border: none;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: 0.2s;
    }

    .dsp-language-active {
      background-color: white;
      color: #0c4a6e;
    }

    .dsp-language-inactive {
      background-color: #0369a1;
      color: white;
    }

    .dsp-language-inactive:hover {
      background-color: #3b6b5b;
    }

    .dsp-main {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 40px 20px;
    }

    .dsp-success-card {
      background-color: white;
      width: 100%;
      max-width: 540px;
      padding: 40px;
      border-radius: 24px;
      box-shadow: 0 10px 35px rgba(24, 56, 45, 0.08);
      text-align: center;
    }

    .dsp-success-icon {
      width: 85px;
      height: 85px;
      margin: 0 auto 24px;
      background-color: #e7f7ee;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      border: 2px solid #b8e8cd;
    }

    .dsp-success-icon span {
      color: #23834b;
      font-size: 46px;
      font-weight: bold;
    }

    .dsp-h1 {
      font-size: 28px;
      margin-bottom: 12px;
      color: #0c4a6e;
    }

    .dsp-success-message {
      color: #647067;
      font-size: 15px;
      line-height: 1.7;
      margin-bottom: 30px;
    }

    .dsp-amount-box {
      background-color: #f7fcff;
      border: 1px solid #e9e3d5;
      padding: 24px;
      border-radius: 16px;
      margin-bottom: 28px;
    }

    .dsp-amount-label {
      font-size: 14px;
      color: #68736b;
      margin-bottom: 10px;
    }

    .dsp-amount {
      font-size: 36px;
      font-weight: bold;
      color: #0c4a6e;
    }

    .dsp-thank-you {
      color: #0284c7;
      font-size: 14px;
      margin-top: 10px;
    }

    .dsp-details {
      text-align: left;
      border-top: 1px solid #e5e7eb;
      padding-top: 22px;
      margin-bottom: 28px;
    }

    .dsp-detail-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 15px;
      padding: 12px 0;
      font-size: 14px;
    }

    .dsp-detail-label { color: #6b7280; }

    .dsp-detail-value {
      color: #0c4a6e;
      font-weight: 600;
      text-align: right;
      overflow-wrap: anywhere;
    }

    .dsp-status {
      display: inline-block;
      padding: 6px 10px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
    }

    .dsp-status-verified {
      background-color: #e7f7ee;
      color: #237743;
    }

    .dsp-status-pending {
      background-color: #fff4d6;
      color: #946200;
    }

    .dsp-button-group {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .dsp-button {
      display: block;
      width: 100%;
      padding: 15px;
      border-radius: 12px;
      font-size: 15px;
      font-weight: bold;
      text-decoration: none;
      text-align: center;
      transition: 0.2s;
    }

    .dsp-primary-button {
      background-color: #0c4a6e;
      color: white;
    }

    .dsp-primary-button:hover {
      background-color: #0369a1;
    }

    .dsp-secondary-button {
      border: 1px solid #0c4a6e;
      color: #0c4a6e;
      background-color: white;
    }

    .dsp-secondary-button:hover {
      background-color: #f1f9fe;
    }

    .dsp-security-note {
      font-size: 12px;
      color: #8b938d;
      margin-top: 24px;
      line-height: 1.6;
    }

    .dsp-footer {
      background-color: #0c4a6e;
      color: #d1d5db;
      text-align: center;
      padding: 20px;
      font-size: 12px;
    }

    @media (max-width: 600px) {
      .dsp-header {
        padding: 18px 5%;
        flex-wrap: wrap;
      }

      .dsp-logo { font-size: 18px; }

      .dsp-header-right {
        gap: 10px;
        flex-wrap: wrap;
        justify-content: flex-end;
      }

      .dsp-header-label { font-size: 12px; }

      .dsp-language-button {
        padding: 7px 9px;
        font-size: 12px;
      }

      .dsp-main { padding: 25px 15px; }

      .dsp-success-card {
        padding: 28px 20px;
        border-radius: 18px;
      }

      .dsp-h1 { font-size: 24px; }

      .dsp-amount { font-size: 30px; }

      .dsp-detail-row { font-size: 13px; }
    }
  `}</style>

            <div className="dsp-body">

                {/* Header */}
                <header className="dsp-header">
                    <div className="dsp-logo">
                        Temple<span>TMS</span>
                    </div>

                    <div className="dsp-header-right">
                        <div className="dsp-header-label">
                            {t('receiptTitle')}
                        </div>

                        {/* Language Selector */}
                        <div className="dsp-language-buttons">
                            <button
                                type="button"
                                onClick={() => changeLang('en')}
                                aria-pressed={language === 'en'}
                                className={`dsp-language-button ${
                                    language === 'en'
                                        ? 'dsp-language-active'
                                        : 'dsp-language-inactive'
                                }`}
                            >
                                English
                            </button>

                            <button
                                type="button"
                                onClick={() => changeLang('si')}
                                aria-pressed={language === 'si'}
                                className={`dsp-language-button ${
                                    language === 'si'
                                        ? 'dsp-language-active'
                                        : 'dsp-language-inactive'
                                }`}
                            >
                                සිංහල
                            </button>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="dsp-main">
                    <section
                        className="dsp-success-card"
                        aria-labelledby="success-heading"
                    >
                        <div className="dsp-success-icon" aria-hidden="true">
                            <span>{isVerified ? '✓' : '!'}</span>
                        </div>

                        <h1 id="success-heading" className="dsp-h1">
                            {isVerified
                                ? t('donationSuccessful')
                                : t('donationPending')}
                        </h1>

                        <p className="dsp-success-message">
                            {isVerified
                                ? t('successMessage')
                                : t('pendingMessage')}
                        </p>

                        {/* Donation Amount */}
                        <div className="dsp-amount-box">
                            <p className="dsp-amount-label">
                                {t('donationAmountLabel')}
                            </p>

                            <p className="dsp-amount">
                                Rs. {amount}
                            </p>

                            <p className="dsp-thank-you">
                                {t('blessings')}
                            </p>
                        </div>

                        {/* Transaction Details */}
                        <div className="dsp-details">

                            <div className="dsp-detail-row">
            <span className="dsp-detail-label">
              {t('transactionReference')}
            </span>

                                <span className="dsp-detail-value">
              {txnRef}
            </span>
                            </div>

                            <div className="dsp-detail-row">
            <span className="dsp-detail-label">
              {t('donationPurposeLabel')}
            </span>

                                <span className="dsp-detail-value">
              {purpose}
            </span>
                            </div>

                            <div className="dsp-detail-row">
            <span className="dsp-detail-label">
              {t('paymentDate')}
            </span>

                                <span className="dsp-detail-value">
              {date}
            </span>
                            </div>

                            <div className="dsp-detail-row">
            <span className="dsp-detail-label">
              {t('paymentStatus')}
            </span>

                                <span className="dsp-detail-value">
              <span
                  className={`dsp-status ${
                      isVerified
                          ? 'dsp-status-verified'
                          : 'dsp-status-pending'
                  }`}
              >
                {isVerified ? t('verified') : t('pending')}
              </span>
            </span>
                            </div>

                        </div>

                        {/* Navigation Buttons */}
                        <div className="dsp-button-group">
                            <Link
                                to="/"
                                className="dsp-button dsp-primary-button"
                            >
                                {t('backToHome')}
                            </Link>

                            <Link
                                to="/donation"
                                className="dsp-button dsp-secondary-button"
                            >
                                {t('anotherDonation')}
                            </Link>
                        </div>

                        {/* Security Note */}
                        <p className="dsp-security-note">
                            {t('securityNote')}
                        </p>

                    </section>
                </main>

                {/* Footer */}
                <footer className="dsp-footer">
                    © 2026 Temple Management System. All rights reserved.
                </footer>

            </div>
        </>


    );
};

export default DonationSuccessPage;