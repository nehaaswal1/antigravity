import './vertex-ai-proxy-interceptor.js';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Run complex test scenarios in development/sandbox environments
if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname.includes('csb.app') || window.location.hostname.includes('goog'))) {
    import('./utils.test').then(({ runTests }) => {
        runTests().catch(console.error);
    });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
    throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
