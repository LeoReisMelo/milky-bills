
import type { Account, Transaction } from "../db/database";

export interface MonthlySummary {
  income: number;
  expenses: number;
  balance: number;
  transactionCount: number;
}

export function toCents(value: string | number): number {
  const normalized = String(value)
    .trim()
    .replace(/\s/g, "")
    .replace(/^R\$/i, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const amount = Number(normalized);

  if (!Number.isFinite(amount)) {
    throw new Error("Informe um valor válido.");
  }

  if (amount <= 0) {
    throw new Error(
      "A transação precisa ter um valor maior que zero.",
    );
  }

  const cents = Math.round(amount * 100);

  if (!Number.isSafeInteger(cents)) {
    throw new Error("O valor informado é muito grande.");
  }

  return cents;
}

export function formatMoney(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

export function today(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;

  return new Date(now.getTime() - offset)
    .toISOString()
    .slice(0, 10);
}

export function currentMonth(): string {
  return today().slice(0, 7);
}

export function getMonthlySummary(
  transactions: Transaction[],
  month: string,
): MonthlySummary {
  const monthlyTransactions = transactions.filter(
    (transaction) => transaction.date.slice(0, 7) === month,
  );

  let income = 0;
  let expenses = 0;

  for (const transaction of monthlyTransactions) {
    if (transaction.type === "income") {
      income += transaction.amount;
    } else if (transaction.type === "expense") {
      expenses += transaction.amount;
    }
  }

  return {
    income,
    expenses,
    balance: income - expenses,
    transactionCount: monthlyTransactions.length,
  };
}

export function calculateAccountBalances(
  accounts: Account[],
  transactions: Transaction[],
): Map<number, number> {
  const balances = new Map<number, number>();

  for (const account of accounts) {
    if (account.id !== undefined) {
      balances.set(account.id, account.initialBalance);
    }
  }

  for (const transaction of transactions) {
    const sourceId = transaction.accountId;
    const sourceBalance = balances.get(sourceId);

    if (sourceBalance === undefined) {
      continue;
    }

    if (transaction.type === "transfer") {
      const destinationId = transaction.destinationAccountId;

      // Uma transferência válida precisa ter duas contas distintas.
      // Registros incompletos não devem alterar os saldos.
      if (
        destinationId === undefined ||
        destinationId === sourceId ||
        !balances.has(destinationId)
      ) {
        continue;
      }

      balances.set(sourceId, sourceBalance - transaction.amount);

      balances.set(
        destinationId,
        balances.get(destinationId)! + transaction.amount,
      );

      continue;
    }

    const delta =
      transaction.type === "income"
        ? transaction.amount
        : -transaction.amount;

    balances.set(sourceId, sourceBalance + delta);
  }

  return balances;
}