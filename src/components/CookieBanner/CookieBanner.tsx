"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import styles from "./CookieBanner.module.scss";

const STORAGE_KEY = "cookie-consent";

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function readAccepted() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

let dismissed = false;

function getSnapshot() {
  return dismissed || readAccepted();
}

function getServerSnapshot() {
  return true;
}

export default function CookieBanner() {
  const accepted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const accept = () => {
    dismissed = true;
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      dismissed = true;
    }
    listeners.forEach((listener) => listener());
  };

  if (accepted) return null;

  return (
    <div className={styles.banner} role="dialog" aria-label="Использование файлов куки">
      <p className={styles.text}>
        На&nbsp;сайте осуществляется обработка пользовательских данных с&nbsp;использованием куки
        в&nbsp;соответствии с{"\u00a0"}
        <Link href="/cookie-policy" target="_blank" className={styles.link}>
          Политикой об&nbsp;использовании файлов Куки
        </Link>
        . Вы&nbsp;можете запретить сохранение куки в&nbsp;настройках своего браузера.
      </p>
      <button type="button" className={styles.button} onClick={accept}>
        Принять
      </button>
    </div>
  );
}
