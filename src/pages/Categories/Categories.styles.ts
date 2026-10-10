import styled from "styled-components";

export const Main = styled.main`
  display: flex;
  flex-direction: column;
  gap: 28px;
  width: 100%;
  min-width: 0;
  padding-bottom: 24px;
`;

export const Header = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const PageTitle = styled.h1`
  margin: 0 0 8px;
  font-size: clamp(1.5rem, 2.5vw, 1.9rem);
  font-weight: 700;
  letter-spacing: -0.04em;
`;

export const PageDescription = styled.p`
  max-width: 620px;
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  line-height: 1.6;
`;

export const PrimaryButton = styled.button<{ $secondary?: boolean }>`
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  gap: 9px;
  padding: 0 17px;
  border: 1px solid
    ${({ $secondary }) =>
      $secondary ? "var(--color-border)" : "var(--color-primary)"};
  border-radius: 12px;
  background: ${({ $secondary }) =>
    $secondary ? "var(--color-surface)" : "var(--color-primary)"};
  color: ${({ $secondary }) => ($secondary ? "var(--color-text)" : "#ffffff")};
  font-size: 0.875rem;
  font-weight: 600;
  white-space: nowrap;
  transition:
    background 160ms ease,
    border-color 160ms ease,
    transform 160ms ease;

  &:hover:not(:disabled) {
    background: ${({ $secondary }) =>
      $secondary
        ? "var(--color-surface-elevated)"
        : "var(--color-primary-hover)"};
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const SummaryGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

export const SummaryCard = styled.article`
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 15px;
  padding: 20px;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  background: var(--color-surface);
  box-shadow: var(--shadow-card);

  div:last-child {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 5px;
  }

  div:last-child span {
    color: var(--color-text-secondary);
    font-size: 0.8rem;
  }

  div:last-child strong {
    color: var(--color-text);
    font-size: 1.65rem;
    font-weight: 700;
    line-height: 1.2;
    font-variant-numeric: tabular-nums;
  }
`;

export const CategoryIcon = styled.div<{
  $color: string;
  $background: string;
}>`
  display: grid;
  width: 48px;
  height: 48px;
  flex: 0 0 48px;
  place-items: center;
  border-radius: 14px;
  background: ${({ $background }) => $background};
  color: ${({ $color }) => $color};
`;

export const Toolbar = styled.section`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  @media (max-width: 760px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const SearchBox = styled.div`
  display: flex;
  min-width: 220px;
  max-width: 440px;
  min-height: 46px;
  flex: 1;
  align-items: center;
  gap: 10px;
  padding: 0 13px;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-surface);
  color: var(--color-text-secondary);
  transition: border-color 160ms ease;

  &:focus-within {
    border-color: var(--color-primary);
  }

  @media (max-width: 760px) {
    max-width: none;
  }
`;

export const Input = styled.input`
  width: 100%;
  min-width: 0;
  min-height: 42px;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--color-text);
  font-size: 0.875rem;

  &::placeholder {
    color: var(--color-text-secondary);
    opacity: 0.8;
  }

  &:focus-visible {
    outline: none;
  }
`;

export const Filters = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  padding: 4px;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-surface);

  @media (max-width: 760px) {
    width: 100%;
  }
`;

export const FilterButton = styled.button<{ $active: boolean }>`
  min-height: 34px;
  padding: 0 13px;
  border: 1px solid transparent;
  border-radius: 9px;
  background: ${({ $active }) =>
    $active ? "var(--color-primary-soft)" : "transparent"};
  color: ${({ $active }) =>
    $active ? "var(--color-primary)" : "var(--color-text-secondary)"};
  font-size: 0.8rem;
  font-weight: ${({ $active }) => ($active ? 600 : 500)};
  white-space: nowrap;

  &:hover {
    color: var(--color-primary);
  }

  @media (max-width: 760px) {
    flex: 1;
    padding-inline: 8px;
  }
`;

export const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: -14px;

  span {
    color: var(--color-text-secondary);
    font-size: 0.8rem;
  }
`;

export const SectionTitle = styled.h2`
  margin: 0;
  font-size: 1.05rem;
  font-weight: 650;
  letter-spacing: -0.02em;
`;

export const CategoryGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

export const CategoryCard = styled.article`
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 17px;
  border: 1px solid var(--color-border);
  border-radius: 15px;
  background: var(--color-surface);
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease;

  &:hover {
    border-color: var(--color-border-strong);
    box-shadow: var(--shadow-card);
  }

  @media (max-width: 520px) {
    flex-wrap: wrap;
  }
`;

export const CategoryInfo = styled.div`
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 13px;

  div:last-child {
    display: flex;
    min-width: 0;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
`;

export const CategoryName = styled.strong`
  overflow-wrap: anywhere;
  color: var(--color-text);
  font-size: 0.9rem;
  font-weight: 600;
`;

export const Badge = styled.span<{ $income: boolean }>`
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  border-radius: 6px;
  background: ${({ $income }) =>
    $income ? "var(--color-income-soft)" : "var(--color-expense-soft)"};
  color: ${({ $income }) =>
    $income ? "var(--color-income)" : "var(--color-expense)"};
  font-size: 0.7rem;
  font-weight: 600;
`;

export const Actions = styled.div`
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 4px;

  span {
    margin-right: 4px;
    color: var(--color-text-secondary);
    font-size: 0.7rem;
    white-space: nowrap;
  }

  @media (max-width: 520px) {
    width: 100%;
    justify-content: flex-end;
  }
`;

export const IconButton = styled.button`
  display: inline-grid;
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  place-items: center;
  border: 1px solid transparent;
  border-radius: 9px;
  background: transparent;
  color: var(--color-text-secondary);
  transition:
    color 160ms ease,
    border-color 160ms ease,
    background 160ms ease;

  &:hover {
    border-color: var(--color-border);
    background: var(--color-surface-elevated);
    color: var(--color-primary);
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
`;

export const EmptyState = styled.div`
  display: flex;
  min-height: 230px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 28px;
  border: 1px dashed var(--color-border-strong);
  border-radius: 16px;
  color: var(--color-text-secondary);
  text-align: center;
  strong {
    color: var(--color-text);
    font-size: 0.95rem;
  }

  span {
    font-size: 0.85rem;
  }
`;

export const ModalBackdrop = styled.div`
  position: fixed;
  z-index: 1000;
  inset: 0;
  display: grid;
  overflow-y: auto;
  place-items: center;
  padding: 20px;
  background: var(--color-overlay);
  backdrop-filter: blur(4px);
`;

export const Modal = styled.section`
  width: min(100%, 460px);
  padding: 24px;
  border: 1px solid var(--color-border);
  border-radius: 18px;
  background: var(--color-surface);
  box-shadow: var(--shadow-overlay);

  h2 {
    margin: 0 0 7px;
    font-size: 1.2rem;
    font-weight: 700;
  }

  p {
    margin: 0;
    color: var(--color-text-secondary);
    font-size: 0.85rem;
    line-height: 1.55;
  }

  p[role="alert"] {
    margin-top: 12px;
    color: var(--color-expense);
  }

  @media (max-width: 480px) {
    padding: 20px;
  }
`;

export const ModalHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

export const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    color: var(--color-text);
    font-size: 0.825rem;
    font-weight: 600;
  }

  input,
  select {
    width: 100%;
    min-height: 44px;
    padding: 0 12px;
    border: 1px solid var(--color-border);
    border-radius: 10px;
    background: var(--color-background);
    color: var(--color-text);
  }

  input:focus,
  select:focus {
    border-color: var(--color-primary);
    outline: 2px solid var(--color-primary-soft);
  }
`;

export const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 4px;
`;

export const IconPicker = styled.div`
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 8px;

  @media (max-width: 400px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`;

export const IconOption = styled.button<{ $selected: boolean }>`
  display: grid;
  min-width: 0;
  aspect-ratio: 1;
  place-items: center;
  border: 1px solid
    ${({ $selected }) =>
      $selected ? "var(--color-primary)" : "var(--color-border)"};
  border-radius: 12px;
  background: ${({ $selected }) =>
    $selected ? "var(--color-primary-soft)" : "var(--color-surface)"};
  color: ${({ $selected }) =>
    $selected ? "var(--color-primary)" : "var(--color-text-secondary)"};

  &:hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
  }
`;

export const SelectedIconLabel = styled.span`
  color: var(--color-text-secondary);
  font-size: 0.75rem;
`;
