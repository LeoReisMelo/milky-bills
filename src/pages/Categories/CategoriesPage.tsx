import { useMemo, useState, type FormEvent } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  BriefcaseBusiness,
  Bus,
  CircleDollarSign,
  Clapperboard,
  Coffee,
  Dumbbell,
  Gift,
  GraduationCap,
  HeartPulse,
  House,
  MoreHorizontal,
  Music,
  PawPrint,
  Pencil,
  Plane,
  Plus,
  Search,
  ShoppingBag,
  Smartphone,
  Trash2,
  TrendingUp,
  Utensils,
  Wallet,
  X,
} from "lucide-react";

import type { Category, CategoryType, Transaction } from "../../db/database";
import {
  Actions,
  Badge,
  CategoryCard,
  CategoryGrid,
  CategoryIcon,
  CategoryInfo,
  CategoryName,
  EmptyState,
  FilterButton,
  Filters,
  Form,
  FormActions,
  FormField,
  Header,
  IconButton,
  IconOption,
  IconPicker,
  Input,
  Main,
  Modal,
  ModalBackdrop,
  ModalHeader,
  PageDescription,
  PageTitle,
  PrimaryButton,
  SearchBox,
  SectionHeader,
  SectionTitle,
  SelectedIconLabel,
  SummaryCard,
  SummaryGrid,
  Toolbar,
} from "./Categories.styles";

const CATEGORY_ICONS = [
  { name: "house", label: "Moradia", Icon: House },
  { name: "utensils", label: "Alimentação", Icon: Utensils },
  { name: "bus", label: "Transporte", Icon: Bus },
  { name: "heart-pulse", label: "Saúde", Icon: HeartPulse },
  { name: "clapperboard", label: "Filmes e streaming", Icon: Clapperboard },
  { name: "graduation-cap", label: "Educação", Icon: GraduationCap },
  { name: "shopping-bag", label: "Compras", Icon: ShoppingBag },
  { name: "briefcase-business", label: "Trabalho", Icon: BriefcaseBusiness },
  { name: "trending-up", label: "Investimentos", Icon: TrendingUp },
  { name: "wallet", label: "Finanças", Icon: Wallet },
  { name: "coffee", label: "Cafés", Icon: Coffee },
  { name: "paw-print", label: "Pets", Icon: PawPrint },
  { name: "gift", label: "Presentes", Icon: Gift },
  { name: "plane", label: "Viagens", Icon: Plane },
  { name: "smartphone", label: "Tecnologia", Icon: Smartphone },
  { name: "dumbbell", label: "Academia", Icon: Dumbbell },
  { name: "music", label: "Música", Icon: Music },
  { name: "circle-dollar-sign", label: "Outros", Icon: CircleDollarSign },
] as const;

type CategoryFilter = "all" | "expense" | "income";

interface CategoriesPageProps {
  categories: Category[];
  transactions: Transaction[];
  onCreate: (data: {
    name: string;
    description: string;
    type: CategoryType;
    icon: string;
  }) => Promise<void>;
  onRename: (
    category: Category,
    data: {
      name: string;
      description: string;
      type: CategoryType;
      icon: string;
    },
  ) => Promise<void>;
  onDelete: (category: Category) => Promise<void>;
}

const incomeNames = new Set(["salário", "investimentos"]);

function getCategoryType(name: string): "income" | "expense" {
  return incomeNames.has(name.trim().toLocaleLowerCase("pt-BR"))
    ? "income"
    : "expense";
}

function getCategoryAppearance(name: string) {
  const normalized = name.trim().toLocaleLowerCase("pt-BR");

  if (/moradia|casa|aluguel/.test(normalized)) {
    return {
      icon: House,
      color: "#6478D3",
      background: "rgba(100, 120, 211, 0.12)",
    };
  }
  if (/alimenta|mercado|comida|restaurante/.test(normalized)) {
    return {
      icon: Utensils,
      color: "#E89A42",
      background: "rgba(232, 154, 66, 0.13)",
    };
  }
  if (/transporte|combustível|uber|mobilidade/.test(normalized)) {
    return {
      icon: Bus,
      color: "#438DCB",
      background: "rgba(67, 141, 203, 0.12)",
    };
  }
  if (/saúde|farmácia|médic/.test(normalized)) {
    return {
      icon: HeartPulse,
      color: "#D95E76",
      background: "rgba(217, 94, 118, 0.12)",
    };
  }
  if (/lazer|filme|streaming|cinema|entretenimento/.test(normalized)) {
    return {
      icon: Clapperboard,
      color: "#9B72CF",
      background: "rgba(155, 114, 207, 0.13)",
    };
  }
  if (/educa|curso|livro/.test(normalized)) {
    return {
      icon: GraduationCap,
      color: "#3D9B88",
      background: "rgba(61, 155, 136, 0.13)",
    };
  }
  if (/salário|salario|renda|receita/.test(normalized)) {
    return {
      icon: BriefcaseBusiness,
      color: "#27986A",
      background: "rgba(39, 152, 106, 0.12)",
    };
  }
  if (/invest/.test(normalized)) {
    return {
      icon: TrendingUp,
      color: "#27986A",
      background: "rgba(39, 152, 106, 0.12)",
    };
  }
  if (/compra|roupa|shopping/.test(normalized)) {
    return {
      icon: ShoppingBag,
      color: "#D9799A",
      background: "rgba(217, 121, 154, 0.13)",
    };
  }
  if (/café|cafe/.test(normalized)) {
    return {
      icon: Coffee,
      color: "#A77955",
      background: "rgba(167, 121, 85, 0.13)",
    };
  }

  return {
    icon: MoreHorizontal,
    color: "#8B7C98",
    background: "rgba(139, 124, 152, 0.12)",
  };
}

export function CategoriesPage({
  categories,
  transactions,
  onCreate,
  onRename,
  onDelete,
}: CategoriesPageProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<CategoryFilter>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [description, setDescription] = useState("");
  const [type, setType] = useState<CategoryType>("expense");
  const [icon, setIcon] = useState<string>("circle-dollar-sign");

  const usage = useMemo(() => {
    const counts = new Map<string, number>();

    for (const transaction of transactions) {
      if (transaction.type === "transfer" || !transaction.category) continue;

      counts.set(
        transaction.category,
        (counts.get(transaction.category) ?? 0) + 1,
      );
    }

    return counts;
  }, [transactions]);

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("pt-BR");

    return [...categories]
      .filter((category) => {
        const matchesSearch = category.name
          .toLocaleLowerCase("pt-BR")
          .includes(query);

        const matchesType = filter === "all" || category.type === filter;

        return matchesSearch && matchesType;
      })
      .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  }, [categories, search, filter]);

  const expenseCount = categories.filter(
    (category) => category.type === "expense",
  ).length;

  const incomeCount = categories.filter(
    (category) => category.type === "income",
  ).length;

  function openCreateModal() {
    setEditing(null);
    setName("");
    setDescription("");
    setType("expense");
    setIcon("circle-dollar-sign");
    setError("");
    setModalOpen(true);
  }

  function openEditModal(category: Category) {
    setEditing(category);
    setName(category.name);
    setDescription(category.description ?? "");
    setType(category.type ?? "expense");
    setIcon(category.icon ?? "circle-dollar-sign");
    setError("");
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;
    setModalOpen(false);
    setEditing(null);
    setName("");
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedName = name.trim();

    if (!normalizedName) {
      setError("Informe o nome da categoria.");
      return;
    }

    const duplicate = categories.some(
      (category) =>
        category.id !== editing?.id &&
        category.name.trim().normalize("NFKC").toLocaleLowerCase("pt-BR") ===
          normalizedName.normalize("NFKC").toLocaleLowerCase("pt-BR"),
    );

    if (duplicate) {
      setError("Já existe uma categoria com esse nome.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const data = {
        name: normalizedName,
        description: description.trim(),
        type,
        icon,
      };

      if (editing) {
        await onRename(editing, data);
      } else {
        await onCreate(data);
      }

      setModalOpen(false);
      setEditing(null);
      setName("");
    } catch {
      setError("Não foi possível salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Main>
      {" "}
      <Header>
        {" "}
        <div>
          {" "}
          <PageTitle>Categorias</PageTitle>{" "}
          <PageDescription>
            Organize suas receitas e despesas para entender melhor suas
            finanças.{" "}
          </PageDescription>{" "}
        </div>
        <PrimaryButton type="button" onClick={openCreateModal}>
          <Plus size={18} />
          Nova categoria
        </PrimaryButton>
      </Header>
      <SummaryGrid>
        <SummaryCard>
          <CategoryIcon
            $color="#D9799A"
            $background="rgba(217, 121, 154, 0.13)"
          >
            <Wallet size={21} />
          </CategoryIcon>
          <div>
            <span>Total de categorias</span>
            <strong>{categories.length}</strong>
          </div>
        </SummaryCard>

        <SummaryCard>
          <CategoryIcon $color="#D95E76" $background="rgba(217, 94, 118, 0.12)">
            <ArrowDownLeft size={21} />
          </CategoryIcon>
          <div>
            <span>Despesas</span>
            <strong>{expenseCount}</strong>
          </div>
        </SummaryCard>

        <SummaryCard>
          <CategoryIcon $color="#27986A" $background="rgba(39, 152, 106, 0.12)">
            <ArrowUpRight size={21} />
          </CategoryIcon>
          <div>
            <span>Receitas</span>
            <strong>{incomeCount}</strong>
          </div>
        </SummaryCard>
      </SummaryGrid>
      <Toolbar>
        <SearchBox>
          <Search size={18} />
          <Input
            aria-label="Buscar categorias"
            placeholder="Buscar categoria..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          {search && (
            <IconButton
              type="button"
              aria-label="Limpar busca"
              onClick={() => setSearch("")}
            >
              <X size={16} />
            </IconButton>
          )}
        </SearchBox>

        <Filters aria-label="Filtrar categorias">
          <FilterButton
            type="button"
            $active={filter === "all"}
            onClick={() => setFilter("all")}
          >
            Todas
          </FilterButton>
          <FilterButton
            type="button"
            $active={filter === "expense"}
            onClick={() => setFilter("expense")}
          >
            Despesas
          </FilterButton>
          <FilterButton
            type="button"
            $active={filter === "income"}
            onClick={() => setFilter("income")}
          >
            Receitas
          </FilterButton>
        </Filters>
      </Toolbar>
      <SectionHeader>
        <SectionTitle>Suas categorias</SectionTitle>
        <span>{filteredCategories.length} categorias</span>
      </SectionHeader>
      {filteredCategories.length > 0 ? (
        <CategoryGrid>
          {filteredCategories.map((category) => {
            const appearance = getCategoryAppearance(category.name);

            const selectedIcon = CATEGORY_ICONS.find(
              (item) => item.name === category.icon,
            );

            const Icon = selectedIcon?.Icon ?? CircleDollarSign;
            const count = usage.get(category.name) ?? 0;

            return (
              <CategoryCard key={category.id ?? category.name}>
                <CategoryInfo>
                  <CategoryIcon
                    $color={appearance.color}
                    $background={appearance.background}
                  >
                    <Icon size={22} strokeWidth={1.8} />
                  </CategoryIcon>

                  <div>
                    <CategoryName>{category.name}</CategoryName>
                    <Badge $income={category.type === "income"}>
                      {category.type === "income" ? "Receita" : "Despesa"}
                    </Badge>
                  </div>
                </CategoryInfo>

                <Actions>
                  <span>
                    {count} {count === 1 ? "lançamento" : "lançamentos"}
                  </span>
                  <IconButton
                    type="button"
                    aria-label={`Editar ${category.name}`}
                    title="Editar categoria"
                    onClick={() => openEditModal(category)}
                  >
                    <Pencil size={16} />
                  </IconButton>
                  <IconButton
                    type="button"
                    aria-label={`Excluir ${category.name}`}
                    title="Excluir categoria"
                    onClick={() => void onDelete(category)}
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </Actions>
              </CategoryCard>
            );
          })}
        </CategoryGrid>
      ) : (
        <EmptyState>
          <Search size={28} />
          <strong>Nenhuma categoria encontrada</strong>
          <span>Experimente mudar a busca ou o filtro selecionado.</span>
        </EmptyState>
      )}
      {modalOpen && (
        <ModalBackdrop
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <Modal
            role="dialog"
            aria-modal="true"
            aria-labelledby="category-modal-title"
          >
            <ModalHeader>
              <div>
                <h2 id="category-modal-title">
                  {editing ? "Editar categoria" : "Nova categoria"}
                </h2>
                <p>
                  {editing
                    ? "Atualize o nome da categoria."
                    : "Dê um nome fácil de reconhecer para sua categoria."}
                </p>
              </div>
              <IconButton
                type="button"
                aria-label="Fechar modal"
                onClick={closeModal}
              >
                <X size={20} />
              </IconButton>
            </ModalHeader>

            <Form onSubmit={(event) => void handleSubmit(event)}>
              <FormField>
                <label htmlFor="category-name">Nome da categoria</label>
                <input
                  id="category-name"
                  name="name"
                  type="text"
                  placeholder="Ex.: Assinaturas"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={60}
                  required
                />
              </FormField>

              <FormField>
                <label htmlFor="category-type">Tipo de categoria</label>
                <select
                  id="category-type"
                  value={type}
                  onChange={(event) =>
                    setType(event.target.value as CategoryType)
                  }
                >
                  <option value="expense">Despesa</option>
                  <option value="income">Receita</option>
                </select>
              </FormField>

              <FormField>
                <label>Escolha um ícone</label>
                <IconPicker>
                  {CATEGORY_ICONS.map(({ name: iconName, label, Icon }) => (
                    <IconOption
                      key={iconName}
                      type="button"
                      $selected={icon === iconName}
                      aria-label={label}
                      aria-pressed={icon === iconName}
                      title={label}
                      onClick={() => setIcon(iconName)}
                    >
                      <Icon size={22} />
                    </IconOption>
                  ))}
                </IconPicker>
                <SelectedIconLabel>
                  Selecionado:{" "}
                  {CATEGORY_ICONS.find((item) => item.name === icon)?.label}
                </SelectedIconLabel>
              </FormField>

              {error && <p role="alert">{error}</p>}

              <FormActions>
                <PrimaryButton
                  type="button"
                  $secondary
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancelar
                </PrimaryButton>
                <PrimaryButton type="submit" disabled={saving}>
                  {saving
                    ? "Salvando..."
                    : editing
                      ? "Salvar alterações"
                      : "Criar categoria"}
                </PrimaryButton>
              </FormActions>
            </Form>
          </Modal>
        </ModalBackdrop>
      )}
    </Main>
  );
}
