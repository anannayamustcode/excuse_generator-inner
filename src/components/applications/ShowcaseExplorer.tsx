import React, { useRef, useState } from 'react';
import Window from '../os/Window';
import useInitialWindowSize from '../../hooks/useInitialWindowSize';
import { InputState, Recommendation } from './ShowcaseExplorer/types';
import { initialForm } from './ShowcaseExplorer/constants';
import { rankExcuses } from './ShowcaseExplorer/utils';
import { styles } from './ShowcaseExplorer/styles';
import { ExcuseForm } from './ShowcaseExplorer/ExcuseForm';
import { ExcuseRecommendations } from './ShowcaseExplorer/ExcuseRecommendations';

export interface ShowcaseExplorerProps extends WindowAppProps {}

const ShowcaseExplorer: React.FC<ShowcaseExplorerProps> = (props) => {
    const { initWidth, initHeight } = useInitialWindowSize({ margin: 100 });
    const [form, setForm] = useState<InputState>(initialForm);
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [showAll, setShowAll] = useState(false);
    const clickAudioContextRef = useRef<AudioContext | null>(null);
    const variantHistoryRef = useRef<Record<string, number>>({});

    const playClickSound = () => {
        if (typeof window === 'undefined') {
            return;
        }

        const AudioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
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

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const ranked = rankExcuses(form, variantHistoryRef.current);
        setRecommendations(ranked);
        setShowAll(false);
    };

    const handleChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
        field: keyof InputState,
    ) => {
        const value = event.target.value;
        setForm((current) => ({ ...current, [field]: value }));
    };

    const handlePreviousExcuses = () => {
        const trimmed = form.previousExcuseInput.trim();
        if (!trimmed) {
            return;
        }

        const values = trimmed
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);

        setForm((current) => ({
            ...current,
            previousExcuses: [...current.previousExcuses, ...values],
            previousExcuseInput: '',
        }));
    };

    const removePreviousExcuse = (value: string) => {
        setForm((current) => ({
            ...current,
            previousExcuses: current.previousExcuses.filter((item) => item !== value),
        }));
    };

    const copyRecommendation = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
        } catch {
            // Ignore clipboard failures
        }
    };

    return (
        <Window
            top={24}
            left={56}
            width={initWidth}
            height={initHeight}
            windowTitle="Excuse Assistant"
            windowBarIcon="windowExplorerIcon"
            closeWindow={props.onClose}
            onInteract={props.onInteract}
            minimizeWindow={props.onMinimize}
            bottomLeftText="© Curated excuse recommendations"
        >
            <div style={styles.shell} onMouseDown={playClickSound}>
                <div style={styles.header}>
                    <div>
                        <h2 style={styles.title}>Excuse Recommendation Assistant</h2>
                    </div>
                </div>

                <div style={styles.layout}>
                    <ExcuseForm 
                        form={form} 
                        handleChange={handleChange} 
                        handleSubmit={handleSubmit}
                        handlePreviousExcuses={handlePreviousExcuses}
                        removePreviousExcuse={removePreviousExcuse}
                    />
                    <ExcuseRecommendations 
                        recommendations={recommendations}
                        showAll={showAll}
                        setShowAll={setShowAll}
                        copyRecommendation={copyRecommendation}
                    />
                </div>
            </div>
        </Window>
    );
};

export default ShowcaseExplorer;
