import React, { useCallback, useEffect, useRef, useState } from 'react';
import { IconName } from '../../assets/icons';
import colors from '../../constants/colors';
import { Icon } from '../general';

export interface DesktopShortcutProps {
    icon: IconName;
    shortcutName: string;
    invertText?: boolean;
    onOpen: () => void;
}

const DesktopShortcut: React.FC<DesktopShortcutProps> = ({
    icon,
    shortcutName,
    invertText,
    onOpen,
}) => {
    const [isSelected, setIsSelected] = useState(false);
    const [shortcutId, setShortcutId] = useState('');
    const [lastSelected, setLastSelected] = useState(false);
    const containerRef = useRef<any>();

    const [scaledStyle, setScaledStyle] = useState({});
    const requiredIcon = require(`../../assets/icons/${icon}.png`);
    const [doubleClickTimerActive, setDoubleClickTimerActive] = useState(false);

    // Draggable position offset for touch/mouse drag on mobile
    const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const isDraggingRef = useRef(false);
    const hasMovedRef = useRef(false);
    const dragStartRef = useRef({ mouseX: 0, mouseY: 0, startX: 0, startY: 0 });

    const isMobile = typeof window !== 'undefined' && (window.innerWidth < 768 || window.innerHeight < 500);

    const getShortcutId = useCallback(() => {
        const id = shortcutName.replace(/\s/g, '');
        return `desktop-shortcut-${id}`;
    }, [shortcutName]);

    useEffect(() => {
        setShortcutId(getShortcutId());
    }, [shortcutName, getShortcutId]);

    useEffect(() => {
        if (containerRef.current && Object.keys(scaledStyle).length === 0) {
            const boundingBox = containerRef.current.getBoundingClientRect();
            setScaledStyle({
                transformOrigin: 'center',
                transform: isMobile ? 'scale(1.8)' : 'scale(1.5)',
                left: boundingBox.width / 4,
                top: boundingBox.height / 4,
            });
        }
    }, [scaledStyle, isMobile]);

    const handleClickOutside = useCallback(
        (event: MouseEvent) => {
            const targetId = (event.target as HTMLElement)?.id;
            if (targetId !== shortcutId) {
                setIsSelected(false);
            }
            if (!isSelected && lastSelected) {
                setLastSelected(false);
            }
        },
        [isSelected, lastSelected, shortcutId]
    );

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [handleClickOutside]);

    const handleStart = (clientX: number, clientY: number) => {
        isDraggingRef.current = true;
        hasMovedRef.current = false;
        dragStartRef.current = {
            mouseX: clientX,
            mouseY: clientY,
            startX: dragOffset.x,
            startY: dragOffset.y,
        };
    };

    const handleMove = useCallback((clientX: number, clientY: number) => {
        if (!isDraggingRef.current) return;
        const dx = clientX - dragStartRef.current.mouseX;
        const dy = clientY - dragStartRef.current.mouseY;

        if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
            hasMovedRef.current = true;
        }

        setDragOffset({
            x: dragStartRef.current.startX + dx,
            y: dragStartRef.current.startY + dy,
        });
    }, []);

    const handleEnd = useCallback(() => {
        if (!isDraggingRef.current) return;
        isDraggingRef.current = false;

        if (!hasMovedRef.current) {
            const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || isMobile;
            if (isTouch) {
                onOpen && onOpen();
                setIsSelected(false);
            } else {
                if (doubleClickTimerActive) {
                    onOpen && onOpen();
                    setIsSelected(false);
                    setDoubleClickTimerActive(false);
                } else {
                    setIsSelected(true);
                    setLastSelected(true);
                    setDoubleClickTimerActive(true);
                    setTimeout(() => {
                        setDoubleClickTimerActive(false);
                    }, 300);
                }
            }
        }
    }, [doubleClickTimerActive, isMobile, onOpen]);

    const onMouseDown = (e: React.MouseEvent) => {
        handleStart(e.clientX, e.clientY);

        const onMouseMove = (ev: MouseEvent) => handleMove(ev.clientX, ev.clientY);
        const onMouseUp = () => {
            handleEnd();
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    };

    const onTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length > 0) {
            const touch = e.touches[0];
            handleStart(touch.clientX, touch.clientY);
        }

        const onTouchMove = (ev: TouchEvent) => {
            if (ev.touches.length > 0) {
                const t = ev.touches[0];
                handleMove(t.clientX, t.clientY);
            }
        };

        const onTouchEnd = () => {
            handleEnd();
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', onTouchEnd);
        };

        window.addEventListener('touchmove', onTouchMove, { passive: true });
        window.addEventListener('touchend', onTouchEnd);
    };

    return (
        <div
            id={shortcutId}
            style={Object.assign(
                {},
                styles.appShortcut,
                scaledStyle,
                (dragOffset.x !== 0 || dragOffset.y !== 0) && {
                    transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) ${isMobile ? 'scale(1.8)' : 'scale(1.5)'}`,
                }
            )}
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
            ref={containerRef}
        >
            <div id={shortcutId} style={styles.iconContainer}>
                <div
                    id={shortcutId}
                    className="desktop-shortcut-icon"
                    style={Object.assign(
                        {},
                        styles.iconOverlay,
                        isSelected && styles.checkerboard,
                        isSelected && {
                            WebkitMask: `url(${requiredIcon})`,
                        }
                    )}
                />
                <Icon icon={icon} style={styles.icon} />
            </div>
            <div
                className={
                    isSelected
                        ? 'selected-shortcut-border'
                        : lastSelected
                        ? 'shortcut-border'
                        : ''
                }
                id={shortcutId}
                style={isSelected ? { backgroundColor: colors.blue } : {}}
            >
                <p
                    id={shortcutId}
                    style={Object.assign(
                        {},
                        styles.shortcutText,
                        invertText && !isSelected && { color: 'black' }
                    )}
                >
                    {shortcutName}
                </p>
            </div>
        </div>
    );
};

const styles: StyleSheetCSS = {
    appShortcut: {
        position: 'absolute',
        width: 56,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        textAlign: 'center',
        touchAction: 'none',
    },
    shortcutText: {
        cursor: 'pointer',
        textOverflow: 'wrap',
        fontFamily: 'MSSerif',
        color: 'white',
        fontSize: 8,
        paddingRight: 2,
        paddingLeft: 2,
    },
    iconContainer: {
        cursor: 'pointer',
        paddingBottom: 3,
    },
    iconOverlay: {
        position: 'absolute',
        top: 0,
        width: 32,
        height: 32,
    },
    checkerboard: {
        backgroundImage: `linear-gradient(45deg, ${colors.blue} 25%, transparent 25%),
        linear-gradient(-45deg, ${colors.blue} 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, ${colors.blue} 75%),
        linear-gradient(-45deg, transparent 75%, ${colors.blue} 75%)`,
        backgroundSize: `2px 2px`,
        backgroundPosition: `0 0, 0 1px, 1px -1px, -1px 0px`,
        pointerEvents: 'none',
    },
};

export default DesktopShortcut;
