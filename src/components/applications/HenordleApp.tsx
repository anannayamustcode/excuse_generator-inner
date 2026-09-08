import React from 'react';
import Window from '../os/Window';
import Wordle from '../wordle/Wordle';
import useInitialWindowSize from '../../hooks/useInitialWindowSize';

export interface HenordleAppProps extends WindowAppProps {}

const HenordleApp: React.FC<HenordleAppProps> = (props) => {
    const { initWidth, initHeight } = useInitialWindowSize({ margin: 100 });

    return (
        <Window
            top={60}
            left={140}
            width={initWidth}
            height={initHeight}
            windowTitle="Anordle"
            windowBarIcon="henordleIcon"
            closeWindow={props.onClose}
            onInteract={props.onInteract}
            minimizeWindow={props.onMinimize}
        >
            <Wordle />
        </Window>
    );
};

export default HenordleApp;
