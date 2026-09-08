import React, { useRef } from 'react';
import Window from '../os/Window';
import useInitialWindowSize from '../../hooks/useInitialWindowSize';
import VerticalNavbar from '../showcase/VerticalNavbar';
import { Routes, Route } from 'react-router-dom';
import Home from '../showcase/Home';
import About from '../showcase/About';
import Experience from '../showcase/Experience';
import Projects from '../showcase/Projects';
import SoftwareProjects from '../showcase/projects/Software';
import ArtProjects from '../showcase/projects/Art';
import Contact from '../showcase/Contact';

export interface ShowcaseExplorerProps extends WindowAppProps {}

const ShowcaseExplorer: React.FC<ShowcaseExplorerProps> = (props) => {
    const { initWidth, initHeight } = useInitialWindowSize({ margin: 100 });
    const clickAudioContextRef = useRef<AudioContext | null>(null);

    const playClickSound = () => {
        if (typeof window === 'undefined') {
            return;
        }

        const AudioContextClass =
            window.AudioContext ||
            (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AudioContextClass) {
            return;
        }

        if (!clickAudioContextRef.current) {
            clickAudioContextRef.current = new AudioContextClass();
        }

        const audioContext = clickAudioContextRef.current;
        if (audioContext.state === 'suspended') {
            void audioContext.resume();
        }

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(760, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(560, audioContext.currentTime + 0.06);
        gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.05, audioContext.currentTime + 0.004);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.11);
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.11);
    };

    return (
        <Window
            top={24}
            left={56}
            width={initWidth}
            height={initHeight}
            windowTitle="My Showcase"
            windowBarIcon="showcaseIcon"
            closeWindow={props.onClose}
            onInteract={props.onInteract}
            minimizeWindow={props.onMinimize}
            bottomLeftText="© Portfolio Showcase"
        >
            <div style={styles.site} onMouseDown={playClickSound}>
                <VerticalNavbar />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/experience" element={<Experience />} />
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/projects/software" element={<SoftwareProjects />} />
                    <Route path="/projects/art" element={<ArtProjects />} />
                    <Route path="/contact" element={<Contact />} />
                </Routes>
            </div>
        </Window>
    );
};

const styles: StyleSheetCSS = {
    site: {
        width: '100%',
        height: '100%',
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
    },
};

export default ShowcaseExplorer;
