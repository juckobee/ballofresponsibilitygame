'use client';

const PADDLE_WIDTH = 10;
const GAME_WIDTH = 600;

interface PaddleProps {
  position: number;
  isPlayer: boolean;
  height: number;
}

const Paddle: React.FC<PaddleProps> = ({ position, isPlayer, height }) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: isPlayer ? 0 : GAME_WIDTH - PADDLE_WIDTH,
        top: position,
        width: PADDLE_WIDTH,
        height: height,
        backgroundColor: 'white',
      }}
    />
  );
};

export default Paddle;