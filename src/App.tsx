import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  db,
  type Account,
  type Category,
  type CategoryType,
  type CreditCard,
  type RecurrenceStatus,
  type RecurringTransaction,
  type Transaction,
  type TransactionType,
} from "./db/database";

import {
  calculateAccountBalances,
  currentMonth,
  today,
  toCents,
} from "./lib/money";
import {
  calculateCardReservations,
  processDueRecurrences,
} from "./lib/recurring";
import { downloadBackup } from "./lib/backup";
import { AppLayout } from "./components/layout/AppLayout";
import type { Page, Theme } from "./types/app";
import { DashboardPage } from "./pages/DashboardPage";
import { CategoriesPage } from "./pages/Categories/CategoriesPage";
import {
  AccountsPage,
  type AccountFormData,
} from "./pages/Accounts/AccountsPage";
import {
  TransactionsPage,
  type TransactionFormData,
} from "./pages/Transactions/TransactionsPage";
import { CardsPage } from "./pages/Cards/CardsPage";
import RecurringPage from "./pages/Recurring/RecurringPage";

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

type CreditCardFormData = Omit<CreditCard, "id" | "createdAt" | "updatedAt">;

type RecurringFormData = Omit<
  RecurringTransaction,
  "id" | "createdAt" | "updatedAt"
>;

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
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [recurrences, setRecurrences] = useState<RecurringTransaction[]>([]);

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
    // Lança as ocorrências vencidas antes de carregar as transações.
    await processDueRecurrences();

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
      // Corrige ícones antigos sem sobrescrever escolhas personalizadas.
      await db.transaction("rw", db.categories, async () => {
        for (const defaultCategory of defaultCategories) {
          const existing = storedCategories.find(
            (category) =>
              normalizeCategoryName(category.name) ===
              normalizeCategoryName(defaultCategory.name),
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

    const [
      storedAccounts,
      storedTransactions,
      storedCreditCards,
      storedRecurrences,
    ] = await Promise.all([
      db.accounts.toArray(),
      db.transactions.toArray(),
      db.creditCards.toArray(),
      db.recurringTransactions.toArray(),
    ]);

    setAccounts(storedAccounts);

    setTransactions(
      storedTransactions.sort((a, b) => b.date.localeCompare(a.date)),
    );

    setCategories(
      storedCategories.sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
    );

    setCreditCards(
      storedCreditCards.sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
    );

    setRecurrences(
      storedRecurrences.sort((a, b) =>
        a.nextOccurrenceDate.localeCompare(b.nextOccurrenceDate),
      ),
    );
  }

  useEffect(() => {
    // O carregamento inicial lê o IndexedDB e sincroniza os estados.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh().catch(() => {
      setNotice("Não foi possível carregar os dados financeiros.");
    });

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

  // Despesas lançadas + parcelas futuras reservadas nas recorrências ativas.
  const expensesByCard = useMemo(() => {
    const postedExpenses = transactions.reduce<Record<number, number>>(
      (totals, transaction) => {
        if (
          transaction.type === "expense" &&
          transaction.creditCardId !== undefined
        ) {
          totals[transaction.creditCardId] =
            (totals[transaction.creditCardId] ?? 0) + transaction.amount;
        }

        return totals;
      },
      {},
    );

    const reservations = calculateCardReservations(recurrences);

    for (const [cardId, amount] of Object.entries(reservations)) {
      const numericCardId = Number(cardId);

      postedExpenses[numericCardId] =
        (postedExpenses[numericCardId] ?? 0) + amount;
    }

    return postedExpenses;
  }, [transactions, recurrences]);

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

  async function createCreditCard(data: CreditCardFormData) {
    const now = new Date().toISOString();

    await db.creditCards.add({
      ...data,
      createdAt: now,
      updatedAt: now,
    });

    await refresh();
    setNotice("Cartão cadastrado com sucesso.");
  }

  async function updateCreditCard(id: number, data: CreditCardFormData) {
    await db.creditCards.update(id, {
      ...data,
      updatedAt: new Date().toISOString(),
    });

    await refresh();
    setNotice("Cartão atualizado com sucesso.");
  }

  async function deleteCreditCard(id: number) {
    const linkedTransactions = await db.transactions
      .where("creditCardId")
      .equals(id)
      .count();

    if (linkedTransactions > 0) {
      setNotice(
        "Este cartão possui transações vinculadas. Remova ou transfira essas transações antes de excluí-lo.",
      );
      return;
    }

    const linkedRecurrences = await db.recurringTransactions
      .where("creditCardId")
      .equals(id)
      .filter((recurrence) => recurrence.status !== "concluded")
      .count();

    if (linkedRecurrences > 0) {
      setNotice(
        "Este cartão está vinculado a recorrências ativas ou pausadas. Remova essas recorrências antes de excluí-lo.",
      );
      return;
    }

    const card = creditCards.find((item) => item.id === id);

    if (
      !window.confirm(
        `Deseja realmente excluir o cartão "${card?.name ?? "selecionado"}"?`,
      )
    ) {
      return;
    }

    await db.creditCards.delete(id);
    await refresh();
    setNotice("Cartão excluído com sucesso.");
  }

  async function createTransaction(data: TransactionFormData): Promise<void> {
    const usesCreditCard =
      data.type === "expense" && data.creditCardId !== undefined;

    if (data.creditCardId !== undefined && !usesCreditCard) {
      setNotice("Cartões de crédito só podem ser usados em despesas.");
      return;
    }

    if (usesCreditCard) {
      const cardExists = creditCards.some(
        (card) => card.id === data.creditCardId,
      );

      if (!cardExists) {
        setNotice("Selecione um cartão de crédito válido.");
        return;
      }
    } else {
      const accountExists = accounts.some(
        (account) => account.id === data.accountId,
      );

      if (data.accountId === undefined || !accountExists) {
        setNotice("Selecione uma conta válida.");
        return;
      }
    }

    const now = new Date().toISOString();

    await db.transactions.add({
      ...data,
      accountId: usesCreditCard ? undefined : data.accountId,
      creditCardId: usesCreditCard ? data.creditCardId : undefined,
      title: data.title.trim() || data.description.trim(),
      description: data.description.trim(),
      createdAt: now,
    });

    await refresh();
    setNotice("Transação criada com sucesso.");
  }

  async function editTransaction(
    transactionId: number,
    data: TransactionFormData,
  ): Promise<void> {
    const usesCreditCard =
      data.type === "expense" && data.creditCardId !== undefined;

    if (data.creditCardId !== undefined && !usesCreditCard) {
      setNotice("Cartões de crédito só podem ser usados em despesas.");
      return;
    }

    if (usesCreditCard) {
      const cardExists = creditCards.some(
        (card) => card.id === data.creditCardId,
      );

      if (!cardExists) {
        setNotice("Selecione um cartão de crédito válido.");
        return;
      }
    } else {
      const accountExists = accounts.some(
        (account) => account.id === data.accountId,
      );

      if (data.accountId === undefined || !accountExists) {
        setNotice("Selecione uma conta válida.");
        return;
      }
    }

    const existingTransaction = await db.transactions.get(transactionId);

    if (!existingTransaction) {
      setNotice("Não foi possível encontrar a transação para atualizar.");
      await refresh();
      return;
    }

    await db.transactions.update(transactionId, {
      ...data,
      accountId: usesCreditCard ? undefined : data.accountId,
      creditCardId: usesCreditCard ? data.creditCardId : undefined,
      title: data.title.trim() || data.description.trim(),
      description: data.description.trim(),
    });

    await refresh();
    setNotice("Transação atualizada com sucesso.");
  }

  async function createRecurring(data: RecurringFormData): Promise<void> {
    const usesCreditCard = data.creditCardId !== undefined;
    const usesAccount = data.accountId !== undefined;

    if (usesCreditCard && usesAccount) {
      throw new Error("Selecione uma conta ou um cartão, não os dois.");
    }

    if (usesCreditCard && data.type !== "expense") {
      throw new Error("Recorrências vinculadas a cartão devem ser despesas.");
    }

    if (usesCreditCard) {
      const cardExists = creditCards.some(
        (card) => card.id === data.creditCardId,
      );

      if (!cardExists) {
        throw new Error("Selecione um cartão de crédito válido.");
      }
    }

    if (usesAccount) {
      const accountExists = accounts.some(
        (account) => account.id === data.accountId,
      );

      if (!accountExists) {
        throw new Error("Selecione uma conta válida.");
      }
    }

    if (data.nextOccurrenceDate > data.endDate) {
      throw new Error(
        "A próxima ocorrência não pode ser posterior à data final.",
      );
    }

    if (data.amount <= 0 || !Number.isFinite(data.amount)) {
      throw new Error("Informe um valor válido para a recorrência.");
    }

    const now = new Date().toISOString();

    await db.recurringTransactions.add({
      ...data,
      title: data.title.trim(),
      description: data.description.trim(),
      accountId: usesCreditCard ? undefined : data.accountId,
      creditCardId: usesCreditCard ? data.creditCardId : undefined,
      createdAt: now,
      updatedAt: now,
    });

    await refresh();
    setNotice("Recorrência criada com sucesso.");
  }

  async function updateRecurring(
    id: number,
    data: RecurringFormData,
  ): Promise<void> {
    const existing = await db.recurringTransactions.get(id);

    if (!existing) {
      throw new Error("Não foi possível encontrar a recorrência.");
    }

    const usesCreditCard = data.creditCardId !== undefined;
    const usesAccount = data.accountId !== undefined;

    if (usesCreditCard && usesAccount) {
      throw new Error("Selecione uma conta ou um cartão, não os dois.");
    }

    if (usesCreditCard && data.type !== "expense") {
      throw new Error("Recorrências vinculadas a cartão devem ser despesas.");
    }

    if (usesCreditCard) {
      const cardExists = creditCards.some(
        (card) => card.id === data.creditCardId,
      );

      if (!cardExists) {
        throw new Error("Selecione um cartão de crédito válido.");
      }
    }

    if (usesAccount) {
      const accountExists = accounts.some(
        (account) => account.id === data.accountId,
      );

      if (!accountExists) {
        throw new Error("Selecione uma conta válida.");
      }
    }

    if (data.nextOccurrenceDate > data.endDate) {
      throw new Error(
        "A próxima ocorrência não pode ser posterior à data final.",
      );
    }

    if (data.amount <= 0 || !Number.isFinite(data.amount)) {
      throw new Error("Informe um valor válido para a recorrência.");
    }

    await db.recurringTransactions.update(id, {
      ...data,
      title: data.title.trim(),
      description: data.description.trim(),
      accountId: usesCreditCard ? undefined : data.accountId,
      creditCardId: usesCreditCard ? data.creditCardId : undefined,
      updatedAt: new Date().toISOString(),
    });

    await refresh();
    setNotice("Recorrência atualizada com sucesso.");
  }

  async function changeRecurringStatus(
    id: number,
    status: RecurrenceStatus,
  ): Promise<void> {
    if (status !== "active" && status !== "paused") {
      throw new Error("Status inválido para esta operação.");
    }

    const recurrence = await db.recurringTransactions.get(id);

    if (!recurrence) {
      throw new Error("Não foi possível encontrar a recorrência.");
    }

    if (recurrence.status === "concluded") {
      throw new Error("Uma recorrência concluída não pode ser retomada.");
    }

    await db.recurringTransactions.update(id, {
      status,
      updatedAt: new Date().toISOString(),
    });

    await refresh();

    setNotice(
      status === "paused"
        ? "Recorrência pausada. A reserva futura foi removida."
        : "Recorrência retomada com sucesso.",
    );
  }

  async function deleteRecurring(id: number): Promise<void> {
    const recurrence = await db.recurringTransactions.get(id);

    if (!recurrence) {
      throw new Error("Não foi possível encontrar a recorrência.");
    }

    await db.recurringTransactions.delete(id);

    await refresh();
    setNotice(
      "Recorrência excluída. Os lançamentos anteriores foram mantidos.",
    );
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

    await db.transaction(
      "rw",
      db.categories,
      db.transactions,
      db.recurringTransactions,
      async () => {
        await db.categories.update(category.id!, data);

        if (category.name !== data.name) {
          await db.transactions
            .where("category")
            .equals(category.name)
            .modify({ category: data.name });

          await db.recurringTransactions
            .where("category")
            .equals(category.name)
            .modify({
              category: data.name,
              updatedAt: new Date().toISOString(),
            });
        }
      },
    );

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
      title: description,
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
      await db.transactions.add({
        ...transactionData,
        createdAt: new Date().toISOString(),
      });
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

    await db.categories.add({
      name,
      description: "",
      type: "expense",
      icon: "tag",
      createdAt: new Date().toISOString(),
    });

    setCategoryName("");
    await refresh();
    setNotice("Categoria adicionada.");
  }

  async function deleteCategory(category: Category) {
    const usedByTransactions = transactions.some(
      (transaction) => transaction.category === category.name,
    );

    const usedByRecurrences = recurrences.some(
      (recurrence) => recurrence.category === category.name,
    );

    if (usedByTransactions || usedByRecurrences) {
      setNotice(
        "Essa categoria está vinculada a transações ou recorrências e não pode ser excluída.",
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
    const usedByTransactions = transactions.some(
      (transaction) =>
        transaction.accountId === account.id ||
        transaction.destinationAccountId === account.id,
    );

    const usedByRecurrences = recurrences.some(
      (recurrence) => recurrence.accountId === account.id,
    );

    if (usedByTransactions || usedByRecurrences) {
      setNotice(
        "Essa conta está vinculada a transações ou recorrências e não pode ser excluída.",
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
            categories={categories}
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
            creditCards={creditCards}
            onCreate={createTransaction}
            onUpdate={editTransaction}
            onDelete={deleteTransaction}
          />
        )}

        {page === "cards" && (
          <CardsPage
            cards={creditCards}
            expensesByCard={expensesByCard}
            onCreate={createCreditCard}
            onUpdate={updateCreditCard}
            onDelete={deleteCreditCard}
          />
        )}

        {page === "recurring" && (
          <RecurringPage
            recurrences={recurrences}
            accounts={accounts}
            creditCards={creditCards}
            categories={categories}
            onCreate={createRecurring}
            onUpdate={updateRecurring}
            onChangeStatus={changeRecurringStatus}
            onDelete={deleteRecurring}
          />
        )}
      </div>
    </AppLayout>
  );
}

export default App;
