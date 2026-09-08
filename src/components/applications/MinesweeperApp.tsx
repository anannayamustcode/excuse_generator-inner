import React from 'react';
import Window from '../os/Window';
import Minesweeper from '../minesweeper/Minesweeper';
export interface MinesweeperAppProps extends WindowAppProps {}

const MinesweeperApp: React.FC<MinesweeperAppProps> = (props) => {

    return (
        <Window
            top={70}
            left={160}
            width={250}
            height={310}
            windowTitle="Minesweeper"
            windowBarIcon="windowGameIcon"
            closeWindow={props.onClose}
            onInteract={props.onInteract}
            minimizeWindow={props.onMinimize}
        >
            <Minesweeper />
        </Window>
    );
};

export default MinesweeperApp;
