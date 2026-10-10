import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  db,
  DEFAULT_CATEGORIES,
  type Account,
  type Category,
  type CategoryType,
  type Transaction,
  type TransactionType,
} from "./db/database";

import {
  calculateAccountBalances,
  currentMonth,
  today,
  toCents,
} from "./lib/money";
import { downloadBackup } from "./lib/backup";
import { AppLayout } from "./components/layout/AppLayout";
import type { Page, Theme } from "./types/app";
import { DashboardPage } from "./pages/DashboardPage";
import { CategoriesPage } from "./pages/Categories/CategoriesPage";
import {
  AccountsPage,
  type AccountFormData,
} from "./pages/Accounts/AccountsPage";
import { TransactionsPage } from "./pages/Transactions/TransactionsPage";

type DashboardPeriod = "this-month" | "last-month" | "last-3-months" | "custom";

type DateRange = {
  start: string;
  end: string;
};

type MonthlyData = {
  month: string;
  label: string;
  income: number;
  expenses: number;
};

function monthStart(offset = 0) {
  const now = new Date();
  const date = new Date(now.getFullYear(), now.getMonth() + offset, 1);

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`;
}

function monthEnd(offset = 0) {
  const now = new Date();
  const date = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0);

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function parseInitialBalance(value: string | number): number {
  const normalized = String(value)
    .trim()
    .replace(/\s/g, "")
    .replace(/^R\$/i, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const amount = Number(normalized);

  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("Informe um saldo inicial válido.");
  }

  return toCents(amount);
}

function normalizeCategoryName(name: string) {
  return name.trim().normalize("NFKC").toLocaleLowerCase("pt-BR");
}

function getTransactionDateRange(period: DashboardPeriod): DateRange {
  switch (period) {
    case "last-month":
      return { start: monthStart(-1), end: monthEnd(-1) };

    case "last-3-months":
      return { start: monthStart(-2), end: today() };

    default:
      return { start: monthStart(), end: today() };
  }
}

function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [_online, setOnline] = useState(
    typeof navigator === "undefined" ? true : navigator.onLine,
  );

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | TransactionType>("all");
  const [monthFilter, setMonthFilter] = useState(currentMonth());

  const [editing, setEditing] = useState<Transaction | null>(null);
  const [transactionType, setTransactionType] =
    useState<TransactionType>("expense");

  const [categoryName, setCategoryName] = useState("");
  const [notice, setNotice] = useState("");
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const savedTheme = localStorage.getItem("milky-bills-theme");

      return savedTheme === "light" ? "light" : "dark";
    } catch {
      return "dark";
    }
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;

    try {
      localStorage.setItem("milky-bills-theme", theme);
    } catch {
      // A aplicação continua funcionando mesmo se o armazenamento estiver indisponível.
    }
  }, [theme]);

  const [dashboardPeriod, setDashboardPeriod] =
    useState<DashboardPeriod>("this-month");
  const [chartMonths, setChartMonths] = useState<3 | 6 | 12>(6);

  const [customPeriodStart, setCustomPeriodStart] = useState(monthStart());
  const [customPeriodEnd, setCustomPeriodEnd] = useState(today());
  const [appliedCustomStart, setAppliedCustomStart] = useState(monthStart());
  const [appliedCustomEnd, setAppliedCustomEnd] = useState(today());

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [accountFilter, setAccountFilter] = useState("all");

  const [modal, setModal] = useState<
    "account" | "transaction" | "custom-period" | null
  >(null);

  async function refresh() {
    let storedCategories = await db.categories.toArray();

    const defaultCategories = [
      {
        name: "Moradia",
        description: "Aluguel, contas e despesas da casa.",
        type: "expense",
        icon: "house",
      },
      {
        name: "Alimentação",
        description: "Mercado, restaurantes e refeições.",
        type: "expense",
        icon: "utensils",
      },
      {
        name: "Transporte",
        description: "Combustível, transporte público e viagens.",
        type: "expense",
        icon: "bus",
      },
      {
        name: "Saúde",
        description: "Consultas, exames e medicamentos.",
        type: "expense",
        icon: "heart-pulse",
      },
      {
        name: "Lazer",
        description: "Entretenimento e atividades de lazer.",
        type: "expense",
        icon: "clapperboard",
      },
      {
        name: "Educação",
        description: "Cursos, livros e materiais de estudo.",
        type: "expense",
        icon: "graduation-cap",
      },
      {
        name: "Salário",
        description: "Salário e remuneração profissional.",
        type: "income",
        icon: "briefcase-business",
      },
      {
        name: "Investimentos",
        description: "Rendimentos e receitas de investimentos.",
        type: "income",
        icon: "trending-up",
      },
      {
        name: "Outros",
        description: "Outras movimentações financeiras.",
        type: "expense",
        icon: "circle-dollar-sign",
      },
    ] satisfies Omit<Category, "id" | "createdAt">[];

    if (storedCategories.length === 0) {
      const createdAt = new Date().toISOString();

      await db.categories.bulkAdd(
        defaultCategories.map((category) => ({
          ...category,
          createdAt,
        })),
      );
    } else {
      // Corrige os ícones antigos sem sobrescrever escolhas personalizadas.
      await db.transaction("rw", db.categories, async () => {
        for (const defaultCategory of defaultCategories) {
          const existing = storedCategories.find(
            (category) =>
              category.name
                .trim()
                .normalize("NFKC")
                .toLocaleLowerCase("pt-BR") ===
              defaultCategory.name.normalize("NFKC").toLocaleLowerCase("pt-BR"),
          );

          if (
            existing?.id !== undefined &&
            (!existing.icon || existing.icon === "circle-dollar-sign")
          ) {
            await db.categories.update(existing.id, {
              icon: defaultCategory.icon,
            });
          }
        }
      });
    }

    storedCategories = await db.categories.toArray();

    const [storedAccounts, storedTransactions] = await Promise.all([
      db.accounts.toArray(),
      db.transactions.toArray(),
    ]);

    setAccounts(storedAccounts);

    setTransactions(
      storedTransactions.sort((a, b) => b.date.localeCompare(a.date)),
    );

    setCategories(
      storedCategories.sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
    );
  }

  useEffect(() => {
    // O carregamento inicial lê o IndexedDB e sincroniza os estados da aplicação.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();

    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!notice) return;

    const timeout = window.setTimeout(() => setNotice(""), 4000);

    return () => window.clearTimeout(timeout);
  }, [notice]);

  const accountBalances = useMemo(
    () => calculateAccountBalances(accounts, transactions),
    [accounts, transactions],
  );

  const totalBalance = useMemo(
    () => [...accountBalances.values()].reduce((sum, value) => sum + value, 0),
    [accountBalances],
  );

  const monthTransactions = transactions.filter(
    (transaction) => transaction.date.slice(0, 7) === currentMonth(),
  );

  const income = monthTransactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const expenses = monthTransactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const dashboardRange = useMemo<DateRange>(() => {
    if (dashboardPeriod === "custom") {
      return { start: appliedCustomStart, end: appliedCustomEnd };
    }

    return getTransactionDateRange(dashboardPeriod);
  }, [dashboardPeriod, appliedCustomStart, appliedCustomEnd]);

  const dashboardSummary = useMemo(() => {
    const periodTransactions = transactions.filter(
      (transaction) =>
        transaction.date >= dashboardRange.start &&
        transaction.date <= dashboardRange.end,
    );

    const income = periodTransactions
      .filter((transaction) => transaction.type === "income")
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    const expenses = periodTransactions
      .filter((transaction) => transaction.type === "expense")
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    return {
      income,
      expenses,
      available: income - expenses,
      count: periodTransactions.length,
    };
  }, [transactions, dashboardRange]);

  const chartData = useMemo<MonthlyData[]>(() => {
    const now = new Date();

    return Array.from({ length: chartMonths }, (_, index) => {
      const offset = index - chartMonths + 1;
      const date = new Date(now.getFullYear(), now.getMonth() + offset, 1);

      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      const monthTransactions = transactions.filter(
        (transaction) => transaction.date.slice(0, 7) === month,
      );

      return {
        month,
        label: date
          .toLocaleDateString("pt-BR", { month: "short" })
          .replace(".", ""),
        income: monthTransactions
          .filter((transaction) => transaction.type === "income")
          .reduce((sum, transaction) => sum + transaction.amount, 0),
        expenses: monthTransactions
          .filter((transaction) => transaction.type === "expense")
          .reduce((sum, transaction) => sum + transaction.amount, 0),
      };
    });
  }, [transactions, chartMonths]);

  const chartMax = Math.max(
    1,
    ...chartData.flatMap((item) => [item.income, item.expenses]),
  );

  const filteredTransactions = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");

    return transactions.filter((transaction) => {
      const matchesSearch =
        !normalizedSearch ||
        transaction.description
          .toLocaleLowerCase("pt-BR")
          .includes(normalizedSearch);

      const matchesType =
        typeFilter === "all" || transaction.type === typeFilter;

      const matchesMonth =
        !monthFilter || transaction.date.slice(0, 7) === monthFilter;

      const matchesDate =
        (!startDate || transaction.date >= startDate) &&
        (!endDate || transaction.date <= endDate);

      const matchesCategory =
        categoryFilter === "all" || transaction.category === categoryFilter;

      const matchesAccount =
        accountFilter === "all" ||
        String(transaction.accountId) === accountFilter;

      const matchesPeriod = startDate || endDate ? matchesDate : matchesMonth;

      return (
        matchesSearch &&
        matchesType &&
        matchesPeriod &&
        matchesCategory &&
        matchesAccount
      );
    });
  }, [
    transactions,
    search,
    typeFilter,
    monthFilter,
    startDate,
    endDate,
    categoryFilter,
    accountFilter,
  ]);

  const pageTitles: Record<Page, string> = {
    dashboard: "Dashboard",
    transactions: "Transações",
    accounts: "Contas",
    cards: "Cartões",
    recurring: "Recorrências",
    categories: "Categorias",
    reports: "Relatórios",
    settings: "Configurações",
  };

  function openNewTransaction() {
    setEditing(null);
    setTransactionType("expense");
    setModal("transaction");
  }

  function openTransactionWithType(type: TransactionType) {
    setEditing(null);
    setTransactionType(type);
    setModal("transaction");
  }

  function openEditTransaction(transaction: Transaction) {
    setEditing(transaction);
    setTransactionType(transaction.type);
    setModal("transaction");
  }

  function closeModal() {
    setModal(null);
    setEditing(null);
    setTransactionType("expense");
  }

  async function createAccount(data: AccountFormData) {
    await db.accounts.add({
      ...data,
      createdAt: new Date().toISOString(),
    });

    await refresh();
    setNotice("Conta criada com sucesso.");
  }

  async function updateAccount(id: number, data: AccountFormData) {
    await db.accounts.update(id, data);

    await refresh();
    setNotice("Conta atualizada com sucesso.");
  }

  async function createTransaction(data: {
    title: string;
    description: string;
    amount: number;
    type: TransactionType;
    category: string;
    accountId: number;
    date: string;
  }) {
    await db.transactions.add({
      ...data,
      createdAt: new Date().toISOString(),
    });

    await refresh();
    setNotice("Transação criada com sucesso.");
  }

  async function editTransaction(
    transactionId: number,
    data: {
      description: string;
      amount: number;
      type: TransactionType;
      category: string;
      accountId: number;
      date: string;
    },
  ) {
    await db.transactions.update(transactionId, data);

    await refresh();
    setNotice("Transação atualizada com sucesso.");
  }

  async function createCategory(data: {
    name: string;
    description: string;
    type: CategoryType;
    icon: string;
  }) {
    await db.categories.add({
      ...data,
      createdAt: new Date().toISOString(),
    });

    await refresh();
    setNotice("Categoria criada com sucesso.");
  }

  async function renameCategory(
    category: Category,
    data: {
      name: string;
      description: string;
      type: CategoryType;
      icon: string;
    },
  ) {
    if (category.id === undefined) {
      throw new Error("Categoria sem identificador.");
    }

    await db.transaction("rw", db.categories, db.transactions, async () => {
      await db.categories.update(category.id!, data);

      if (category.name !== data.name) {
        await db.transactions
          .where("category")
          .equals(category.name)
          .modify({ category: data.name });
      }
    });

    await refresh();
    setNotice("Categoria atualizada com sucesso.");
  }

  async function saveAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const type = String(form.get("type") ?? "checking") as Account["type"];

    let initialBalance: number;

    try {
      initialBalance = parseInitialBalance(
        String(form.get("initialBalance") ?? "0"),
      );
    } catch {
      setNotice("Informe um saldo inicial válido.");
      return;
    }

    if (!name) {
      setNotice("Informe o nome da conta.");
      return;
    }

    await db.accounts.add({
      name,
      type,
      initialBalance,
    } as Account);

    await refresh();
    closeModal();
    setNotice("Conta criada com sucesso.");
  }

  async function saveTransaction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const description = String(form.get("description") ?? "").trim();
    const accountId = Number(form.get("accountId"));
    const amountText = String(form.get("amount") ?? "").trim();
    const date = String(form.get("date") ?? today());
    const destinationAccountIdValue = String(
      form.get("destinationAccountId") ?? "",
    );

    const normalizedAmount = amountText
      .replace(/\s/g, "")
      .replace(/^R\$/i, "")
      .replace(/\.(?=\d{3}(?:\D|$))/g, "")
      .replace(",", ".");

    const amountInReais = Number(normalizedAmount);
    const amount = toCents(amountInReais);

    if (!description || !Number.isFinite(amountInReais) || amountInReais <= 0) {
      setNotice("Informe uma descrição e um valor válido.");
      return;
    }

    if (!accounts.some((account) => account.id === accountId)) {
      setNotice("Selecione uma conta válida.");
      return;
    }

    if (!date) {
      setNotice("Selecione a data da transação.");
      return;
    }

    const category = String(form.get("category") ?? "");

    if (transactionType !== "transfer") {
      if (!categories.some((item) => item.name === category)) {
        setNotice("Selecione uma categoria válida.");
        return;
      }
    }

    let destinationAccountId: number | undefined;

    if (transactionType === "transfer") {
      destinationAccountId = Number(destinationAccountIdValue);

      if (
        !accounts.some((account) => account.id === destinationAccountId) ||
        destinationAccountId === accountId
      ) {
        setNotice("Selecione uma conta de destino diferente da origem.");
        return;
      }
    }

    const transactionData = {
      description,
      type: transactionType,
      amount,
      date,
      accountId,
      category: transactionType === "transfer" ? "" : category,
      ...(destinationAccountId !== undefined ? { destinationAccountId } : {}),
    };

    if (editing?.id !== undefined) {
      await db.transactions.update(editing.id, transactionData);
    } else {
      await db.transactions.add(transactionData as Transaction);
    }

    await refresh();
    closeModal();
    setNotice(editing ? "Transação atualizada." : "Transação registrada.");
  }

  async function saveCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = categoryName.trim();

    if (!name) {
      setNotice("Informe o nome da categoria.");
      return;
    }

    if (
      categories.some(
        (category) =>
          normalizeCategoryName(category.name) === normalizeCategoryName(name),
      )
    ) {
      setNotice("Essa categoria já existe.");
      return;
    }

    await db.categories.add({ name } as Category);

    setCategoryName("");
    await refresh();
    setNotice("Categoria adicionada.");
  }

  async function deleteCategory(category: Category) {
    const used = transactions.some(
      (transaction) => transaction.category === category.name,
    );

    if (used) {
      setNotice(
        "Essa categoria está vinculada a transações e não pode ser excluída.",
      );
      return;
    }

    if (!window.confirm(`Excluir a categoria "${category.name}"?`)) return;

    if (category.id !== undefined) {
      await db.categories.delete(category.id);
    }

    await refresh();
    setNotice("Categoria excluída.");
  }

  async function deleteTransaction(transaction: Transaction) {
    if (!window.confirm(`Excluir a transação "${transaction.description}"?`)) {
      return;
    }

    if (transaction.id !== undefined) {
      await db.transactions.delete(transaction.id);
    }

    await refresh();
    setNotice("Transação excluída.");
  }

  async function deleteAccount(account: Account) {
    const used = transactions.some(
      (transaction) =>
        transaction.accountId === account.id ||
        transaction.destinationAccountId === account.id,
    );

    if (used) {
      setNotice(
        "Essa conta está vinculada a transações e não pode ser excluída.",
      );
      return;
    }

    if (!window.confirm(`Excluir a conta "${account.name}"?`)) return;

    if (account.id !== undefined) {
      await db.accounts.delete(account.id);
    }

    await refresh();
    setNotice("Conta excluída.");
  }

  async function exportData() {
    try {
      await downloadBackup();
      setNotice("Backup exportado com sucesso.");
    } catch {
      setNotice("Não foi possível exportar o backup.");
    }
  }

  function applyCustomPeriod(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !customPeriodStart ||
      !customPeriodEnd ||
      customPeriodStart > customPeriodEnd
    ) {
      setNotice("Selecione um intervalo de datas válido.");
      return;
    }

    setAppliedCustomStart(customPeriodStart);
    setAppliedCustomEnd(customPeriodEnd);
    setDashboardPeriod("custom");
    setModal(null);
  }

  return (
    <AppLayout
      page={page}
      darkMode={theme === "dark"}
      onToggleTheme={() => {
        setTheme((current) => (current === "dark" ? "light" : "dark"));
      }}
      onNavigate={setPage}
    >
      <div className="page-content">
        {page === "dashboard" && (
          <DashboardPage
            accounts={accounts}
            transactions={transactions}
            accountBalances={accountBalances}
            totalBalance={totalBalance}
            income={income}
            expenses={expenses}
            onNavigate={setPage}
            onNewTransaction={openNewTransaction}
            onNewAccount={() => setPage("accounts")}
            onEditTransaction={openEditTransaction}
            onDeleteTransaction={deleteTransaction}
          />
        )}
        {page === "categories" && (
          <CategoriesPage
            categories={categories}
            transactions={transactions}
            onCreate={createCategory}
            onRename={renameCategory}
            onDelete={deleteCategory}
          />
        )}
        {page === "accounts" && (
          <AccountsPage
            accounts={accounts}
            balances={Object.fromEntries(accountBalances)}
            onCreate={createAccount}
            onUpdate={updateAccount}
            onDelete={deleteAccount}
          />
        )}
        {page === "transactions" && (
          <TransactionsPage
            transactions={transactions}
            accounts={accounts}
            categories={categories}
            onCreate={createTransaction}
            onUpdate={editTransaction}
            onDelete={deleteTransaction}
          />
        )}
      </div>
    </AppLayout>
  );
}

export default App;
