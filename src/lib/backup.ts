
import {
  db,
  DEFAULT_CATEGORIES,
  type Account,
  type Category,
  type Transaction,
} from "../db/database";

const BACKUP_APP = "Milky Bills";
const BACKUP_VERSION = 2;

export interface MilkyBillsBackup {
  app: typeof BACKUP_APP;
  version: number;
  exportedAt: string;
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
}

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function isPositiveId(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value > 0
  );
}

function isValidTimestamp(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}T/.test(value) &&
    Number.isFinite(Date.parse(value))
  );
}

function isValidDate(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function isAccount(value: unknown): value is Account {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isPositiveId(value.id) &&
    typeof value.name === "string" &&
    value.name.trim().length > 0 &&
    ["checking", "savings", "cash", "credit"].includes(
      String(value.type),
    ) &&
    typeof value.initialBalance === "number" &&
    Number.isSafeInteger(value.initialBalance) &&
    isValidTimestamp(value.createdAt)
  );
}

function isTransaction(value: unknown): value is Transaction {
  if (!isRecord(value)) {
    return false;
  }

  const supportedType = [
    "income",
    "expense",
    "transfer",
  ].includes(String(value.type));

  const validDestination =
    value.type === "transfer"
      ? isPositiveId(value.destinationAccountId) &&
        value.destinationAccountId !== value.accountId
      : value.destinationAccountId === undefined;

  return (
    isPositiveId(value.id) &&
    isPositiveId(value.accountId) &&
    supportedType &&
    validDestination &&
    typeof value.description === "string" &&
    value.description.trim().length > 0 &&
    typeof value.category === "string" &&
    value.category.trim().length > 0 &&
    typeof value.amount === "number" &&
    Number.isSafeInteger(value.amount) &&
    value.amount > 0 &&
    isValidDate(value.date) &&
    isValidTimestamp(value.createdAt)
  );
}

function isCategory(value: unknown): value is Category {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isPositiveId(value.id) &&
    typeof value.name === "string" &&
    value.name.trim().length > 0 &&
    isValidTimestamp(value.createdAt)
  );
}

function normalizeName(value: string): string {
  return value.trim().normalize("NFKC").toLocaleLowerCase("pt-BR");
}

function categoriesFromLegacyBackup(
  transactions: Transaction[],
  exportedAt: string,
): Category[] {
  const names = new Map<string, string>();

  for (const name of DEFAULT_CATEGORIES) {
    names.set(normalizeName(name), name);
  }

  for (const transaction of transactions) {
    if (transaction.type === "transfer") {
      continue;
    }

    const name = transaction.category.trim();

    if (name) {
      const normalized = normalizeName(name);

      if (!names.has(normalized)) {
        names.set(normalized, name);
      }
    }
  }

  return [...names.values()].map((name) => ({
    name,
    createdAt: exportedAt,
  }));
}

export async function createBackup(): Promise<MilkyBillsBackup> {
  const [accounts, transactions, categories] = await Promise.all([
    db.accounts.toArray(),
    db.transactions.toArray(),
    db.categories.toArray(),
  ]);

  return {
    app: BACKUP_APP,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    accounts,
    transactions,
    categories,
  };
}

export async function downloadBackup(): Promise<void> {
  const backup = await createBackup();

  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `milky-bills-${new Date()
    .toISOString()
    .slice(0, 10)}.json`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

export async function restoreBackup(file: File): Promise<void> {
  let data: unknown;

  try {
    data = JSON.parse(await file.text());
  } catch {
    throw new Error("O arquivo não contém um JSON válido.");
  }

  if (
    !isRecord(data) ||
    data.app !== BACKUP_APP ||
    ![1, BACKUP_VERSION].includes(Number(data.version)) ||
    !Array.isArray(data.accounts) ||
    !Array.isArray(data.transactions)
  ) {
    throw new Error(
      "Backup inválido ou versão não suportada pelo Milky Bills.",
    );
  }

  if (!isValidTimestamp(data.exportedAt)) {
    throw new Error("A data de exportação do backup é inválida.");
  }

  if (
    !data.accounts.every(isAccount) ||
    !data.transactions.every(isTransaction)
  ) {
    throw new Error("O backup contém registros inválidos.");
  }

  const accounts = data.accounts as Account[];
  const transactions = data.transactions as Transaction[];

  const categories: Category[] =
    data.version === 1
      ? categoriesFromLegacyBackup(
          transactions,
          data.exportedAt,
        )
      : Array.isArray(data.categories) &&
          data.categories.every(isCategory)
        ? (data.categories as Category[])
        : (() => {
            throw new Error(
              "O backup contém categorias inválidas ou ausentes.",
            );
          })();

  const accountIds = new Set(
    accounts.map((account) => account.id),
  );

  if (accountIds.size !== accounts.length) {
    throw new Error("O backup contém IDs de contas duplicados.");
  }

  const transactionIds = new Set(
    transactions.map((transaction) => transaction.id),
  );

  if (transactionIds.size !== transactions.length) {
    throw new Error(
      "O backup contém IDs de transações duplicados.",
    );
  }

  const categoryIds = new Set(
    categories.map((category) => category.id),
  );

  if (categoryIds.size !== categories.length) {
    throw new Error(
      "O backup contém IDs de categorias duplicados.",
    );
  }

  const categoryNames = new Set<string>();

  for (const category of categories) {
    const normalized = normalizeName(category.name);

    if (categoryNames.has(normalized)) {
      throw new Error(
        "O backup contém categorias com nomes duplicados.",
      );
    }

    categoryNames.add(normalized);
  }

  const hasOrphanTransactions = transactions.some(
    (transaction) =>
      !accountIds.has(transaction.accountId) ||
      (transaction.type === "transfer" &&
        (transaction.destinationAccountId === undefined ||
          !accountIds.has(transaction.destinationAccountId))),
  );

  if (hasOrphanTransactions) {
    throw new Error(
      "Existem transações vinculadas a contas que não estão no backup.",
    );
  }

  await db.transaction(
    "rw",
    db.accounts,
    db.transactions,
    db.categories,
    async () => {
      await db.transactions.clear();
      await db.accounts.clear();
      await db.categories.clear();

      await db.accounts.bulkPut(accounts);
      await db.transactions.bulkPut(transactions);
      await db.categories.bulkPut(categories);
    },
  );
}