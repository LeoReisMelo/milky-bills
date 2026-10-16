import { useMemo, useState, type FormEvent } from "react";
import {
  CreditCard as CreditCardIcon,
  Ellipsis,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import type { CardBrand, CreditCard } from "../../db/database";
import * as S from "./Cards.styles";

type CardFormData = Omit<CreditCard, "id" | "createdAt" | "updatedAt">;

type CardFormValues = {
  name: string;
  bank: string;
  brand: CardBrand;
  lastFourDigits: string;
  creditLimit: string;
  closingDay: string;
  dueDay: string;
  color: string;
  holder: string;
};

export type CardsPageProps = {
  cards: CreditCard[];
  expensesByCard: Record<number, number>;
  onCreate: (data: CardFormData) => Promise<void> | void;
  onUpdate: (id: number, data: CardFormData) => Promise<void> | void;
  onDelete: (id: number) => Promise<void> | void;
};

const cardColors = [
  { name: "Roxo", value: "#7357D9" },
  { name: "Rosa", value: "#D9799A" },
  { name: "Azul", value: "#3977D5" },
  { name: "Verde", value: "#27866D" },
  { name: "Preto", value: "#29252A" },
  { name: "Laranja", value: "#D77A35" },
  { name: "Vinho", value: "#8D3658" },
  { name: "Cinza", value: "#697386" },
];

const emptyForm: CardFormValues = {
  name: "",
  bank: "",
  brand: "Visa",
  lastFourDigits: "",
  creditLimit: "",
  closingDay: "1",
  dueDay: "10",
  color: cardColors[0].value,
  holder: "",
};

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

function parseCurrencyToCents(value: string) {
  const normalized = value
    .trim()
    .replace(/\s/g, "")
    .replace(/^R\$\s?/, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const amount = Number(normalized);
  return Number.isFinite(amount) ? Math.round(amount * 100) : 0;
}

function formatLimitInput(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getInitialForm(card?: CreditCard): CardFormValues {
  if (!card) return { ...emptyForm };

  return {
    name: card.name,
    bank: card.bank,
    brand: card.brand,
    lastFourDigits: card.lastFourDigits,
    creditLimit: formatLimitInput(card.creditLimit),
    closingDay: String(card.closingDay),
    dueDay: String(card.dueDay),
    color: card.color,
    holder: card.holder,
  };
}

export function CardsPage({
  cards,
  expensesByCard,
  onCreate,
  onUpdate,
  onDelete,
}: CardsPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);
  const [form, setForm] = useState<CardFormValues>({ ...emptyForm });
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const totalLimit = useMemo(
    () => cards.reduce((total, card) => total + card.creditLimit, 0),
    [cards],
  );

  const totalAvailable = useMemo(
    () =>
      cards.reduce(
        (total, card) =>
          total +
          Math.max(0, card.creditLimit - (expensesByCard[card.id ?? -1] ?? 0)),
        0,
      ),
    [cards, expensesByCard],
  );

  const currentLimit = parseCurrencyToCents(form.creditLimit);
  const currentExpenses = editingCard
    ? (expensesByCard[editingCard.id ?? -1] ?? 0)
    : 0;
  const currentAvailable = Math.max(0, currentLimit - currentExpenses);

  function openCreateModal() {
    setEditingCard(null);
    setForm({ ...emptyForm });
    setError("");
    setIsModalOpen(true);
    setOpenMenuId(null);
  }

  function openEditModal(card: CreditCard) {
    setEditingCard(card);
    setForm(getInitialForm(card));
    setError("");
    setIsModalOpen(true);
    setOpenMenuId(null);
  }

  function closeModal() {
    if (isSaving) return;
    setIsModalOpen(false);
    setEditingCard(null);
    setError("");
  }

  function updateField<K extends keyof CardFormValues>(
    field: K,
    value: CardFormValues[K],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const creditLimit = parseCurrencyToCents(form.creditLimit);
    const closingDay = Number(form.closingDay);
    const dueDay = Number(form.dueDay);
    const lastFourDigits = form.lastFourDigits.replace(/\D/g, "");

    if (!form.name.trim() || !form.bank.trim()) {
      setError("Informe o nome do cartão e o banco.");
      return;
    }

    if (lastFourDigits.length !== 4) {
      setError("Informe os quatro últimos dígitos do cartão.");
      return;
    }

    if (!Number.isFinite(creditLimit) || creditLimit <= 0) {
      setError("Informe um limite maior que zero.");
      return;
    }

    if (
      !Number.isInteger(closingDay) ||
      closingDay < 1 ||
      closingDay > 31 ||
      !Number.isInteger(dueDay) ||
      dueDay < 1 ||
      dueDay > 31
    ) {
      setError("Os dias de fechamento e vencimento devem estar entre 1 e 31.");
      return;
    }

    const data: CardFormData = {
      name: form.name.trim(),
      bank: form.bank.trim(),
      brand: form.brand,
      lastFourDigits,
      creditLimit,
      closingDay,
      dueDay,
      color: form.color,
      holder: form.holder.trim(),
    };

    setIsSaving(true);

    try {
      if (editingCard?.id !== undefined) {
        await onUpdate(editingCard.id, data);
      } else {
        await onCreate(data);
      }

      setIsModalOpen(false);
      setEditingCard(null);
    } catch {
      setError("Não foi possível salvar o cartão. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(card: CreditCard) {
    if (card.id === undefined) return;

    const confirmed = window.confirm(
      `Deseja realmente excluir o cartão "${card.name}"?`,
    );

    if (!confirmed) return;

    setOpenMenuId(null);
    await onDelete(card.id);
  }

  return (
    <S.Page>
      <S.PageHeader>
        <div>
          <S.Title>Cartões</S.Title>
          <S.Subtitle>
            Gerencie seus cartões de crédito e acompanhe seus limites.
          </S.Subtitle>
        </div>

        <S.PrimaryButton type="button" onClick={openCreateModal}>
          <Plus size={18} />
          Adicionar cartão
        </S.PrimaryButton>
      </S.PageHeader>

      <S.SummaryGrid>
        <S.SummaryCard>
          <S.SummaryLabel>Limite total</S.SummaryLabel>
          <S.SummaryValue>{formatCurrency(totalLimit)}</S.SummaryValue>
          <S.SummaryHint>Somatório dos limites cadastrados</S.SummaryHint>
        </S.SummaryCard>

        <S.SummaryCard>
          <S.SummaryLabel>Limite disponível</S.SummaryLabel>
          <S.SummaryValue>{formatCurrency(totalAvailable)}</S.SummaryValue>
          <S.SummaryHint>Após descontar as despesas vinculadas</S.SummaryHint>
        </S.SummaryCard>

        <S.SummaryCard>
          <S.SummaryLabel>Cartões cadastrados</S.SummaryLabel>
          <S.SummaryValue>{cards.length}</S.SummaryValue>
          <S.SummaryHint>
            {cards.length === 1 ? "cartão ativo na lista" : "cartões na lista"}
          </S.SummaryHint>
        </S.SummaryCard>
      </S.SummaryGrid>

      {cards.length === 0 ? (
        <S.EmptyState>
          <S.EmptyIcon>
            <CreditCardIcon size={28} />
          </S.EmptyIcon>
          <S.EmptyTitle>Nenhum cartão cadastrado</S.EmptyTitle>
          <S.EmptyDescription>
            Adicione seu primeiro cartão para acompanhar o limite e vincular
            despesas às suas compras.
          </S.EmptyDescription>
          <S.PrimaryButton type="button" onClick={openCreateModal}>
            <Plus size={18} />
            Adicionar primeiro cartão
          </S.PrimaryButton>
        </S.EmptyState>
      ) : (
        <>
          <S.SectionHeader>
            <div>
              <S.SectionTitle>Seus cartões</S.SectionTitle>
              <S.SectionDescription>
                Consulte os limites e os dados de cada cartão.
              </S.SectionDescription>
            </div>
          </S.SectionHeader>

          <S.CardGrid>
            {cards.map((card) => {
              const spent = expensesByCard[card.id ?? -1] ?? 0;
              const available = Math.max(0, card.creditLimit - spent);
              const usage =
                card.creditLimit > 0
                  ? Math.min(100, (spent / card.creditLimit) * 100)
                  : 0;

              return (
                <S.CreditCard key={card.id} $color={card.color}>
                  <S.CardTop>
                    <S.CardBank>{card.bank}</S.CardBank>
                    <CreditCardIcon size={25} />
                  </S.CardTop>

                  <S.CardName>{card.name}</S.CardName>
                  <S.CardNumber>
                    •••• •••• •••• {card.lastFourDigits}
                  </S.CardNumber>

                  <S.CardBottom>
                    <div>
                      <S.CardMetaLabel>TITULAR</S.CardMetaLabel>
                      <S.CardMetaValue>
                        {card.holder || "Não informado"}
                      </S.CardMetaValue>
                    </div>
                    <S.Brand>{card.brand}</S.Brand>
                  </S.CardBottom>
                </S.CreditCard>
              );
            })}
          </S.CardGrid>

          <S.ListHeader>
            <S.SectionTitle>Detalhes dos cartões</S.SectionTitle>
            <S.CardCount>{cards.length}</S.CardCount>
          </S.ListHeader>

          <S.CardList>
            {cards.map((card) => {
              const spent = expensesByCard[card.id ?? -1] ?? 0;
              const available = Math.max(0, card.creditLimit - spent);
              const usage =
                card.creditLimit > 0
                  ? Math.min(100, (spent / card.creditLimit) * 100)
                  : 0;

              return (
                <S.CardRow key={card.id}>
                  <S.CardRowIcon $color={card.color}>
                    <CreditCardIcon size={21} />
                  </S.CardRowIcon>

                  <S.CardInfo>
                    <S.CardRowTitle>{card.name}</S.CardRowTitle>
                    <S.CardRowSubtitle>
                      {card.bank} · {card.brand} · •••• {card.lastFourDigits}
                    </S.CardRowSubtitle>
                    <S.MobileLimit>
                      Disponível: {formatCurrency(available)}
                    </S.MobileLimit>
                  </S.CardInfo>

                  <S.LimitInfo>
                    <S.LimitValues>
                      <span>
                        {formatCurrency(available)}{" "}
                        <S.MutedText>disponíveis</S.MutedText>
                      </span>
                      <S.MutedText>
                        de {formatCurrency(card.creditLimit)}
                      </S.MutedText>
                    </S.LimitValues>
                    <S.ProgressTrack>
                      <S.ProgressBar $usage={usage} $color={card.color} />
                    </S.ProgressTrack>
                    <S.CardSchedule>
                      Fecha dia {card.closingDay} · Vence dia {card.dueDay}
                    </S.CardSchedule>
                  </S.LimitInfo>

                  <S.MenuWrapper>
                    <S.MenuButton
                      type="button"
                      aria-label={`Opções do cartão ${card.name}`}
                      aria-expanded={openMenuId === card.id}
                      onClick={() =>
                        setOpenMenuId((current) =>
                          current === card.id ? null : (card.id ?? null),
                        )
                      }
                    >
                      <Ellipsis size={21} />
                    </S.MenuButton>

                    {openMenuId === card.id && (
                      <S.MenuPopover>
                        <S.MenuItem
                          type="button"
                          onClick={() => openEditModal(card)}
                        >
                          <Pencil size={16} />
                          Editar
                        </S.MenuItem>
                        <S.MenuItem
                          type="button"
                          $danger
                          onClick={() => void handleDelete(card)}
                        >
                          <Trash2 size={16} />
                          Excluir
                        </S.MenuItem>
                      </S.MenuPopover>
                    )}
                  </S.MenuWrapper>
                </S.CardRow>
              );
            })}
          </S.CardList>
        </>
      )}

      {isModalOpen && (
        <S.ModalOverlay onMouseDown={closeModal}>
          <S.Modal
            role="dialog"
            aria-modal="true"
            aria-labelledby="card-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <S.ModalHeader>
              <div>
                <S.ModalTitle id="card-modal-title">
                  {editingCard ? "Editar cartão" : "Adicionar cartão"}
                </S.ModalTitle>
                <S.ModalDescription>
                  Cadastre os dados necessários para controlar seu limite.
                </S.ModalDescription>
              </div>
              <S.IconButton
                type="button"
                aria-label="Fechar modal"
                onClick={closeModal}
              >
                <X size={20} />
              </S.IconButton>
            </S.ModalHeader>

            <S.Form onSubmit={handleSubmit}>
              <S.FormGrid>
                <S.Field>
                  <S.Label htmlFor="card-name">Nome do cartão</S.Label>
                  <S.Input
                    id="card-name"
                    value={form.name}
                    onChange={(event) =>
                      updateField("name", event.target.value)
                    }
                    placeholder="Ex.: Cartão principal"
                    required
                  />
                </S.Field>

                <S.Field>
                  <S.Label htmlFor="card-bank">Banco ou instituição</S.Label>
                  <S.Input
                    id="card-bank"
                    value={form.bank}
                    onChange={(event) =>
                      updateField("bank", event.target.value)
                    }
                    placeholder="Ex.: Nubank"
                    required
                  />
                </S.Field>

                <S.Field>
                  <S.Label htmlFor="card-brand">Bandeira</S.Label>
                  <S.Select
                    id="card-brand"
                    value={form.brand}
                    onChange={(event) =>
                      updateField("brand", event.target.value as CardBrand)
                    }
                  >
                    <option value="Visa">Visa</option>
                    <option value="Mastercard">Mastercard</option>
                    <option value="Elo">Elo</option>
                    <option value="American Express">American Express</option>
                    <option value="Hipercard">Hipercard</option>
                    <option value="Outra">Outra</option>
                  </S.Select>
                </S.Field>

                <S.Field>
                  <S.Label htmlFor="card-last-four">Últimos 4 dígitos</S.Label>
                  <S.Input
                    id="card-last-four"
                    value={form.lastFourDigits}
                    onChange={(event) =>
                      updateField(
                        "lastFourDigits",
                        event.target.value.replace(/\D/g, "").slice(0, 4),
                      )
                    }
                    placeholder="1234"
                    inputMode="numeric"
                    maxLength={4}
                    required
                  />
                </S.Field>

                <S.Field>
                  <S.Label htmlFor="card-limit">Limite total (R$)</S.Label>
                  <S.Input
                    id="card-limit"
                    value={form.creditLimit}
                    onChange={(event) =>
                      updateField("creditLimit", event.target.value)
                    }
                    placeholder="Ex.: 2500,00"
                    inputMode="decimal"
                    required
                  />
                </S.Field>

                <S.Field>
                  <S.Label htmlFor="card-available">Limite disponível</S.Label>
                  <S.ReadOnlyValue id="card-available">
                    {formatCurrency(currentAvailable)}
                  </S.ReadOnlyValue>
                </S.Field>

                <S.Field>
                  <S.Label htmlFor="card-closing">Dia de fechamento</S.Label>
                  <S.Input
                    id="card-closing"
                    type="number"
                    min={1}
                    max={31}
                    value={form.closingDay}
                    onChange={(event) =>
                      updateField("closingDay", event.target.value)
                    }
                    required
                  />
                </S.Field>

                <S.Field>
                  <S.Label htmlFor="card-due">Dia de vencimento</S.Label>
                  <S.Input
                    id="card-due"
                    type="number"
                    min={1}
                    max={31}
                    value={form.dueDay}
                    onChange={(event) =>
                      updateField("dueDay", event.target.value)
                    }
                    required
                  />
                </S.Field>

                <S.Field $fullWidth>
                  <S.Label htmlFor="card-holder">Nome do titular</S.Label>
                  <S.Input
                    id="card-holder"
                    value={form.holder}
                    onChange={(event) =>
                      updateField("holder", event.target.value)
                    }
                    placeholder="Nome impresso no cartão"
                  />
                </S.Field>

                <S.Field $fullWidth>
                  <S.Label>Cor do cartão</S.Label>
                  <S.ColorOptions aria-label="Selecione a cor do cartão">
                    {cardColors.map((color) => (
                      <S.ColorOption
                        key={color.value}
                        type="button"
                        title={color.name}
                        aria-label={color.name}
                        aria-pressed={form.color === color.value}
                        $color={color.value}
                        $selected={form.color === color.value}
                        onClick={() => updateField("color", color.value)}
                      />
                    ))}
                  </S.ColorOptions>
                </S.Field>
              </S.FormGrid>

              {error && <S.ErrorMessage role="alert">{error}</S.ErrorMessage>}

              <S.ModalFooter>
                <S.SecondaryButton
                  type="button"
                  onClick={closeModal}
                  disabled={isSaving}
                >
                  Cancelar
                </S.SecondaryButton>
                <S.PrimaryButton type="submit" disabled={isSaving}>
                  {isSaving
                    ? "Salvando..."
                    : editingCard
                      ? "Salvar alterações"
                      : "Adicionar cartão"}
                </S.PrimaryButton>
              </S.ModalFooter>
            </S.Form>
          </S.Modal>
        </S.ModalOverlay>
      )}
    </S.Page>
  );
}
