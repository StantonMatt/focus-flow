import React from 'react';
import ReactDOM from 'react-dom/client';
import { I18nProvider } from '../shared/i18n';
import Options from './Options';
import '../styles/global.css';
import './Options.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <I18nProvider>
      <Options />
    </I18nProvider>
  </React.StrictMode>
);
