import Dexie, { type EntityTable } from "dexie";

export type AccountType =
  | "checking"
  | "savings"
  | "cash"
  | "credit";

export type TransactionType = "income" | "expense";

export interface Account {
  id?: number;
  name: string;
  type: AccountType;
  initialBalance: number; // centavos
  createdAt: string;
}

export interface Transaction {
  id?: number;
  accountId: number;
  type: TransactionType;
  description: string;
  category: string;
  amount: number; // centavos, sempre positivo
  date: string; // YYYY-MM-DD
  createdAt: string;
}

class MilkyBillsDatabase extends Dexie {
  accounts!: EntityTable<Account, "id">;
  transactions!: EntityTable<Transaction, "id">;

  constructor() {
    super("milky-bills");

    this.version(1).stores({
      accounts: "++id, name, type, createdAt",
      transactions:
        "++id, accountId, type, date, category, createdAt",
    });
  }
}

export const db = new MilkyBillsDatabase();