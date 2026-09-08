import React, { useEffect } from 'react';
import './App.css';
import { HashRouter } from 'react-router-dom';
import Desktop from './components/os/Desktop';

function App() {
    useEffect(() => {
        const lockOrientation = async () => {
            try {
                if (window.screen && window.screen.orientation && 'lock' in window.screen.orientation) {
                    // @ts-ignore
                    await window.screen.orientation.lock('landscape');
                }
            } catch (e) {
                // Device or browser does not permit auto-lock without user interaction
            }
        };

        lockOrientation();

        const handleTouch = () => {
            lockOrientation();
        };

        window.addEventListener('touchstart', handleTouch);
        return () => window.removeEventListener('touchstart', handleTouch);
    }, []);

    return (
        <HashRouter>
            <div className="App">
                <div className="desktop-app">
                    <Desktop />
                </div>
                <div className="mobile-only-message" role="status" aria-live="polite">
                    <p>Please rotate your phone to landscape mode for the desktop experience!</p>
                </div>
            </div>
        </HashRouter>
    );
}

export default App;
