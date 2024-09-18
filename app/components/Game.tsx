'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Paddle from './Paddle';
import Ball from './Ball';
import ScoreCounter from './ScoreCounter';
import PlayerLives from './PlayerLives';
import styles from '../styles/Game.module.css';
import Image from 'next/image';

const GAME_WIDTH = 600;
const GAME_HEIGHT = 400;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 100;
const BALL_SIZE = 20;
const INITIAL_BALL_SPEED = 5;
const PADDLE_SPEED = 5;
const COUNTDOWN_DURATION = 30;
const SPEED_INCREASE_FACTOR = 1.1;
const PADDLE_REDUCTION_FACTOR = 0.9;
const INITIAL_LIVES = 5;

const BOUNCE_MESSAGES = [
  "It's on your end now!",
  "No, it's yours!",
  "Not my fault!",
  "It's for you!",
  "Check this yourself!"
];

const Game: React.FC = () => {
  const [leftPaddleY, setLeftPaddleY] = useState(GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2);
  const [rightPaddleY, setRightPaddleY] = useState(GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2);
  const [ballPosition, setBallPosition] = useState({ x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2});
  const [ballVelocity, setBallVelocity] = useState({ x: 0, y: 0 });
  const [leftScore, setLeftScore] = useState(0);
  const [rightScore, setRightScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [level, setLevel] = useState(1);
  const [countdown, setCountdown] = useState(COUNTDOWN_DURATION);
  const [ballSpeed, setBallSpeed] = useState(INITIAL_BALL_SPEED);
  const [shouldIncrementLevel, setShouldIncrementLevel] = useState(false);
  const [paddleHeight, setPaddleHeight] = useState(PADDLE_HEIGHT);
  const [leftLives, setLeftLives] = useState(INITIAL_LIVES);
  const [rightLives, setRightLives] = useState(INITIAL_LIVES);
  const [gameOver, setGameOver] = useState(false);
  const [loser, setLoser] = useState<'Player 1' | 'Player 2' | null>(null);
  const [leftBounceMessage, setLeftBounceMessage] = useState('');
  const [rightBounceMessage, setRightBounceMessage] = useState('');
  const [leftPlayerImage, setLeftPlayerImage] = useState('/images/player1.webp');
  const [rightPlayerImage, setRightPlayerImage] = useState('/images/player2.webp');

  const gameLoopRef = useRef<number>();
  const keysPressed = useRef<Set<string>>(new Set());
  const lastScoreTimeRef = useRef(0);

  const resetBall = () => {
    setBallPosition({ 
      x: GAME_WIDTH / 2,
      y: GAME_HEIGHT / 2
    });
    setBallVelocity({ x: 0, y: 0 });
    setGameStarted(false);
  };

  const startGame = () => {
    if (!gameStarted) {
      const angle = (Math.random() - 0.5) * Math.PI / 2;
      setBallVelocity({
        x: ballSpeed * Math.cos(angle) * (Math.random() > 0.5 ? 1 : -1),
        y: ballSpeed * Math.sin(angle)
      });
      setGameStarted(true);
    }
  };

  const calculateNewVelocity = (paddleY: number, ballY: number, isLeftPaddle: boolean) => {
    const relativeIntersectY = (paddleY + (PADDLE_HEIGHT / 2)) - ballY;
    const normalizedRelativeIntersectionY = relativeIntersectY / (PADDLE_HEIGHT / 2);
    const bounceAngle = normalizedRelativeIntersectionY * (Math.PI / 4);

    return {
      x: ballSpeed * Math.cos(bounceAngle) * (isLeftPaddle ? 1 : -1),
      y: -ballSpeed * Math.sin(bounceAngle)
    };
  };

  const getRandomMessage = useCallback(() => {
    return BOUNCE_MESSAGES[Math.floor(Math.random() * BOUNCE_MESSAGES.length)];
  }, []);

  const showBounceMessage = useCallback((isLeft: boolean) => {
    const message = getRandomMessage();
    if (isLeft) {
      setLeftBounceMessage(message);
      setTimeout(() => setLeftBounceMessage(''), 2000); // Message disappears after 2 seconds
    } else {
      setRightBounceMessage(message);
      setTimeout(() => setRightBounceMessage(''), 2000);
    }
  }, [getRandomMessage]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key.toLowerCase());
      if (e.key === ' ') startGame();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const updateGameState = (time: number) => {
      // Update paddle positions
      if (keysPressed.current.has('q') && leftPaddleY > 0) {
        setLeftPaddleY(prev => Math.max(prev - PADDLE_SPEED, 0));
      }
      if (keysPressed.current.has('a') && leftPaddleY < GAME_HEIGHT - PADDLE_HEIGHT) {
        setLeftPaddleY(prev => Math.min(prev + PADDLE_SPEED, GAME_HEIGHT - PADDLE_HEIGHT));
      }
      if (keysPressed.current.has('p') && rightPaddleY > 0) {
        setRightPaddleY(prev => Math.max(prev - PADDLE_SPEED, 0));
      }
      if (keysPressed.current.has('l') && rightPaddleY < GAME_HEIGHT - PADDLE_HEIGHT) {
        setRightPaddleY(prev => Math.min(prev + PADDLE_SPEED, GAME_HEIGHT - PADDLE_HEIGHT));
      }

      if (gameStarted) {
        setCountdown(prev => {
          const newCountdown = prev - 1/60; // Assuming 60 FPS
          if (newCountdown <= 0) {
            setShouldIncrementLevel(true);
            return COUNTDOWN_DURATION;
          }
          return newCountdown;
        });

        // Move level and difficulty adjustment logic here
        if (countdown <= 0) {
          setLevel(prevLevel => {
            const newLevel = prevLevel + 1;
            setBallSpeed(prevSpeed => prevSpeed * SPEED_INCREASE_FACTOR);
            if (newLevel % 3 === 0) {
              setLeftPaddleY(prev => prev * PADDLE_REDUCTION_FACTOR);
              setRightPaddleY(prev => prev * PADDLE_REDUCTION_FACTOR);
            }
            return newLevel;
          });
        }

        setBallPosition(prev => {
          let newX = prev.x + ballVelocity.x;
          let newY = prev.y + ballVelocity.y;
          let newVelocity = { ...ballVelocity };

          // Ball collision with top and bottom walls
          if (newY <= 0 || newY >= GAME_HEIGHT - BALL_SIZE) {
            newVelocity.y = -newVelocity.y;
            newY = newY <= 0 ? 0 : GAME_HEIGHT - BALL_SIZE;
            setBallVelocity(newVelocity);
          }

          // Ball collision with left paddle
          if (
            newX <= PADDLE_WIDTH &&
            newY + BALL_SIZE > leftPaddleY &&
            newY < leftPaddleY + PADDLE_HEIGHT &&
            ballVelocity.x < 0
          ) {
            const newVelocity = calculateNewVelocity(leftPaddleY, newY + BALL_SIZE / 2, true);
            setBallVelocity(newVelocity);
            newX = PADDLE_WIDTH;
            showBounceMessage(true);
          }

          // Ball collision with right paddle
          if (
            newX + BALL_SIZE >= GAME_WIDTH - PADDLE_WIDTH &&
            newY + BALL_SIZE > rightPaddleY &&
            newY < rightPaddleY + PADDLE_HEIGHT &&
            ballVelocity.x > 0
          ) {
            const newVelocity = calculateNewVelocity(rightPaddleY, newY + BALL_SIZE / 2, false);
            setBallVelocity(newVelocity);
            newX = GAME_WIDTH - PADDLE_WIDTH - BALL_SIZE;
            showBounceMessage(false);
          }

          // Scoring
          if (newX < 0 && time - lastScoreTimeRef.current > 1000) {
            setRightScore(s => s + 1);
            setLeftLives(lives => {
              const newLives = lives - 1;
              if (newLives === 0) {
                setGameOver(true);
                setLoser('Player 1');
                setLeftPlayerImage('/images/loosing.webp');
                setRightPlayerImage('/images/winning.webp');
              }
              return newLives;
            });
            lastScoreTimeRef.current = time;
            resetBall();
            startGame(); // Immediately start a new round
            return { 
              x: GAME_WIDTH / 2,
              y: GAME_HEIGHT / 2
            };
          } else if (newX + BALL_SIZE > GAME_WIDTH && time - lastScoreTimeRef.current > 1000) {
            setLeftScore(s => s + 1);
            setRightLives(lives => {
              const newLives = lives - 1;
              if (newLives === 0) {
                setGameOver(true);
                setLoser('Player 2');
                setLeftPlayerImage('/images/winning.webp');
                setRightPlayerImage('/images/loosing.webp');
              }
              return newLives;
            });
            lastScoreTimeRef.current = time;
            resetBall();
            startGame(); // Immediately start a new round
            return { 
              x: GAME_WIDTH / 2,
              y: GAME_HEIGHT / 2
            };
          }

          return { x: newX, y: newY };
        });
      }
    };

    const gameLoop = (time: number) => {
      updateGameState(time);
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameStarted, ballVelocity, leftPaddleY, rightPaddleY, ballSpeed, countdown, showBounceMessage]);

  // New effect to handle level increment and difficulty adjustments
  useEffect(() => {
    if (shouldIncrementLevel) {
      setLevel(prevLevel => {
        const newLevel = prevLevel + 1;
        
        if (newLevel % 3 === 0) {
          // Every 3rd level, shorten paddles and reset ball speed
          setPaddleHeight(prev => prev * PADDLE_REDUCTION_FACTOR);
          setBallSpeed(INITIAL_BALL_SPEED);
        } else {
          // On other levels, increase ball speed
          setBallSpeed(prevSpeed => prevSpeed * SPEED_INCREASE_FACTOR);
        }
        
        return newLevel;
      });
      setShouldIncrementLevel(false);
    }
  }, [shouldIncrementLevel]);

  return (
    <div className={styles.gameWrapper}>
      <div className={styles.playerImageLeft}>
        <Image src={leftPlayerImage} alt="Player 1" width={150} height={150} />
        <div className={styles.bounceMessage}>{leftBounceMessage}</div>
      </div>
      <div className={styles.gameContainer}>
        <div className={styles.scoreContainer}>
          <ScoreCounter score={leftScore} isLeft={true} />
          <div className={styles.scoreSeparator}>:</div>
          <ScoreCounter score={rightScore} isLeft={false} />
        </div>
        <div className={styles.gameWindow}>
          <div className={styles.centerLine}></div>
          <div className={styles.centerCircle}></div>
          <Paddle position={leftPaddleY} isPlayer={true} height={paddleHeight} />
          <Paddle position={rightPaddleY} isPlayer={false} height={paddleHeight} />
          <Ball position={ballPosition} />
          {!gameStarted && !gameOver && (
            <div className={styles.startMessage}>
              Press Space to Start
            </div>
          )}
          {gameOver && (
            <div className={styles.gameOverContainer}>
              <div className={styles.gameOverMessage}>
                {loser} lost the argument!
              </div>
              <div className={styles.gameOverSubtext}>
                The ball is at his end...
              </div>
            </div>
          )}
        </div>
        <div className={styles.playerInfo}>
          <div className={styles.playerColumn}>
            <div className={styles.playerName}>Player 1</div>
            <PlayerLives lives={leftLives} />
          </div>
          <div className={styles.playerColumn}>
            <div className={styles.playerName}>Player 2</div>
            <PlayerLives lives={rightLives} />
          </div>
        </div>
        <div className={styles.gameStats}>
          Level: {level} | Time: {Math.ceil(countdown)} | Speed: {ballSpeed.toFixed(2)} | Paddle: {paddleHeight.toFixed(0)}
        </div>
        <div className={styles.instructionsContainer}>
          <div className={styles.instructionText}>
            Player 1: Use Q and A keys
          </div>
          <div className={styles.instructionText}>
            Player 2: Use P and L keys
          </div>
        </div>
      </div>
      <div className={styles.playerImageRight}>
        <Image src={rightPlayerImage} alt="Player 2" width={150} height={150} />
        <div className={styles.bounceMessage}>{rightBounceMessage}</div>
      </div>
    </div>
  );
};

export default Game;