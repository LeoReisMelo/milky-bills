import { createGlobalStyle } from "styled-components";

export const GlobalStyles = createGlobalStyle`
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :root {
    font-family: "Fredoka", system-ui, sans-serif;
    font-synthesis: none;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;

    /* Identidade da marca */
    --color-brand: #163a5f;
    --color-brand-hover: #214f7d;
    --color-petroleum: #153b46;

    /* Estados financeiros */
    --color-income: #15803d;
    --color-income-soft: rgba(21, 128, 61, 0.12);
    --color-expense: #dc2626;
    --color-expense-soft: rgba(220, 38, 38, 0.10);
    --color-warning: #b7791f;
    --color-warning-soft: rgba(183, 121, 31, 0.12);

    /* Compatibilidade com componentes existentes */
    --color-success: var(--color-income);
    --color-danger: var(--color-expense);
    --color-positive: var(--color-income);
    --color-negative: var(--color-expense);
    --color-overlay: rgba(8, 20, 32, 0.55);
  }

  :root,
  [data-theme="dark"] {
    color-scheme: dark;

    --color-background: #0b1520;
    --color-surface: #111f2d;
    --color-surface-elevated: #1a2b3b;
    --color-elevated: var(--color-surface-elevated);

    --color-border: #293b4c;
    --color-border-strong: #405569;

    --color-text: #f1f5f9;
    --color-text-secondary: #a6b6c5;

    --color-primary: #79a9dc;
    --color-primary-hover: #a1c7ed;
    --color-primary-soft: rgba(121, 169, 220, 0.14);
    --color-primary-border: rgba(121, 169, 220, 0.28);
    --color-primary-glow: rgba(121, 169, 220, 0.10);

    --color-income: #4ade80;
    --color-income-soft: rgba(74, 222, 128, 0.12);

    --color-expense: #f87171;
    --color-expense-soft: rgba(248, 113, 113, 0.12);

    --color-warning: #fbbf24;
    --color-warning-soft: rgba(251, 191, 36, 0.12);

    --color-chart-income: #79a9dc;
    --color-chart-expense: #f87171;

    --shadow-card: 0 8px 30px rgba(0, 0, 0, 0.16);
    --shadow-overlay: 0 24px 80px rgba(0, 0, 0, 0.36);
  }

  [data-theme="light"] {
    color-scheme: light;

    --color-background: #f3f6f9;
    --color-surface: #ffffff;
    --color-surface-elevated: #eaf0f5;
    --color-elevated: var(--color-surface-elevated);

    --color-border: #dce5ed;
    --color-border-strong: #c3d1dd;

    --color-text: #153b46;
    --color-text-secondary: #5c7280;

    --color-primary: #214f7d;
    --color-primary-hover: #163a5f;
    --color-primary-soft: rgba(33, 79, 125, 0.09);
    --color-primary-border: rgba(33, 79, 125, 0.20);
    --color-primary-glow: rgba(33, 79, 125, 0.08);

    --color-income: #15803d;
    --color-income-soft: rgba(21, 128, 61, 0.10);

    --color-expense: #dc2626;
    --color-expense-soft: rgba(220, 38, 38, 0.08);

    --color-warning: #a16207;
    --color-warning-soft: rgba(161, 98, 7, 0.10);

    --color-chart-income: #214f7d;
    --color-chart-expense: #dc2626;

    --shadow-card: 0 4px 20px rgba(21, 59, 70, 0.05);
    --shadow-overlay: 0 20px 60px rgba(21, 59, 70, 0.16);
  }

  html {
    min-width: 320px;
    min-height: 100%;
    background: var(--color-background);
    scroll-behavior: smooth;
  }

  body {
    margin: 0;
    min-width: 320px;
    min-height: 100vh;
    background: var(--color-background);
    color: var(--color-text);
    font-family: "Fredoka", system-ui, sans-serif;
    font-size: 14px;
    font-weight: 400;
    line-height: 1.5;
    transition:
      background-color 180ms ease,
      color 180ms ease;
  }

  button,
  input,
  select,
  textarea {
    font: inherit;
  }

  button {
    cursor: pointer;
  }

  button:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }

  button,
  a,
  input,
  select,
  textarea {
    -webkit-tap-highlight-color: transparent;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button:focus-visible,
  a:focus-visible,
  input:focus-visible,
  select:focus-visible,
  textarea:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 3px;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin-top: 0;
    color: var(--color-text);
    font-family: "Fredoka", system-ui, sans-serif;
    font-weight: 600;
    line-height: 1.25;
  }

  p {
    margin-top: 0;
  }

  img,
  svg {
    display: block;
  }

  ::selection {
    color: #ffffff;
    background: var(--color-brand);
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      scroll-behavior: auto !important;
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`;
