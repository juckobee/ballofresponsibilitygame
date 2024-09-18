import Game from './components/Game';
import styles from './styles/VintageTitle.module.css';
import Image from 'next/image';

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.titleContainer}>
        <div className={styles.ballContainer}>
          <Image
            src="/ball.png"
            alt="Ball"
            width={80}
            height={80}
            className={styles.ballImage}
          />
        </div>
        <h1 className={styles.vintageTitle}>
          <span className={styles.topLine}>Ball of</span>
          <span className={styles.middleLine}>Responsibility</span>
          <span className={styles.bottomLine}>Game</span>
        </h1>
      </div>
      <Game />
    </div>
  );
}