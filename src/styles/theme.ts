export const theme = {
  colors: {
    background: "var(--color-background)",
    surface: "var(--color-surface)",
    surfaceElevated: "var(--color-surface-elevated)",
    border: "var(--color-border)",
    borderStrong: "var(--color-border-strong)",

    text: "var(--color-text)",
    textSecondary: "var(--color-text-secondary)",

    brand: "var(--color-brand)",
    brandHover: "var(--color-brand-hover)",
    petroleum: "var(--color-petroleum)",

    primary: "var(--color-primary)",
    primaryHover: "var(--color-primary-hover)",
    primarySoft: "var(--color-primary-soft)",

    income: "var(--color-income)",
    incomeSoft: "var(--color-income-soft)",

    expense: "var(--color-expense)",
    expenseSoft: "var(--color-expense-soft)",

    success: "var(--color-success)",
    danger: "var(--color-danger)",
    warning: "var(--color-warning)",
    warningSoft: "var(--color-warning-soft)",

    overlay: "var(--color-overlay)",
  },

  radius: {
    sm: "8px",
    md: "12px",
    lg: "18px",
    xl: "24px",
  },

  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
  },

  layout: {
    sidebarWidth: "240px",
    contentMaxWidth: "1600px",
  },

  shadow: {
    card: "var(--shadow-card)",
    overlay: "var(--shadow-overlay)",
  },
} as const;
