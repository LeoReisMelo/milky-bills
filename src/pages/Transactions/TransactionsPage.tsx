import { useMemo, useRef, useState, type FormEvent } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  Check,
  FileText,
  Paperclip,
  Pencil,
  Plus,
  Search,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";

import type {
  Account,
  Category,
  Transaction,
  TransactionAttachment,
  TransactionType,
} from "../../db/database";

import * as S from "./Transactions.styles";

type TransactionFormData = {
  type: "income" | "expense";
  title: string;
  description: string;
  accountId: number;
  category: string;
  amount: number;
  date: string;
  attachment?: TransactionAttachment;
};

interface TransactionsPageProps {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  onCreate: (data: TransactionFormData) => void | Promise<void>;
  onUpdate: (id: number, data: TransactionFormData) => void | Promise<void>;
  onDelete: (transaction: Transaction) => Promise<void>;
}

type FormErrors = Partial<
  Record<"title" | "amount" | "accountId" | "category" | "date", string>
>;

const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024;

const ACCEPTED_ATTACHMENT_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];

function getToday(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount / 100);
}

function formatDate(date: string): string {
  if (!date) return "Data não informada";

  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

function formatAmountInput(amountInCents: number): string {
  return (amountInCents / 100).toFixed(2).replace(".", ",");
}

function parseAmount(value: string): number {
  const normalized = value.trim().replace(/\s/g, "");

  if (!normalized) return 0;

  let decimalValue = normalized;

  if (normalized.includes(",")) {
    decimalValue = normalized.replace(/\./g, "").replace(",", ".");
  }

  const amount = Number(decimalValue);

  if (!Number.isFinite(amount) || amount <= 0) return 0;

  return Math.round(amount * 100);
}

function createInitialForm(): {
  type: "income" | "expense";
  title: string;
  description: string;
  accountId: string;
  category: string;
  amount: string;
  date: string;
} {
  return {
    type: "expense",
    title: "",
    description: "",
    accountId: "",
    category: "",
    amount: "",
    date: getToday(),
  };
}

export function TransactionsPage({
  transactions,
  accounts,
  categories,
  onCreate,
  onUpdate,
  onDelete,
}: TransactionsPageProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  const [form, setForm] = useState(createInitialForm);
  const [attachment, setAttachment] = useState<
    TransactionAttachment | undefined
  >();

  const [removeExistingAttachment, setRemoveExistingAttachment] =
    useState(false);

  const [errors, setErrors] = useState<FormErrors>({});
  const [notice, setNotice] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [accountFilter, setAccountFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const availableCategories = useMemo(
    () => categories.filter((category) => category.type === form.type),
    [categories, form.type],
  );

  const accountNames = useMemo(
    () =>
      new Map(
        accounts
          .filter((account) => account.id !== undefined)
          .map((account) => [account.id!, account.name]),
      ),
    [accounts],
  );

  const sortedTransactions = useMemo(
    () =>
      [...transactions].sort((a, b) => {
        const dateComparison = b.date.localeCompare(a.date);

        if (dateComparison !== 0) return dateComparison;

        return (b.id ?? 0) - (a.id ?? 0);
      }),
    [transactions],
  );

  const visibleTransactions = useMemo(() => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(
      now.getMonth() + 1,
    ).padStart(2, "0")}`;

    const today = getToday();

    return sortedTransactions.filter((transaction) => {
      const normalizedTitle =
        transaction.title || transaction.description || "";

      const matchesSearch = [
        normalizedTitle,
        transaction.description,
        transaction.category,
        accountNames.get(transaction.accountId) ?? "",
      ]
        .join(" ")
        .toLocaleLowerCase("pt-BR")
        .includes(search.toLocaleLowerCase("pt-BR"));

      const matchesType =
        typeFilter === "all" || transaction.type === typeFilter;

      const matchesAccount =
        accountFilter === "all" ||
        String(transaction.accountId) === accountFilter;

      let matchesPeriod = true;

      if (periodFilter === "month") {
        matchesPeriod = transaction.date.startsWith(currentMonth);
      } else if (periodFilter === "30days") {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 30);
        const cutoffDate = [
          cutoff.getFullYear(),
          String(cutoff.getMonth() + 1).padStart(2, "0"),
          String(cutoff.getDate()).padStart(2, "0"),
        ].join("-");

        matchesPeriod =
          transaction.date >= cutoffDate && transaction.date <= today;
      }

      return matchesSearch && matchesType && matchesAccount && matchesPeriod;
    });
  }, [
    sortedTransactions,
    search,
    typeFilter,
    accountFilter,
    periodFilter,
    accountNames,
  ]);

  const summary = useMemo(() => {
    const now = new Date();

    const currentMonth = `${now.getFullYear()}-${String(
      now.getMonth() + 1,
    ).padStart(2, "0")}`;

    const monthTransactions = transactions.filter((transaction) =>
      transaction.date.startsWith(currentMonth),
    );

    const income = monthTransactions
      .filter((transaction) => transaction.type === "income")
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    const expense = monthTransactions
      .filter((transaction) => transaction.type === "expense")
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    return {
      income,
      expense,
      balance: income - expense,
    };
  }, [transactions]);

  function openCreateForm() {
    setEditingTransaction(null);
    setForm(createInitialForm());
    setAttachment(undefined);
    setRemoveExistingAttachment(false);
    setErrors({});
    setNotice("");
    setIsFormOpen(true);
  }

  function openEditForm(transaction: Transaction) {
    if (transaction.type === "transfer") {
      setNotice(
        "A edição de transferências será integrada à tela de transferências.",
      );
      return;
    }

    setEditingTransaction(transaction);

    setForm({
      type: transaction.type,
      title: transaction.title || transaction.description || "",
      description: transaction.description || "",
      accountId: String(transaction.accountId),
      category: transaction.category || "",
      amount: formatAmountInput(transaction.amount),
      date: transaction.date,
    });

    setAttachment(transaction.attachment);
    setRemoveExistingAttachment(false);
    setErrors({});
    setNotice("");
    setIsFormOpen(true);
  }

  function closeForm() {
    if (isSaving) return;

    setIsFormOpen(false);
    setEditingTransaction(null);
    setAttachment(undefined);
    setRemoveExistingAttachment(false);
    setErrors({});
  }

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => {
      if (field === "type") {
        return {
          ...current,
          type: value as "income" | "expense",
          category: "",
        };
      }

      return { ...current, [field]: value };
    });

    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!ACCEPTED_ATTACHMENT_TYPES.includes(file.type)) {
      setNotice("Selecione um comprovante em PDF, JPG ou PNG.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_ATTACHMENT_SIZE) {
      setNotice("O comprovante deve ter no máximo 10 MB.");
      event.target.value = "";
      return;
    }

    setAttachment({
      name: file.name,
      type: file.type,
      size: file.size,
      data: file,
    });

    setRemoveExistingAttachment(false);
    setNotice("");
  }

  function validateForm(): FormErrors {
    const nextErrors: FormErrors = {};

    if (!form.title.trim()) {
      nextErrors.title = "Informe o título da transação.";
    }

    if (parseAmount(form.amount) <= 0) {
      nextErrors.amount = "Informe um valor maior que zero.";
    }

    const selectedAccount = Number(form.accountId);

    if (
      !form.accountId ||
      !accounts.some((account) => account.id === selectedAccount)
    ) {
      nextErrors.accountId = "Selecione uma conta válida.";
    }

    if (
      !form.category ||
      !availableCategories.some((category) => category.name === form.category)
    ) {
      nextErrors.category = "Selecione uma categoria válida.";
    }

    if (!form.date || form.date > "9999-12-31") {
      nextErrors.date = "Informe uma data válida.";
    }

    return nextErrors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateForm();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const data: TransactionFormData = {
      type: form.type,
      title: form.title.trim(),
      description: form.description.trim(),
      accountId: Number(form.accountId),
      category: form.category,
      amount: parseAmount(form.amount),
      date: form.date,
      attachment: removeExistingAttachment ? undefined : attachment,
    };

    setIsSaving(true);
    setNotice("");

    try {
      if (editingTransaction?.id !== undefined) {
        await onUpdate(editingTransaction.id, data);
      } else {
        await onCreate(data);
      }

      setIsFormOpen(false);
      setEditingTransaction(null);
      setAttachment(undefined);
      setRemoveExistingAttachment(false);
      setForm(createInitialForm());
      setErrors({});
    } catch {
      setNotice("Não foi possível salvar a transação. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(transaction: Transaction) {
    if (transaction.id === undefined) return;

    const title =
      transaction.title || transaction.description || "esta transação";

    if (!window.confirm(`Excluir "${title}"?`)) return;

    try {
      await onDelete(transaction);
      setNotice("Transação excluída.");
    } catch {
      setNotice("Não foi possível excluir a transação.");
    }
  }

  return (
    <S.Page>
      <S.PageHeader>
        <S.HeaderContent>
          <S.Eyebrow>Seu dinheiro, sob controle</S.Eyebrow>
          <S.Title>Transações</S.Title>
          <S.Subtitle>
            Acompanhe suas receitas e despesas em um só lugar.
          </S.Subtitle>
        </S.HeaderContent>

        <S.PrimaryButton type="button" onClick={openCreateForm}>
          <Plus size={18} />
          Nova transação
        </S.PrimaryButton>
      </S.PageHeader>

      <S.SummaryGrid>
        <S.SummaryCard>
          <S.SummaryIcon $variant="income">
            <TrendingUp size={21} />
          </S.SummaryIcon>
          <S.SummaryContent>
            <S.SummaryLabel>Receitas do mês</S.SummaryLabel>
            <S.SummaryValue $variant="income">
              {formatCurrency(summary.income)}
            </S.SummaryValue>
          </S.SummaryContent>
        </S.SummaryCard>

        <S.SummaryCard>
          <S.SummaryIcon $variant="expense">
            <TrendingDown size={21} />
          </S.SummaryIcon>
          <S.SummaryContent>
            <S.SummaryLabel>Despesas do mês</S.SummaryLabel>
            <S.SummaryValue $variant="expense">
              {formatCurrency(summary.expense)}
            </S.SummaryValue>
          </S.SummaryContent>
        </S.SummaryCard>

        <S.SummaryCard>
          <S.SummaryIcon $variant="total">
            <Wallet size={21} />
          </S.SummaryIcon>
          <S.SummaryContent>
            <S.SummaryLabel>Resultado do mês</S.SummaryLabel>
            <S.SummaryValue $variant="total">
              {formatCurrency(summary.balance)}
            </S.SummaryValue>
          </S.SummaryContent>
        </S.SummaryCard>
      </S.SummaryGrid>

      {notice && (
        <S.Notice role="status">
          <span>{notice}</span>
          <S.IconButton
            type="button"
            aria-label="Fechar aviso"
            onClick={() => setNotice("")}
          >
            <X size={16} />
          </S.IconButton>
        </S.Notice>
      )}

      {isFormOpen && (
        <S.Panel>
          <S.PanelHeader>
            <div>
              <S.PanelTitle>
                {editingTransaction ? "Editar transação" : "Nova transação"}
              </S.PanelTitle>
              <S.PanelDescription>
                Preencha os dados da movimentação financeira.
              </S.PanelDescription>
            </div>

            <S.IconButton
              type="button"
              aria-label="Fechar formulário"
              onClick={closeForm}
            >
              <X size={19} />
            </S.IconButton>
          </S.PanelHeader>

          <form onSubmit={handleSubmit} noValidate>
            <S.Field $fullWidth>
              <S.Label>Tipo de transação</S.Label>

              <S.TypeSwitch>
                <S.TypeOption
                  type="button"
                  $active={form.type === "expense"}
                  $type="expense"
                  onClick={() => updateField("type", "expense")}
                >
                  <ArrowUpRight size={18} />
                  Despesa
                </S.TypeOption>

                <S.TypeOption
                  type="button"
                  $active={form.type === "income"}
                  $type="income"
                  onClick={() => updateField("type", "income")}
                >
                  <ArrowDownLeft size={18} />
                  Receita
                </S.TypeOption>
              </S.TypeSwitch>
            </S.Field>

            <S.FormGrid style={{ marginTop: 22 }}>
              <S.Field $fullWidth>
                <S.Label htmlFor="transaction-title">Título</S.Label>
                <S.Input
                  id="transaction-title"
                  placeholder="Ex.: Supermercado, salário..."
                  value={form.title}
                  onChange={(event) => updateField("title", event.target.value)}
                  maxLength={120}
                  aria-invalid={Boolean(errors.title)}
                  aria-describedby={
                    errors.title ? "transaction-title-error" : undefined
                  }
                />
                {errors.title && (
                  <S.ErrorMessage id="transaction-title-error">
                    {errors.title}
                  </S.ErrorMessage>
                )}
              </S.Field>

              <S.Field>
                <S.Label htmlFor="transaction-amount">Valor</S.Label>
                <S.AmountInputWrapper>
                  <S.AmountInput
                    id="transaction-amount"
                    inputMode="decimal"
                    placeholder="0,00"
                    value={form.amount}
                    onChange={(event) =>
                      updateField("amount", event.target.value)
                    }
                    aria-invalid={Boolean(errors.amount)}
                    aria-describedby={
                      errors.amount ? "transaction-amount-error" : undefined
                    }
                  />
                </S.AmountInputWrapper>
                {errors.amount && (
                  <S.ErrorMessage id="transaction-amount-error">
                    {errors.amount}
                  </S.ErrorMessage>
                )}
              </S.Field>

              <S.Field>
                <S.Label htmlFor="transaction-date">
                  Data da movimentação
                </S.Label>
                <S.Input
                  id="transaction-date"
                  type="date"
                  value={form.date}
                  onChange={(event) => updateField("date", event.target.value)}
                  aria-invalid={Boolean(errors.date)}
                />
                {errors.date && <S.ErrorMessage>{errors.date}</S.ErrorMessage>}
              </S.Field>

              <S.Field>
                <S.Label htmlFor="transaction-account">Conta</S.Label>
                <S.Select
                  id="transaction-account"
                  value={form.accountId}
                  onChange={(event) =>
                    updateField("accountId", event.target.value)
                  }
                  aria-invalid={Boolean(errors.accountId)}
                >
                  <option value="">Selecione uma conta</option>
                  {accounts
                    .filter((account) => account.id !== undefined)
                    .map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name}
                      </option>
                    ))}
                </S.Select>
                {errors.accountId && (
                  <S.ErrorMessage>{errors.accountId}</S.ErrorMessage>
                )}
                {accounts.length === 0 && (
                  <S.UploadHint>
                    Cadastre uma conta antes de registrar uma transação.
                  </S.UploadHint>
                )}
              </S.Field>

              <S.Field>
                <S.Label htmlFor="transaction-category">Categoria</S.Label>
                <S.Select
                  id="transaction-category"
                  value={form.category}
                  onChange={(event) =>
                    updateField("category", event.target.value)
                  }
                  aria-invalid={Boolean(errors.category)}
                >
                  <option value="">Selecione uma categoria</option>
                  {availableCategories.map((category) => (
                    <option
                      key={category.id ?? category.name}
                      value={category.name}
                    >
                      {category.name}
                    </option>
                  ))}
                </S.Select>
                {errors.category && (
                  <S.ErrorMessage>{errors.category}</S.ErrorMessage>
                )}
                {availableCategories.length === 0 && (
                  <S.UploadHint>
                    Não há categorias para este tipo de transação.
                  </S.UploadHint>
                )}
              </S.Field>

              <S.Field $fullWidth>
                <S.Label htmlFor="transaction-description">
                  Descrição <span>(opcional)</span>
                </S.Label>
                <S.Textarea
                  id="transaction-description"
                  placeholder="Adicione detalhes sobre esta movimentação..."
                  value={form.description}
                  onChange={(event) =>
                    updateField("description", event.target.value)
                  }
                  maxLength={1000}
                />
              </S.Field>

              <S.Field $fullWidth>
                <S.Label>Comprovante (opcional)</S.Label>

                <S.UploadArea
                  $hasFile={Boolean(attachment)}
                  htmlFor="transaction-attachment"
                >
                  <S.UploadIcon>
                    <Paperclip size={21} />
                  </S.UploadIcon>

                  <S.UploadText>
                    <S.UploadTitle>
                      {attachment?.name ?? "Anexar comprovante"}
                    </S.UploadTitle>
                    <S.UploadHint>
                      PDF, JPG ou PNG · Máximo de 10 MB
                    </S.UploadHint>
                  </S.UploadText>

                  {attachment ? (
                    <Check size={19} color="#16834b" />
                  ) : (
                    <FileText size={20} color="#bd6486" />
                  )}
                </S.UploadArea>

                <S.HiddenFileInput
                  ref={fileInputRef}
                  id="transaction-attachment"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                  onChange={handleFileChange}
                />

                {attachment && (
                  <S.AttachmentActions>
                    <S.TextButton
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Substituir arquivo
                    </S.TextButton>

                    <S.TextButton
                      type="button"
                      onClick={() => {
                        setAttachment(undefined);
                        setRemoveExistingAttachment(true);

                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }}
                    >
                      <Trash2 size={14} />
                      Remover comprovante
                    </S.TextButton>
                  </S.AttachmentActions>
                )}

                {editingTransaction?.attachment &&
                  !attachment &&
                  !removeExistingAttachment && (
                    <S.UploadHint>
                      Um comprovante já está anexado à transação.
                    </S.UploadHint>
                  )}
              </S.Field>
            </S.FormGrid>

            <S.FormFooter>
              <S.SecondaryButton
                type="button"
                onClick={closeForm}
                disabled={isSaving}
              >
                Cancelar
              </S.SecondaryButton>

              <S.PrimaryButton
                type="submit"
                disabled={
                  isSaving ||
                  accounts.length === 0 ||
                  availableCategories.length === 0
                }
              >
                <Check size={17} />
                {isSaving
                  ? "Salvando..."
                  : editingTransaction
                    ? "Salvar alterações"
                    : "Salvar transação"}
              </S.PrimaryButton>
            </S.FormFooter>
          </form>
        </S.Panel>
      )}

      <S.Panel>
        <S.PanelHeader>
          <div>
            <S.PanelTitle>Histórico de transações</S.PanelTitle>
            <S.PanelDescription>
              Consulte e gerencie suas movimentações.
            </S.PanelDescription>
          </div>
        </S.PanelHeader>

        <S.Filters>
          <S.SearchWrapper>
            <Search size={17} />
            <S.Input
              aria-label="Pesquisar transações"
              placeholder="Buscar transação..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </S.SearchWrapper>

          <S.Select
            aria-label="Filtrar por tipo"
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
          >
            <option value="all">Todos os tipos</option>
            <option value="income">Receitas</option>
            <option value="expense">Despesas</option>
            <option value="transfer">Transferências</option>
          </S.Select>

          <S.Select
            aria-label="Filtrar por conta"
            value={accountFilter}
            onChange={(event) => setAccountFilter(event.target.value)}
          >
            <option value="all">Todas as contas</option>
            {accounts
              .filter((account) => account.id !== undefined)
              .map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
          </S.Select>

          <S.Select
            aria-label="Filtrar por período"
            value={periodFilter}
            onChange={(event) => setPeriodFilter(event.target.value)}
          >
            <option value="all">Todo o período</option>
            <option value="month">Este mês</option>
            <option value="30days">Últimos 30 dias</option>
          </S.Select>
        </S.Filters>

        <S.ResultsCount>
          {visibleTransactions.length}{" "}
          {visibleTransactions.length === 1
            ? "transação encontrada"
            : "transações encontradas"}
        </S.ResultsCount>

        {visibleTransactions.length > 0 ? (
          <S.TransactionList>
            {visibleTransactions.map((transaction) => {
              const isIncome = transaction.type === "income";
              const isTransfer = transaction.type === "transfer";

              const title =
                transaction.title ||
                transaction.description ||
                (isTransfer ? "Transferência" : "Transação");

              return (
                <S.TransactionRow key={transaction.id}>
                  <S.TransactionIcon $type={transaction.type}>
                    {isIncome ? (
                      <ArrowDownLeft size={20} />
                    ) : isTransfer ? (
                      <Wallet size={20} />
                    ) : (
                      <ArrowUpRight size={20} />
                    )}
                  </S.TransactionIcon>

                  <S.TransactionInfo>
                    <S.TransactionTitle>{title}</S.TransactionTitle>

                    <S.TransactionMeta>
                      {transaction.category || "Sem categoria"} ·{" "}
                      {accountNames.get(transaction.accountId) ??
                        "Conta não encontrada"}{" "}
                      · {formatDate(transaction.date)}
                    </S.TransactionMeta>

                    {transaction.attachment && (
                      <S.AttachmentBadge>
                        <Paperclip size={12} />
                        Comprovante anexado
                      </S.AttachmentBadge>
                    )}
                  </S.TransactionInfo>

                  <S.TransactionAmount $type={transaction.type}>
                    {isIncome ? "+" : isTransfer ? "" : "−"}
                    {formatCurrency(transaction.amount)}
                  </S.TransactionAmount>

                  <S.RowActions>
                    <S.IconButton
                      type="button"
                      aria-label={`Editar ${title}`}
                      title="Editar transação"
                      onClick={() => openEditForm(transaction)}
                    >
                      <Pencil size={16} />
                    </S.IconButton>

                    <S.IconButton
                      type="button"
                      aria-label={`Excluir ${title}`}
                      title="Excluir transação"
                      onClick={() => void handleDelete(transaction)}
                    >
                      <Trash2 size={16} />
                    </S.IconButton>
                  </S.RowActions>
                </S.TransactionRow>
              );
            })}
          </S.TransactionList>
        ) : (
          <S.EmptyState>
            <S.EmptyIcon>
              {search ||
              typeFilter !== "all" ||
              accountFilter !== "all" ||
              periodFilter !== "all" ? (
                <Search size={25} />
              ) : (
                <CalendarDays size={25} />
              )}
            </S.EmptyIcon>

            <S.EmptyTitle>
              {transactions.length === 0
                ? "Nenhuma transação por enquanto"
                : "Nenhuma transação encontrada"}
            </S.EmptyTitle>

            <S.EmptyDescription>
              {transactions.length === 0
                ? "Registre sua primeira receita ou despesa para começar a acompanhar suas finanças."
                : "Tente mudar os filtros ou pesquisar por outro termo."}
            </S.EmptyDescription>

            {transactions.length === 0 && (
              <S.PrimaryButton type="button" onClick={openCreateForm}>
                <Plus size={17} />
                Criar primeira transação
              </S.PrimaryButton>
            )}
          </S.EmptyState>
        )}
      </S.Panel>
    </S.Page>
  );
}
