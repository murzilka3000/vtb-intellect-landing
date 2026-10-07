import Image from "next/image";
import { strategies } from "@/data/strategies";
import styles from "./Strategies.module.scss";

export default function Strategies() {
  return (
    <section className={styles.strategies}>
      <div className={`${styles.blob} ${styles.blobRight}`} aria-hidden="true" />
      <div className={`${styles.blob} ${styles.blobLeft}`} aria-hidden="true" />

      <div className={styles.container}>
        <p className={styles.eyebrow}>Четыре стратегии — четыре характера</p>
        <h2 className={styles.title}>Какой подход ваш?</h2>
        <p className={styles.subtitle}>
          У каждой стратегии своя логика, познакомьтесь с&nbsp;ними
        </p>

        <ul className={styles.list}>
          {strategies.map((item, i) => (
            <li
              key={item.id}
              className={`${styles.card} ${styles[item.variant]}`}
              style={{ "--i": i } as React.CSSProperties}
            >
              <span className={styles.num}>{item.num}</span>
              <div className={styles.body}>
                <span className={styles.tag}>{item.tag}</span>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.cardText}>{item.text}</p>
              </div>
              <div className={styles.image}>
                <Image
                  src={item.image}
                  alt=""
                  fill
                  sizes="(max-width: 767px) 161px, 260px"
                  className={styles.imageImg}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
