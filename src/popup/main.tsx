import React from 'react';
import ReactDOM from 'react-dom/client';
import { I18nProvider } from '../shared/i18n';
import Popup from './Popup';
import '../styles/global.css';
import './Popup.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <I18nProvider>
      <Popup />
    </I18nProvider>
  </React.StrictMode>
);
