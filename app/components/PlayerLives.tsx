import React from 'react';
import styles from '../styles/Game.module.css';

interface PlayerLivesProps {
  lives: number;
}

const PlayerLives: React.FC<PlayerLivesProps> = ({ lives }) => {
  return (
    <div className={styles.livesContainer}>
      {[...Array(5)].map((_, index) => (
        <div 
          key={index} 
          className={`${styles.life} ${index < lives ? '' : styles.lostLife}`}
        />
      ))}
    </div>
  );
};

export default PlayerLives;