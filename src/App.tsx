import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  LayoutDashboard,
  Plus,
  Search,
  Trash2,
  Wallet,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";

import { db, type Account, type Transaction } from "./db/database";
import { currentMonth, formatMoney, today, toCents } from "./lib/money";

type Page = "dashboard" | "transactions" | "accounts";

const categories = [
  "Moradia",
  "Alimentação",
  "Transporte",
  "Saúde",
  "Lazer",
  "Educação",
  "Salário",
  "Investimentos",
  "Outros",
];

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [online, setOnline] = useState(navigator.onLine);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | Transaction["type"]>(
    "all",
  );
  const [monthFilter, setMonthFilter] = useState(currentMonth());
  const [modal, setModal] = useState<"account" | "transaction" | null>(null);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [notice, setNotice] = useState("");

  async function refresh() {
    const [a, t] = await Promise.all([
      db.accounts.toArray(),
      db.transactions.orderBy("date").reverse().toArray(),
    ]);

    setAccounts(a);
    setTransactions(t);
  }

  useEffect(() => {
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

  const accountBalances = useMemo(() => {
    const balances = new Map<number, number>();

    for (const account of accounts) {
      if (account.id !== undefined) {
        balances.set(account.id, account.initialBalance);
      }
    }

    for (const transaction of transactions) {
      const previous = balances.get(transaction.accountId) ?? 0;
      const delta =
        transaction.type === "income"
          ? transaction.amount
          : -transaction.amount;

      balances.set(transaction.accountId, previous + delta);
    }

    return balances;
  }, [accounts, transactions]);

  const totalBalance = [...accountBalances.values()].reduce(
    (sum, value) => sum + value,
    0,
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

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = [transaction.description, transaction.category].some(
      (value) => value.toLowerCase().includes(search.toLowerCase()),
    );

    const matchesType = typeFilter === "all" || transaction.type === typeFilter;

    const matchesMonth =
      !monthFilter || transaction.date.startsWith(monthFilter);

    return matchesSearch && matchesType && matchesMonth;
  });

  async function saveAccount(form: HTMLFormElement) {
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const type = String(data.get("type") ?? "checking") as Account["type"];
    const initialBalance = toCents(String(data.get("initialBalance") ?? "0"));

    if (!name) throw new Error("Informe o nome da conta.");

    await db.accounts.add({
      name,
      type,
      initialBalance,
      createdAt: new Date().toISOString(),
    });

    await refresh();
    setModal(null);
    setNotice("Conta criada.");
  }

  async function saveTransaction(form: HTMLFormElement) {
    const data = new FormData(form);
    const accountId = Number(data.get("accountId"));
    const description = String(data.get("description") ?? "").trim();
    const type = String(data.get("type") ?? "expense") as Transaction["type"];
    const category = String(data.get("category") ?? "Outros");
    const date = String(data.get("date") ?? today());
    const amount = toCents(String(data.get("amount") ?? ""));

    if (!description) throw new Error("Informe a descrição.");
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("Informe um valor maior que zero.");
    }
    if (!accounts.some((account) => account.id === accountId)) {
      throw new Error("Selecione uma conta válida.");
    }

    const record: Transaction = {
      accountId,
      description,
      type,
      category,
      date,
      amount,
      createdAt: editing?.createdAt ?? new Date().toISOString(),
    };

    if (editing?.id !== undefined) {
      await db.transactions.update(editing.id, record);
    } else {
      await db.transactions.add(record);
    }

    await refresh();
    setModal(null);
    setEditing(null);
    setNotice("Transação salva.");
  }

  async function deleteTransaction(transaction: Transaction) {
    if (!window.confirm(`Excluir "${transaction.description}"?`)) return;

    if (transaction.id !== undefined) {
      await db.transactions.delete(transaction.id);
      await refresh();
      setNotice("Transação excluída.");
    }
  }

  async function deleteAccount(account: Account) {
    if (account.id === undefined) return;

    const hasTransactions = await db.transactions
      .where("accountId")
      .equals(account.id)
      .count();

    if (hasTransactions > 0) {
      setNotice("Exclua ou mova as transações dessa conta primeiro.");
      return;
    }

    if (!window.confirm(`Excluir a conta "${account.name}"?`)) return;

    await db.accounts.delete(account.id);
    await refresh();
    setNotice("Conta excluída.");
  }

  async function exportData() {
    const data = {
      app: "Milky Bills",
      version: 1,
      exportedAt: new Date().toISOString(),
      accounts: await db.accounts.toArray(),
      transactions: await db.transactions.toArray(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `milky-bills-${today()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setNotice("Backup exportado.");
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setPage("dashboard");
          }}
        >
          <span className="brand-mark">M</span>
          <span>
            milky <b>bills</b>
          </span>
        </a>

        <p className="eyebrow">FINANÇAS PESSOAIS</p>

        <nav className="navigation">
          <NavItem
            active={page === "dashboard"}
            icon={<LayoutDashboard size={18} />}
            label="Dashboard"
            onClick={() => setPage("dashboard")}
          />
          <NavItem
            active={page === "transactions"}
            icon={<Activity size={18} />}
            label="Transações"
            onClick={() => setPage("transactions")}
          />
          <NavItem
            active={page === "accounts"}
            icon={<Wallet size={18} />}
            label="Contas"
            onClick={() => setPage("accounts")}
          />
        </nav>

        <div className="sidebar-bottom">
          <span className={`connection ${online ? "" : "offline"}`}>
            {online ? <Wifi size={15} /> : <WifiOff size={15} />}
            {online ? "Conectado" : "Modo offline"}
          </span>
          <button className="button-secondary full-width" onClick={exportData}>
            <Download size={16} /> Exportar backup
          </button>
          <small>Milky Bills · V1 local-first</small>
        </div>
      </aside>

      <section className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">MILKY / BILLS</p>
            <h1>
              {page === "dashboard"
                ? "Visão geral"
                : page === "transactions"
                  ? "Transações"
                  : "Contas"}
            </h1>
          </div>

          <button
            className="button-primary"
            onClick={() => {
              setEditing(null);
              setModal(page === "accounts" ? "account" : "transaction");
            }}
          >
            <Plus size={17} />
            <span>{page === "accounts" ? "Nova conta" : "Nova transação"}</span>
          </button>
        </header>

        {notice && (
          <div className="notice" role="status">
            <span>{notice}</span>
            <button aria-label="Fechar aviso" onClick={() => setNotice("")}>
              <X size={16} />
            </button>
          </div>
        )}

        {page === "dashboard" && (
          <>
            <section className="balance-card">
              <div>
                <p className="muted">Saldo consolidado</p>
                <h2>{formatMoney(totalBalance)}</h2>
                <span className="balance-caption">
                  {accounts.length}{" "}
                  {accounts.length === 1
                    ? "conta cadastrada"
                    : "contas cadastradas"}
                </span>
              </div>
              <div className="balance-symbol">
                <Wallet size={30} />
              </div>
            </section>

            <section className="stats-grid">
              <StatCard
                label="Receitas do mês"
                value={formatMoney(income)}
                icon={<ArrowDownLeft size={19} />}
                kind="income"
              />
              <StatCard
                label="Despesas do mês"
                value={formatMoney(expenses)}
                icon={<ArrowUpRight size={19} />}
                kind="expense"
              />
            </section>

            <section className="panel">
              <div className="panel-heading">
                <div>
                  <h2>Transações recentes</h2>
                  <p className="muted">Últimos lançamentos registrados</p>
                </div>
                <button
                  className="text-button"
                  onClick={() => setPage("transactions")}
                >
                  Ver todas
                </button>
              </div>
              <TransactionList
                transactions={transactions.slice(0, 5)}
                accounts={accounts}
                onEdit={(transaction) => {
                  setEditing(transaction);
                  setModal("transaction");
                }}
                onDelete={deleteTransaction}
              />
            </section>

            <section className="panel">
              <div className="panel-heading">
                <div>
                  <h2>Suas contas</h2>
                  <p className="muted">Saldo atual por conta</p>
                </div>
                <button
                  className="text-button"
                  onClick={() => setPage("accounts")}
                >
                  Gerenciar
                </button>
              </div>
              <AccountList
                accounts={accounts}
                balances={accountBalances}
                onDelete={deleteAccount}
              />
            </section>
          </>
        )}

        {page === "transactions" && (
          <section className="panel">
            <div className="filters">
              <label className="search-box">
                <Search size={17} />
                <input
                  placeholder="Buscar transação..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>
              <select
                value={typeFilter}
                onChange={(event) => {
                  const value = event.target.value;

                  if (
                    value === "all" ||
                    value === "income" ||
                    value === "expense"
                  ) {
                    setTypeFilter(value);
                  }
                }}
                aria-label="Filtrar por tipo"
              >
                <option value="all">Todos os tipos</option>
                <option value="income">Receitas</option>
                <option value="expense">Despesas</option>
              </select>
              <input
                aria-label="Filtrar por mês"
                type="month"
                value={monthFilter}
                onChange={(event) => setMonthFilter(event.target.value)}
              />
              <button
                className="button-secondary"
                onClick={() => {
                  setSearch("");
                  setTypeFilter("all");
                  setMonthFilter("");
                }}
              >
                Limpar filtros
              </button>
            </div>
            <p className="muted result-count">
              {filteredTransactions.length} resultado(s)
            </p>
            <TransactionList
              transactions={filteredTransactions}
              accounts={accounts}
              onEdit={(transaction) => {
                setEditing(transaction);
                setModal("transaction");
              }}
              onDelete={deleteTransaction}
            />
          </section>
        )}

        {page === "accounts" && (
          <section className="panel">
            <div className="panel-heading">
              <div>
                <h2>Contas e carteiras</h2>
                <p className="muted">
                  Gerencie onde seu dinheiro está registrado
                </p>
              </div>
              <button
                className="button-primary"
                onClick={() => setModal("account")}
              >
                <Plus size={16} /> Nova conta
              </button>
            </div>
            <AccountList
              accounts={accounts}
              balances={accountBalances}
              onDelete={deleteAccount}
            />
          </section>
        )}

        <footer className="footer">
          <span>Milky Bills</span>
          <span>Seus dados ficam neste dispositivo.</span>
        </footer>
      </section>

      {modal && (
        <div
          className="modal-backdrop"
          onClick={() => {
            setModal(null);
            setEditing(null);
          }}
        >
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-heading">
              <div>
                <p className="eyebrow">MILKY / BILLS</p>
                <h2 id="modal-title">
                  {modal === "account"
                    ? "Nova conta"
                    : editing
                      ? "Editar transação"
                      : "Nova transação"}
                </h2>
              </div>
              <button
                className="icon-button"
                aria-label="Fechar"
                onClick={() => {
                  setModal(null);
                  setEditing(null);
                }}
              >
                <X />
              </button>
            </div>

            {modal === "account" ? (
              <form
                className="form"
                onSubmit={async (event) => {
                  event.preventDefault();
                  try {
                    await saveAccount(event.currentTarget);
                  } catch (error) {
                    setNotice(
                      error instanceof Error
                        ? error.message
                        : "Erro ao salvar.",
                    );
                  }
                }}
              >
                <label>
                  Nome da conta
                  <input
                    name="name"
                    placeholder="Ex.: Conta principal"
                    required
                  />
                </label>

                <label>
                  Tipo
                  <select name="type" defaultValue="checking">
                    <option value="checking">Conta corrente</option>
                    <option value="savings">Poupança</option>
                    <option value="cash">Dinheiro</option>
                    <option value="credit">Cartão de crédito</option>
                  </select>
                </label>

                <label>
                  Saldo inicial (R$)
                  <input
                    name="initialBalance"
                    inputMode="decimal"
                    defaultValue="0"
                    required
                  />
                </label>

                <button className="button-primary full-width" type="submit">
                  Salvar conta
                </button>
              </form>
            ) : (
              <form
                className="form"
                key={editing?.id ?? "new"}
                onSubmit={async (event) => {
                  event.preventDefault();
                  try {
                    await saveTransaction(event.currentTarget);
                  } catch (error) {
                    setNotice(
                      error instanceof Error
                        ? error.message
                        : "Erro ao salvar.",
                    );
                  }
                }}
              >
                <label>
                  Descrição
                  <input
                    name="description"
                    placeholder="Ex.: Mercado"
                    defaultValue={editing?.description ?? ""}
                    required
                  />
                </label>

                <label>
                  Tipo
                  <select name="type" defaultValue={editing?.type ?? "expense"}>
                    <option value="expense">Despesa</option>
                    <option value="income">Receita</option>
                  </select>
                </label>

                <label>
                  Valor (R$)
                  <input
                    name="amount"
                    inputMode="decimal"
                    placeholder="0,00"
                    defaultValue={
                      editing
                        ? (editing.amount / 100).toFixed(2).replace(".", ",")
                        : ""
                    }
                    required
                  />
                </label>

                <label>
                  Conta
                  <select
                    name="accountId"
                    defaultValue={editing?.accountId ?? accounts[0]?.id ?? ""}
                    required
                  >
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name}
                      </option>
                    ))}
                  </select>
                  {accounts.length === 0 && (
                    <small>
                      Cadastre uma conta antes de lançar transações.
                    </small>
                  )}
                </label>

                <label>
                  Categoria
                  <select
                    name="category"
                    defaultValue={editing?.category ?? "Outros"}
                  >
                    {categories.map((category) => (
                      <option key={category}>{category}</option>
                    ))}
                  </select>
                </label>

                <label>
                  Data
                  <input
                    name="date"
                    type="date"
                    defaultValue={editing?.date ?? today()}
                    required
                  />
                </label>

                <button
                  className="button-primary full-width"
                  type="submit"
                  disabled={accounts.length === 0}
                >
                  {editing ? "Salvar alterações" : "Adicionar transação"}
                </button>
              </form>
            )}
          </section>
        </div>
      )}
    </main>
  );
}

function NavItem({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button className={`nav-item ${active ? "active" : ""}`} onClick={onClick}>
      {icon}
      <span>{label}</span>
    </button>
  );
}

function StatCard({
  label,
  value,
  icon,
  kind,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  kind: "income" | "expense";
}) {
  return (
    <article className="stat-card">
      <div className={`stat-icon ${kind}`}>{icon}</div>
      <p className="muted">{label}</p>
      <strong>{value}</strong>
      <span className="stat-caption">Mês atual</span>
    </article>
  );
}

function TransactionList({
  transactions,
  accounts,
  onEdit,
  onDelete,
}: {
  transactions: Transaction[];
  accounts: Account[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}) {
  if (transactions.length === 0) {
    return (
      <div className="empty-state">
        <Activity size={28} />
        <strong>Nenhuma transação por aqui</strong>
        <span>Adicione uma receita ou despesa para começar.</span>
      </div>
    );
  }

  return (
    <div className="transaction-list">
      {transactions.map((transaction) => {
        const account = accounts.find(
          (item) => item.id === transaction.accountId,
        );
        const isIncome = transaction.type === "income";

        return (
          <article className="transaction-row" key={transaction.id}>
            <div
              className={`transaction-icon ${isIncome ? "income" : "expense"}`}
            >
              {isIncome ? (
                <ArrowDownLeft size={19} />
              ) : (
                <ArrowUpRight size={19} />
              )}
            </div>

            <div className="transaction-info">
              <strong>{transaction.description}</strong>
              <span>
                {transaction.category} · {account?.name ?? "Conta removida"}
              </span>
              <small>
                {new Date(`${transaction.date}T12:00:00`).toLocaleDateString(
                  "pt-BR",
                )}
              </small>
            </div>

            <div className="transaction-end">
              <strong className={isIncome ? "positive" : "negative"}>
                {isIncome ? "+" : "−"}
                {formatMoney(transaction.amount)}
              </strong>
              <div className="row-actions">
                <button
                  className="text-button"
                  onClick={() => onEdit(transaction)}
                  aria-label={`Editar ${transaction.description}`}
                >
                  Editar
                </button>
                <button
                  className="icon-button danger"
                  onClick={() => onDelete(transaction)}
                  aria-label={`Excluir ${transaction.description}`}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function AccountList({
  accounts,
  balances,
  onDelete,
}: {
  accounts: Account[];
  balances: Map<number, number>;
  onDelete: (account: Account) => void;
}) {
  if (accounts.length === 0) {
    return (
      <div className="empty-state">
        <Wallet size={28} />
        <strong>Você ainda não tem contas</strong>
        <span>Crie uma conta para começar a registrar seus gastos.</span>
      </div>
    );
  }

  const accountLabels: Record<string, string> = {
    checking: "Conta corrente",
    savings: "Poupança",
    cash: "Dinheiro",
    credit: "Cartão de crédito",
  };

  return (
    <div className="account-list">
      {accounts.map((account) => (
        <article className="account-row" key={account.id}>
          <div className="account-symbol">
            <Wallet size={19} />
          </div>
          <div className="account-info">
            <strong>{account.name}</strong>
            <span>{accountLabels[account.type] ?? account.type}</span>
          </div>
          <div className="account-end">
            <strong>{formatMoney(balances.get(account.id!) ?? 0)}</strong>
            <button
              className="icon-button danger"
              onClick={() => onDelete(account)}
              aria-label={`Excluir conta ${account.name}`}
            >
              <Trash2 size={15} />
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
