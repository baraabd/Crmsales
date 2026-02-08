import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AppProvider } from './contexts/AppContext';
import { Toaster } from 'sonner';
import '../styles/theme.css';
import '../styles/fonts.css';

function App() {
  return (
    <AppProvider>
      <RouterProvider router={router} />
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
          },
        }}
      />
    </AppProvider>
  );
}

export default App;