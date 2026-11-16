import { createBrowserRouter } from 'react-router-dom';
import ChatPage from '@/pages/ChatPage';

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <ChatPage />,
    },
  ],
  {
    // Serves the app from a sub-path when deployed (e.g. GitHub Pages).
    basename: import.meta.env.BASE_URL,
  }
);
