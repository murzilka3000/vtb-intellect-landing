"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { getResult, quiz } from "@/data/quiz";
import { CONNECT_URL, strategies } from "@/data/strategies";
import styles from "./Quiz.module.scss";

const NEXT_DELAY = 400;

export default function Quiz() {
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const step = answers.length;
  const isDone = step === quiz.length;
  const current = quiz[step];
  const result = isDone ? strategies.find((s) => s.id === getResult(answers)) : null;

  const choose = (index: number) => {
    if (selected !== null) return;
    setSelected(index);
    window.setTimeout(() => {
      setAnswers((prev) => [...prev, index]);
      setSelected(null);
    }, NEXT_DELAY);
  };

  const restart = () => {
    setAnswers([]);
    setSelected(null);
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section ref={sectionRef} className={`${styles.quiz} ${isDone ? styles.isResult : ""}`}>
      {result ? (
        <>
          <div className={`${styles.blob} ${styles.blobBlue}`} aria-hidden="true" />
          <div className={`${styles.blob} ${styles.blobPink}`} aria-hidden="true" />

          <div key={result.id} className={`${styles.container} ${styles.fade}`}>
            <div className={styles.resultHead}>
              <p className={styles.eyebrow}>Вам подходит</p>
              <h2 className={styles.resultTitle}>{result.title}</h2>
              <p className={styles.resultLead}>{result.result.lead}</p>
            </div>

            <div className={styles.resultImage} aria-hidden="true">
              <Image
                src={result.image}
                alt=""
                fill
                sizes="(max-width: 767px) 300px, 443px"
                className={styles.resultImageImg}
              />
            </div>

            <div className={styles.details}>
              <div className={styles.detailsBlock}>
                <h3 className={styles.detailsTitle}>Почему мы это рекомендуем:</h3>
                <p className={styles.detailsText}>{result.result.why}</p>
              </div>
              <div className={styles.detailsBlock}>
                <h3 className={styles.detailsTitle}>Что внутри:</h3>
                <ul className={styles.detailsText}>
                  {result.result.inside.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className={styles.actions}>
              <a href={CONNECT_URL} className={styles.button}>
                Подключить стратегию
              </a>
              <button type="button" className={styles.secondary} onClick={restart}>
                Пройти ещё раз
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className={`${styles.blob} ${styles.blobQuiz}`} aria-hidden="true" />

          <div className={styles.container}>
            <p className={styles.eyebrow}>Найдите свой подход</p>
            <h2 className={styles.title}>
              <span>Какая стратегия</span>
              <span>вам ближе?</span>
            </h2>
            <p className={styles.subtitle}>Пять вопросов об опыте, целях и отношении к риску</p>

            <div className={styles.grid}>
              <div className={styles.side}>
                <div
                  className={styles.progress}
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={quiz.length}
                  aria-valuenow={step + 1}
                >
                  {quiz.map((_, i) => (
                    <span key={i} className={`${styles.bar} ${i <= step ? styles.barActive : ""}`} />
                  ))}
                </div>

                <div key={step} className={styles.fade}>
                  <p className={styles.counter}>
                    Вопрос {step + 1} / {quiz.length}
                  </p>
                  <h3 className={styles.question}>{current.question}</h3>
                </div>
              </div>

              <div key={step} className={`${styles.options} ${styles.fade}`} role="radiogroup">
                {current.options.map((option, i) => (
                  <button
                    key={option.title}
                    type="button"
                    role="radio"
                    aria-checked={selected === i}
                    className={`${styles.option} ${selected === i ? styles.optionActive : ""}`}
                    onClick={() => choose(i)}
                  >
                    <span className={styles.radio} aria-hidden="true" />
                    <span className={styles.optionBody}>
                      <span className={styles.optionTitle}>{option.title}</span>
                      <span className={styles.optionText}>{option.text}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
