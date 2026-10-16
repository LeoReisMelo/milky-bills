import styled, { css } from "styled-components";

export const Page = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  min-width: 0;
  color: var(--color-text, #fafafa);
`;

export const PageHeader = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`;

export const HeaderContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const Eyebrow = styled.span`
  display: none;
`;

export const Title = styled.h1`
  margin: 0;
  color: var(--color-text, #fafafa);
  font-size: clamp(1.55rem, 2.4vw, 1.9rem);
  font-weight: 700;
  letter-spacing: -0.035em;
`;

export const Subtitle = styled.p`
  margin: 0;
  color: var(--color-text-secondary, #a1a1aa);
  font-size: 0.875rem;
  line-height: 1.5;
`;

export const PrimaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 38px;
  padding: 0 16px;
  border: 1px solid var(--color-primary, #efa7be);
  border-radius: 7px;
  background: var(--color-primary, #efa7be);
  color: #fff;
  font: inherit;
  font-size: 0.84rem;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  box-shadow: 0 2px 4px rgb(0 0 0 / 14%);
  transition:
    background 150ms ease,
    transform 150ms ease;

  &:hover {
    background: var(--color-primary-hover, #d9799a);
    transform: translateY(-1px);
  }
  &:focus-visible {
    outline: 3px solid rgb(50 104 233 / 30%);
    outline-offset: 2px;
  }
  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    transform: none;
  }
`;

export const SecondaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 40px;
  padding: 0 14px;
  border: 1px solid var(--color-border, #27272a);
  border-radius: 8px;
  background: var(--color-surface, #111113);
  color: var(--color-text, #fafafa);
  font: inherit;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  &:hover {
    background: var(--color-background, #09090b);
  }
  &:focus-visible {
    outline: 3px solid rgb(50 104 233 / 25%);
    outline-offset: 2px;
  }
`;

/* Kept exported for compatibility with the existing component tree. */
export const SummaryGrid = styled.section`
  display: none;
`;
export const SummaryCard = styled.article`
  display: none;
`;
export const SummaryIcon = styled.div<{
  $variant: "income" | "expense" | "total";
}>`
  display: none;
`;
export const SummaryContent = styled.div`
  display: none;
`;
export const SummaryLabel = styled.span`
  display: none;
`;
export const SummaryValue = styled.strong<{
  $variant?: "income" | "expense" | "total";
}>`
  display: none;
`;

export const Panel = styled.section`
  min-width: 0;
  padding: 16px;
  border: 1px solid var(--color-border, #27272a);
  border-radius: 9px;
  background: var(--color-surface, #111113);
  color: var(--color-text, #fafafa);

  @media (max-width: 600px) {
    padding: 12px;
    border-radius: 8px;
  }
`;

export const PanelHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
`;

export const PanelTitle = styled.h2`
  margin: 0;
  color: var(--color-text, #fafafa);
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: -0.015em;
`;

export const PanelDescription = styled.p`
  margin: 5px 0 0;
  color: var(--color-text-secondary, #a1a1aa);
  font-size: 0.82rem;
  line-height: 1.5;
`;

export const TypeSwitch = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
  padding: 5px;
  border-radius: 10px;
  background: var(--color-background, #09090b);
`;

export const TypeOption = styled.button<{
  $active: boolean;
  $type: "income" | "expense";
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 42px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: ${({ $active }) =>
    $active ? "var(--color-surface, #111113)" : "transparent"};
  color: ${({ $active, $type }) =>
    $active
      ? $type === "income"
        ? "var(--color-income, #22c55e)"
        : "var(--color-expense, #c34b70)"
      : "var(--color-text-secondary, #a1a1aa)"};
  font: inherit;
  font-weight: 650;
  cursor: pointer;
  ${({ $active }) =>
    $active &&
    css`
      box-shadow: 0 1px 4px rgb(16 24 40 / 9%);
    `}
  &:focus-visible {
    outline: 3px solid rgb(50 104 233 / 25%);
    outline-offset: 2px;
  }
`;

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 15px;
  }
`;

export const Field = styled.div<{ $fullWidth?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 7px;
  min-width: 0;
  ${({ $fullWidth }) =>
    $fullWidth &&
    css`
      grid-column: 1 / -1;
    `}
`;

export const Label = styled.label`
  color: var(--color-text, #fafafa);
  font-size: 0.82rem;
  font-weight: 650;
`;

const controlStyles = css`
  width: 100%;
  min-width: 0;
  min-height: 40px;
  padding: 9px 11px;
  border: 1px solid var(--color-border-strong, #3f3f46);
  border-radius: 7px;
  background: var(--color-surface, #111113);
  color: var(--color-text, #fafafa);
  font: inherit;
  font-size: 0.84rem;
  transition:
    border-color 150ms ease,
    box-shadow 150ms ease;
  &::placeholder {
    color: var(--color-text-secondary, #a1a1aa);
  }
  &:hover {
    border-color: var(--color-border-strong, #3f3f46);
  }
  &:focus {
    outline: none;
    border-color: var(--color-primary, #efa7be);
    box-shadow: 0 0 0 3px rgb(50 104 233 / 12%);
  }
  &:disabled {
    background: var(--color-background, #09090b);
    cursor: not-allowed;
  }
`;

export const Input = styled.input`
  ${controlStyles}
`;
export const Select = styled.select`
  ${controlStyles};
  cursor: pointer;
`;
export const Textarea = styled.textarea`
  ${controlStyles};
  min-height: 100px;
  resize: vertical;
  line-height: 1.55;
`;

export const AmountInputWrapper = styled.div`
  position: relative;
  &::before {
    position: absolute;
    top: 50%;
    left: 12px;
    color: var(--color-text-secondary, #a1a1aa);
    font-size: 0.84rem;
    content: "R$";
    transform: translateY(-50%);
    pointer-events: none;
  }
`;
export const AmountInput = styled(Input)`
  padding-left: 40px;
  font-size: 1rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
`;
export const FormFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 22px;
  padding-top: 18px;
  border-top: 1px solid var(--color-border, #27272a);
`;

export const UploadArea = styled.label<{ $hasFile: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  padding: 15px;
  border: 1px dashed
    ${({ $hasFile }) =>
      $hasFile
        ? "var(--color-primary, #EFA7BE)"
        : "var(--color-border-strong, #3f3f46)"};
  border-radius: 8px;
  background: ${({ $hasFile }) =>
    $hasFile
      ? "var(--color-primary-soft, #18181b)"
      : "var(--color-background, #09090b)"};
  cursor: pointer;
  &:hover {
    border-color: var(--color-primary, #efa7be);
    background: var(--color-primary-soft, #18181b);
  }
`;
export const UploadIcon = styled.div`
  display: grid;
  flex: 0 0 40px;
  width: 40px;
  height: 40px;
  place-items: center;
  border-radius: 9px;
  background: var(--color-primary-soft, #18181b);
  color: var(--color-primary, #efa7be);
`;
export const UploadText = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;
export const UploadTitle = styled.strong`
  overflow-wrap: anywhere;
  color: var(--color-text, #fafafa);
  font-size: 0.85rem;
`;
export const UploadHint = styled.span`
  color: var(--color-text-secondary, #a1a1aa);
  font-size: 0.76rem;
  line-height: 1.5;
`;
export const HiddenFileInput = styled.input`
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  clip-path: inset(50%);
`;
export const AttachmentActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 8px;
`;
export const TextButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 0;
  border: 0;
  background: transparent;
  color: var(--color-primary, #efa7be);
  font: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

export const Filters = styled.div`
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 20px;
  ${Input} {
    min-height: 40px;
  }
  @media (max-width: 1100px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  @media (max-width: 650px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  @media (max-width: 420px) {
    grid-template-columns: 1fr;
  }
`;

export const SearchWrapper = styled.div`
  position: relative;
  grid-column: 1 / -1;
  min-width: 0;
  margin-bottom: 2px;
  > svg {
    position: absolute;
    top: 50%;
    left: 13px;
    color: var(--color-text-secondary, #a1a1aa);
    transform: translateY(-50%);
    pointer-events: none;
  }
  input {
    padding-left: 37px;
  }
`;

export const ResultsCount = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 0 0 0;
  padding: 0 0 12px;
  border-bottom: 1px solid var(--color-border, #27272a);
  color: var(--color-text-secondary, #a1a1aa);
  font-size: 0.76rem;
`;

export const ResultsTotals = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  color: var(--color-text-secondary, #a1a1aa);
  text-align: right;
  white-space: nowrap;
  strong {
    color: var(--color-text, #fafafa);
    font-weight: 700;
  }
  .income {
    color: var(--color-income, #22c55e);
  }
  @media (max-width: 520px) {
    white-space: normal;
    flex-wrap: wrap;
  }
`;

export const TransactionList = styled.div`
  display: flex;
  flex-direction: column;
`;
export const TransactionRow = styled.article`
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 12px;
  padding: 15px 0;
  border-bottom: 1px solid var(--color-border, #27272a);
  &:last-child {
    border-bottom: 0;
  }
  @media (max-width: 600px) {
    grid-template-columns: 38px minmax(0, 1fr) auto;
    gap: 9px;
  }
`;
export const TransactionIcon = styled.div<{
  $type: "income" | "expense" | "transfer";
}>`
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  border-radius: 9px;
  background: var(--color-primary-soft, #18181b);
  color: var(--color-text, #fafafa);
`;
export const TransactionInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
`;
export const TransactionTitle = styled.strong`
  overflow: hidden;
  color: var(--color-text, #fafafa);
  font-size: 0.84rem;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
export const TransactionMeta = styled.span`
  overflow: hidden;
  color: var(--color-text-secondary, #a1a1aa);
  font-size: 0.74rem;
  line-height: 1.45;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
export const TransactionAmount = styled.strong<{
  $type: "income" | "expense" | "transfer";
}>`
  color: ${({ $type }) =>
    $type === "income"
      ? "var(--color-income, #22c55e)"
      : $type === "expense"
        ? "var(--color-expense, var(--color-text, #fafafa))"
        : "var(--color-text, #fafafa)"};
  font-size: 0.84rem;
  font-weight: 750;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
`;
export const RowActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  flex-wrap: wrap;
  min-width: 0;
  @media (max-width: 600px) {
    grid-column: 2 / -1;
    grid-row: 2;
    justify-content: flex-end;
    align-self: center;
  }
`;
export const IconButton = styled.button`
  display: inline-grid;
  width: 30px;
  height: 30px;
  place-items: center;
  border: 1px solid transparent;
  border-radius: 7px;
  background: transparent;
  color: var(--color-text-secondary, #a1a1aa);
  cursor: pointer;
  &:hover {
    border-color: var(--color-border, #27272a);
    background: var(--color-background, #09090b);
    color: var(--color-text, #fafafa);
  }
  &:focus-visible {
    outline: 3px solid rgb(50 104 233 / 25%);
    outline-offset: 2px;
  }
`;
export const AttachmentBadge = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  width: fit-content;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--color-primary, #efa7be);
  font: inherit;
  font-size: 0.7rem;
  font-weight: 600;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;
export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 44px 20px;
  text-align: center;
`;
export const EmptyIcon = styled.div`
  display: grid;
  width: 52px;
  height: 52px;
  place-items: center;
  border-radius: 14px;
  background: var(--color-primary-soft, #18181b);
  color: var(--color-text-secondary, #a1a1aa);
`;
export const EmptyTitle = styled.h3`
  margin: 0;
  color: var(--color-text, #fafafa);
  font-size: 0.98rem;
`;
export const EmptyDescription = styled.p`
  max-width: 360px;
  margin: 0;
  color: var(--color-text-secondary, #a1a1aa);
  font-size: 0.83rem;
  line-height: 1.6;
`;
export const ErrorMessage = styled.p`
  margin: 0;
  color: #c24155;
  font-size: 0.8rem;
  line-height: 1.5;
`;
export const Notice = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid var(--color-primary-border, #3f3f46);
  border-radius: 8px;
  background: var(--color-primary-soft, #18181b);
  color: var(--color-text, #fafafa);
  font-size: 0.84rem;
  line-height: 1.5;
`;
export const VisuallyHidden = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

export const PreviewBackdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgb(0 0 0 / 68%);
`;

export const PreviewDialog = styled.section`
  display: flex;
  flex-direction: column;
  width: min(100%, 900px);
  max-height: min(90vh, 900px);
  overflow: hidden;
  border: 1px solid var(--color-border, #27272a);
  border-radius: 14px;
  background: var(--color-surface, #111113);
  color: var(--color-text, #fafafa);
  box-shadow: 0 24px 80px rgb(0 0 0 / 35%);
`;

export const PreviewHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 16px 18px;
  border-bottom: 1px solid var(--color-border, #27272a);
`;

export const PreviewTitle = styled.h2`
  margin: 0 0 4px;
  overflow-wrap: anywhere;
  color: var(--color-text, #fafafa);
  font-size: 0.95rem;
  font-weight: 700;
`;

export const PreviewContent = styled.div`
  display: grid;
  flex: 1;
  min-height: 220px;
  overflow: auto;
  place-items: center;
  padding: 16px;
  background: var(--color-background, #09090b);
`;

export const PreviewImage = styled.img`
  display: block;
  max-width: 100%;
  max-height: 65vh;
  object-fit: contain;
  border-radius: 6px;
`;

export const PreviewFrame = styled.iframe`
  display: block;
  width: 100%;
  height: min(65vh, 680px);
  border: 0;
  border-radius: 6px;
  background: var(--color-surface, #111113);
`;

export const PreviewFallback = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px 16px;
  color: var(--color-text-secondary, #a1a1aa);
  text-align: center;
`;

export const PreviewFooter = styled.footer`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 18px;
  border-top: 1px solid var(--color-border, #27272a);
  background: var(--color-surface, #111113);
`;
