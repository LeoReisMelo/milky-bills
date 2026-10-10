import { useMemo, useState, type FormEvent } from "react";
import {
  Building2,
  Check,
  ChevronDown,
  Pencil,
  Plus,
  Search,
  Trash2,
  Wallet,
  X,
} from "lucide-react";
import type { Account } from "../../db/database";
import {
  ACCOUNT_TYPES,
  FINANCIAL_INSTITUTIONS,
} from "../../data/financial-institutions";
import {
  AccountActions,
  AccountBalance,
  AccountCard,
  AccountDetails,
  AccountForm,
  AccountGrid,
  AccountHeader,
  AccountIcon,
  AccountIdentity,
  AccountInstitution,
  AccountName,
  AccountTypeBadge,
  AccountsContainer,
  AccountsEmpty,
  AccountsToolbar,
  ActionButton,
  BalanceLabel,
  BalanceValue,
  CancelButton,
  Field,
  FieldError,
  FormActions,
  FormGrid,
  FormHeading,
  FormOverlay,
  FormPanel,
  FormSubtitle,
  FormTitle,
  InstitutionButton,
  InstitutionGrid,
  InstitutionLogo,
  InstitutionName,
  Input,
  InputAdornment,
  Label,
  PrimaryButton,
  SearchBox,
  Select,
  SummaryCard,
  SummaryGrid,
  SummaryLabel,
  SummaryValue,
  ToolbarCount,
} from "./Accounts.styles";

type AccountType = (typeof ACCOUNT_TYPES)[number]["value"];

export type AccountFormData = {
  name: string;
  institutionId: string;
  type: AccountType;
  initialBalance: number;
};

interface AccountsPageProps {
  accounts: Account[];
  balances?: Record<number, number>;
  onCreate: (data: AccountFormData) => void | Promise<void>;
  onUpdate: (id: number, data: AccountFormData) => void | Promise<void>;
  onDelete: (account: Account) => Promise<void>;
}

const formatCurrency = (amountInCents: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amountInCents / 100);

const parseCurrencyToCents = (value: string) => {
  const normalized = value
    .trim()
    .replace(/\s/g, "")
    .replace(/^R\$/i, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const amount = Number(normalized);

  if (!Number.isFinite(amount)) {
    return null;
  }

  return Math.round(amount * 100);
};

const getInstitution = (institutionId: string) =>
  FINANCIAL_INSTITUTIONS.find(
    (institution) => institution.id === institutionId,
  ) ?? FINANCIAL_INSTITUTIONS[FINANCIAL_INSTITUTIONS.length - 1];

const getAccountTypeLabel = (type: string) =>
  ACCOUNT_TYPES.find((item) => item.value === type)?.label ?? "Conta";

const getInitialFormData = (): AccountFormData => ({
  name: "",
  institutionId: "nubank",
  type: "checking",
  initialBalance: 0,
});

export function AccountsPage({
  accounts,
  balances = {},
  onCreate,
  onUpdate,
  onDelete,
}: AccountsPageProps) {
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [formData, setFormData] = useState<AccountFormData>(getInitialFormData);
  const [initialBalanceInput, setInitialBalanceInput] = useState("0,00");
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState("nubank");

  const filteredAccounts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("pt-BR");

    if (!query) {
      return accounts;
    }

    return accounts.filter((account) => {
      const institution = getInstitution(account.institutionId);

      return [
        account.name,
        institution.name,
        institution.shortName,
        getAccountTypeLabel(account.type),
      ].some((value) => value.toLocaleLowerCase("pt-BR").includes(query));
    });
  }, [accounts, search]);

  const totalBalance = useMemo(
    () =>
      accounts.reduce((total, account) => {
        const balance =
          account.id !== undefined
            ? (balances[account.id] ?? account.initialBalance)
            : account.initialBalance;

        return total + balance;
      }, 0),
    [accounts, balances],
  );

  const openCreateForm = () => {
    setEditingAccount(null);
    setFormData(getInitialFormData());
    setInitialBalanceInput("0,00");
    setSelectedInstitution("nubank");
    setFormError("");
    setIsFormOpen(true);
  };

  const openEditForm = (account: Account) => {
    setEditingAccount(account);
    setFormData({
      name: account.name,
      institutionId: account.institutionId,
      type: account.type,
      initialBalance: account.initialBalance,
    });
    setInitialBalanceInput(
      (account.initialBalance / 100).toFixed(2).replace(".", ","),
    );
    setSelectedInstitution(account.institutionId);
    setFormError("");
    setIsFormOpen(true);
  };

  const closeForm = () => {
    if (isSaving) {
      return;
    }

    setIsFormOpen(false);
    setEditingAccount(null);
    setFormError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    const institution = getInstitution(selectedInstitution);
    const initialBalance = parseCurrencyToCents(initialBalanceInput);

    if (initialBalance === null) {
      setFormError("Informe um saldo inicial válido.");
      return;
    }

    if (initialBalance < 0) {
      setFormError("O saldo inicial não pode ser negativo.");
      return;
    }

    if (formData.type === "credit" && initialBalance > 0) {
      setFormError(
        "Para uma conta de crédito, informe o saldo inicial conforme a regra adotada pelo seu aplicativo.",
      );
      return;
    }

    const payload: AccountFormData = {
      name: formData.name.trim() || institution.name,
      institutionId: selectedInstitution,
      type: formData.type,
      initialBalance,
    };

    try {
      setIsSaving(true);

      if (editingAccount?.id !== undefined) {
        await onUpdate(editingAccount.id, payload);
      } else {
        await onCreate(payload);
      }

      setIsFormOpen(false);
      setEditingAccount(null);
      setFormData(getInitialFormData());
      setInitialBalanceInput("0,00");
    } catch {
      setFormError("Não foi possível salvar a conta. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (account: Account) => {
    if (account.id === undefined) {
      return;
    }

    const institution = getInstitution(account.institutionId);
    const confirmed = window.confirm(
      `Deseja excluir a conta "${account.name || institution.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await onDelete(account);
    } catch {
      window.alert(
        "Não foi possível excluir a conta. Verifique se existem transações vinculadas.",
      );
    }
  };

  const handleInstitutionChange = (institutionId: string) => {
    setSelectedInstitution(institutionId);
    setFormData((current) => ({
      ...current,
      institutionId,
    }));
  };

  return (
    <AccountsContainer>
      <AccountHeader>
        <div>
          <AccountName>Minhas contas</AccountName>
          <FormSubtitle>
            Gerencie suas contas e acompanhe seus saldos em um só lugar.
          </FormSubtitle>
        </div>

        <PrimaryButton type="button" onClick={openCreateForm}>
          <Plus size={18} />
          Nova conta
        </PrimaryButton>
      </AccountHeader>

      <SummaryGrid>
        <SummaryCard>
          <AccountIcon>
            <Wallet size={21} />
          </AccountIcon>
          <SummaryLabel>Saldo total das contas</SummaryLabel>
          <SummaryValue>{formatCurrency(totalBalance)}</SummaryValue>
        </SummaryCard>

        <SummaryCard>
          <AccountIcon>
            <Building2 size={21} />
          </AccountIcon>
          <SummaryLabel>Contas cadastradas</SummaryLabel>
          <SummaryValue>{accounts.length}</SummaryValue>
        </SummaryCard>
      </SummaryGrid>

      <AccountsToolbar>
        <SearchBox>
          <Search size={18} />
          <Input
            aria-label="Buscar contas"
            placeholder="Buscar por banco ou tipo de conta..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          {search && (
            <ActionButton
              type="button"
              aria-label="Limpar busca"
              onClick={() => setSearch("")}
            >
              <X size={16} />
            </ActionButton>
          )}
        </SearchBox>

        <ToolbarCount>
          {filteredAccounts.length}{" "}
          {filteredAccounts.length === 1 ? "conta" : "contas"}
        </ToolbarCount>
      </AccountsToolbar>

      {filteredAccounts.length > 0 ? (
        <AccountGrid>
          {filteredAccounts.map((account) => {
            const institution = getInstitution(account.institutionId);
            const Logo = institution.logo;
            const balance =
              account.id !== undefined
                ? (balances[account.id] ?? account.initialBalance)
                : account.initialBalance;

            return (
              <AccountCard key={account.id ?? account.name}>
                <AccountDetails>
                  <AccountIdentity>
                    <InstitutionLogo aria-label={institution.name}>
                      <Logo size={32} />
                    </InstitutionLogo>

                    <div>
                      <AccountInstitution>
                        {institution.shortName}
                      </AccountInstitution>
                      <AccountName>{account.name}</AccountName>
                    </div>
                  </AccountIdentity>

                  <AccountActions>
                    <ActionButton
                      type="button"
                      aria-label={`Editar ${account.name}`}
                      title="Editar conta"
                      onClick={() => openEditForm(account)}
                    >
                      <Pencil size={17} />
                    </ActionButton>
                    <ActionButton
                      type="button"
                      aria-label={`Excluir ${account.name}`}
                      title="Excluir conta"
                      onClick={() => void handleDelete(account)}
                    >
                      <Trash2 size={17} />
                    </ActionButton>
                  </AccountActions>
                </AccountDetails>

                <AccountTypeBadge>
                  {getAccountTypeLabel(account.type)}
                </AccountTypeBadge>

                <AccountBalance>
                  <BalanceLabel>Saldo atual</BalanceLabel>
                  <BalanceValue>{formatCurrency(balance)}</BalanceValue>
                </AccountBalance>
              </AccountCard>
            );
          })}
        </AccountGrid>
      ) : (
        <AccountsEmpty>
          <AccountIcon>
            <Wallet size={26} />
          </AccountIcon>
          <FormTitle>
            {search
              ? "Nenhuma conta encontrada"
              : "Comece adicionando uma conta"}
          </FormTitle>
          <FormSubtitle>
            {search
              ? "Experimente buscar por outro banco ou tipo de conta."
              : "Cadastre seu banco, informe o tipo de conta e seu saldo inicial."}
          </FormSubtitle>
          {!search && (
            <PrimaryButton type="button" onClick={openCreateForm}>
              <Plus size={18} />
              Adicionar primeira conta
            </PrimaryButton>
          )}
        </AccountsEmpty>
      )}

      {isFormOpen && (
        <FormOverlay
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeForm();
            }
          }}
        >
          <FormPanel
            role="dialog"
            aria-modal="true"
            aria-labelledby="account-form-title"
          >
            <FormHeading>
              <div>
                <FormTitle id="account-form-title">
                  {editingAccount ? "Editar conta" : "Nova conta"}
                </FormTitle>
                <FormSubtitle>
                  Selecione a instituição e informe os dados da conta.
                </FormSubtitle>
              </div>

              <ActionButton
                type="button"
                aria-label="Fechar formulário"
                onClick={closeForm}
                disabled={isSaving}
              >
                <X size={20} />
              </ActionButton>
            </FormHeading>

            <AccountForm onSubmit={handleSubmit}>
              <Field>
                <Label>Instituição financeira</Label>
                <InstitutionGrid>
                  {FINANCIAL_INSTITUTIONS.map((institution) => {
                    const Logo = institution.logo;
                    const isSelected = selectedInstitution === institution.id;

                    return (
                      <InstitutionButton
                        key={institution.id}
                        type="button"
                        $selected={isSelected}
                        aria-pressed={isSelected}
                        onClick={() => handleInstitutionChange(institution.id)}
                      >
                        <InstitutionLogo>
                          <Logo size={30} />
                        </InstitutionLogo>
                        <InstitutionName>
                          {institution.shortName}
                        </InstitutionName>
                        {isSelected && <Check size={15} />}
                      </InstitutionButton>
                    );
                  })}
                </InstitutionGrid>
              </Field>

              <Field>
                <Label htmlFor="account-name">
                  Nome para identificação <span>(opcional)</span>
                </Label>
                <Input
                  id="account-name"
                  placeholder={getInstitution(selectedInstitution).name}
                  value={formData.name}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                />
                <FormSubtitle>
                  Ex.: Conta pessoal, Conta conjunta ou Reserva.
                </FormSubtitle>
              </Field>

              <FormGrid>
                <Field>
                  <Label htmlFor="account-type">Tipo de conta</Label>
                  <Select
                    id="account-type"
                    value={formData.type}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        type: event.target.value as AccountType,
                      }))
                    }
                  >
                    {ACCOUNT_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </Select>
                  <ChevronDown size={16} />
                </Field>

                <Field>
                  <Label htmlFor="account-balance">Saldo inicial</Label>
                  <InputAdornment>
                    <span>R$</span>
                    <Input
                      id="account-balance"
                      inputMode="decimal"
                      placeholder="0,00"
                      value={initialBalanceInput}
                      onChange={(event) =>
                        setInitialBalanceInput(event.target.value)
                      }
                      required
                    />
                  </InputAdornment>
                </Field>
              </FormGrid>

              {formError && <FieldError role="alert">{formError}</FieldError>}

              <FormActions>
                <CancelButton
                  type="button"
                  onClick={closeForm}
                  disabled={isSaving}
                >
                  Cancelar
                </CancelButton>

                <PrimaryButton type="submit" disabled={isSaving}>
                  {isSaving
                    ? "Salvando..."
                    : editingAccount
                      ? "Salvar alterações"
                      : "Criar conta"}
                </PrimaryButton>
              </FormActions>
            </AccountForm>
          </FormPanel>
        </FormOverlay>
      )}
    </AccountsContainer>
  );
}
