import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
en: {
translation: {
// General
language: "Language",


  // Login Page
  loginTitle: "Login to your account",
  email: "Email Address",
  emailPlaceholder: "Enter your email address",
  password: "Password",
  passwordPlaceholder: "Enter your password",
  remember: "Remember me",
  forgot: "Forgot password?",
  signIn: "Sign In",
  signingIn: "Signing In...",
  continueGoogle: "Continue with Google",
  continueFacebook: "Continue with Facebook",
  createAccount: "Create New Account",
  welcomeBack: "Welcome Back",

  // Donation Page
  donationTitle: "Temple Donation",
  donationDescription: "Your donation preserves tradition",
  donorName: "Full Name",
  namePlaceholder: "Your Name",
  donationPurpose: "Donation Purpose",
  templeMaintenance: "Temple Maintenance",
  religiousEvents: "Religious Events",
  communitySupport: "Community Support",
  donationAmount: "Amount (Rs.)",
  donateNow: "Donate Now",
  securePayment: "Secure Payment | SSL Secured",
  invalidAmount: "Please enter a valid donation amount.",
  enterName: "Please enter your name.",
  paymentNotIntegrated: "Payment gateway integration is not available yet. No donation has been processed.",

  // Donation Success Page
  receiptTitle: "Donation Receipt",
  donationSuccessful: "Donation Successful!",
  donationPending: "Payment Verification Pending",
  successMessage: "Thank you for your generous contribution. Your donation has been verified successfully. Your support helps maintain the temple and its religious and community activities.",
  pendingMessage: "Your payment has not yet been verified. Please wait for confirmation.",
  donationAmountLabel: "Donation Amount",
  transactionReference: "Transaction Reference",
  donationPurposeLabel: "Donation Purpose",
  paymentDate: "Payment Date",
  paymentStatus: "Payment Status",
  verified: "Verified",
  pending: "Pending",
  blessings: "May your generosity bring blessings.",
  backToHome: "Back to Home",
  anotherDonation: "Make Another Donation",
  securityNote: "Please keep your transaction reference for future inquiries. This confirmation should be displayed only after the payment has been verified by the server."
}


},

si: {
translation: {
// General
language: "භාෂාව",


  // Login Page
  loginTitle: "ඔබේ ගිණුමට පිවිසෙන්න",
  email: "ඊමේල් ලිපිනය",
  emailPlaceholder: "ඔබේ ඊමේල් ලිපිනය",
  password: "මුරපදය",
  passwordPlaceholder: "මුරපදය ඇතුළත් කරන්න",
  remember: "මතක තබා ගන්න",
  forgot: "මුරපදය අමතකද?",
  signIn: "පිවිසෙන්න",
  signingIn: "පිවිසෙමින්...",
  continueGoogle: "Google සමඟ ඉදිරියට",
  continueFacebook: "Facebook සමඟ ඉදිරියට",
  createAccount: "නව ගිණුමක් සාදන්න",
  welcomeBack: "ආයුබෝවන්",

  // Donation Page
  donationTitle: "විහාර පරිත්‍යාගය",
  donationDescription: "ඔබේ පරිත්‍යාගයෙන් විහාරය රැකේ",
  donorName: "සම්පූර්ණ නම",
  namePlaceholder: "ඔබේ නම",
  donationPurpose: "පරිත්‍යාගයේ අරමුණ",
  templeMaintenance: "විහාර නඩත්තුව",
  religiousEvents: "ආගමික උත්සව",
  communitySupport: "ප්‍රජා සේවය",
  donationAmount: "මුදල (රු.)",
  donateNow: "දැන් පරිත්‍යාග කරන්න",
  securePayment: "ආරක්ෂිත ගෙවීම් | SSL ආරක්ෂිතයි",
  invalidAmount: "කරුණාකර නිවැරදි පරිත්‍යාග මුදලක් ඇතුළත් කරන්න.",
  enterName: "කරුණාකර ඔබේ නම ඇතුළත් කරන්න.",
  paymentNotIntegrated: "ගෙවීම් පද්ධතිය තවම සම්බන්ධ කර නොමැත. කිසිදු පරිත්‍යාගයක් සිදු කර නොමැත.",

  // Donation Success Page
  receiptTitle: "පරිත්‍යාග රිසිට්පත",
  donationSuccessful: "පරිත්‍යාගය සාර්ථකයි!",
  donationPending: "ගෙවීම් තහවුරු කිරීම අපේක්ෂාවෙන්",
  successMessage: "ඔබගේ වටිනා පරිත්‍යාගයට ස්තුතියි. ඔබගේ පරිත්‍යාගය සාර්ථකව තහවුරු කර ඇත. විහාරය සහ එහි ආගමික හා ප්‍රජා කටයුතු පවත්වාගෙන යාමට ඔබගේ සහයෝගය උපකාරී වේ.",
  pendingMessage: "ඔබගේ ගෙවීම තවමත් තහවුරු කර නොමැත. කරුණාකර තහවුරු කිරීම ලැබෙන තෙක් රැඳී සිටින්න.",
  donationAmountLabel: "පරිත්‍යාග මුදල",
  transactionReference: "ගනුදෙනු යොමු අංකය",
  donationPurposeLabel: "පරිත්‍යාගයේ අරමුණ",
  paymentDate: "ගෙවීම් දිනය",
  paymentStatus: "ගෙවීම් තත්ත්වය",
  verified: "තහවුරු කරන ලදී",
  pending: "තහවුරු වෙමින් පවතී",
  blessings: "ඔබගේ පරිත්‍යාගශීලීත්වයට ආශීර්වාද ලැබේවා!",
  backToHome: "මුල් පිටුවට",
  anotherDonation: "තවත් පරිත්‍යාගයක් කරන්න",
  securityNote: "අනාගත විමසීම් සඳහා ඔබගේ ගනුදෙනු යොමු අංකය සුරක්ෂිතව තබා ගන්න. මෙම තහවුරු කිරීම පෙන්විය යුත්තේ සේවාදායකය මඟින් ගෙවීම තහවුරු කළ පසුව පමණි."
}


}
};

const savedLanguage = localStorage.getItem('temple_lang');

i18n.use(initReactI18next).init({
resources,
lng: savedLanguage === 'si' ? 'si' : 'en',
fallbackLng: 'en',
interpolation: {
escapeValue: false
}
});

export default i18n;
