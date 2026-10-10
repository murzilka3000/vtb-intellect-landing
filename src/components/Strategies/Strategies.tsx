import styles from "./Strategies.module.scss";
import StrategyList from "./StrategyList";

export default function Strategies() {
  return (
    <section className={styles.strategies}>
      <div className={`${styles.blob} ${styles.blobRight}`} aria-hidden="true" />
      <div className={`${styles.blob} ${styles.blobLeft}`} aria-hidden="true" />

      <div className={styles.container}>
        <p className={styles.eyebrow}>Четыре стратегии&nbsp;— четыре характера</p>
        <h2 className={styles.title}>Какой подход ваш?</h2>
        <p className={styles.subtitle}>
          У&nbsp;каждой стратегии своя логика, познакомьтесь с&nbsp;ними
        </p>

        <StrategyList />
      </div>
    </section>
  );
}
