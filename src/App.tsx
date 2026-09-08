import React from 'react';
import './App.css';
import { HashRouter } from 'react-router-dom';
import Desktop from './components/os/Desktop';

function App() {
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
