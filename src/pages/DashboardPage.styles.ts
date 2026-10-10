import styled from "styled-components";

export type BalanceKindValue = "positive" | "negative" | "neutral";
type StatKind = "income" | "expense" | "available" | "balance";
type InsightStatus = "positive" | "negative" | "neutral";

export const DashboardContainer = styled.div`
  display: grid;
  gap: 24px;
  min-width: 0;
  width: 100%;
`;

export const DashboardHeading = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;

  > div {
    min-width: 0;
  }

  h2 {
    margin: 0 0 6px;
    font-size: clamp(20px, 2vw, 26px);
    letter-spacing: -0.7px;
    line-height: 1.25;
  }

  p {
    margin: 0;
    color: var(--color-text-secondary);
    font-size: 13px;
    line-height: 1.6;
  }

  @media (max-width: 480px) {
    align-items: stretch;
    flex-direction: column;
  }
`;

export const PeriodSelector = styled.label`
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex-shrink: 0;
  min-height: 38px;
  padding: 0 11px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-surface);
  color: var(--color-text-secondary);

  svg {
    flex-shrink: 0;
  }

  select {
    width: auto;
    max-width: 180px;
    min-width: 0;
    border: 0;
    outline: 0;
    background: transparent;
    color: var(--color-text);
    font: inherit;
    font-size: 12px;
    cursor: pointer;
  }

  select:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 3px;
    border-radius: 4px;
  }

  option {
    background: var(--color-surface);
    color: var(--color-text);
  }

  @media (max-width: 480px) {
    align-self: flex-start;
  }
`;

export const BalanceCard = styled.section`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  min-height: 210px;
  padding: clamp(24px, 4vw, 40px);
  overflow: hidden;
  border: 1px solid var(--color-primary-border);
  border-radius: 20px;
  background:
    radial-gradient(
      circle at 90% 10%,
      var(--color-primary-glow),
      transparent 42%
    ),
    var(--color-surface);

  .balance-label {
    margin: 0 0 14px;
    color: var(--color-text-secondary);
    font-size: 13px;
  }

  h2 {
    margin: 0 0 12px;
    font-size: clamp(30px, 4vw, 42px);
    font-weight: 750;
    letter-spacing: -1.5px;
    overflow-wrap: anywhere;
    font-variant-numeric: tabular-nums;
  }

  .balance-caption {
    color: var(--color-text-secondary);
    font-size: 12px;
  }

  @media (max-width: 480px) {
    min-height: 170px;
    padding: 22px;
  }
`;

export const BalanceSymbol = styled.div`
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  flex-shrink: 0;
  border: 1px solid var(--color-primary-border);
  border-radius: 18px;
  background: var(--color-primary-soft);
  color: var(--color-primary);

  @media (max-width: 480px) {
    width: 48px;
    height: 48px;

    svg {
      width: 24px;
      height: 24px;
    }
  }
`;

export const StatsGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  align-items: stretch;
  gap: 16px;
  min-width: 0;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 560px) {
    grid-template-columns: minmax(0, 1fr);
    gap: 12px;
  }
`;

export const StatCardContainer = styled.article<{ $kind: StatKind }>`
  display: flex;
  align-items: stretch;
  min-width: 0;
  padding: 20px;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  background: var(--color-surface);
  transition:
    border-color 160ms ease,
    transform 160ms ease;

  &:hover {
    border-color: var(--color-border-strong);
    transform: translateY(-2px);
  }

  .stat-card-content {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
  }

  .stat-card-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 18px;

    p {
      margin: 0;
      color: var(--color-text-secondary);
      font-size: 12px;
      font-weight: 500;
    }

    svg {
      flex-shrink: 0;
    }
  }

  .stat-card-heading svg {
    color: ${({ $kind }) => {
      if ($kind === "income") return "var(--color-income)";
      if ($kind === "expense") return "var(--color-expense)";
      return "var(--color-primary)";
    }};
  }

  .stat-value,
  h3 {
    margin: 0;
    font-size: clamp(18px, 1.65vw, 25px);
    font-weight: 700;
    letter-spacing: -0.7px;
    line-height: 1.3;
    overflow-wrap: anywhere;
    font-variant-numeric: tabular-nums;
  }

  h3[data-value-kind="income"] {
    color: var(--color-income);
  }

  h3[data-value-kind="expense"] {
    color: var(--color-expense);
  }

  h3[data-value-kind="positive"] {
    color: var(--color-income);
  }

  h3[data-value-kind="negative"] {
    color: var(--color-expense);
  }

  h3[data-value-kind="neutral"] {
    color: var(--color-text);
  }

  .stat-card-content > span {
    display: block;
    margin-top: 9px;
    color: var(--color-text-secondary);
    font-size: 11px;
    line-height: 1.5;
    overflow-wrap: anywhere;
  }

  @media (max-width: 560px) {
    padding: 18px;

    .stat-card-heading {
      margin-bottom: 12px;
    }

    h3 {
      font-size: clamp(21px, 6vw, 26px);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;

    &:hover {
      transform: none;
    }
  }
`;

export const Panel = styled.section`
  min-width: 0;
  overflow: visible;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  background: var(--color-surface);
`;

export const PanelHeading = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 14px;
  padding: 22px 22px 18px;
  border-bottom: 1px solid var(--color-border);

  h2,
  h3 {
    margin: 0 0 6px;
    font-size: 15px;
    font-weight: 700;
  }

  p {
    margin: 0;
    color: var(--color-text-secondary);
    font-size: 12px;
    line-height: 1.5;
  }

  @media (max-width: 480px) {
    padding: 18px 16px 15px;
  }
`;

export const MiddleCardsGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr);
  align-items: stretch;
  gap: 20px;
  min-width: 0;

  > section {
    min-width: 0;
    height: 100%;
  }

  @media (max-width: 900px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const DashboardBottomGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: stretch;
  gap: 20px;
  min-width: 0;

  > section {
    display: flex;
    flex-direction: column;
    min-width: 0;
    height: 100%;
  }

  @media (max-width: 900px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const CashFlowChart = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 18px 22px 22px;

  @media (max-width: 480px) {
    padding: 16px;
  }
`;

export const ChartLegend = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 18px;
  margin-bottom: 20px;
`;

export const ChartLegendItem = styled.span<{ $kind: "income" | "expense" }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-secondary);
  font-size: 11px;

  > span {
    width: 8px;
    height: 8px;
    border-radius: 3px;
    background: ${({ $kind }) =>
      $kind === "income" ? "var(--color-income)" : "var(--color-expense)"};
  }
`;

export const ChartPlot = styled.div`
  position: relative;
  display: flex;
  flex: 1;
  min-height: 220px;
  padding: 0 0 28px;
`;

export const ChartMonths = styled.div`
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
  align-items: stretch;
  width: 100%;
  min-width: 0;
`;

export const ChartMonth = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  min-width: 0;

  .month-label {
    color: var(--color-text-secondary);
    font-size: 11px;
    line-height: 1;
    white-space: nowrap;
  }
`;

export const ChartBars = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 5px;
  width: 100%;
  height: 190px;
  padding: 0 3px;
`;

export const ChartTooltip = styled.div`
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  width: min(24px, 40%);
  height: 100%;

  .tooltip-content {
    position: absolute;
    z-index: 5;
    bottom: calc(100% + 8px);
    left: 50%;
    width: max-content;
    max-width: 190px;
    padding: 8px 10px;
    border: 1px solid var(--color-border);
    border-radius: 8px;
    background: var(--color-surface-elevated, var(--color-surface));
    color: var(--color-text);
    font-size: 11px;
    line-height: 1.4;
    box-shadow: 0 6px 20px rgb(0 0 0 / 12%);
    pointer-events: none;
    opacity: 0;
    transform: translate(-50%, 4px);
    transition:
      opacity 120ms ease,
      transform 120ms ease;
    white-space: nowrap;
  }

  &:hover .tooltip-content,
  &:focus-within .tooltip-content {
    opacity: 1;
    transform: translate(-50%, 0);
  }
`;

export const ChartBar = styled.div<{
  $kind: "income" | "expense";
  $height: number;
}>`
  width: 100%;
  height: ${({ $height }) => `${$height}%`};
  min-height: ${({ $height }) => ($height > 0 ? "3px" : "0")};
  border-radius: 5px 5px 2px 2px;
  background: ${({ $kind }) =>
    $kind === "income" ? "var(--color-income)" : "var(--color-expense)"};
  opacity: 0.9;
  cursor: pointer;
  transition:
    opacity 150ms ease,
    filter 150ms ease;

  &:hover {
    opacity: 1;
    filter: brightness(1.08);
  }
`;

export const InsightCard = styled.section<{ $status: InsightStatus }>`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1.25rem;

  width: 100%;
  min-width: 0;
  min-height: 100%;
  padding: 1.5rem;

  border: 1px solid var(--color-border);
  border-radius: 16px;

  background: var(--color-surface);
  color: var(--color-text);

  transition:
    border-color 180ms ease,
    background-color 180ms ease,
    color 180ms ease;

  .insight-card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .insight-period {
    color: var(--color-text-secondary);
    font-size: 0.75rem;
  }

  @media (max-width: 480px) {
    padding: 1.25rem;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

export const InsightEyebrow = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.2px;
`;

export const InsightHeading = styled.h3`
  margin: 0;
  font-size: clamp(23px, 2.2vw, 30px);
  font-weight: 750;
  line-height: 1.3;
  letter-spacing: -0.8px;
  overflow-wrap: anywhere;
`;

export const InsightExpense = styled.p`
  margin: 18px 0 0;
  font-size: 12px;
  line-height: 1.7;
  opacity: 0.78;

  strong {
    font-weight: 750;
    opacity: 1;
  }
`;

export const InsightMessage = styled.p`
  margin: 14px 0 0;
  font-size: 12px;
  line-height: 1.7;
  opacity: 0.68;
`;

export const InsightProgress = styled.div`
  display: grid;
  gap: 12px;

  .insight-progress-label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    font-size: 11px;
    opacity: 0.8;

    strong {
      font-size: 12px;
      font-weight: 750;
    }
  }
`;

export const InsightProgressTrack = styled.div`
  width: 100%;
  height: 7px;
  overflow: hidden;
  border-radius: 999px;
  background: rgb(127 127 127 / 25%);
`;

export const InsightProgressValue = styled.div<{
  $status: InsightStatus;
  $percentage: number;
}>`
  width: ${({ $percentage }) => `${$percentage}%`};
  height: 100%;
  border-radius: inherit;
  background: ${({ $status }) =>
    $status === "positive"
      ? "var(--color-income)"
      : $status === "negative"
        ? "var(--color-expense)"
        : "currentColor"};
  transition:
    width 240ms ease,
    background-color 180ms ease;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

export const TextButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 8px 0;
  border: 0;
  background: transparent;
  color: var(--color-primary);
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    color: var(--color-primary-hover);
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 4px;
    border-radius: 4px;
  }
`;

export const EmptyState = styled.div`
  display: grid;
  place-items: center;
  align-content: center;
  gap: 8px;
  min-height: 160px;
  padding: 28px;
  color: var(--color-text-secondary);
  text-align: center;

  svg {
    color: var(--color-primary);
  }

  strong {
    color: var(--color-text);
    font-size: 14px;
  }

  p {
    margin: 0;
    font-size: 13px;
    font-weight: 600;
  }

  span {
    font-size: 12px;
    line-height: 1.6;
  }
`;

export const RecentTransactionsContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 8px 20px 16px;
  min-width: 0;

  .recent-transaction {
    display: grid;
    grid-template-columns: 40px minmax(0, 1fr) auto auto;
    align-items: center;
    gap: 12px;
    min-width: 0;
    padding: 15px 0;
    border-bottom: 1px solid var(--color-border);
  }

  .recent-transaction:last-child {
    border-bottom: none;
  }

  .transaction-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    flex-shrink: 0;
    border-radius: 12px;
    background: var(--color-background, var(--color-surface));
    border: 1px solid var(--color-border);
    color: var(--color-primary);
  }

  .transaction-description {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 5px;
    min-width: 0;
  }

  .transaction-description strong {
    display: block;
    overflow: hidden;
    color: var(--color-text);
    font-size: 13px;
    font-weight: 600;
    line-height: 1.4;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .transaction-description span {
    display: block;
    overflow: hidden;
    color: var(--color-text-secondary);
    font-size: 11px;
    line-height: 1.5;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .transaction-amount {
    font-size: 13px;
    font-weight: 700;
    text-align: right;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
  }

  .transaction-amount.income {
    color: var(--color-income);
  }

  .transaction-amount.expense {
    color: var(--color-expense);
  }

  .transaction-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 4px;
  }

  .transaction-actions button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    padding: 0;
    border: 1px solid transparent;
    border-radius: 8px;
    background: transparent;
    color: var(--color-text-secondary);
    cursor: pointer;
  }

  .transaction-actions button:hover {
    border-color: var(--color-border);
    background: var(--color-background, var(--color-surface));
    color: var(--color-text);
  }

  button:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  @media (max-width: 560px) {
    padding-inline: 14px;

    .recent-transaction {
      grid-template-columns: 34px minmax(0, 1fr) auto;
      gap: 9px;
    }

    .transaction-icon {
      width: 34px;
      height: 34px;
    }

    .transaction-amount {
      font-size: 12px;
    }

    .transaction-actions {
      grid-column: 2 / -1;
      justify-content: flex-start;
    }
  }
`;

export const QuickActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  padding: 20px;

  .quick-action {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
    min-height: 56px;
    padding: 14px;
    border: 1px solid var(--color-border);
    border-radius: 12px;
    background: var(--color-surface);
    color: var(--color-text);
    font: inherit;
    font-size: 12px;
    font-weight: 600;
    text-align: left;
    cursor: pointer;
    transition:
      border-color 160ms ease,
      background-color 160ms ease;
  }

  .quick-action svg {
    flex-shrink: 0;
    color: var(--color-primary);
  }

  .quick-action span {
    min-width: 0;
    line-height: 1.4;
  }

  .quick-action:hover {
    border-color: var(--color-primary);
    background: var(--color-background, var(--color-surface));
  }

  .quick-action:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  @media (max-width: 420px) {
    gap: 8px;
    padding: 16px;

    .quick-action {
      gap: 7px;
      min-height: 50px;
      padding: 10px;
      font-size: 11px;
    }
  }
`;

export const BillAlert = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin: 0 20px 20px;
  padding: 16px;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-background, var(--color-surface));

  > svg {
    display: block;
    flex: 0 0 20px;
    margin-top: 1px;
  }

  > div {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 5px;
    min-width: 0;
  }

  strong {
    display: block;
    margin: 0;
    color: var(--color-text);
    font-size: 12px;
    font-weight: 650;
    line-height: 1.5;
    overflow-wrap: anywhere;
  }

  p {
    display: block;
    margin: 0;
    color: var(--color-text-secondary);
    font-size: 11px;
    font-weight: 400;
    line-height: 1.6;
    overflow-wrap: anywhere;
  }

  &.success {
    border-color: color-mix(
      in srgb,
      var(--color-income) 30%,
      var(--color-border)
    );

    > svg {
      color: var(--color-income);
    }
  }

  &.warning {
    border-color: color-mix(in srgb, #eab308 40%, var(--color-border));

    > svg {
      color: #eab308;
    }
  }

  &.urgent {
    border-color: color-mix(
      in srgb,
      var(--color-expense) 35%,
      var(--color-border)
    );

    > svg {
      color: var(--color-expense);
    }
  }

  @media (max-width: 420px) {
    gap: 10px;
    margin: 0 16px 16px;
    padding: 13px;
  }
`;