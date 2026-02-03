import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';

// Walking animation frames (2x3 grid = 6 frames from moving.png)
const WALK_FRAMES = [
    '/sprites/walk_0.png',
    '/sprites/walk_1.png',
    '/sprites/walk_2.png',
    '/sprites/walk_3.png',
    '/sprites/walk_4.png',
    '/sprites/walk_5.png',
];

// Waving animation frames (2x2 grid = 4 frames from waving.png)
const WAVE_FRAMES = [
    '/sprites/wave_0.png',
    '/sprites/wave_1.png',
    '/sprites/wave_2.png',
    '/sprites/wave_3.png',
];

// Idle frame - separate transparent standing pose
const IDLE_FRAME = '/sprites/idle.png';

const preloadImages = (urls: string[]) => {
    urls.forEach((url) => {
        const img = new Image();
        img.src = url;
    });
};

const LegoAvatar = () => {
    const [isHovered, setIsHovered] = useState(false);
    const [isWaving, setIsWaving] = useState(false);
    const [shouldShow, setShouldShow] = useState(false);
    const { scrollY } = useScroll();
    const [isScrolling, setIsScrolling] = useState(false);

    // Direction for oscillating movement: 1 = right, -1 = left
    const [direction, setDirection] = useState(1);
    const lastScrollY = useRef(0);

    // Horizontal position for walking movement (oscillates left-right)
    const [xPosition, setXPosition] = useState(0);
    const X_BOUND = 40; // Maximum movement in either direction

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const scrollTimeout = useRef<any>(null);

    // Animation state
    const [currentFrame, setCurrentFrame] = useState(IDLE_FRAME);
    const frameIndexRef = useRef(0);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const animationIntervalRef = useRef<any>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const movementIntervalRef = useRef<any>(null);

    useEffect(() => {
        preloadImages([...WALK_FRAMES, ...WAVE_FRAMES, IDLE_FRAME]);
    }, []);

    // 1. Detect Scrolling
    useMotionValueEvent(scrollY, "change", (latest) => {
        if (isWaving) return; // Don't walk while waving
        
        setIsScrolling(true);
        lastScrollY.current = latest;

        if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
        scrollTimeout.current = setTimeout(() => {
            setIsScrolling(false);
        }, 200);
    });

    // 2. Handle oscillating movement while scrolling
    useEffect(() => {
        if (isScrolling && !isWaving) {
            // Start oscillating movement
            if (movementIntervalRef.current) clearInterval(movementIntervalRef.current);
            
            movementIntervalRef.current = setInterval(() => {
                setXPosition(prev => {
                    // If at right bound, switch to left
                    if (prev >= X_BOUND) {
                        setDirection(-1);
                        return prev - 5;
                    }
                    // If at left bound, switch to right
                    if (prev <= -X_BOUND) {
                        setDirection(1);
                        return prev + 5;
                    }
                    // Otherwise continue in current direction
                    return prev + (direction * 5);
                });
            }, 50);
        } else {
            // Stop movement
            if (movementIntervalRef.current) {
                clearInterval(movementIntervalRef.current);
                movementIntervalRef.current = null;
            }
        }

        return () => {
            if (movementIntervalRef.current) clearInterval(movementIntervalRef.current);
        };
    }, [isScrolling, isWaving, direction]);

    // Reset wave state when mouse leaves so it can be triggered again
    const handleMouseLeave = () => {
        setIsHovered(false);
        // Clear any ongoing wave animation
        if (animationIntervalRef.current) {
            clearInterval(animationIntervalRef.current);
            animationIntervalRef.current = null;
        }
        setIsWaving(false);
        setCurrentFrame(IDLE_FRAME);
        frameIndexRef.current = 0;
    };

    // 3. Handle Wave animation (plays once then stops) - SLOWER
    useEffect(() => {
        if (isHovered && !isWaving) {
            setIsWaving(true);
            frameIndexRef.current = 0;
            setCurrentFrame(WAVE_FRAMES[0]);
            
            let frameCount = 0;
            const totalFrames = WAVE_FRAMES.length;
            
            if (animationIntervalRef.current) clearInterval(animationIntervalRef.current);
            
            // Much slower animation - 250ms per frame (4 FPS)
            animationIntervalRef.current = setInterval(() => {
                frameCount++;
                if (frameCount >= totalFrames) {
                    // Animation complete, stop and go to idle
                    clearInterval(animationIntervalRef.current);
                    animationIntervalRef.current = null;
                    setCurrentFrame(IDLE_FRAME);
                    frameIndexRef.current = 0;
                    setIsWaving(false);
                } else {
                    frameIndexRef.current = frameCount;
                    setCurrentFrame(WAVE_FRAMES[frameCount]);
                }
            }, 250); // 250ms per frame = very visible animation
        }
    }, [isHovered, isWaving]);

    // 4. Handle Walk animation
    useEffect(() => {
        if (isWaving) return; // Don't interrupt waving

        const playWalkAnimation = () => {
            if (animationIntervalRef.current) clearInterval(animationIntervalRef.current);

            animationIntervalRef.current = setInterval(() => {
                frameIndexRef.current = (frameIndexRef.current + 1) % WALK_FRAMES.length;
                setCurrentFrame(WALK_FRAMES[frameIndexRef.current]);
            }, 1000 / 10); // 10 FPS walk animation
        };

        const stopAnimation = () => {
            if (animationIntervalRef.current) {
                clearInterval(animationIntervalRef.current);
                animationIntervalRef.current = null;
            }
            // Return to idle frame
            setCurrentFrame(IDLE_FRAME);
            frameIndexRef.current = 0;
        };

        if (isScrolling && !isWaving) {
            playWalkAnimation();
        } else if (!isWaving) {
            stopAnimation();
        }

        return () => {
            if (animationIntervalRef.current) {
                clearInterval(animationIntervalRef.current);
                animationIntervalRef.current = null;
            }
        };
    }, [isScrolling, isWaving]);

    useEffect(() => {
        const timer = setTimeout(() => setShouldShow(true), 1000);
        return () => clearTimeout(timer);
    }, []);

    if (!shouldShow) return null;

    return (
        <div className="fixed bottom-20 right-2 z-50 sm:bottom-24 sm:right-6 pointer-events-none">
            <motion.div 
                className="relative flex flex-col items-center"
                animate={{ x: xPosition }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
            >
                <AnimatePresence>
                    {isHovered && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 10 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="absolute bottom-full mb-4 bg-white text-black px-4 py-2 sm:px-6 sm:py-3 rounded-2xl rounded-br-none shadow-2xl border-2 border-black whitespace-nowrap z-50"
                            style={{
                                right: '0%',
                                marginRight: '-10px'
                            }}
                        >
                            <p className="font-mono text-xs sm:text-base font-bold">Hi, I am Dilyorbek! 👋</p>
                            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-r-2 border-b-2 border-black transform rotate-45"></div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.div
                    className="relative pointer-events-auto cursor-pointer"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={handleMouseLeave}
                    initial={{ y: 200, opacity: 0 }}
                    animate={{
                        y: 0,
                        opacity: 1,
                    }}
                    transition={{ duration: 0.5 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {/* Fixed size container to prevent size jumping between walk/wave frames */}
                    <div 
                        className="w-20 sm:w-24 md:w-28 flex items-end justify-center"
                        style={{ 
                            height: '120px',
                            // Adjust height for responsive sizes
                        }}
                    >
                        <img
                            src={currentFrame}
                            alt="Dilyorbek Lego Avatar"
                            className="max-w-full max-h-full object-contain drop-shadow-2xl"
                            style={{
                                imageRendering: 'pixelated',
                                filter: 'drop-shadow(0px 8px 8px rgba(0,0,0,0.4))',
                                // Flip based on direction: moving right = face right, moving left = face left
                                // Invert direction for correct facing: -direction makes sprite face the movement direction
                                // When waving or idle, face forward (no flip)
                                transform: (isWaving || !isScrolling) ? 'scaleX(1)' : `scaleX(${-direction})`,
                                transition: 'transform 0.2s ease'
                            }}
                        />
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default LegoAvatar;
