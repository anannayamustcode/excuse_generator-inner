import './App.css';
import Desktop from './components/os/Desktop';

function App() {
    return (
        <div className="App">
            <div className="desktop-app">
                <Desktop />
            </div>
            <div className="mobile-only-message" role="status" aria-live="polite">
                <p>Kindly check this website out on your laptop</p>
            </div>
        </div>
    );
}

export default App;
