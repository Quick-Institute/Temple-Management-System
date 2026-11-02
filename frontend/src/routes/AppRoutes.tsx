import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthLoginPage } from '../pages/auth/auth.login';
import { authRoutes } from './authRoutes';
import DonationPage from '../pages/DonationPage';
import DonationSuccessPage from '../pages/DonationSuccessPage';
import SuggestionsPage from '../pages/SuggestionsPage';
import AdminSuggestionsPage from '../pages/admin/AdminSuggestionsPage';

export const AppRoutes = () => ( <Routes>
{/* Login */}
<Route path={authRoutes.login} element={<AuthLoginPage />} />


{/* Donation Module */}
<Route path="/donation" element={<DonationPage />} />
<Route path="/donation/success" element={<DonationSuccessPage />} />

{/*Community Suggestions Section*/}
<Route path="/suggestions" element={<SuggestionsPage />} />
<Route path="/admin/suggestions" element={<AdminSuggestionsPage />} />

{/* Fallback Route */}
<Route path="*" element={<Navigate to={authRoutes.login} replace />} />


  </Routes>
);
