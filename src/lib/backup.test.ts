
import { beforeEach, describe, expect, it } from "vitest";

import {
  db,
  type Account,
  type Category,
  type Transaction,
} from "../db/database";

import {
  createBackup,
  restoreBackup,
  type MilkyBillsBackup,
} from "./backup";

const account: Account = {
  id: 1,
  name: "Conta principal",
  type: "checking",
  initialBalance: 100_000,
  createdAt: "2026-10-01T10:00:00.000Z",
};

const savingsAccount: Account = {
  id: 2,
  name: "Poupança",
  type: "savings",
  initialBalance: 50_000,
  createdAt: "2026-10-01T10:00:00.000Z",
};

const transaction: Transaction = {
  id: 1,
  accountId: 1,
  type: "expense",
  description: "Mercado",
  category: "Alimentação",
  amount: 5_000,
  date: "2026-10-05",
  createdAt: "2026-10-05T12:00:00.000Z",
};

const transfer: Transaction = {
  id: 2,
  accountId: 1,
  destinationAccountId: 2,
  type: "transfer",
  description: "Reserva mensal",
  category: "Transferência",
  amount: 20_000,
  date: "2026-10-06",
  createdAt: "2026-10-06T12:00:00.000Z",
};

const category: Category = {
  id: 1,
  name: "Alimentação",
  createdAt: "2026-10-01T10:00:00.000Z",
};

const customCategory: Category = {
  id: 2,
  name: "Pets",
  createdAt: "2026-10-02T10:00:00.000Z",
};

function createFile(content: unknown): File {
  return new File(
    [JSON.stringify(content)],
    "milky-bills-backup.json",
    { type: "application/json" },
  );
}

function createValidBackup(
  overrides: Partial<MilkyBillsBackup> = {},
): MilkyBillsBackup {
  return {
    app: "Milky Bills",
    version: 2,
    exportedAt: "2026-10-09T12:00:00.000Z",
    accounts: [account, savingsAccount],
    transactions: [transaction, transfer],
    categories: [category, customCategory],
    ...overrides,
  };
}

async function seedDatabase(): Promise<void> {
  await db.transaction(
    "rw",
    db.accounts,
    db.transactions,
    db.categories,
    async () => {
      await db.accounts.clear();
      await db.transactions.clear();
      await db.categories.clear();

      await db.accounts.bulkPut([account, savingsAccount]);
      await db.transactions.bulkPut([transaction, transfer]);
      await db.categories.bulkPut([category, customCategory]);
    },
  );
}

async function expectOriginalDataToRemain(): Promise<void> {
  expect(await db.accounts.toArray()).toHaveLength(2);
  expect(await db.transactions.toArray()).toHaveLength(2);
  expect(await db.transactions.get(2)).toEqual(transfer);
  expect(await db.categories.toArray()).toHaveLength(2);
  expect(await db.categories.get(2)).toEqual(customCategory);
}

describe("Milky Bills — backup", () => {
  beforeEach(async () => {
    await db.transaction(
      "rw",
      db.accounts,
      db.transactions,
      db.categories,
      async () => {
        await db.accounts.clear();
        await db.transactions.clear();
        await db.categories.clear();
      },
    );
  });

  it("cria um backup com contas, movimentações e categorias", async () => {
    await seedDatabase();

    const backup = await createBackup();

    expect(backup.app).toBe("Milky Bills");
    expect(backup.version).toBe(2);
    expect(Number.isFinite(Date.parse(backup.exportedAt))).toBe(true);
    expect(backup.accounts).toHaveLength(2);
    expect(backup.transactions).toHaveLength(2);
    expect(backup.categories).toHaveLength(2);
    expect(backup.transactions).toContainEqual(transfer);
    expect(backup.categories).toContainEqual(customCategory);
  });

  it("restaura o backup e substitui os dados anteriores", async () => {
    await seedDatabase();

    await db.accounts.put({
      ...account,
      id: 3,
      name: "Conta antiga",
    });

    await db.categories.put({
      id: 3,
      name: "Categoria antiga",
      createdAt: "2026-10-03T10:00:00.000Z",
    });

    await restoreBackup(createFile(createValidBackup()));

    expect(await db.accounts.toArray()).toHaveLength(2);
    expect(await db.transactions.toArray()).toHaveLength(2);
    expect(await db.categories.toArray()).toHaveLength(2);
    expect(await db.transactions.get(2)).toEqual(transfer);
    expect(await db.categories.get(2)).toEqual(customCategory);
    expect(await db.accounts.get(3)).toBeUndefined();
    expect(await db.categories.get(3)).toBeUndefined();
  });

  it("aceita um backup sem contas ou movimentações", async () => {
    await seedDatabase();

    await restoreBackup(
      createFile(
        createValidBackup({
          accounts: [],
          transactions: [],
        }),
      ),
    );

    expect(await db.accounts.toArray()).toEqual([]);
    expect(await db.transactions.toArray()).toEqual([]);
    expect(await db.categories.toArray()).toHaveLength(2);
  });


  it("rejeita um arquivo que não contém JSON válido", async () => {
    await seedDatabase();

    const file = new File(
      ["isto não é JSON"],
      "backup.json",
      { type: "application/json" },
    );

    await expect(restoreBackup(file)).rejects.toThrow(
      "O arquivo não contém um JSON válido.",
    );

    await expectOriginalDataToRemain();
  });

  it("rejeita uma versão não suportada", async () => {
    await seedDatabase();

    await expect(
      restoreBackup(
        createFile({
          ...createValidBackup(),
          version: 999,
        }),
      ),
    ).rejects.toThrow(
      "Backup inválido ou versão não suportada pelo Milky Bills.",
    );

    await expectOriginalDataToRemain();
  });

  it("rejeita uma data de exportação inválida", async () => {
    await seedDatabase();

    await expect(
      restoreBackup(
        createFile({
          ...createValidBackup(),
          exportedAt: "data inválida",
        }),
      ),
    ).rejects.toThrow(
      "A data de exportação do backup é inválida.",
    );

    await expectOriginalDataToRemain();
  });

  it("rejeita registros inválidos", async () => {
    await seedDatabase();

    await expect(
      restoreBackup(
        createFile(
          createValidBackup({
            accounts: [{ ...account, name: "   " }],
          }),
        ),
      ),
    ).rejects.toThrow("O backup contém registros inválidos.");

    await expectOriginalDataToRemain();
  });

  it("rejeita datas de transação impossíveis", async () => {
    await seedDatabase();

    await expect(
      restoreBackup(
        createFile(
          createValidBackup({
            transactions: [
              { ...transaction, date: "2026-02-31" },
            ],
          }),
        ),
      ),
    ).rejects.toThrow("O backup contém registros inválidos.");

    await expectOriginalDataToRemain();
  });

  it("rejeita IDs de contas duplicados", async () => {
    await seedDatabase();

    await expect(
      restoreBackup(
        createFile(
          createValidBackup({
            accounts: [
              account,
              { ...account, name: "Outra conta" },
            ],
            transactions: [],
          }),
        ),
      ),
    ).rejects.toThrow(
      "O backup contém IDs de contas duplicados.",
    );

    await expectOriginalDataToRemain();
  });

  it("rejeita IDs de movimentações duplicados", async () => {
    await seedDatabase();

    await expect(
      restoreBackup(
        createFile(
          createValidBackup({
            transactions: [
              transaction,
              {
                ...transaction,
                description: "Outra movimentação",
              },
            ],
          }),
        ),
      ),
    ).rejects.toThrow(
      "O backup contém IDs de transações duplicados.",
    );

    await expectOriginalDataToRemain();
  });

  it("rejeita IDs de categorias duplicados", async () => {
    await seedDatabase();

    await expect(
      restoreBackup(
        createFile(
          createValidBackup({
            categories: [
              category,
              {
                ...customCategory,
                id: category.id,
                name: "Outra categoria",
              },
            ],
          }),
        ),
      ),
    ).rejects.toThrow(
      "O backup contém IDs de categorias duplicados.",
    );

    await expectOriginalDataToRemain();
  });

  it("rejeita categorias com nomes duplicados", async () => {
    await seedDatabase();

    await expect(
      restoreBackup(
        createFile(
          createValidBackup({
            categories: [
              category,
              {
                ...customCategory,
                name: "  alimentação ",
              },
            ],
          }),
        ),
      ),
    ).rejects.toThrow(
      "O backup contém categorias com nomes duplicados.",
    );

    await expectOriginalDataToRemain();
  });

  it("rejeita categorias inválidas", async () => {
    await seedDatabase();

    await expect(
      restoreBackup(
        createFile({
          ...createValidBackup(),
          categories: [
            {
              ...category,
              name: "   ",
            },
          ],
        }),
      ),
    ).rejects.toThrow(
      "O backup contém categorias inválidas ou ausentes.",
    );

    await expectOriginalDataToRemain();
  });

  it("rejeita movimentações sem a conta correspondente", async () => {
    await seedDatabase();

    await expect(
      restoreBackup(
        createFile(
          createValidBackup({
            transactions: [
              { ...transaction, accountId: 999 },
            ],
          }),
        ),
      ),
    ).rejects.toThrow(
      "Existem transações vinculadas a contas que não estão no backup.",
    );

    await expectOriginalDataToRemain();
  });

  it("rejeita transferências sem uma conta de destino válida", async () => {
    await seedDatabase();

    await expect(
      restoreBackup(
        createFile(
          createValidBackup({
            transactions: [
              {
                ...transfer,
                destinationAccountId: 999,
              },
            ],
          }),
        ),
      ),
    ).rejects.toThrow(
      "Existem transações vinculadas a contas que não estão no backup.",
    );

    await expectOriginalDataToRemain();
  });

  it("rejeita transferências para a mesma conta de origem", async () => {
    await seedDatabase();

    await expect(
      restoreBackup(
        createFile(
          createValidBackup({
            transactions: [
              {
                ...transfer,
                destinationAccountId: transfer.accountId,
              },
            ],
          }),
        ),
      ),
    ).rejects.toThrow(
      "O backup contém registros inválidos.",
    );

    await expectOriginalDataToRemain();
  });

  it("rejeita valores monetários fracionários em centavos", async () => {
    await seedDatabase();

    await expect(
      restoreBackup(
        createFile(
          createValidBackup({
            transactions: [
              { ...transaction, amount: 10.5 },
            ],
          }),
        ),
      ),
    ).rejects.toThrow(
      "O backup contém registros inválidos.",
    );

    await expectOriginalDataToRemain();
  });
});