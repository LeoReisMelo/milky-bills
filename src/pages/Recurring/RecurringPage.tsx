import { useMemo, useState, type FormEvent } from "react";
import {
  House,
  Utensils,
  CarFront,
  HeartPulse,
  Gamepad2,
  GraduationCap,
  BriefcaseBusiness,
  TrendingUp,
  Tags,
} from "lucide-react";

import type {
  Account,
  Category,
  CreditCard,
  RecurringTransaction,
  RecurrenceStatus,
} from "../../db/database";
import { countRemainingOccurrences } from "../../lib/recurring";
import * as S from "./Recurring.styles";

type RecurrenceInput = Omit<
  RecurringTransaction,
  "id" | "createdAt" | "updatedAt"
>;

interface RecurringPageProps {
  recurrences: RecurringTransaction[];
  accounts: Account[];
  creditCards: CreditCard[];
  categories: Category[];
  onCreate: (data: RecurrenceInput) => Promise<void>;
  onUpdate: (id: number, data: RecurrenceInput) => Promise<void>;
  onChangeStatus: (id: number, status: RecurrenceStatus) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

type Frequency = RecurringTransaction["frequency"];
type RecurrenceType = RecurringTransaction["type"];

const frequencyLabels: Record<Frequency, string> = {
  weekly: "Semanal",
  monthly: "Mensal",
  yearly: "Anual",
};

const statusLabels: Record<RecurrenceStatus, string> = {
  active: "Ativa",
  paused: "Pausada",
  concluded: "Concluída",
};

function localDate(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(value: string): string {
  if (!value) return "—";

  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function formatMoney(amountInCents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amountInCents / 100);
}

function emptyForm(): RecurrenceInput {
  const today = localDate();

  return {
    title: "",
    description: "",
    category: "",
    type: "expense",
    amount: 0,
    frequency: "monthly",
    nextOccurrenceDate: today,
    endDate: today,
    status: "active",
  };
}

function getLinkValue(
  recurrence: Pick<RecurringTransaction, "accountId" | "creditCardId">,
): string {
  if (recurrence.creditCardId !== undefined) {
    return `card:${recurrence.creditCardId}`;
  }

  if (recurrence.accountId !== undefined) {
    return `account:${recurrence.accountId}`;
  }

  return "";
}

/**
 * Mantém os ícones de categoria iguais aos utilizados em TransactionsPage.
 */
function renderCategoryIcon(categoryName: string) {
  const normalized = categoryName.trim().toLocaleLowerCase("pt-BR");

  if (normalized.includes("moradia") || normalized.includes("casa")) {
    return <House size={19} aria-hidden="true" />;
  }

  if (normalized.includes("alimenta")) {
    return <Utensils size={19} aria-hidden="true" />;
  }

  if (normalized.includes("transport")) {
    return <CarFront size={19} aria-hidden="true" />;
  }

  if (normalized.includes("saúde") || normalized.includes("saude")) {
    return <HeartPulse size={19} aria-hidden="true" />;
  }

  if (normalized.includes("lazer")) {
    return <Gamepad2 size={19} aria-hidden="true" />;
  }

  if (normalized.includes("educa")) {
    return <GraduationCap size={19} aria-hidden="true" />;
  }

  if (normalized.includes("salário") || normalized.includes("salario")) {
    return <BriefcaseBusiness size={19} aria-hidden="true" />;
  }

  if (normalized.includes("invest")) {
    return <TrendingUp size={19} aria-hidden="true" />;
  }

  return <Tags size={19} aria-hidden="true" />;
}

export default function RecurringPage({
  recurrences,
  accounts,
  creditCards,
  categories,
  onCreate,
  onUpdate,
  onChangeStatus,
  onDelete,
}: RecurringPageProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<RecurrenceInput>(emptyForm);
  const [amountInput, setAmountInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | RecurrenceStatus>(
    "all",
  );
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [pendingId, setPendingId] = useState<number | null>(null);

  const availableCategories = useMemo(
    () => categories.filter((category) => category.type === form.type),
    [categories, form.type],
  );

  const filteredRecurrences = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");

    return [...recurrences]
      .filter((recurrence) => {
        const matchesSearch =
          !normalizedSearch ||
          recurrence.title
            .toLocaleLowerCase("pt-BR")
            .includes(normalizedSearch) ||
          recurrence.category
            .toLocaleLowerCase("pt-BR")
            .includes(normalizedSearch) ||
          recurrence.description
            .toLocaleLowerCase("pt-BR")
            .includes(normalizedSearch);

        const matchesStatus =
          statusFilter === "all" || recurrence.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => a.nextOccurrenceDate.localeCompare(b.nextOccurrenceDate));
  }, [recurrences, search, statusFilter]);

  const summary = useMemo(() => {
    const active = recurrences.filter(
      (recurrence) => recurrence.status === "active",
    );

    const paused = recurrences.filter(
      (recurrence) => recurrence.status === "paused",
    );

    const activeMonthlyExpenses = active.reduce((total, recurrence) => {
      if (recurrence.type !== "expense") return total;

      const monthlyAmount =
        recurrence.frequency === "weekly"
          ? recurrence.amount * (52 / 12)
          : recurrence.frequency === "yearly"
            ? recurrence.amount / 12
            : recurrence.amount;

      return total + monthlyAmount;
    }, 0);

    return {
      activeCount: active.length,
      pausedCount: paused.length,
      monthlyExpenses: activeMonthlyExpenses,
    };
  }, [recurrences]);

  function openCreateForm() {
    const initial = emptyForm();

    setForm({
      ...initial,
      category:
        categories.find((category) => category.type === "expense")?.name ?? "",
    });

    setAmountInput("");
    setEditingId(null);
    setError("");
    setIsFormOpen(true);
  }

  function openEditForm(recurrence: RecurringTransaction) {
    if (recurrence.id === undefined) return;

    setEditingId(recurrence.id);

    setForm({
      title: recurrence.title,
      description: recurrence.description,
      category: recurrence.category,
      type: recurrence.type,
      amount: recurrence.amount,
      accountId: recurrence.accountId,
      creditCardId: recurrence.creditCardId,
      frequency: recurrence.frequency,
      nextOccurrenceDate: recurrence.nextOccurrenceDate,
      endDate: recurrence.endDate,
      status: recurrence.status,
    });

    setAmountInput((recurrence.amount / 100).toFixed(2).replace(".", ","));
    setError("");
    setIsFormOpen(true);
  }

  function closeForm() {
    if (isSaving) return;

    setIsFormOpen(false);
    setEditingId(null);
    setForm(emptyForm());
    setAmountInput("");
    setError("");
  }

  function updateType(type: RecurrenceType) {
    setForm((current) => ({
      ...current,
      type,
      category:
        categories.find((category) => category.type === type)?.name ?? "",
      ...(type === "income" ? { creditCardId: undefined } : {}),
    }));
  }

  function updateFinancialLink(value: string) {
    if (!value) {
      setForm((current) => ({
        ...current,
        accountId: undefined,
        creditCardId: undefined,
      }));
      return;
    }

    const [kind, rawId] = value.split(":");
    const id = Number(rawId);

    if (!Number.isInteger(id) || id <= 0) return;

    if (kind === "account") {
      setForm((current) => ({
        ...current,
        accountId: id,
        creditCardId: undefined,
      }));
      return;
    }

    if (kind === "card") {
      setForm((current) => ({
        ...current,
        type: "expense",
        category:
          categories.find((category) => category.type === "expense")?.name ??
          current.category,
        accountId: undefined,
        creditCardId: id,
      }));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const normalizedAmount = amountInput
      .trim()
      .replace(/\s/g, "")
      .replace(/\./g, "")
      .replace(",", ".");

    const amountInCents = Math.round(Number(normalizedAmount) * 100);

    if (!form.title.trim()) {
      setError("Informe o nome da recorrência.");
      return;
    }

    if (!Number.isFinite(amountInCents) || amountInCents <= 0) {
      setError("Informe um valor maior que zero.");
      return;
    }

    if (!form.category) {
      setError("Selecione uma categoria.");
      return;
    }

    if (!form.nextOccurrenceDate || !form.endDate) {
      setError("Informe a próxima ocorrência e a data final.");
      return;
    }

    if (form.nextOccurrenceDate > form.endDate) {
      setError("A próxima ocorrência não pode ser posterior à data final.");
      return;
    }

    if (form.creditCardId !== undefined && form.type !== "expense") {
      setError("Recorrências vinculadas a cartão devem ser despesas.");
      return;
    }

    if (form.accountId !== undefined && form.creditCardId !== undefined) {
      setError("Selecione uma conta ou um cartão, não os dois.");
      return;
    }

    if (
      form.accountId !== undefined &&
      !accounts.some((account) => account.id === form.accountId)
    ) {
      setError("A conta selecionada não está mais disponível.");
      return;
    }

    if (
      form.creditCardId !== undefined &&
      !creditCards.some((card) => card.id === form.creditCardId)
    ) {
      setError("O cartão selecionado não está mais disponível.");
      return;
    }

    const payload: RecurrenceInput = {
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      amount: amountInCents,
    };

    setIsSaving(true);

    try {
      if (editingId !== null) {
        await onUpdate(editingId, payload);
      } else {
        await onCreate(payload);
      }

      setIsFormOpen(false);
      setEditingId(null);
      setForm(emptyForm());
      setAmountInput("");
      setError("");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível salvar a recorrência.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggleStatus(recurrence: RecurringTransaction) {
    if (recurrence.id === undefined) return;

    const nextStatus: RecurrenceStatus =
      recurrence.status === "active" ? "paused" : "active";

    setPendingId(recurrence.id);
    setError("");

    try {
      await onChangeStatus(recurrence.id, nextStatus);
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Não foi possível alterar o status.",
      );
    } finally {
      setPendingId(null);
    }
  }

  async function handleDelete(recurrence: RecurringTransaction) {
    if (recurrence.id === undefined) return;

    const confirmed = window.confirm(
      `Deseja excluir a recorrência "${recurrence.title}"? As transações já lançadas serão mantidas.`,
    );

    if (!confirmed) return;

    setPendingId(recurrence.id);
    setError("");

    try {
      await onDelete(recurrence.id);
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Não foi possível excluir a recorrência.",
      );
    } finally {
      setPendingId(null);
    }
  }

  function getFinancialLinkLabel(recurrence: RecurringTransaction): string {
    if (recurrence.creditCardId !== undefined) {
      const card = creditCards.find(
        (item) => item.id === recurrence.creditCardId,
      );

      return card ? `Cartão · ${card.name}` : "Cartão indisponível";
    }

    if (recurrence.accountId !== undefined) {
      const account = accounts.find((item) => item.id === recurrence.accountId);

      return account ? `Conta · ${account.name}` : "Conta indisponível";
    }

    return "Sem vínculo financeiro";
  }

  return (
    <S.Page>
      <S.Header>
        <div>
          <S.Eyebrow>ORGANIZAÇÃO FINANCEIRA</S.Eyebrow>
          <S.Title>Recorrências</S.Title>
          <S.Subtitle>
            Organize despesas e receitas que se repetem ao longo do tempo.
          </S.Subtitle>
        </div>

        <S.PrimaryButton type="button" onClick={openCreateForm}>
          <span aria-hidden="true">＋</span>
          Nova recorrência
        </S.PrimaryButton>
      </S.Header>

      <S.SummaryGrid>
        <S.SummaryCard>
          <S.SummaryLabel>Recorrências ativas</S.SummaryLabel>
          <S.SummaryValue>{summary.activeCount}</S.SummaryValue>
          <S.SummaryHint>Programadas para lançamento</S.SummaryHint>
        </S.SummaryCard>

        <S.SummaryCard>
          <S.SummaryLabel>Recorrências pausadas</S.SummaryLabel>
          <S.SummaryValue>{summary.pausedCount}</S.SummaryValue>
          <S.SummaryHint>Não geram novos lançamentos</S.SummaryHint>
        </S.SummaryCard>

        <S.SummaryCard>
          <S.SummaryLabel>Despesas mensais estimadas</S.SummaryLabel>
          <S.SummaryValue>
            {formatMoney(summary.monthlyExpenses)}
          </S.SummaryValue>
          <S.SummaryHint>Estimativa das despesas ativas</S.SummaryHint>
        </S.SummaryCard>
      </S.SummaryGrid>

      {error && !isFormOpen && (
        <S.ErrorBanner role="alert">{error}</S.ErrorBanner>
      )}

      <S.Toolbar>
        <S.SearchInput
          type="search"
          placeholder="Buscar recorrência..."
          aria-label="Buscar recorrência"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <S.FilterSelect
          aria-label="Filtrar por status"
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value as "all" | RecurrenceStatus)
          }
        >
          <option value="all">Todos os status</option>
          <option value="active">Ativas</option>
          <option value="paused">Pausadas</option>
          <option value="concluded">Concluídas</option>
        </S.FilterSelect>
      </S.Toolbar>

      {filteredRecurrences.length === 0 ? (
        <S.EmptyState>
          <S.EmptyIcon aria-hidden="true">
            <span>↻</span>
          </S.EmptyIcon>

          <S.EmptyTitle>
            {recurrences.length === 0
              ? "Nenhuma recorrência cadastrada"
              : "Nenhuma recorrência encontrada"}
          </S.EmptyTitle>

          <S.EmptyDescription>
            {recurrences.length === 0
              ? "Cadastre uma receita ou despesa recorrente para organizar os seus lançamentos."
              : "Tente alterar a busca ou o filtro de status."}
          </S.EmptyDescription>

          {recurrences.length === 0 && (
            <S.SecondaryButton type="button" onClick={openCreateForm}>
              Criar primeira recorrência
            </S.SecondaryButton>
          )}
        </S.EmptyState>
      ) : (
        <S.List>
          {filteredRecurrences.map((recurrence) => {
            const remaining =
              recurrence.status === "active"
                ? countRemainingOccurrences(recurrence)
                : 0;

            return (
              <S.RecurrenceCard key={recurrence.id ?? recurrence.title}>
                <S.RecurrenceMain>
                  <S.RecurrenceIcon $type={recurrence.type}>
                    {renderCategoryIcon(recurrence.category)}
                  </S.RecurrenceIcon>

                  <S.RecurrenceInfo>
                    <S.RecurrenceTitle>{recurrence.title}</S.RecurrenceTitle>

                    <S.RecurrenceMeta>
                      <span>{recurrence.category}</span>
                      <S.Dot />
                      <span>{frequencyLabels[recurrence.frequency]}</span>
                    </S.RecurrenceMeta>

                    <S.RecurrenceMeta>
                      <span>{getFinancialLinkLabel(recurrence)}</span>
                    </S.RecurrenceMeta>
                  </S.RecurrenceInfo>
                </S.RecurrenceMain>

                <S.RecurrenceDetails>
                  <S.Amount $type={recurrence.type}>
                    {recurrence.type === "income" ? "+" : "−"}
                    {formatMoney(recurrence.amount)}
                  </S.Amount>

                  <S.StatusPill $status={recurrence.status}>
                    {statusLabels[recurrence.status]}
                  </S.StatusPill>

                  <S.NextDate>
                    <span>Próximo lançamento</span>
                    <strong>
                      {recurrence.status === "concluded"
                        ? "Finalizada"
                        : formatDate(recurrence.nextOccurrenceDate)}
                    </strong>
                  </S.NextDate>

                  {recurrence.status === "active" && (
                    <S.Remaining>
                      {remaining}{" "}
                      {remaining === 1
                        ? "ocorrência restante"
                        : "ocorrências restantes"}
                    </S.Remaining>
                  )}
                </S.RecurrenceDetails>

                <S.Actions>
                  {recurrence.status !== "concluded" && (
                    <S.ActionButton
                      type="button"
                      onClick={() => void handleToggleStatus(recurrence)}
                      disabled={pendingId === recurrence.id}
                      aria-label={
                        recurrence.status === "active"
                          ? `Pausar ${recurrence.title}`
                          : `Retomar ${recurrence.title}`
                      }
                      title={
                        recurrence.status === "active" ? "Pausar" : "Retomar"
                      }
                    >
                      {recurrence.status === "active" ? "Ⅱ" : "▶"}
                    </S.ActionButton>
                  )}

                  <S.ActionButton
                    type="button"
                    onClick={() => openEditForm(recurrence)}
                    aria-label={`Editar ${recurrence.title}`}
                    title="Editar"
                  >
                    ✎
                  </S.ActionButton>

                  <S.ActionButton
                    type="button"
                    $danger
                    onClick={() => void handleDelete(recurrence)}
                    disabled={pendingId === recurrence.id}
                    aria-label={`Excluir ${recurrence.title}`}
                    title="Excluir"
                  >
                    <span aria-hidden="true">×</span>
                  </S.ActionButton>
                </S.Actions>
              </S.RecurrenceCard>
            );
          })}
        </S.List>
      )}

      {isFormOpen && (
        <S.ModalBackdrop
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeForm();
          }}
        >
          <S.Modal
            role="dialog"
            aria-modal="true"
            aria-labelledby="recurring-form-title"
          >
            <S.ModalHeader>
              <div>
                <S.Title id="recurring-form-title" $small>
                  {editingId === null
                    ? "Nova recorrência"
                    : "Editar recorrência"}
                </S.Title>

                <S.Subtitle>
                  Configure os lançamentos que se repetem automaticamente.
                </S.Subtitle>
              </div>

              <S.CloseButton
                type="button"
                onClick={closeForm}
                disabled={isSaving}
                aria-label="Fechar formulário"
              >
                ×
              </S.CloseButton>
            </S.ModalHeader>

            <S.Form onSubmit={handleSubmit}>
              <S.Field>
                <S.FieldLabel htmlFor="recurring-title">Nome</S.FieldLabel>
                <S.TextInput
                  id="recurring-title"
                  autoFocus
                  maxLength={100}
                  placeholder="Ex.: Aluguel, Internet, Salário"
                  value={form.title}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  required
                />
              </S.Field>

              <S.Field>
                <S.FieldLabel htmlFor="recurring-description">
                  Descrição (opcional)
                </S.FieldLabel>
                <S.TextInput
                  id="recurring-description"
                  maxLength={250}
                  placeholder="Detalhes do lançamento"
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                />
              </S.Field>

              <S.FormGrid>
                <S.Field>
                  <S.FieldLabel htmlFor="recurring-type">Tipo</S.FieldLabel>
                  <S.SelectInput
                    id="recurring-type"
                    value={form.type}
                    disabled={form.creditCardId !== undefined}
                    onChange={(event) =>
                      updateType(event.target.value as RecurrenceType)
                    }
                  >
                    <option value="expense">Despesa</option>
                    <option value="income">Receita</option>
                  </S.SelectInput>
                </S.Field>

                <S.Field>
                  <S.FieldLabel htmlFor="recurring-amount">
                    Valor (R$)
                  </S.FieldLabel>
                  <S.TextInput
                    id="recurring-amount"
                    inputMode="decimal"
                    placeholder="0,00"
                    value={amountInput}
                    onChange={(event) => setAmountInput(event.target.value)}
                    required
                  />
                </S.Field>
              </S.FormGrid>

              <S.FormGrid>
                <S.Field>
                  <S.FieldLabel htmlFor="recurring-frequency">
                    Frequência
                  </S.FieldLabel>
                  <S.SelectInput
                    id="recurring-frequency"
                    value={form.frequency}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        frequency: event.target.value as Frequency,
                      }))
                    }
                  >
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensal</option>
                    <option value="yearly">Anual</option>
                  </S.SelectInput>
                </S.Field>

                <S.Field>
                  <S.FieldLabel htmlFor="recurring-category">
                    Categoria
                  </S.FieldLabel>
                  <S.SelectInput
                    id="recurring-category"
                    value={form.category}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        category: event.target.value,
                      }))
                    }
                    required
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
                  </S.SelectInput>
                </S.Field>
              </S.FormGrid>

              <S.Field>
                <S.FieldLabel htmlFor="recurring-link">
                  Conta ou cartão de crédito (opcional)
                </S.FieldLabel>

                <S.SelectInput
                  id="recurring-link"
                  value={getLinkValue(form)}
                  onChange={(event) => updateFinancialLink(event.target.value)}
                >
                  <option value="">Sem vínculo financeiro</option>

                  {accounts.length > 0 && (
                    <optgroup label="Contas">
                      {accounts.map((account) => (
                        <option
                          key={account.id ?? account.name}
                          value={`account:${account.id}`}
                        >
                          {account.name}
                        </option>
                      ))}
                    </optgroup>
                  )}

                  {form.type === "expense" && creditCards.length > 0 && (
                    <optgroup label="Cartões de crédito">
                      {creditCards.map((card) => (
                        <option
                          key={card.id ?? card.name}
                          value={`card:${card.id}`}
                        >
                          {card.name} · final {card.lastFourDigits}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </S.SelectInput>

                <S.FieldHint>
                  Você pode deixar sem vínculo ou selecionar uma conta ou um
                  cartão. Apenas uma opção pode ser vinculada por recorrência.
                  {form.creditCardId !== undefined &&
                    " As ocorrências futuras serão consideradas na reserva do limite do cartão."}
                </S.FieldHint>
              </S.Field>

              <S.FormGrid>
                <S.Field>
                  <S.FieldLabel htmlFor="recurring-next-date">
                    Próxima ocorrência
                  </S.FieldLabel>
                  <S.TextInput
                    id="recurring-next-date"
                    type="date"
                    value={form.nextOccurrenceDate}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        nextOccurrenceDate: event.target.value,
                        endDate:
                          current.endDate < event.target.value
                            ? event.target.value
                            : current.endDate,
                      }))
                    }
                    required
                  />
                </S.Field>

                <S.Field>
                  <S.FieldLabel htmlFor="recurring-end-date">
                    Data final
                  </S.FieldLabel>
                  <S.TextInput
                    id="recurring-end-date"
                    type="date"
                    min={form.nextOccurrenceDate}
                    value={form.endDate}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        endDate: event.target.value,
                      }))
                    }
                    required
                  />
                </S.Field>
              </S.FormGrid>

              {error && <S.ErrorBanner role="alert">{error}</S.ErrorBanner>}

              <S.ModalFooter>
                <S.SecondaryButton
                  type="button"
                  onClick={closeForm}
                  disabled={isSaving}
                >
                  Cancelar
                </S.SecondaryButton>

                <S.PrimaryButton type="submit" disabled={isSaving}>
                  {isSaving
                    ? "Salvando..."
                    : editingId === null
                      ? "Criar recorrência"
                      : "Salvar alterações"}
                </S.PrimaryButton>
              </S.ModalFooter>
            </S.Form>
          </S.Modal>
        </S.ModalBackdrop>
      )}
    </S.Page>
  );
}
