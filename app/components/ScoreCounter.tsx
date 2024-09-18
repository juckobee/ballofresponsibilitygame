import styles from '../styles/ScoreCounter.module.css';

interface ScoreCounterProps {
  score: number;
  isLeft: boolean;
}

const ScoreCounter: React.FC<ScoreCounterProps> = ({ score, isLeft }) => {
  return (
    <div className={`${styles.scoreCounter} ${isLeft ? styles.left : styles.right}`}>
      {score}
    </div>
  );
};

export default ScoreCounter;