import Dexie, { type EntityTable } from "dexie";

export type AccountType =
  | "checking"
  | "savings"
  | "salary"
  | "payment"
  | "investment"
  | "cash"
  | "credit";

export type TransactionType = "income" | "expense" | "transfer";

export interface Account {
  id?: number;
  name: string;
  institutionId: string;
  type: AccountType;
  initialBalance: number;
  createdAt: string;
}

export interface TransactionAttachment {
  name: string;
  type: string;
  size: number;
  data: Blob;
}

export interface Transaction {
  id?: number;
  accountId: number;
  destinationAccountId?: number;
  type: TransactionType;
  title: string;
  description: string;
  category: string;
  amount: number;
  date: string;
  attachment?: TransactionAttachment;
  createdAt: string;
}

export type CategoryType = "income" | "expense";

export interface Category {
  id?: number;
  name: string;
  description: string;
  type: CategoryType;
  icon: string;
  createdAt: string;
}

export const DEFAULT_CATEGORIES = [
  "Moradia",
  "Alimentação",
  "Transporte",
  "Saúde",
  "Lazer",
  "Educação",
  "Salário",
  "Investimentos",
  "Outros",
] as const;

class MilkyBillsDatabase extends Dexie {
  accounts!: EntityTable<Account, "id">;
  transactions!: EntityTable<Transaction, "id">;
  categories!: EntityTable<Category, "id">;

  constructor() {
    super("milky-bills");

    this.version(1).stores({
      accounts: "++id, name, type, createdAt",
      transactions: "++id, accountId, type, date, category, createdAt",
    });

    this.version(2)
      .stores({
        accounts: "++id, name, type, createdAt",
        transactions: "++id, accountId, type, date, category, createdAt",
        categories: "++id, &name, createdAt",
      })
      .upgrade(async (transaction) => {
        const categoriesTable = transaction.table("categories");
        const transactionsTable = transaction.table("transactions");
        const existingTransactions = await transactionsTable.toArray();
        const names = new Map<string, string>();

        for (const name of DEFAULT_CATEGORIES) {
          names.set(name.trim().toLocaleLowerCase("pt-BR"), name);
        }

        for (const item of existingTransactions) {
          if (
            item.type !== "transfer" &&
            typeof item.category === "string" &&
            item.category.trim()
          ) {
            const name = item.category.trim();
            const normalized = name.toLocaleLowerCase("pt-BR");

            if (!names.has(normalized)) {
              names.set(normalized, name);
            }
          }
        }

        const createdAt = new Date().toISOString();

        await categoriesTable.bulkAdd(
          [...names.values()].map((name) => ({
            name,
            createdAt,
          })),
        );
      });

    this.version(3)
      .stores({
        accounts: "++id, name, type, createdAt",
        transactions: "++id, accountId, type, date, category, createdAt",
        categories: "++id, &name, type, createdAt",
      })
      .upgrade(async (transaction) => {
        const categoriesTable = transaction.table("categories");
        const existingCategories = await categoriesTable.toArray();
        const incomeNames = new Set(["salário", "investimentos"]);
        const now = new Date().toISOString();

        for (const category of existingCategories) {
          const normalizedName = String(category.name)
            .trim()
            .toLocaleLowerCase("pt-BR");

          await categoriesTable.update(category.id, {
            description: category.description ?? "",
            type:
              category.type ??
              (incomeNames.has(normalizedName) ? "income" : "expense"),
            icon: category.icon ?? "circle-dollar-sign",
            createdAt: category.createdAt ?? now,
          });
        }
      });

    this.version(4)
      .stores({
        accounts: "++id, name, institutionId, type, createdAt",
        transactions: "++id, accountId, type, date, category, createdAt",
        categories: "++id, &name, type, createdAt",
      })
      .upgrade(async (transaction) => {
        const accountsTable = transaction.table("accounts");
        const existingAccounts = await accountsTable.toArray();

        for (const account of existingAccounts) {
          await accountsTable.update(account.id, {
            institutionId: account.institutionId ?? "other",
            initialBalance: account.initialBalance ?? 0,
            createdAt: account.createdAt ?? new Date().toISOString(),
          });
        }
      });
    this.version(5)
      .stores({
        accounts: "++id, name, institutionId, type, createdAt",
        transactions: "++id, accountId, type, date, category, createdAt",
        categories: "++id, &name, type, createdAt",
      })
      .upgrade(async (transaction) => {
        const transactionsTable = transaction.table("transactions");
        const existingTransactions = await transactionsTable.toArray();

        for (const item of existingTransactions) {
          await transactionsTable.update(item.id, {
            title: item.title ?? item.description ?? "",
            description: item.description ?? "",
          });
        }
      });
  }
}

export const db = new MilkyBillsDatabase();
