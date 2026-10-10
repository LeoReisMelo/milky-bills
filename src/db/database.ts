
import Dexie, { type EntityTable } from "dexie";

export type AccountType = "checking" | "savings" | "cash" | "credit";

export type TransactionType = "income" | "expense" | "transfer";

export interface Account {
  id?: number;
  name: string;
  type: AccountType;
  initialBalance: number;
  createdAt: string;
}

export interface Transaction {
  id?: number;
  accountId: number;
  destinationAccountId?: number;
  type: TransactionType;
  description: string;
  category: string;
  amount: number;
  date: string;
  createdAt: string;
}

export interface Category {
  id?: number;
  name: string;
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
        transactions:
          "++id, accountId, type, date, category, createdAt",
        categories: "++id, &name, createdAt",
      })
      .upgrade(async (transaction) => {
        const categoriesTable = transaction.table("categories");
        const transactionsTable = transaction.table("transactions");

        const existingTransactions =
          await transactionsTable.toArray();

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
  }
}

export const db = new MilkyBillsDatabase();