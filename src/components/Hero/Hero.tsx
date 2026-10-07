import Image from "next/image";
import styles from "./Hero.module.scss";

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.bg} aria-hidden="true">
        <div className={styles.video}>
          <Image
            src="/images/hero/hero-bg.jpg"
            alt=""
            fill
            priority
            sizes="120vw"
            className={styles.videoMedia}
          />
        </div>
        <div className={styles.tint} />
        <div className={styles.lights} />
        <div className={styles.shade} />
        <div className={`${styles.blob} ${styles.blobTop}`} />
        <div className={`${styles.blob} ${styles.blobBottom}`} />
        <div className={styles.fade} />
      </div>

      <Image
        src="/images/hero/logos.svg"
        alt="ВТБ Мои Инвестиции × Frank Media"
        width={403}
        height={33}
        priority
        className={styles.logo}
      />

      <div className={styles.crystal} aria-hidden="true">
        <div className={styles.glow} />
        <Image
          src="/images/hero/crystal.png"
          alt=""
          fill
          priority
          sizes="(max-width: 767px) 400px, 640px"
          className={styles.crystalImg}
        />
      </div>

      <div className={styles.content}>
        <h1 className={styles.title}>
          <span className={styles.titleLine}>«Интеллект» от ВТБ Мои Инвестиции: стратегия</span>{" "}
          <span className={styles.titleLine}>инвестиций, которая подходит именно вам</span>
        </h1>
        <p className={styles.subtitle}>
          Четыре стратегии. Разные подходы к&nbsp;рынку. Найдите свою.
        </p>
      </div>
    </section>
  );
}
