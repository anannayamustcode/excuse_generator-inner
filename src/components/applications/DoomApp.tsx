import React from 'react';
import Window from '../os/Window';
import DosPlayer from '../dos/DosPlayer';
import useInitialWindowSize from '../../hooks/useInitialWindowSize';

export interface DoomAppProps extends WindowAppProps {}

const DoomApp: React.FC<DoomAppProps> = (props) => {
    const { initWidth, initHeight } = useInitialWindowSize({ margin: 100 });

    return (
        <Window
            top={50}
            left={120}
            width={initWidth}
            height={initHeight}
            windowTitle="DOOM"
            windowBarIcon="doomIcon"
            closeWindow={props.onClose}
            onInteract={props.onInteract}
            minimizeWindow={props.onMinimize}
        >
            <DosPlayer
                width={initWidth}
                height={initHeight - 24}
                bundleUrl={process.env.PUBLIC_URL + '/doom.jsdos'}
            />
        </Window>
    );
};

export default DoomApp;
