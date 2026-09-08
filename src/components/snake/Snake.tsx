import React, { useState, useEffect, useRef, useCallback } from 'react';

type Position = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const GRID_SIZE = 16;
const CELL_SIZE = 20; // 16 * 20 = 320px
const SPEED = 180; // ms per tick (slower movement)

export default function Snake() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const [snake, setSnake] = useState<Position[]>([
        { x: 8, y: 8 },
        { x: 8, y: 9 },
        { x: 8, y: 10 },
    ]);
    const [food, setFood] = useState<Position>({ x: 4, y: 4 });
    const [direction, setDirection] = useState<Direction>('UP');
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);

    const directionRef = useRef<Direction>(direction);
    directionRef.current = direction;

    const generateFood = useCallback((currentSnake: Position[]): Position => {
        const snakeSet = new Set(currentSnake.map((s) => `${s.x},${s.y}`));
        let cx = Math.floor(Math.random() * GRID_SIZE);
        let cy = Math.floor(Math.random() * GRID_SIZE);
        while (snakeSet.has(`${cx},${cy}`)) {
            cx = Math.floor(Math.random() * GRID_SIZE);
            cy = Math.floor(Math.random() * GRID_SIZE);
        }
        return { x: cx, y: cy };
    }, []);

    const resetGame = useCallback(() => {
        const initialSnake = [
            { x: 8, y: 8 },
            { x: 8, y: 9 },
            { x: 8, y: 10 },
        ];
        setSnake(initialSnake);
        setDirection('UP');
        setFood(generateFood(initialSnake));
        setScore(0);
        setGameOver(false);
        setIsPaused(false);
        setGameStarted(true);
    }, [generateFood]);

    const changeDirection = useCallback((newDir: Direction) => {
        const current = directionRef.current;
        if (newDir === 'UP' && current !== 'DOWN') setDirection('UP');
        if (newDir === 'DOWN' && current !== 'UP') setDirection('DOWN');
        if (newDir === 'LEFT' && current !== 'RIGHT') setDirection('LEFT');
        if (newDir === 'RIGHT' && current !== 'LEFT') setDirection('RIGHT');
    }, []);

    // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }

            if (!gameStarted && e.key === ' ') {
                resetGame();
                return;
            }

            if (gameOver && e.key === ' ') {
                resetGame();
                return;
            }

            if (e.key === ' ') {
                setIsPaused((p) => !p);
                return;
            }

            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') changeDirection('UP');
            else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') changeDirection('DOWN');
            else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') changeDirection('LEFT');
            else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') changeDirection('RIGHT');
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameStarted, gameOver, resetGame, changeDirection]);

    // Game Loop
    useEffect(() => {
        if (!gameStarted || gameOver || isPaused) return;

        const interval = setInterval(() => {
            setSnake((prevSnake) => {
                const head = { ...prevSnake[0] };
                const currentDir = directionRef.current;

                if (currentDir === 'UP') head.y -= 1;
                if (currentDir === 'DOWN') head.y += 1;
                if (currentDir === 'LEFT') head.x -= 1;
                if (currentDir === 'RIGHT') head.x += 1;

                // Wall collision
                if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
                    setGameOver(true);
                    return prevSnake;
                }

                // Self collision
                if (prevSnake.some((s) => s.x === head.x && s.y === head.y)) {
                    setGameOver(true);
                    return prevSnake;
                }

                const newSnake = [head, ...prevSnake];

                // Food collision
                if (head.x === food.x && head.y === food.y) {
                    setScore((s) => {
                        const ns = s + 10;
                        setHighScore((hs) => Math.max(hs, ns));
                        return ns;
                    });
                    setFood(generateFood(newSnake));
                } else {
                    newSnake.pop();
                }

                return newSnake;
            });
        }, SPEED);

        return () => clearInterval(interval);
    }, [gameStarted, gameOver, isPaused, food, generateFood]);

    // Canvas Renderer
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Background
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw Grid Lines
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        for (let i = 0; i <= GRID_SIZE; i++) {
            ctx.beginPath();
            ctx.moveTo(i * CELL_SIZE, 0);
            ctx.lineTo(i * CELL_SIZE, canvas.height);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0, i * CELL_SIZE);
            ctx.lineTo(canvas.width, i * CELL_SIZE);
            ctx.stroke();
        }

        // Draw Food
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(
            food.x * CELL_SIZE + 2,
            food.y * CELL_SIZE + 2,
            CELL_SIZE - 4,
            CELL_SIZE - 4
        );

        // Draw Snake
        snake.forEach((seg, index) => {
            if (index === 0) {
                ctx.fillStyle = '#22c55e'; // Head
            } else {
                ctx.fillStyle = '#16a34a'; // Body
            }
            ctx.fillRect(
                seg.x * CELL_SIZE + 1,
                seg.y * CELL_SIZE + 1,
                CELL_SIZE - 2,
                CELL_SIZE - 2
            );
        });
    }, [snake, food]);

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>SCORE: {String(score).padStart(3, '0')}</div>
                <div>HIGH: {String(highScore).padStart(3, '0')}</div>
            </div>

            <div style={styles.boardWrapper}>
                <canvas
                    ref={canvasRef}
                    width={GRID_SIZE * CELL_SIZE}
                    height={GRID_SIZE * CELL_SIZE}
                    style={styles.canvas}
                />

                {!gameStarted && (
                    <div style={styles.overlay}>
                        <div style={styles.overlayTitle}>SNAKE GAME</div>
                        <button style={styles.retroBtn} onClick={resetGame}>
                            START GAME
                        </button>
                    </div>
                )}

                {gameOver && (
                    <div style={styles.overlay}>
                        <div style={styles.overlayTitle}>GAME OVER</div>
                        <div style={styles.overlaySubtitle}>FINAL SCORE: {score}</div>
                        <button style={styles.retroBtn} onClick={resetGame}>
                            PLAY AGAIN
                        </button>
                    </div>
                )}
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
        width: '100%',
        height: '100%',
        backgroundColor: '#1e293b',
        color: '#ffffff',
        fontFamily: 'monospace',
        padding: 12,
        boxSizing: 'border-box',
        userSelect: 'none',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        width: 320,
        marginBottom: 8,
        fontSize: 14,
        fontWeight: 'bold',
        color: '#22c55e',
    },
    boardWrapper: {
        position: 'relative',
        width: 320,
        height: 320,
        border: '3px solid #475569',
        boxSizing: 'content-box',
    },
    canvas: {
        display: 'block',
        backgroundColor: '#0f172a',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 320,
        height: 320,
        backgroundColor: 'rgba(15, 23, 42, 0.88)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    overlayTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#22c55e',
        marginBottom: 12,
    },
    overlaySubtitle: {
        fontSize: 12,
        color: '#94a3b8',
        marginBottom: 14,
    },
    retroBtn: {
        padding: '6px 16px',
        backgroundColor: '#22c55e',
        color: '#0f172a',
        border: 'none',
        borderRadius: 2,
        fontWeight: 'bold',
        fontSize: 13,
        fontFamily: 'monospace',
        cursor: 'pointer',
    },
};
