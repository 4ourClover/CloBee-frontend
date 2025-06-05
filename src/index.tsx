import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';

// Google Analytics
const GA_TRACKING_ID = 'G-Q14QT1S3RQ';

const script1 = document.createElement('script');
script1.async = true;
script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
document.head.appendChild(script1);

const script2 = document.createElement('script');
script2.innerHTML = `
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${GA_TRACKING_ID}');
`;
document.head.appendChild(script2);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  //<React.StrictMode>
  <BrowserRouter>
    <App />
  </BrowserRouter>
  //</React.StrictMode>
);

// Service Worker 등록
serviceWorkerRegistration.register();

// 웹 사이트 성능 지표
reportWebVitals();