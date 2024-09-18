'use client';

import Image from 'next/image';
import styles from '../styles/Ball.module.css';

const BALL_SIZE = 20;

interface BallProps {
  position: { x: number; y: number };
}

const Ball: React.FC<BallProps> = ({ position }) => {
  return (
    <div
      className={styles.ball}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${BALL_SIZE}px`,
        height: `${BALL_SIZE}px`,
        position: 'absolute',
        transform: 'translate(-50%, -50%)', // Center the ball on its position
      }}
    >
      <Image
        src="/ball.png"
        alt="Ball"
        width={BALL_SIZE}
        height={BALL_SIZE}
        priority
      />
    </div>
  );
};

export default Ball;