import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('[Main] Starting app...');

try {
    const rootElement = document.getElementById('root');
    console.log('[Main] Root element:', rootElement);

    if (rootElement) {
        console.log('[Main] Creating React root...');
        const root = ReactDOM.createRoot(rootElement);
        console.log('[Main] Rendering App...');
        root.render(
            <React.StrictMode>
                <App />
            </React.StrictMode>
        );
        console.log('[Main] Render called successfully');
    }
} catch (error) {
    console.error('[Main] Error during startup:', error);
}

