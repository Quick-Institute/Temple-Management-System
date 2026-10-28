import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
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
      welcomeBack: "Welcome Back"
    }
  },
  si: {
    translation: {
      loginTitle: "ඔබේ ගිණුමට පිවිසෙන්න",
      email: "ඊමේල් ලිපිනය",
      emailPlaceholder: "ඔබේ ඊමේල් ලිපිනය",
      password: "මුරපදය",
      passwordPlaceholder: "මුරපදය ඇතුලත් කරන්න",
      remember: "මතක තබා ගන්න",
      forgot: "මුරපදය අමතකද?",
      signIn: "පිවිසෙන්න",
      signingIn: "පිවිසෙමින්...",
      continueGoogle: "Google සමඟ ඉදිරියට",
      continueFacebook: "Facebook සමඟ ඉදිරියට",
      createAccount: "නව ගිණුමක් සාදන්න",
      welcomeBack: "ආයුබෝවන්"
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false }
});

export default i18n;