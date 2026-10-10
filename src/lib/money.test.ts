import { describe, expect, it } from "vitest";

import type { Account, Transaction } from "../db/database";

import {
  calculateAccountBalances,
  currentMonth,
  formatMoney,
  getMonthlySummary,
  toCents,
  today,
} from "./money";

const checkingAccount: Account = {
  id: 1,
  name: "Conta principal",
  institutionId: "1",
  type: "checking",
  initialBalance: 100_000,
  createdAt: "2026-10-01T10:00:00.000Z",
};

const savingsAccount: Account = {
  id: 2,
  institutionId: "1",
  name: "Poupança",
  type: "savings",
  initialBalance: 50_000,
  createdAt: "2026-10-01T10:00:00.000Z",
};

function makeTransaction(
  overrides: Partial<Transaction> & Pick<Transaction, "type" | "amount">,
): Transaction {
  return {
    id: 1,
    accountId: 1,
    description: "Transação de teste",
    category: "Outros",
    date: "2026-10-05",
    createdAt: "2026-10-05T12:00:00.000Z",
    title: "",
    ...overrides,
  };
}

/**
 * Normaliza diferenças de formatação Unicode entre ambientes.
 * Remove espaços e caracteres invisíveis de formatação, preservando
 * o sinal, o símbolo da moeda, os dígitos e os separadores numéricos.
 */
function normalizeMoney(value: string): string {
  return value.normalize("NFKC").replace(/[\s\p{Cf}]/gu, "");
}

describe("toCents", () => {
  it("converte valores brasileiros para centavos", () => {
    expect(toCents("10,50")).toBe(1050);
    expect(toCents("1.234,56")).toBe(123456);
    expect(toCents("R$ 99,90")).toBe(9990);
  });

  it("aceita espaços extras", () => {
    expect(toCents("  R$  25,75  ")).toBe(2575);
  });

  it("rejeita zero", () => {
    expect(() => toCents("0,00")).toThrow(
      "A transação precisa ter um valor maior que zero.",
    );
  });

  it("rejeita valores negativos", () => {
    expect(() => toCents("-10,00")).toThrow(
      "A transação precisa ter um valor maior que zero.",
    );
  });

  it("rejeita valores inválidos", () => {
    expect(() => toCents("abc")).toThrow("Informe um valor válido.");
  });

  it("rejeita valores que ultrapassam a precisão segura", () => {
    expect(() => toCents("999999999999999999999999")).toThrow();
  });
});

describe("formatMoney", () => {
  it("formata valores positivos em reais", () => {
    expect(normalizeMoney(formatMoney(1050))).toBe("R$10,50");
  });

  it("formata valores negativos", () => {
    expect(normalizeMoney(formatMoney(-2500))).toBe("-R$25,00");
  });

  it("formata zero", () => {
    expect(normalizeMoney(formatMoney(0))).toBe("R$0,00");
  });
});

describe("datas", () => {
  it("retorna a data atual no formato YYYY-MM-DD", () => {
    expect(today()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("retorna o mês atual no formato YYYY-MM", () => {
    expect(currentMonth()).toMatch(/^\d{4}-\d{2}$/);
    expect(currentMonth()).toBe(today().slice(0, 7));
  });
});

describe("getMonthlySummary", () => {
  const transactions: Transaction[] = [
    makeTransaction({
      id: 1,
      type: "income",
      amount: 500_000,
      date: "2026-10-01",
    }),
    makeTransaction({
      id: 2,
      type: "expense",
      amount: 150_000,
      date: "2026-10-05",
    }),
    makeTransaction({
      id: 3,
      type: "expense",
      amount: 25_000,
      date: "2026-09-20",
    }),
    makeTransaction({
      id: 4,
      type: "transfer",
      amount: 50_000,
      destinationAccountId: 2,
      date: "2026-10-12",
    }),
  ];

  it("calcula receitas, despesas e resultado do mês", () => {
    expect(getMonthlySummary(transactions, "2026-10")).toEqual({
      income: 500_000,
      expenses: 150_000,
      balance: 350_000,
      transactionCount: 3,
    });
  });

  it("não contabiliza transferências como receitas ou despesas", () => {
    const summary = getMonthlySummary(transactions, "2026-10");

    expect(summary.income).toBe(500_000);
    expect(summary.expenses).toBe(150_000);
    expect(summary.balance).toBe(350_000);
  });

  it("calcula um mês com resultado negativo", () => {
    expect(getMonthlySummary(transactions, "2026-09")).toEqual({
      income: 0,
      expenses: 25_000,
      balance: -25_000,
      transactionCount: 1,
    });
  });

  it("retorna zeros para um mês sem movimentações", () => {
    expect(getMonthlySummary([], "2026-01")).toEqual({
      income: 0,
      expenses: 0,
      balance: 0,
      transactionCount: 0,
    });
  });

  it("mantém o resultado independente da ordem dos lançamentos", () => {
    const original = getMonthlySummary(transactions, "2026-10");
    const reversed = getMonthlySummary([...transactions].reverse(), "2026-10");

    expect(reversed).toEqual(original);
  });
});

describe("calculateAccountBalances", () => {
  it("calcula o saldo de uma conta com receitas e despesas", () => {
    const transactions = [
      makeTransaction({
        id: 1,
        type: "income",
        amount: 20_000,
        accountId: 1,
      }),
      makeTransaction({
        id: 2,
        type: "expense",
        amount: 5_000,
        accountId: 1,
      }),
    ];

    const balances = calculateAccountBalances([checkingAccount], transactions);

    expect(balances.get(1)).toBe(115_000);
  });

  it("debita a origem e credita o destino em uma transferência", () => {
    const transfer = makeTransaction({
      id: 1,
      type: "transfer",
      amount: 20_000,
      accountId: 1,
      destinationAccountId: 2,
    });

    const balances = calculateAccountBalances(
      [checkingAccount, savingsAccount],
      [transfer],
    );

    expect(balances.get(1)).toBe(80_000);
    expect(balances.get(2)).toBe(70_000);
  });

  it("mantém o saldo consolidado ao transferir entre contas", () => {
    const transfer = makeTransaction({
      type: "transfer",
      amount: 20_000,
      accountId: 1,
      destinationAccountId: 2,
    });

    const balances = calculateAccountBalances(
      [checkingAccount, savingsAccount],
      [transfer],
    );

    const consolidatedBalance = [...balances.values()].reduce(
      (sum, balance) => sum + balance,
      0,
    );

    expect(consolidatedBalance).toBe(150_000);
  });

  it("não altera saldos quando a transferência está incompleta", () => {
    const invalidTransfer = makeTransaction({
      type: "transfer",
      amount: 20_000,
      accountId: 1,
    });

    const balances = calculateAccountBalances(
      [checkingAccount, savingsAccount],
      [invalidTransfer],
    );

    expect(balances.get(1)).toBe(100_000);
    expect(balances.get(2)).toBe(50_000);
  });

  it("calcula várias transferências e movimentações", () => {
    const transactions = [
      makeTransaction({
        id: 1,
        type: "transfer",
        amount: 10_000,
        accountId: 1,
        destinationAccountId: 2,
      }),
      makeTransaction({
        id: 2,
        type: "expense",
        amount: 2_000,
        accountId: 2,
      }),
      makeTransaction({
        id: 3,
        type: "transfer",
        amount: 3_000,
        accountId: 2,
        destinationAccountId: 1,
      }),
    ];

    const balances = calculateAccountBalances(
      [checkingAccount, savingsAccount],
      transactions,
    );

    expect(balances.get(1)).toBe(93_000);
    expect(balances.get(2)).toBe(55_000);
  });
});
