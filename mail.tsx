
import React from 'react';
import ReactDOM from 'react-dom/client';
import MailApp from './MailApp';

const rootElement = document.getElementById('mail-root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <MailApp />
    </React.StrictMode>
  );
}
