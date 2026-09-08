import React, { useState, useEffect, useCallback } from 'react';

interface Cell {
    row: number;
    col: number;
    isMine: boolean;
    isRevealed: boolean;
    isFlagged: boolean;
    neighborMines: number;
}

const ROWS = 8;
const COLS = 8;
const MINES = 10;
const CELL_SIZE = 24;

export default function Minesweeper() {
    const [board, setBoard] = useState<Cell[][]>([]);
    const [gameOver, setGameOver] = useState(false);
    const [won, setWon] = useState(false);
    const [flagsCount, setFlagsCount] = useState(0);
    const [timer, setTimer] = useState(0);
    const [timerActive, setTimerActive] = useState(false);

    const initBoard = useCallback(() => {
        let newBoard: Cell[][] = [];
        for (let r = 0; r < ROWS; r++) {
            let row: Cell[] = [];
            for (let c = 0; c < COLS; c++) {
                row.push({
                    row: r,
                    col: c,
                    isMine: false,
                    isRevealed: false,
                    isFlagged: false,
                    neighborMines: 0,
                });
            }
            newBoard.push(row);
        }

        // Place mines randomly
        let planted = 0;
        while (planted < MINES) {
            let r = Math.floor(Math.random() * ROWS);
            let c = Math.floor(Math.random() * COLS);
            if (!newBoard[r][c].isMine) {
                newBoard[r][c].isMine = true;
                planted++;
            }
        }

        // Calculate neighbor mines
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (newBoard[r][c].isMine) continue;
                let count = 0;
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        let nr = r + dr;
                        let nc = c + dc;
                        if (
                            nr >= 0 &&
                            nr < ROWS &&
                            nc >= 0 &&
                            nc < COLS &&
                            newBoard[nr][nc].isMine
                        ) {
                            count++;
                        }
                    }
                }
                newBoard[r][c].neighborMines = count;
            }
        }

        setBoard(newBoard);
        setGameOver(false);
        setWon(false);
        setFlagsCount(0);
        setTimer(0);
        setTimerActive(false);
    }, []);

    useEffect(() => {
        initBoard();
    }, [initBoard]);

    useEffect(() => {
        let interval: any = null;
        if (timerActive && !gameOver && !won) {
            interval = setInterval(() => {
                setTimer((t) => Math.min(t + 1, 999));
            }, 1000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [timerActive, gameOver, won]);

    const revealCell = (r: number, c: number) => {
        if (gameOver || won) return;
        let cell = board[r][c];
        if (cell.isRevealed || cell.isFlagged) return;

        if (!timerActive) setTimerActive(true);

        let newBoard = board.map((row) => row.map((cell) => ({ ...cell })));

        if (newBoard[r][c].isMine) {
            // Hit a mine!
            newBoard[r][c].isRevealed = true;
            for (let i = 0; i < ROWS; i++) {
                for (let j = 0; j < COLS; j++) {
                    if (newBoard[i][j].isMine) newBoard[i][j].isRevealed = true;
                }
            }
            setBoard(newBoard);
            setGameOver(true);
            setTimerActive(false);
            return;
        }

        // Flood fill reveal
        const revealNeighbors = (br: number, bc: number) => {
            if (
                br < 0 ||
                br >= ROWS ||
                bc < 0 ||
                bc >= COLS ||
                newBoard[br][bc].isRevealed ||
                newBoard[br][bc].isFlagged
            )
                return;

            newBoard[br][bc].isRevealed = true;

            if (newBoard[br][bc].neighborMines === 0) {
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        if (dr !== 0 || dc !== 0) {
                            revealNeighbors(br + dr, bc + dc);
                        }
                    }
                }
            }
        };

        revealNeighbors(r, c);
        setBoard(newBoard);

        checkWin(newBoard);
    };

    const toggleFlag = (e: React.MouseEvent, r: number, c: number) => {
        e.preventDefault();
        if (gameOver || won) return;
        let cell = board[r][c];
        if (cell.isRevealed) return;

        if (!timerActive) setTimerActive(true);

        let newBoard = board.map((row) => row.map((cell) => ({ ...cell })));
        newBoard[r][c].isFlagged = !newBoard[r][c].isFlagged;
        setBoard(newBoard);

        let newFlags = flagsCount + (newBoard[r][c].isFlagged ? 1 : -1);
        setFlagsCount(newFlags);

        checkWin(newBoard);
    };

    const checkWin = (currentBoard: Cell[][]) => {
        let unrevealedNonMines = 0;
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (!currentBoard[r][c].isMine && !currentBoard[r][c].isRevealed) {
                    unrevealedNonMines++;
                }
            }
        }
        if (unrevealedNonMines === 0) {
            setWon(true);
            setGameOver(true);
            setTimerActive(false);
        }
    };

    const numberColors: { [key: number]: string } = {
        1: '#0000ff',
        2: '#007b00',
        3: '#ff0000',
        4: '#00007b',
        5: '#7b0000',
        6: '#007b7b',
        7: '#000000',
        8: '#7b7b7b',
    };

    const boardWidth = COLS * CELL_SIZE; // 192px

    return (
        <div style={styles.container}>
            <div style={{ ...styles.header, width: boardWidth }}>
                <div style={styles.counter}>
                    {String(Math.max(0, MINES - flagsCount)).padStart(3, '0')}
                </div>
                <button style={styles.resetButton} onClick={initBoard}>
                    Reset
                </button>
                <div style={styles.counter}>{String(timer).padStart(3, '0')}</div>
            </div>

            <div style={styles.scrollArea}>
                <table style={styles.table}>
                    <tbody>
                        {board.map((row, r) => (
                            <tr key={r} style={styles.tableRow}>
                                {row.map((cell, c) => (
                                    <td key={c} style={styles.tableCell}>
                                        <button
                                            style={Object.assign(
                                                {},
                                                styles.cellButton,
                                                cell.isRevealed && styles.revealedCell
                                            )}
                                            onClick={() => revealCell(r, c)}
                                            onContextMenu={(e) => toggleFlag(e, r, c)}
                                        >
                                            {cell.isRevealed ? (
                                                cell.isMine ? (
                                                    <span style={{ color: 'black', fontWeight: 'bold' }}>*</span>
                                                ) : cell.neighborMines > 0 ? (
                                                    <span
                                                        style={{
                                                            color: numberColors[cell.neighborMines],
                                                            fontWeight: 'bold',
                                                        }}
                                                    >
                                                        {cell.neighborMines}
                                                    </span>
                                                ) : (
                                                    ''
                                                )
                                            ) : cell.isFlagged ? (
                                                <span style={{ color: 'red', fontWeight: 'bold' }}>F</span>
                                            ) : (
                                                ''
                                            )}
                                        </button>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        backgroundColor: '#c0c0c0',
        border: '3px solid #ffffff',
        borderRightColor: '#808080',
        borderBottomColor: '#808080',
        boxSizing: 'border-box',
        width: '100%',
        height: '100%',
        userSelect: 'none',
        overflow: 'hidden',
    },
    header: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 6,
        backgroundColor: '#c0c0c0',
        border: '2px solid #808080',
        borderRightColor: '#ffffff',
        borderBottomColor: '#ffffff',
        marginBottom: 10,
        boxSizing: 'border-box',
    },
    counter: {
        backgroundColor: '#000000',
        color: '#ff0000',
        fontFamily: 'monospace',
        fontSize: 18,
        fontWeight: 'bold',
        padding: '2px 5px',
        borderRadius: 2,
    },
    resetButton: {
        padding: '4px 10px',
        fontSize: 11,
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
        backgroundColor: '#c0c0c0',
        border: '2px solid #ffffff',
        borderRightColor: '#808080',
        borderBottomColor: '#808080',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollArea: {
        display: 'block',
    },
    table: {
        borderCollapse: 'collapse',
        border: '3px solid #808080',
        borderRightColor: '#ffffff',
        borderBottomColor: '#ffffff',
        tableLayout: 'fixed',
    },
    tableRow: {
        height: CELL_SIZE,
    },
    tableCell: {
        padding: 0,
        margin: 0,
        width: CELL_SIZE,
        height: CELL_SIZE,
        minWidth: CELL_SIZE,
        minHeight: CELL_SIZE,
    },
    cellButton: {
        width: CELL_SIZE,
        height: CELL_SIZE,
        backgroundColor: '#c0c0c0',
        border: '2px solid #ffffff',
        borderRightColor: '#808080',
        borderBottomColor: '#808080',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 12,
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
        cursor: 'pointer',
        padding: 0,
        margin: 0,
        boxSizing: 'border-box',
    },
    revealedCell: {
        backgroundColor: '#e0e0e0',
        border: '1px solid #7b7b7b',
    },
};
