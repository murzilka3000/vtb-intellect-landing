import Image from "next/image";
import { CONNECT_URL } from "@/data/strategies";
import styles from "./Final.module.scss";

export default function Final() {
  return (
    <footer className={styles.final}>
      <div className={styles.blob} aria-hidden="true" />
      <div className={styles.image} aria-hidden="true">
        <Image
          src="/images/final/intellect.png"
          alt=""
          fill
          sizes="(max-width: 767px) 411px, 1056px"
          className={styles.imageImg}
        />
      </div>
      <div className={styles.shade} aria-hidden="true" />

      <div className={styles.container}>
        <p className={styles.eyebrow}>У каждого — свой подход</p>
        <h2 className={styles.title}>
          <span>Ваш характер</span>
          <span>Ваша стратегия</span>
        </h2>
        <p className={styles.lead}>
          Познакомьтесь с «Интеллектом»
          <br />в ВТБ Мои Инвестиции
        </p>

        <a href={CONNECT_URL} className={styles.button}>
          Подключить стратегию
        </a>

        <div className={styles.legal}>
          <p className={styles.marking}>
            <span>erid: ...</span>
            <span>Реклама 18+</span>
            <span>Рекламодатель: Банк ВТБ (ПАО), ИНН 7702070139</span>
          </p>
          <p className={styles.disclaimer}>
            Банк ВТБ (ПАО) не&nbsp;гарантирует доходность инвестиций. Не&nbsp;является индивидуальной
            инвестиционной рекомендацией, представленные финансовые инструменты и&nbsp;услуги могут
            не&nbsp;подходить вам. Денежные средства, переданные Банку ВТБ в&nbsp;рамках брокерского
            обслуживания, не&nbsp;подлежат страхованию. Полная информация об&nbsp;условиях, тарифах
            и&nbsp;рисках инвестирования на&nbsp;сайте www.vtb.ru (0+) и&nbsp;в&nbsp;офисах банка.
            Получить полный комплекс услуг можно после заключения брокерского, депозитарного
            и&nbsp;договора инвестиционного консультирования, в&nbsp;том числе дистанционно
            в&nbsp;приложении «ВТБ Мои Инвестиции».
          </p>
        </div>
      </div>
    </footer>
  );
}
