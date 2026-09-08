import React from 'react';
import Window from '../os/Window';
import DosPlayer from '../dos/DosPlayer';
import useInitialWindowSize from '../../hooks/useInitialWindowSize';

export interface OregonTrailAppProps extends WindowAppProps {}

const OregonTrailApp: React.FC<OregonTrailAppProps> = (props) => {
    const { initWidth, initHeight } = useInitialWindowSize({ margin: 100 });

    return (
        <Window
            top={30}
            left={80}
            width={initWidth}
            height={initHeight}
            windowTitle="The Oregon Trail"
            windowBarIcon="trailIcon"
            closeWindow={props.onClose}
            onInteract={props.onInteract}
            minimizeWindow={props.onMinimize}
        >
            <DosPlayer
                width={initWidth}
                height={initHeight - 24}
                bundleUrl={process.env.PUBLIC_URL + '/trail.jsdos'}
            />
        </Window>
    );
};

export default OregonTrailApp;
