import React from 'react';
import Window from '../os/Window';
import Snake from '../snake/Snake';

export interface SnakeAppProps extends WindowAppProps {}

const SnakeApp: React.FC<SnakeAppProps> = (props) => {
    return (
        <Window
            top={80}
            left={180}
            width={360}
            height={410}
            windowTitle="Snake"
            windowBarIcon="windowGameIcon"
            closeWindow={props.onClose}
            onInteract={props.onInteract}
            minimizeWindow={props.onMinimize}
        >
            <Snake />
        </Window>
    );
};

export default SnakeApp;
