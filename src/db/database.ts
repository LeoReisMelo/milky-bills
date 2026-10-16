import Dexie, { type EntityTable } from "dexie";

export type AccountType =
  | "checking"
  | "savings"
  | "salary"
  | "payment"
  | "investment"
  | "cash"
  | "credit";

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
  accountId?: number;
  destinationAccountId?: number;
  creditCardId?: number;
  recurringId?: number;
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

export type CardBrand =
  | "Visa"
  | "Mastercard"
  | "Elo"
  | "American Express"
  | "Hipercard"
  | "Outra";

export interface CreditCard {
  id?: number;
  name: string;
  bank: string;
  brand: CardBrand;
  lastFourDigits: string;
  creditLimit: number;
  closingDay: number;
  dueDay: number;
  color: string;
  holder: string;
  createdAt: string;
  updatedAt: string;
}

export type RecurrenceFrequency = "weekly" | "monthly" | "yearly";

export type RecurrenceStatus = "active" | "paused" | "concluded";

export interface RecurringTransaction {
  id?: number;
  title: string;
  description: string;
  type: CategoryType;
  amount: number;
  frequency: RecurrenceFrequency;
  nextOccurrenceDate: string;
  endDate: string;
  category: string;
  accountId?: number;
  creditCardId?: number;
  status: RecurrenceStatus;
  createdAt: string;
  updatedAt: string;
}

class MilkyBillsDatabase extends Dexie {
  accounts!: EntityTable<Account, "id">;
  transactions!: EntityTable<Transaction, "id">;
  categories!: EntityTable<Category, "id">;
  creditCards!: EntityTable<CreditCard, "id">;
  recurringTransactions!: EntityTable<RecurringTransaction, "id">;

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
        const existing = await categoriesTable.toArray();
        const names = new Set(
          existing.map((category: { name: string }) => category.name),
        );

        for (const item of await transactionsTable.toArray()) {
          const categoryName = (item as { category?: string }).category?.trim();

          if (categoryName && !names.has(categoryName)) {
            await categoriesTable.add({
              name: categoryName,
              description: "",
              type: "expense",
              icon: "tag",
              createdAt: new Date().toISOString(),
            });
            names.add(categoryName);
          }
        }
      });

    this.version(3)
      .stores({
        accounts: "++id, name, type, createdAt",
        transactions: "++id, accountId, type, date, category, createdAt",
        categories: "++id, &name, type, createdAt",
      })
      .upgrade(async (transaction) => {
        const categoriesTable = transaction.table("categories");
        const items = await categoriesTable.toArray();

        for (const item of items) {
          await categoriesTable.update(item.id, {
            description: item.description ?? "",
            type: item.type ?? "expense",
            icon: item.icon ?? "tag",
            createdAt: item.createdAt ?? new Date().toISOString(),
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
        const items = await accountsTable.toArray();

        for (const item of items) {
          await accountsTable.update(item.id, {
            institutionId: item.institutionId ?? "",
            initialBalance: item.initialBalance ?? 0,
            createdAt: item.createdAt ?? new Date().toISOString(),
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
        const items = await transactionsTable.toArray();

        for (const item of items) {
          await transactionsTable.update(item.id, {
            title: item.title ?? item.description ?? "",
            description: item.description ?? "",
          });
        }
      });

    this.version(6).stores({
      accounts: "++id, name, institutionId, type, createdAt",
      transactions:
        "++id, accountId, creditCardId, type, date, category, createdAt",
      categories: "++id, &name, type, createdAt",
      creditCards: "++id, name, bank, brand, createdAt, updatedAt",
    });

    this.version(7).stores({
      accounts: "++id, name, institutionId, type, createdAt",
      transactions:
        "++id, accountId, creditCardId, recurringId, type, date, category, createdAt",
      categories: "++id, &name, type, createdAt",
      creditCards: "++id, name, bank, brand, createdAt, updatedAt",
      recurringTransactions:
        "++id, type, status, frequency, nextOccurrenceDate, endDate, accountId, creditCardId, createdAt",
    });
  }
}

export const db = new MilkyBillsDatabase();
