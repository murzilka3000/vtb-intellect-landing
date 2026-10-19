import Link from "next/link";
import type { LegalDocument } from "@/data/legal";
import styles from "./Legal.module.scss";

const URL_PATTERN = /(https?:\/\/[^\s]+?)(?=[.,;:)]*(?:\s|$))/g;

function renderText(text: string) {
  return text.split(URL_PATTERN).map((part, index) =>
    index % 2 === 1 ? (
      <a key={index} href={part} target="_blank" rel="noopener noreferrer">
        {part}
      </a>
    ) : (
      part
    ),
  );
}

export default function Legal({ document }: { document: LegalDocument }) {
  return (
    <main className={styles.page}>
      <div className={styles.blob} aria-hidden="true" />
      <div className={styles.container}>
        <Link href="/" className={styles.back}>
          <span aria-hidden="true">←</span> На главную
        </Link>
        <p className={styles.eyebrow}>Правовая информация</p>
        <h1 className={styles.title}>{document.title}</h1>

        <article className={styles.card}>
          {document.sections.map((section) => (
            <section key={section.num} className={styles.section}>
              <h2 className={styles.heading}>
                {section.num}. {section.title}
              </h2>
              {section.items.map((item) => (
                <p key={item.num} className={styles.item}>
                  <span className={styles.num}>{item.num}</span>
                  <span>{renderText(item.text)}</span>
                </p>
              ))}
            </section>
          ))}
        </article>
      </div>
    </main>
  );
}
