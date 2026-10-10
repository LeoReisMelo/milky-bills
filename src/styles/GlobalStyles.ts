import { createGlobalStyle } from "styled-components";

export const GlobalStyles = createGlobalStyle`
*,
*::before,
*::after {
box-sizing: border-box;
}

:root {
font-family: "Plus Jakarta Sans", system-ui, sans-serif;
font-synthesis: none;
text-rendering: optimizeLegibility;
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale;

/* Identidade da marca */
--color-brand: #de5a96;
--color-brand-hover: #db085d;
--color-brand-soft: rgba(222, 90, 150, 0.12);
--color-brand-border: rgba(222, 90, 150, 0.28);
--color-brand-glow: rgba(222, 90, 150, 0.10);
--color-petroleum: #153b46;

/* Estados financeiros */
--color-income: #15803d;
--color-income-soft: rgba(21, 128, 61, 0.12);

--color-expense: #dc2626;
--color-expense-soft: rgba(220, 38, 38, 0.10);

--color-warning: #a16207;
--color-warning-soft: rgba(161, 98, 7, 0.12);

/* Compatibilidade com componentes existentes */
--color-success: var(--color-income);
--color-danger: var(--color-expense);
--color-positive: var(--color-income);
--color-negative: var(--color-expense);
--color-overlay: rgba(32, 20, 29, 0.56);

}

:root,
[data-theme="dark"] {
color-scheme: dark;
/* Superfícies */
--color-background: #181119;
--color-surface: #211722;
--color-surface-elevated: #2d202e;
--color-elevated: var(--color-surface-elevated);

/* Bordas */
--color-border: #443044;
--color-border-strong: #60405a;

/* Tipografia */
--color-text: #fff4fa;
--color-text-secondary: #c7afbf;

/* Cor de ação: rosa */
--color-primary: #f18ab8;
--color-primary-hover: #ffafd0;
--color-primary-soft: rgba(241, 138, 184, 0.14);
--color-primary-border: rgba(241, 138, 184, 0.30);
--color-primary-glow: rgba(241, 138, 184, 0.12);

/* Estados financeiros */
--color-income: #65d6a0;
--color-income-soft: rgba(101, 214, 160, 0.13);

--color-expense: #ff8298;
--color-expense-soft: rgba(255, 130, 152, 0.13);

--color-warning: #ffd080;
--color-warning-soft: rgba(255, 208, 128, 0.13);

/* Gráficos */
--color-chart-income: #65d6a0;
--color-chart-expense: #ff8298;

/* Sombras */
--shadow-card: 0 8px 30px rgba(0, 0, 0, 0.20);
--shadow-overlay: 0 24px 80px rgba(0, 0, 0, 0.44);
}

[data-theme="light"] {
color-scheme: light;
/* Superfícies */
--color-background: #FFFFFF;
--color-surface: #FFFFFF;
--color-surface-elevated: #FFF0F6;
--color-elevated: var(--color-surface-elevated);

/* Bordas */
--color-border: #F0D9E5;
--color-border-strong: #E3B9CF;

/* Tipografia */
--color-text: #392332;
--color-text-secondary: #796172;

/* Cor de ação: rosa */
--color-primary: #de5a96;
--color-primary-hover: #db085d;
--color-primary-soft: rgba(222, 90, 150, 0.10);
--color-primary-border: rgba(222, 90, 150, 0.24);
--color-primary-glow: rgba(222, 90, 150, 0.08);

/* Estados financeiros */
--color-income: #16794a;
--color-income-soft: rgba(22, 121, 74, 0.09);

--color-expense: #c62845;
--color-expense-soft: rgba(198, 40, 69, 0.08);

--color-warning: #95600c;
--color-warning-soft: rgba(149, 96, 12, 0.09);

/* Gráficos */
--color-chart-income: #16794a;
--color-chart-expense: #c62845;

/* Sombras */
--shadow-card: 0 4px 20px rgba(110, 48, 80, 0.06);
--shadow-overlay: 0 20px 60px rgba(67, 30, 51, 0.18);
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
font-family: "Plus Jakarta Sans", system-ui, sans-serif;
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
font-family: "Plus Jakarta Sans", system-ui, sans-serif;
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
