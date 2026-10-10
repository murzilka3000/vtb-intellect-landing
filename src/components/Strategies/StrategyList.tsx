"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { strategies } from "@/data/strategies";
import styles from "./Strategies.module.scss";

const SHRINK = 0.035;

export default function StrategyList() {
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const cards = Array.from(list.children) as HTMLElement[];
    let raf = 0;

    const update = () => {
      raf = 0;
      const cover = cards.map((card, i) => {
        if (i === 0) return 0;
        const range = cards[i - 1].offsetHeight || 1;
        const stuckAt = parseFloat(getComputedStyle(card).top) || 0;
        const distance = card.getBoundingClientRect().top - stuckAt;
        return Math.min(1, Math.max(0, 1 - distance / range));
      });

      cards.forEach((card, i) => {
        const covered = cover.slice(i + 1).reduce((sum, value) => sum + value, 0);
        card.style.setProperty("--scale", String(1 - SHRINK * covered));
      });
    };

    const request = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);

    return () => {
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <ul ref={listRef} className={styles.list}>
      {strategies.map((item, i) => (
        <li
          key={item.id}
          className={`${styles.card} ${styles[item.variant]}`}
          style={{ "--i": i } as React.CSSProperties}
        >
          <div className={styles.main}>
            <span className={styles.num}>{item.num}</span>
            <div className={styles.body}>
              <span className={styles.tag}>{item.tag}</span>
              <h3 className={styles.cardTitle}>{item.title}</h3>
              <p className={styles.cardText}>{item.text}</p>
            </div>
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
  );
}
