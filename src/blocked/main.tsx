import React from 'react';
import ReactDOM from 'react-dom/client';
import { I18nProvider } from '../shared/i18n';
import BlockedPage from './BlockedPage';
import '../styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <I18nProvider>
      <BlockedPage />
    </I18nProvider>
  </React.StrictMode>
);
