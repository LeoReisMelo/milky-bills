import { useMemo, useState } from "react";
import * as LucideIcons from "lucide-react";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CircleAlert,
  CircleCheck,
  CreditCard,
  Pencil,
  Tags,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { Account, Category, Transaction } from "../db/database";
import { formatMoney } from "../lib/money";
import type { BalanceKindValue } from "./DashboardPage.styles";
import {
  DashboardContainer,
  DashboardHeading,
  EmptyState,
  InsightCard,
  InsightProgress,
  InsightProgressTrack,
  InsightProgressValue,
  MiddleCardsGrid,
  Panel,
  PanelHeading,
  PeriodSelector,
  StatCardContainer,
  StatsGrid,
  TextButton,
  CashFlowChart,
  ChartLegend,
  ChartLegendItem,
  ChartMonth,
  ChartMonths,
  ChartBars,
  ChartBar,
  ChartPlot,
  ChartTooltip,
  InsightExpense,
  InsightEyebrow,
  InsightHeading,
  InsightMessage,
  DashboardBottomGrid,
  RecentTransactionsContent,
  QuickActionsGrid,
  BillAlert,
} from "./DashboardPage.styles";

type Period = "current" | "previous" | "3" | "6" | "12";

interface DashboardPageProps {
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  accountBalances: Map<number, number>;
  totalBalance: number;
  income: number;
  expenses: number;
  onNavigate: (page: "transactions" | "accounts") => void;
  onNewTransaction: () => void;
  onNewAccount: () => void;
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (transaction: Transaction) => void;
}

const PERIODS: { label: string; value: Period }[] = [
  { label: "This month", value: "current" },
  { label: "Last month", value: "previous" },
  { label: "Last 3 months", value: "3" },
  { label: "Last 6 months", value: "6" },
  { label: "Last 12 months", value: "12" },
];

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function localDateKey(date: Date): string {
  return `${monthKey(date)}-${String(date.getDate()).padStart(2, "0")}`;
}

function getMonthOffset(offset: number): string {
  const date = new Date();
  date.setDate(1);
  date.setMonth(date.getMonth() + offset);

  return monthKey(date);
}

function getMonthLabel(key: string): string {
  const [year, month] = key.split("-").map(Number);

  return new Date(year, month - 1, 1).toLocaleDateString("en-US", {
    month: "short",
  });
}

function sumTransactions(
  transactions: Transaction[],
  type: Transaction["type"],
): number {
  return transactions
    .filter((transaction) => transaction.type === type)
    .reduce((sum, transaction) => sum + transaction.amount, 0);
}

function getPeriodRange(period: Period) {
  const today = new Date();

  const endDate =
    period === "previous"
      ? localDateKey(new Date(today.getFullYear(), today.getMonth(), 0))
      : localDateKey(today);

  const months =
    period === "current" || period === "previous" ? 1 : Number(period);

  const startMonth = getMonthOffset(
    (period === "previous" ? -1 : 0) - (months - 1),
  );

  return {
    startDate: `${startMonth}-01`,
    endDate,
    startMonth,
    months,
  };
}

function calculateBalanceAtDate(
  accounts: Account[],
  transactions: Transaction[],
  endDate: string,
): number {
  const eligibleAccounts = accounts.filter(
    (account) => account.createdAt.slice(0, 10) <= endDate,
  );

  const eligibleAccountIds = new Set(
    eligibleAccounts
      .map((account) => account.id)
      .filter((id): id is number => id !== undefined),
  );

  const initialBalance = eligibleAccounts.reduce(
    (total, account) => total + account.initialBalance,
    0,
  );

  const movements = transactions
    .filter((transaction) => transaction.date <= endDate)
    .reduce((total, transaction) => {
      if (transaction.type === "income") {
        const accountId = transaction.accountId;

        if (accountId === undefined || !eligibleAccountIds.has(accountId)) {
          return total;
        }

        return total + transaction.amount;
      }

      if (transaction.type === "expense") {
        // Compras no cartão reduzem o saldo consolidado,
        // mas não alteram o saldo bancário.
        if (transaction.creditCardId !== undefined) {
          return total - transaction.amount;
        }

        const accountId = transaction.accountId;

        if (accountId === undefined || !eligibleAccountIds.has(accountId)) {
          return total;
        }

        return total - transaction.amount;
      }

      if (transaction.type === "transfer") {
        const sourceId = transaction.accountId;
        const destinationId = transaction.destinationAccountId;

        if (sourceId === undefined || !eligibleAccountIds.has(sourceId)) {
          return total;
        }

        // Transferências entre contas elegíveis não alteram
        // o patrimônio consolidado.
        if (
          destinationId !== undefined &&
          eligibleAccountIds.has(destinationId)
        ) {
          return total;
        }

        // O dinheiro saiu de uma conta elegível para uma
        // conta que não faz parte do saldo dessa data.
        return total - transaction.amount;
      }

      return total;
    }, 0);

  return initialBalance + movements;
}

function normalizeCategoryName(name: string): string {
  return name.trim().toLocaleLowerCase("pt-BR");
}

function getCategoryIconComponent(iconName: string | undefined): LucideIcon {
  if (!iconName?.trim()) {
    return Tags;
  }

  const componentName = iconName
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

  const icons = LucideIcons as unknown as Record<string, unknown>;
  const icon = icons[componentName];

  if (typeof icon === "object" && icon !== null) {
    return icon as LucideIcon;
  }

  if (typeof icon === "function") {
    return icon as LucideIcon;
  }

  return Tags;
}

export function DashboardPage({
  accounts,
  transactions,
  categories,
  onNavigate,
  onNewTransaction,
  onNewAccount,
  onEditTransaction,
  onDeleteTransaction,
}: DashboardPageProps) {
  const [period, setPeriod] = useState<Period>("current");

  const categoriesByName = useMemo(
    () =>
      new Map(
        categories.map((category) => [
          normalizeCategoryName(category.name),
          category,
        ]),
      ),
    [categories],
  );

  const periodRange = useMemo(() => getPeriodRange(period), [period]);

  const periodTransactions = useMemo(
    () =>
      transactions.filter(
        (transaction) =>
          transaction.date >= periodRange.startDate &&
          transaction.date <= periodRange.endDate,
      ),
    [transactions, periodRange],
  );

  const periodIncome = sumTransactions(periodTransactions, "income");
  const periodExpenses = sumTransactions(periodTransactions, "expense");
  const available = periodIncome - periodExpenses;

  const savingsRate = periodIncome > 0 ? (available / periodIncome) * 100 : 0;
  const progressPercentage = Math.max(0, Math.min(savingsRate, 100));

  const insightStatus =
    periodIncome <= 0 || savingsRate < 20
      ? "negative"
      : savingsRate > 50
        ? "positive"
        : "neutral";

  const insightMessage =
    periodIncome <= 0
      ? "Add income to discover how much you are keeping."
      : savingsRate > 50
        ? "Great job! You're keeping more than half of your income."
        : savingsRate >= 20
          ? "You're making progress. Keep an eye on your spending."
          : savingsRate >= 0
            ? "Your expenses are using most of your income."
            : "Your expenses exceeded your income during this period.";

  const periodLabel =
    PERIODS.find((option) => option.value === period)?.label ?? "This month";

  const filteredTotalBalance = useMemo(
    () => calculateBalanceAtDate(accounts, transactions, periodRange.endDate),
    [accounts, transactions, periodRange.endDate],
  );

  const chartData = useMemo(
    () =>
      Array.from({ length: periodRange.months }, (_, index) => {
        const month = getMonthOffset(
          (period === "previous" ? -1 : 0) - (periodRange.months - 1 - index),
        );

        const monthItems = transactions.filter(
          (transaction) =>
            transaction.date.slice(0, 7) === month &&
            transaction.date <= periodRange.endDate,
        );

        return {
          month,
          label: getMonthLabel(month),
          income: sumTransactions(monthItems, "income"),
          expenses: sumTransactions(monthItems, "expense"),
        };
      }),
    [period, periodRange.months, periodRange.endDate, transactions],
  );

  const maxValue = Math.max(
    1,
    ...chartData.flatMap((item) => [item.income, item.expenses]),
  );

  const recentTransactions = [...transactions]
    .sort((a, b) => {
      const dateDifference = b.date.localeCompare(a.date);

      if (dateDifference !== 0) return dateDifference;

      return (b.id ?? 0) - (a.id ?? 0);
    })
    .slice(0, 5);

  const todayKey = localDateKey(new Date());

  const upcomingBills = transactions.filter((transaction) => {
    if (transaction.type !== "expense") return false;

    const days =
      (new Date(`${transaction.date}T00:00:00`).getTime() -
        new Date(`${todayKey}T00:00:00`).getTime()) /
      86_400_000;

    return days >= 0 && days <= 7;
  });

  const alertLevel =
    upcomingBills.length === 0
      ? "success"
      : upcomingBills.length >= 3
        ? "urgent"
        : "warning";

  const balanceKind: BalanceKindValue =
    filteredTotalBalance > 0
      ? "positive"
      : filteredTotalBalance < 0
        ? "negative"
        : "neutral";

  const availableKind: BalanceKindValue =
    available > 0 ? "positive" : available < 0 ? "negative" : "neutral";

  return (
    <DashboardContainer>
      <DashboardHeading className="dashboard-summary-heading">
        <div>
          <h2>Good to see you.</h2>
          <p>Here is what is happening with your money.</p>
        </div>

        <PeriodSelector>
          <CalendarDays size={15} aria-hidden="true" />

          <select
            aria-label="Filter dashboard period"
            value={period}
            onChange={(event) => setPeriod(event.target.value as Period)}
          >
            {PERIODS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </PeriodSelector>
      </DashboardHeading>

      <StatsGrid className="dashboard-stats-grid">
        <StatCardContainer $kind="balance">
          <div className="stat-card-content">
            <div className="stat-card-heading">
              <p>Total balance</p>
              <Wallet size={20} aria-hidden="true" />
            </div>

            <h3 data-value-kind={balanceKind}>
              {formatMoney(filteredTotalBalance)}
            </h3>

            <span>Balance as of {periodRange.endDate}</span>
          </div>
        </StatCardContainer>

        <StatCardContainer $kind="income">
          <div className="stat-card-content">
            <div className="stat-card-heading">
              <p>Income</p>
              <ArrowUpRight size={20} aria-hidden="true" />
            </div>

            <h3 data-value-kind="income">{formatMoney(periodIncome)}</h3>
            <span>{periodLabel}</span>
          </div>
        </StatCardContainer>

        <StatCardContainer $kind="expense">
          <div className="stat-card-content">
            <div className="stat-card-heading">
              <p>Expenses</p>
              <ArrowDownRight size={20} aria-hidden="true" />
            </div>

            <h3 data-value-kind="expense">{formatMoney(periodExpenses)}</h3>
            <span>{periodLabel}</span>
          </div>
        </StatCardContainer>

        <StatCardContainer $kind="available">
          <div className="stat-card-content">
            <div className="stat-card-heading">
              <p>Available</p>
              <CreditCard size={20} aria-hidden="true" />
            </div>

            <h3 data-value-kind={availableKind}>{formatMoney(available)}</h3>

            <span>
              {savingsRate.toLocaleString("en-US", {
                maximumFractionDigits: 1,
              })}
              % of income left
            </span>
          </div>
        </StatCardContainer>
      </StatsGrid>

      <MiddleCardsGrid>
        <Panel>
          <PanelHeading>
            <div>
              <h3>Income vs Expenses</h3>
              <p>Your cash flow over time</p>
            </div>
          </PanelHeading>

          <CashFlowChart>
            <ChartLegend>
              <ChartLegendItem $kind="income">
                <span />
                Income
              </ChartLegendItem>

              <ChartLegendItem $kind="expense">
                <span />
                Expenses
              </ChartLegendItem>
            </ChartLegend>

            {periodTransactions.length === 0 ? (
              <EmptyState>
                <p>No transactions for this period.</p>
                <span>Add income and expenses to see your cash flow here.</span>
              </EmptyState>
            ) : (
              <ChartPlot
                role="img"
                aria-label={`Income and expenses chart for ${periodLabel}`}
              >
                <div className="chart-grid-lines" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                  <span />
                </div>

                <ChartMonths>
                  {chartData.map((item) => (
                    <ChartMonth key={item.month}>
                      <ChartBars>
                        <ChartTooltip>
                          <ChartBar
                            $kind="income"
                            $height={
                              item.income > 0
                                ? Math.max((item.income / maxValue) * 100, 2)
                                : 0
                            }
                            title={`Income — ${item.label}: ${formatMoney(item.income)}`}
                            aria-label={`Income in ${item.label}: ${formatMoney(item.income)}`}
                          />
                          <span className="tooltip-content">
                            Income: {formatMoney(item.income)}
                          </span>
                        </ChartTooltip>

                        <ChartTooltip>
                          <ChartBar
                            $kind="expense"
                            $height={
                              item.expenses > 0
                                ? Math.max((item.expenses / maxValue) * 100, 2)
                                : 0
                            }
                            title={`Expenses — ${item.label}: ${formatMoney(item.expenses)}`}
                            aria-label={`Expenses in ${item.label}: ${formatMoney(item.expenses)}`}
                          />
                          <span className="tooltip-content">
                            Expenses: {formatMoney(item.expenses)}
                          </span>
                        </ChartTooltip>
                      </ChartBars>

                      <span className="month-label">{item.label}</span>
                    </ChartMonth>
                  ))}
                </ChartMonths>
              </ChartPlot>
            )}
          </CashFlowChart>
        </Panel>

        <InsightCard $status={insightStatus}>
          <div className="insight-card-top">
            <InsightEyebrow>
              <span className="insight-dot" />
              Insight
            </InsightEyebrow>

            <span className="insight-period">{periodLabel}</span>
          </div>

          <div className="insight-main">
            <InsightHeading>
              {periodIncome > 0
                ? `You kept ${savingsRate.toFixed(1)}% of your income.`
                : "Let's build your financial picture."}
            </InsightHeading>

            <InsightExpense>
              Expenses this period:{" "}
              <strong>{formatMoney(periodExpenses)}</strong>
            </InsightExpense>

            <InsightMessage>{insightMessage}</InsightMessage>
          </div>

          <InsightProgress>
            <div className="insight-progress-label">
              <span>Income remaining</span>
              <strong>
                {periodIncome > 0 ? `${savingsRate.toFixed(1)}%` : "—"}
              </strong>
            </div>

            <InsightProgressTrack
              role="progressbar"
              aria-label="Percentage of income remaining"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progressPercentage)}
              data-status={insightStatus}
            >
              <InsightProgressValue
                $status={insightStatus}
                $percentage={progressPercentage}
              />
            </InsightProgressTrack>
          </InsightProgress>
        </InsightCard>
      </MiddleCardsGrid>

      <DashboardBottomGrid>
        <Panel>
          <PanelHeading>
            <div>
              <h3>Recent transactions</h3>
              <p>Your latest recorded activity.</p>
            </div>

            <TextButton
              type="button"
              onClick={() => onNavigate("transactions")}
            >
              View all <ArrowRight size={15} />
            </TextButton>
          </PanelHeading>

          <RecentTransactionsContent>
            {recentTransactions.map((transaction) => {
              const title =
                transaction.title?.trim() ||
                transaction.description?.trim() ||
                (transaction.type === "transfer" ? "Transfer" : "Transaction");

              const category = categoriesByName.get(
                normalizeCategoryName(transaction.category || ""),
              );

              const CategoryIcon =
                transaction.type === "transfer"
                  ? Wallet
                  : getCategoryIconComponent(category?.icon);

              const categoryLabel =
                transaction.type === "transfer"
                  ? "Transfer"
                  : transaction.category?.trim() || "Uncategorized";

              return (
                <div className="recent-transaction" key={transaction.id}>
                  <div className="transaction-icon">
                    <CategoryIcon size={19} aria-hidden="true" />
                  </div>

                  <div className="transaction-description">
                    <strong>{title}</strong>
                    <span>
                      {categoryLabel} · {transaction.date}
                    </span>
                  </div>

                  <strong
                    className={`transaction-amount ${
                      transaction.type === "income"
                        ? "income"
                        : transaction.type === "expense"
                          ? "expense"
                          : "transfer"
                    }`}
                  >
                    {transaction.type === "income"
                      ? "+"
                      : transaction.type === "expense"
                        ? "−"
                        : ""}
                    {formatMoney(transaction.amount)}
                  </strong>

                  <div className="transaction-actions">
                    <button
                      type="button"
                      aria-label={`Edit ${title}`}
                      title="Edit"
                      onClick={() => onEditTransaction(transaction)}
                    >
                      <Pencil size={15} />
                    </button>

                    <button
                      type="button"
                      aria-label={`Delete ${title}`}
                      title="Delete"
                      onClick={() => onDeleteTransaction(transaction)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </RecentTransactionsContent>
        </Panel>

        <Panel>
          <PanelHeading>
            <div>
              <h3>Quick actions</h3>
              <p>Shortcuts to manage your money.</p>
            </div>
          </PanelHeading>

          <QuickActionsGrid>
            <button
              className="quick-action"
              type="button"
              onClick={onNewTransaction}
            >
              <TrendingDown size={18} />
              <span>Add expense</span>
            </button>

            <button
              className="quick-action"
              type="button"
              onClick={onNewTransaction}
            >
              <TrendingUp size={18} />
              <span>Add income</span>
            </button>

            <button
              className="quick-action"
              type="button"
              onClick={onNewAccount}
            >
              <CreditCard size={18} />
              <span>Add card</span>
            </button>

            <button
              className="quick-action"
              type="button"
              onClick={onNewTransaction}
            >
              <Tags size={18} />
              <span>Add category</span>
            </button>
          </QuickActionsGrid>

          <BillAlert className={alertLevel} role="status">
            {alertLevel === "success" ? (
              <CircleCheck size={20} aria-hidden="true" />
            ) : (
              <CircleAlert size={20} aria-hidden="true" />
            )}

            <div>
              <strong>
                {upcomingBills.length === 0
                  ? "No bills due this week"
                  : `${upcomingBills.length} bills due soon`}
              </strong>

              <p>
                {upcomingBills.length === 0
                  ? "Add recurring bills to get reminders here."
                  : `${upcomingBills
                      .slice(0, 2)
                      .map(
                        (transaction) =>
                          transaction.title?.trim() ||
                          transaction.description?.trim() ||
                          "Expense",
                      )
                      .join(
                        " and ",
                      )} — check their due dates and payment status.`}
              </p>
            </div>
          </BillAlert>
        </Panel>
      </DashboardBottomGrid>
    </DashboardContainer>
  );
}
