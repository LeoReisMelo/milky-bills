import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  Check,
  CreditCard as CreditCardIcon,
  House,
  Utensils,
  CarFront,
  HeartPulse,
  Gamepad2,
  GraduationCap,
  BriefcaseBusiness,
  TrendingUp,
  Tags,
  FileText,
  Eye,
  Download,
  Paperclip,
  Pencil,
  Plus,
  Search,
  Trash2,
  Wallet,
  X,
  MoreHorizontal,
} from "lucide-react";

import type {
  Account,
  Category,
  CreditCard,
  Transaction,
  TransactionAttachment,
} from "../../db/database";

import * as S from "./Transactions.styles";

export type TransactionFormData = {
  type: "income" | "expense";
  title: string;
  description: string;
  accountId?: number;
  creditCardId?: number;
  category: string;
  amount: number;
  date: string;
  attachment?: TransactionAttachment;
};

interface TransactionsPageProps {
  transactions: Transaction[];
  accounts: Account[];
  creditCards: CreditCard[];
  categories: Category[];
  onCreate: (data: TransactionFormData) => void | Promise<void>;
  onUpdate: (id: number, data: TransactionFormData) => void | Promise<void>;
  onDelete: (transaction: Transaction) => Promise<void>;
}

type FormErrors = Partial<
  Record<
    "title" | "amount" | "accountId" | "creditCardId" | "category" | "date",
    string
  >
>;
const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024;
const ACCEPTED_ATTACHMENT_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];

function getToday(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
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
  const decimalValue = normalized.includes(",")
    ? normalized.replace(/\./g, "").replace(",", ".")
    : normalized;
  const amount = Number(decimalValue);
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  return Math.round(amount * 100);
}

function createInitialForm() {
  return {
    type: "expense" as "income" | "expense",
    paymentMethod: "account" as "account" | "creditCard",
    title: "",
    description: "",
    accountId: "",
    creditCardId: "",
    category: "",
    amount: "",
    date: getToday(),
  };
}

export function TransactionsPage({
  transactions = [],
  accounts = [],
  creditCards = [],
  categories = [],
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
  const [previewAttachment, setPreviewAttachment] =
    useState<TransactionAttachment | null>(null);
  const previewUrl = useMemo(
    () =>
      previewAttachment ? URL.createObjectURL(previewAttachment.data) : null,
    [previewAttachment],
  );

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [accountFilter, setAccountFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [recurrenceFilter, setRecurrenceFilter] = useState("all");
  const [openActionId, setOpenActionId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const availableCategories = useMemo(
    () => (categories ?? []).filter((category) => category.type === form.type),
    [categories, form.type],
  );

  const accountNames = useMemo(
    () =>
      new Map(
        (accounts ?? [])
          .filter((account) => account.id !== undefined)
          .map((account) => [account.id!, account.name]),
      ),
    [accounts],
  );

  const cardNames = useMemo(
    () =>
      new Map(
        (creditCards ?? [])
          .filter((card) => card.id !== undefined)
          .map((card) => [
            card.id!,
            `${card.name} •••• ${card.lastFourDigits}`,
          ]),
      ),
    [creditCards],
  );

  const paymentSourceName = (transaction: Transaction) =>
    transaction.creditCardId != null
      ? (cardNames.get(transaction.creditCardId) ?? "Cartão não encontrado")
      : transaction.accountId != null
        ? (accountNames.get(transaction.accountId) ?? "Conta não encontrada")
        : "Origem não informada";
  const categoryNames = useMemo(
    () =>
      categories
        .map((category) => category.name)
        .filter((name, index, all) => all.indexOf(name) === index)
        .sort((a, b) => a.localeCompare(b, "pt-BR")),
    [categories],
  );

  const sortedTransactions = useMemo(
    () =>
      [...(transactions ?? [])].sort((a, b) => {
        const dateComparison = (b.date ?? "").localeCompare(a.date ?? "");

        return dateComparison !== 0
          ? dateComparison
          : (b.id ?? 0) - (a.id ?? 0);
      }),
    [transactions],
  );

  const visibleTransactions = useMemo(
    () =>
      sortedTransactions.filter((transaction) => {
        const title = transaction.title || transaction.description || "";
        const searchableText = [
          title,
          transaction.description,
          transaction.category,
          paymentSourceName(transaction),
        ]
          .join(" ")
          .toLocaleLowerCase("pt-BR");
        const matchesSearch = searchableText.includes(
          search.toLocaleLowerCase("pt-BR"),
        );
        const matchesType =
          typeFilter === "all" || transaction.type === typeFilter;
        const matchesCategory =
          categoryFilter === "all" || transaction.category === categoryFilter;
        const matchesAccount =
          accountFilter === "all" ||
          (accountFilter.startsWith("account:") &&
            String(transaction.accountId) === accountFilter.slice(8)) ||
          (accountFilter.startsWith("card:") &&
            String(transaction.creditCardId) === accountFilter.slice(5));
        const matchesStartDate = !startDate || transaction.date >= startDate;
        const matchesEndDate = !endDate || transaction.date <= endDate;

        // Recurrence is not part of the current Transaction model yet. Keep the selector
        // ready for the future data-model integration without incorrectly hiding records.
        const matchesRecurrence = recurrenceFilter === "all";
        return (
          matchesSearch &&
          matchesType &&
          matchesCategory &&
          matchesAccount &&
          matchesStartDate &&
          matchesEndDate &&
          matchesRecurrence
        );
      }),
    [
      sortedTransactions,
      search,
      typeFilter,
      categoryFilter,
      accountFilter,
      startDate,
      endDate,
      recurrenceFilter,
      accountNames,
      cardNames,
    ],
  );

  const totals = useMemo(
    () =>
      visibleTransactions.reduce(
        (result, transaction) => {
          if (transaction.type === "income")
            result.income += transaction.amount;
          else if (transaction.type === "expense")
            result.expense += transaction.amount;
          return result;
        },
        { income: 0, expense: 0 },
      ),
    [visibleTransactions],
  );

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
      paymentMethod:
        transaction.creditCardId != null ? "creditCard" : "account",
      accountId:
        transaction.accountId != null ? String(transaction.accountId) : "",
      creditCardId:
        transaction.creditCardId != null
          ? String(transaction.creditCardId)
          : "",
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

  function updateField(
    field: keyof ReturnType<typeof createInitialForm>,
    value: string,
  ) {
    setForm((current) => {
      if (field === "type") {
        const nextType = value as "income" | "expense";
        return {
          ...current,
          type: nextType,
          category: "",
          paymentMethod:
            nextType === "income" ? "account" : current.paymentMethod,
          creditCardId: nextType === "income" ? "" : current.creditCardId,
        };
      }
      if (field === "paymentMethod") {
        const paymentMethod = value as "account" | "creditCard";
        return {
          ...current,
          paymentMethod,
          accountId: paymentMethod === "account" ? current.accountId : "",
          creditCardId:
            paymentMethod === "creditCard" ? current.creditCardId : "",
        };
      }
      return { ...current, [field]: value };
    });
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function downloadAttachment(file: TransactionAttachment) {
    const url = URL.createObjectURL(file.data);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function openAttachmentPreview(file: TransactionAttachment) {
    setPreviewAttachment(file);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
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
    if (!form.title.trim()) nextErrors.title = "Informe o título da transação.";
    if (parseAmount(form.amount) <= 0)
      nextErrors.amount = "Informe um valor maior que zero.";
    if (form.type === "income" || form.paymentMethod === "account") {
      const selectedAccount = Number(form.accountId);
      if (
        !form.accountId ||
        !accounts.some((account) => account.id === selectedAccount)
      )
        nextErrors.accountId = "Selecione uma conta válida.";
    } else {
      const selectedCard = Number(form.creditCardId);
      if (
        !form.creditCardId ||
        !creditCards.some((card) => card.id === selectedCard)
      )
        nextErrors.creditCardId = "Selecione um cartão de crédito válido.";
    }
    if (
      !form.category ||
      !availableCategories.some((category) => category.name === form.category)
    )
      nextErrors.category = "Selecione uma categoria válida.";
    if (!form.date || form.date > "9999-12-31")
      nextErrors.date = "Informe uma data válida.";
    return nextErrors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateForm();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    const usesCreditCard =
      form.type === "expense" && form.paymentMethod === "creditCard";
    const data: TransactionFormData = {
      type: form.type,
      title: form.title.trim(),
      description: form.description.trim(),
      accountId: usesCreditCard ? undefined : Number(form.accountId),
      creditCardId: usesCreditCard ? Number(form.creditCardId) : undefined,
      category: form.category,
      amount: parseAmount(form.amount),
      date: form.date,
      attachment: removeExistingAttachment ? undefined : attachment,
    };
    setIsSaving(true);
    setNotice("");
    try {
      if (editingTransaction?.id !== undefined)
        await onUpdate(editingTransaction.id, data);
      else await onCreate(data);
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
    setOpenActionId(null);
  }

  function categoryIcon(categoryName: string) {
    const normalized = categoryName.toLocaleLowerCase("pt-BR");
    if (normalized.includes("moradia") || normalized.includes("casa"))
      return <House size={19} />;
    if (normalized.includes("alimenta")) return <Utensils size={19} />;
    if (normalized.includes("transport")) return <CarFront size={19} />;
    if (normalized.includes("saúde") || normalized.includes("saude"))
      return <HeartPulse size={19} />;
    if (normalized.includes("lazer")) return <Gamepad2 size={19} />;
    if (normalized.includes("educa")) return <GraduationCap size={19} />;
    if (normalized.includes("salário") || normalized.includes("salario"))
      return <BriefcaseBusiness size={19} />;
    if (normalized.includes("invest")) return <TrendingUp size={19} />;
    return <Tags size={19} />;
  }

  const hasActiveFilters = Boolean(
    search ||
    typeFilter !== "all" ||
    categoryFilter !== "all" ||
    accountFilter !== "all" ||
    startDate ||
    endDate ||
    recurrenceFilter !== "all",
  );

  return (
    <S.Page>
      <S.PageHeader>
        <S.HeaderContent>
          <S.Title>Transactions</S.Title>
          <S.Subtitle>Every movement, clearly organized.</S.Subtitle>
        </S.HeaderContent>
        <S.PrimaryButton type="button" onClick={openCreateForm}>
          <Plus size={17} />
          New transaction
        </S.PrimaryButton>
      </S.PageHeader>

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
                {editingTransaction ? "Edit transaction" : "New transaction"}
              </S.PanelTitle>
              <S.PanelDescription>
                Enter the details of your financial movement.
              </S.PanelDescription>
            </div>
            <S.IconButton
              type="button"
              aria-label="Close form"
              onClick={closeForm}
            >
              <X size={19} />
            </S.IconButton>
          </S.PanelHeader>
          <form onSubmit={handleSubmit} noValidate>
            <S.Field $fullWidth>
              <S.Label>Transaction type</S.Label>
              <S.TypeSwitch>
                <S.TypeOption
                  type="button"
                  $active={form.type === "expense"}
                  $type="expense"
                  onClick={() => updateField("type", "expense")}
                >
                  <ArrowUpRight size={18} />
                  Expense
                </S.TypeOption>
                <S.TypeOption
                  type="button"
                  $active={form.type === "income"}
                  $type="income"
                  onClick={() => updateField("type", "income")}
                >
                  <ArrowDownLeft size={18} />
                  Income
                </S.TypeOption>
              </S.TypeSwitch>
            </S.Field>
            <S.FormGrid style={{ marginTop: 20 }}>
              <S.Field $fullWidth>
                <S.Label htmlFor="transaction-title">Title</S.Label>
                <S.Input
                  id="transaction-title"
                  placeholder="e.g. Groceries, salary..."
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
                <S.Label htmlFor="transaction-amount">Amount</S.Label>
                <S.AmountInputWrapper>
                  <S.AmountInput
                    id="transaction-amount"
                    inputMode="decimal"
                    placeholder="0.00"
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
                <S.Label htmlFor="transaction-date">Transaction date</S.Label>
                <S.Input
                  id="transaction-date"
                  type="date"
                  value={form.date}
                  onChange={(event) => updateField("date", event.target.value)}
                  aria-invalid={Boolean(errors.date)}
                />
                {errors.date && <S.ErrorMessage>{errors.date}</S.ErrorMessage>}
              </S.Field>
              {form.type === "expense" && (
                <S.Field $fullWidth>
                  <S.Label>Payment method</S.Label>
                  <S.TypeSwitch>
                    <S.TypeOption
                      type="button"
                      $active={form.paymentMethod === "account"}
                      $type="expense"
                      onClick={() => updateField("paymentMethod", "account")}
                    >
                      <Wallet size={17} />
                      Account / debit
                    </S.TypeOption>
                    <S.TypeOption
                      type="button"
                      $active={form.paymentMethod === "creditCard"}
                      $type="income"
                      onClick={() => updateField("paymentMethod", "creditCard")}
                    >
                      <CreditCardIcon size={17} />
                      Credit card
                    </S.TypeOption>
                  </S.TypeSwitch>
                  <S.UploadHint>
                    Choose one payment source. Credit-card purchases do not
                    immediately change the bank account balance.
                  </S.UploadHint>
                </S.Field>
              )}
              {form.type === "income" || form.paymentMethod === "account" ? (
                <S.Field>
                  <S.Label htmlFor="transaction-account">Account</S.Label>
                  <S.Select
                    id="transaction-account"
                    value={form.accountId}
                    onChange={(event) =>
                      updateField("accountId", event.target.value)
                    }
                    aria-invalid={Boolean(errors.accountId)}
                  >
                    <option value="">Select an account</option>
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
                      Create an account before adding a transaction.
                    </S.UploadHint>
                  )}
                </S.Field>
              ) : (
                <S.Field>
                  <S.Label htmlFor="transaction-credit-card">
                    Credit card
                  </S.Label>
                  <S.Select
                    id="transaction-credit-card"
                    value={form.creditCardId}
                    onChange={(event) =>
                      updateField("creditCardId", event.target.value)
                    }
                    aria-invalid={Boolean(errors.creditCardId)}
                  >
                    <option value="">Select a credit card</option>
                    {creditCards
                      .filter((card) => card.id !== undefined)
                      .map((card) => (
                        <option key={card.id} value={card.id}>
                          {card.name} · {card.brand} ···· {card.lastFourDigits}
                        </option>
                      ))}
                  </S.Select>
                  {errors.creditCardId && (
                    <S.ErrorMessage>{errors.creditCardId}</S.ErrorMessage>
                  )}
                  {creditCards.length === 0 && (
                    <S.UploadHint>
                      Register a credit card on the Cards page first.
                    </S.UploadHint>
                  )}
                </S.Field>
              )}
              <S.Field>
                <S.Label htmlFor="transaction-category">Category</S.Label>
                <S.Select
                  id="transaction-category"
                  value={form.category}
                  onChange={(event) =>
                    updateField("category", event.target.value)
                  }
                  aria-invalid={Boolean(errors.category)}
                >
                  <option value="">Select a category</option>
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
                    No categories for this transaction type.
                  </S.UploadHint>
                )}
              </S.Field>
              <S.Field $fullWidth>
                <S.Label htmlFor="transaction-description">
                  Description <span>(optional)</span>
                </S.Label>
                <S.Textarea
                  id="transaction-description"
                  placeholder="Add details about this movement..."
                  value={form.description}
                  onChange={(event) =>
                    updateField("description", event.target.value)
                  }
                  maxLength={1000}
                />
              </S.Field>
              <S.Field $fullWidth>
                <S.Label>Attachment (optional)</S.Label>
                <S.UploadArea
                  $hasFile={Boolean(attachment)}
                  htmlFor="transaction-attachment"
                >
                  <S.UploadIcon>
                    <Paperclip size={20} />
                  </S.UploadIcon>
                  <S.UploadText>
                    <S.UploadTitle>
                      {attachment?.name ?? "Attach a receipt"}
                    </S.UploadTitle>
                    <S.UploadHint>PDF, JPG or PNG · Maximum 10 MB</S.UploadHint>
                  </S.UploadText>
                  {attachment ? (
                    <Check size={19} color="#16834b" />
                  ) : (
                    <FileText size={20} color="#3268e9" />
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
                      onClick={() => openAttachmentPreview(attachment)}
                    >
                      <Eye size={14} />
                      Visualizar
                    </S.TextButton>
                    <S.TextButton
                      type="button"
                      onClick={() => downloadAttachment(attachment)}
                    >
                      <Download size={14} />
                      Baixar
                    </S.TextButton>
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
                        if (fileInputRef.current)
                          fileInputRef.current.value = "";
                      }}
                    >
                      <Trash2 size={14} />
                      Remover anexo
                    </S.TextButton>
                  </S.AttachmentActions>
                )}
                {editingTransaction?.attachment &&
                  !attachment &&
                  !removeExistingAttachment && (
                    <S.UploadHint>
                      An attachment is already linked to this transaction.
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
                Cancel
              </S.SecondaryButton>
              <S.PrimaryButton
                type="submit"
                disabled={
                  isSaving ||
                  (form.type === "income"
                    ? accounts.length === 0
                    : form.paymentMethod === "account"
                      ? accounts.length === 0
                      : creditCards.length === 0) ||
                  availableCategories.length === 0
                }
              >
                <Check size={17} />
                {isSaving
                  ? "Saving..."
                  : editingTransaction
                    ? "Save changes"
                    : "Save transaction"}
              </S.PrimaryButton>
            </S.FormFooter>
          </form>
        </S.Panel>
      )}

      <S.Panel>
        <S.Filters>
          <S.SearchWrapper>
            <Search size={17} />
            <S.Input
              aria-label="Search transactions"
              placeholder="Search transactions"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </S.SearchWrapper>
          <S.Input
            aria-label="Start date"
            type="date"
            value={startDate}
            max={endDate || undefined}
            onChange={(event) => setStartDate(event.target.value)}
          />
          <S.Input
            aria-label="End date"
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(event) => setEndDate(event.target.value)}
          />
          <S.Select
            aria-label="Filter by type"
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
          >
            <option value="all">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
            <option value="transfer">Transfers</option>
          </S.Select>
          <S.Select
            aria-label="Filter by category"
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
          >
            <option value="all">All categories</option>
            {categoryNames.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </S.Select>
          <S.Select
            aria-label="Filter by account or card"
            value={accountFilter}
            onChange={(event) => setAccountFilter(event.target.value)}
          >
            <option value="all">All accounts &amp; cards</option>
            <optgroup label="Accounts">
              {accounts
                .filter((account) => account.id !== undefined)
                .map((account) => (
                  <option
                    key={`account-${account.id}`}
                    value={`account:${account.id}`}
                  >
                    {account.name}
                  </option>
                ))}
            </optgroup>
            <optgroup label="Credit cards">
              {creditCards
                .filter((card) => card.id !== undefined)
                .map((card) => (
                  <option key={`card-${card.id}`} value={`card:${card.id}`}>
                    {card.name} ···· {card.lastFourDigits}
                  </option>
                ))}
            </optgroup>
          </S.Select>
          <S.Select
            aria-label="Filter by recurrence"
            value={recurrenceFilter}
            onChange={(event) => setRecurrenceFilter(event.target.value)}
          >
            <option value="all">Recurring &amp; one-off</option>
          </S.Select>
        </S.Filters>

        <S.ResultsCount>
          <span>
            {visibleTransactions.length}{" "}
            {visibleTransactions.length === 1 ? "transaction" : "transactions"}
          </span>
          <S.ResultsTotals>
            <span>
              In{" "}
              <strong className="income">
                {formatCurrency(totals.income)}
              </strong>
            </span>
            <span>·</span>
            <span>
              Out <strong>{formatCurrency(totals.expense)}</strong>
            </span>
          </S.ResultsTotals>
        </S.ResultsCount>

        {visibleTransactions.length > 0 ? (
          <S.TransactionList>
            {visibleTransactions.map((transaction) => {
              const isIncome = transaction.type === "income";
              const isTransfer = transaction.type === "transfer";
              const title =
                transaction.title ||
                transaction.description ||
                (isTransfer ? "Transfer" : "Transaction");
              return (
                <S.TransactionRow key={transaction.id}>
                  <S.TransactionIcon $type={transaction.type}>
                    {isTransfer ? (
                      <Wallet size={19} />
                    ) : (
                      categoryIcon(transaction.category || "")
                    )}
                  </S.TransactionIcon>
                  <S.TransactionInfo>
                    <S.TransactionTitle>{title}</S.TransactionTitle>
                    <S.TransactionMeta>
                      {transaction.category || "Uncategorized"} ·{" "}
                      {formatDate(transaction.date)} ·{" "}
                      {paymentSourceName(transaction)}
                    </S.TransactionMeta>
                    {transaction.attachment && (
                      <S.AttachmentActions>
                        <S.AttachmentBadge
                          as="button"
                          type="button"
                          onClick={() =>
                            openAttachmentPreview(transaction.attachment!)
                          }
                        >
                          <Eye size={12} />
                          Visualizar anexo
                        </S.AttachmentBadge>
                        <S.TextButton
                          type="button"
                          onClick={() =>
                            downloadAttachment(transaction.attachment!)
                          }
                        >
                          <Download size={13} />
                          Baixar
                        </S.TextButton>
                      </S.AttachmentActions>
                    )}
                  </S.TransactionInfo>
                  <S.TransactionAmount $type={transaction.type}>
                    {isIncome ? "+" : isTransfer ? "" : "−"}
                    {formatCurrency(transaction.amount)}
                  </S.TransactionAmount>
                  <S.RowActions>
                    <S.IconButton
                      type="button"
                      aria-label={`Actions for ${title}`}
                      title="Transaction actions"
                      onClick={() =>
                        setOpenActionId(
                          openActionId === transaction.id
                            ? null
                            : (transaction.id ?? null),
                        )
                      }
                    >
                      <MoreHorizontal size={19} />
                    </S.IconButton>
                    {openActionId === transaction.id && (
                      <>
                        <S.IconButton
                          type="button"
                          aria-label={`Edit ${title}`}
                          title="Edit transaction"
                          onClick={() => {
                            setOpenActionId(null);
                            openEditForm(transaction);
                          }}
                        >
                          <Pencil size={15} />
                        </S.IconButton>
                        <S.IconButton
                          type="button"
                          aria-label={`Delete ${title}`}
                          title="Delete transaction"
                          onClick={() => void handleDelete(transaction)}
                        >
                          <Trash2 size={15} />
                        </S.IconButton>
                      </>
                    )}
                  </S.RowActions>
                </S.TransactionRow>
              );
            })}
          </S.TransactionList>
        ) : (
          <S.EmptyState>
            <S.EmptyIcon>
              {hasActiveFilters ? (
                <Search size={24} />
              ) : (
                <CalendarDays size={24} />
              )}
            </S.EmptyIcon>
            <S.EmptyTitle>
              {transactions.length === 0
                ? "No transactions yet"
                : "No transactions found"}
            </S.EmptyTitle>
            <S.EmptyDescription>
              {transactions.length === 0
                ? "Add your first income or expense to start tracking your finances."
                : "Try adjusting your filters or searching for another term."}
            </S.EmptyDescription>
            {transactions.length === 0 && (
              <S.PrimaryButton type="button" onClick={openCreateForm}>
                <Plus size={17} />
                Create first transaction
              </S.PrimaryButton>
            )}
          </S.EmptyState>
        )}
      </S.Panel>

      {previewAttachment && previewUrl && (
        <S.PreviewBackdrop
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget)
              setPreviewAttachment(null);
          }}
        >
          <S.PreviewDialog
            role="dialog"
            aria-modal="true"
            aria-label={`Visualização do anexo ${previewAttachment.name}`}
          >
            <S.PreviewHeader>
              <div>
                <S.PreviewTitle>{previewAttachment.name}</S.PreviewTitle>
                <S.UploadHint>
                  {(previewAttachment.size / (1024 * 1024)).toLocaleString(
                    "pt-BR",
                    { maximumFractionDigits: 2 },
                  )}{" "}
                  MB
                </S.UploadHint>
              </div>
              <S.IconButton
                type="button"
                aria-label="Fechar visualização"
                onClick={() => setPreviewAttachment(null)}
              >
                <X size={19} />
              </S.IconButton>
            </S.PreviewHeader>
            <S.PreviewContent>
              {previewAttachment.type.startsWith("image/") ? (
                <S.PreviewImage
                  src={previewUrl}
                  alt={`Pré-visualização de ${previewAttachment.name}`}
                />
              ) : previewAttachment.type === "application/pdf" ? (
                <S.PreviewFrame
                  src={previewUrl}
                  title={`Pré-visualização de ${previewAttachment.name}`}
                />
              ) : (
                <S.PreviewFallback>
                  <FileText size={34} />
                  <span>Este formato não possui pré-visualização.</span>
                </S.PreviewFallback>
              )}
            </S.PreviewContent>
            <S.PreviewFooter>
              <S.SecondaryButton
                type="button"
                onClick={() => setPreviewAttachment(null)}
              >
                Fechar
              </S.SecondaryButton>
              <S.PrimaryButton
                type="button"
                onClick={() => downloadAttachment(previewAttachment)}
              >
                <Download size={16} />
                Baixar arquivo
              </S.PrimaryButton>
            </S.PreviewFooter>
          </S.PreviewDialog>
        </S.PreviewBackdrop>
      )}
    </S.Page>
  );
}
