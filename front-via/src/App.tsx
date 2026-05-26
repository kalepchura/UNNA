import { BrowserRouter } from 'react-router-dom';

import { AuthProvider } from '@/store/auth-context';
import { AppRoutes } from '@/routes/app-routes';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;