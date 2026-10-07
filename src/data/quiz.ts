import type { StrategyId } from "./strategies";

export type QuizOption = {
  title: string;
  text: string;
  scores: Partial<Record<StrategyId, number>>;
};

export type QuizQuestion = {
  question: string;
  options: QuizOption[];
};

const careful = { conservative: 2, eternal: 1 };
const balanced = { eternal: 2, euler: 1, ai: 1 };
const bold = { euler: 2, ai: 2 };

export const quiz: QuizQuestion[] = [
  {
    question: "Какой у вас опыт\nинвестирования?",
    options: [
      { title: "Только начинаю", text: "Хочу разобраться и начать с малого", scores: careful },
      { title: "Есть опыт", text: "Понимаю рынки и могу оценить риски", scores: balanced },
      { title: "Уверенный инвестор", text: "Самостоятельно собираю и меняю портфель", scores: bold },
    ],
  },
  {
    question: "Как вы относитесь\nк колебаниям рынка?",
    options: [
      { title: "Избегаю просадок", text: "Даже небольшое снижение заставляет меня сокращать риск", scores: careful },
      { title: "Спокойно", text: "Снижения — нормальная часть рынка, я могу подождать", scores: balanced },
      { title: "Комфортно с риском", text: "Сильные колебания приемлемы ради высокой потенциальной доходности", scores: bold },
    ],
  },
  {
    question: "На какой срок\nвы готовы инвестировать?",
    options: [
      { title: "1–2 года", text: "Готов ждать, но не слишком долго", scores: careful },
      { title: "2–3 года", text: "Комфортный среднесрочный горизонт", scores: balanced },
      { title: "Более 5 лет", text: "Смотрю на инвестиции как на долгосрочный капитал", scores: bold },
    ],
  },
  {
    question: "Что для вас важнее\nв инвестировании?",
    options: [
      {
        title: "Сохранение капитала",
        text: "Главное — не потерять деньги и обогнать инфляцию, даже ценой низкой доходности",
        scores: careful,
      },
      {
        title: "Сбалансированность",
        text: "Я хочу, чтобы портфель работал в любую погоду,\nбез экстремальных скачков",
        scores: balanced,
      },
      {
        title: "Максимальная доходность",
        text: "Я готов к высоким рискам ради возможности значительно обогнать рынок",
        scores: bold,
      },
    ],
  },
  {
    question: "Кому вы готовы\nдоверить решения?",
    options: [
      { title: "Экспертам", text: "Мне важно понимать логику решений аналитиков", scores: { euler: 3 } },
      { title: "Правилам стратегии", text: "Предпочитаю прозрачную и понятную систему", scores: { eternal: 2, conservative: 1 } },
      { title: "Алгоритмам", text: "Доверяю данным, моделям и количественному анализу", scores: { ai: 3 } },
    ],
  },
];

const priority: StrategyId[] = ["conservative", "eternal", "euler", "ai"];

export function getResult(answers: number[]): StrategyId {
  const total: Record<StrategyId, number> = { conservative: 0, eternal: 0, euler: 0, ai: 0 };

  answers.forEach((optionIndex, questionIndex) => {
    const scores = quiz[questionIndex]?.options[optionIndex]?.scores ?? {};
    for (const [id, value] of Object.entries(scores) as [StrategyId, number][]) {
      total[id] += value;
    }
  });

  return priority.reduce((best, id) => (total[id] > total[best] ? id : best), priority[0]);
}
