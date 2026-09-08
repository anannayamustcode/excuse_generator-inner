import React from 'react';
import Window from '../os/Window';
import DosPlayer from '../dos/DosPlayer';
import useInitialWindowSize from '../../hooks/useInitialWindowSize';

export interface ScrabbleAppProps extends WindowAppProps {}

const ScrabbleApp: React.FC<ScrabbleAppProps> = (props) => {
    const { initWidth, initHeight } = useInitialWindowSize({ margin: 100 });

    return (
        <Window
            top={40}
            left={100}
            width={initWidth}
            height={initHeight}
            windowTitle="Scrabble"
            windowBarIcon="scrabbleIcon"
            closeWindow={props.onClose}
            onInteract={props.onInteract}
            minimizeWindow={props.onMinimize}
        >
            <DosPlayer
                width={initWidth}
                height={initHeight - 24}
                bundleUrl={process.env.PUBLIC_URL + '/scrabble.jsdos'}
            />
        </Window>
    );
};

export default ScrabbleApp;
