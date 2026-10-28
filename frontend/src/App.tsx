import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import {AppRoutes} from './routes/AppRoutes';

const App = () => (
<AuthProvider>
    <LanguageProvider>
    <AppRoutes />
    </LanguageProvider>
</AuthProvider>
);
export default App;
