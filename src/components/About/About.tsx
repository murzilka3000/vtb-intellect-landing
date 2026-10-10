import styles from "./About.module.scss";

const steps = [
  {
    num: "01",
    title: "Узнаёт вас",
    text: (
      <>
        Опрос об&nbsp;опыте, целях и&nbsp;готовности
        <br />к&nbsp;колебаниям рынка
      </>
    ),
  },
  {
    num: "02",
    title: "Подбирает подход",
    text: (
      <>
        Четыре стратегии от&nbsp;аналитиков
        <br />и&nbsp;на&nbsp;основе алгоритмов
      </>
    ),
  },
  {
    num: "03",
    title: "Объясняет решения",
    text: "Баланс, доходность и\u00a0комментарии экспертов в\u00a0приложении",
  },
];

export default function About() {
  return (
    <section className={styles.about}>
      <div className={styles.blob} aria-hidden="true" />

      <div className={styles.container}>
        <p className={styles.eyebrow}>Не&nbsp;нужно думать как&nbsp;аналитик</p>
        <h2 className={styles.title}>
          <span>Достаточно понимать,</span>
          <span className={styles.accent}>что&nbsp;важно именно вам</span>
        </h2>

        <div className={styles.intro}>
          <p className={styles.lead}>
            Вы&nbsp;— отправная
            <br />
            точка стратегии
          </p>
          <p className={styles.text}>
            Сервис «Интеллект» знакомится с&nbsp;вашими целями, опытом и&nbsp;отношением
            к&nbsp;риску и&nbsp;помогает выбрать инвестиционную стратегию
          </p>
        </div>

        <ol className={styles.steps}>
          {steps.map((step) => (
            <li key={step.num} className={styles.step}>
              <span className={styles.stepNum}>{step.num}</span>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepText}>{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
