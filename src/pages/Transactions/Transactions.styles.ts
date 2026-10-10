import styled, { css } from "styled-components";

export const Page = styled.div`
  display: flex;
  flex-direction: column;
  gap: 28px;
  width: 100%;
  min-width: 0;
  color: #29252a;
`;

export const PageHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`;

export const HeaderContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const Eyebrow = styled.span`
  color: #d9799a;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
`;

export const Title = styled.h1`
  margin: 0;
  font-size: clamp(1.65rem, 3vw, 2rem);
  font-weight: 750;
  letter-spacing: -0.04em;
`;

export const Subtitle = styled.p`
  margin: 0;
  color: #858087;
  font-size: 0.9rem;
  line-height: 1.6;
`;

export const PrimaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  padding: 0 18px;
  border: 0;
  border-radius: 12px;
  background: #e9a0ba;
  color: #29252a;
  font: inherit;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    background 160ms ease,
    transform 160ms ease;

  &:hover {
    background: #df8eac;
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: 3px solid #d9799a;
    outline-offset: 3px;
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
  min-height: 42px;
  padding: 0 15px;
  border: 1px solid #e9e5e8;
  border-radius: 11px;
  background: #fff;
  color: #514b53;
  font: inherit;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: #faf7f9;
  }

  &:focus-visible {
    outline: 3px solid #d9799a;
    outline-offset: 2px;
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
  align-items: flex-start;
  gap: 14px;
  min-width: 0;
  padding: 20px;
  border: 1px solid #eee8ec;
  border-radius: 18px;
  background: #fff;
`;

export const SummaryIcon = styled.div<{
  $variant: "income" | "expense" | "total";
}>`
  display: grid;
  flex: 0 0 44px;
  width: 44px;
  height: 44px;
  place-items: center;
  border-radius: 14px;

  ${({ $variant }) => {
    if ($variant === "income") {
      return css`
        background: #e6f7ed;
        color: #16834b;
      `;
    }

    if ($variant === "expense") {
      return css`
        background: #fdeaf0;
        color: #c34b70;
      `;
    }

    return css`
      background: #f9edf2;
      color: #bd6486;
    `;
  }}
`;

export const SummaryContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
`;

export const SummaryLabel = styled.span`
  color: #858087;
  font-size: 0.82rem;
  font-weight: 500;
`;

export const SummaryValue = styled.strong<{
  $variant?: "income" | "expense" | "total";
}>`
  overflow-wrap: anywhere;
  color: ${({ $variant }) =>
    $variant === "income"
      ? "#16834b"
      : $variant === "expense"
        ? "#c34b70"
        : "#29252a"};
  font-size: clamp(1.1rem, 2vw, 1.45rem);
  font-weight: 750;
  letter-spacing: -0.035em;
`;

export const Panel = styled.section`
  min-width: 0;
  padding: 24px;
  border: 1px solid #eee8ec;
  border-radius: 18px;
  background: #fff;

  @media (max-width: 600px) {
    padding: 17px;
    border-radius: 15px;
  }
`;

export const PanelHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 22px;
`;

export const PanelTitle = styled.h2`
  margin: 0;
  font-size: 1.05rem;
  font-weight: 750;
  letter-spacing: -0.02em;
`;

export const PanelDescription = styled.p`
  margin: 6px 0 0;
  color: #858087;
  font-size: 0.84rem;
  line-height: 1.5;
`;

export const TypeSwitch = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
  padding: 5px;
  border-radius: 13px;
  background: #f7f3f5;
`;

export const TypeOption = styled.button<{
  $active: boolean;
  $type: "income" | "expense";
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 45px;
  border: 1px solid transparent;
  border-radius: 10px;
  background: ${({ $active }) => ($active ? "#fff" : "transparent")};
  color: ${({ $active, $type }) =>
    $active ? ($type === "income" ? "#16834b" : "#c34b70") : "#777078"};
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  transition: background 150ms ease;

  ${({ $active }) =>
    $active &&
    css`
      box-shadow: 0 2px 8px rgb(41 37 42 / 6%);
    `}

  &:focus-visible {
    outline: 3px solid #d9799a;
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
  gap: 8px;
  min-width: 0;

  ${({ $fullWidth }) =>
    $fullWidth &&
    css`
      grid-column: 1 / -1;
    `}
`;

export const Label = styled.label`
  color: #49434b;
  font-size: 0.83rem;
  font-weight: 650;
`;

const controlStyles = css`
  width: 100%;
  min-width: 0;
  min-height: 46px;
  padding: 11px 13px;
  border: 1px solid #e9e3e7;
  border-radius: 11px;
  background: #fff;
  color: #29252a;
  font: inherit;
  font-size: 0.9rem;
  transition:
    border-color 150ms ease,
    box-shadow 150ms ease;

  &::placeholder {
    color: #aaa3ab;
  }

  &:hover {
    border-color: #d8cbd2;
  }

  &:focus {
    outline: none;
    border-color: #d9799a;
    box-shadow: 0 0 0 3px rgb(217 121 154 / 15%);
  }

  &:disabled {
    background: #f8f6f7;
    cursor: not-allowed;
  }
`;

export const Input = styled.input`
  ${controlStyles}
`;

export const Select = styled.select`
  ${controlStyles}
  cursor: pointer;
`;

export const Textarea = styled.textarea`
  ${controlStyles}
  min-height: 100px;
  resize: vertical;
  line-height: 1.6;
`;

export const AmountInputWrapper = styled.div`
  position: relative;

  &::before {
    position: absolute;
    top: 50%;
    left: 14px;
    color: #858087;
    font-size: 0.84rem;
    content: "R$";
    transform: translateY(-50%);
    pointer-events: none;
  }
`;

export const AmountInput = styled(Input)`
  padding-left: 43px;
  font-size: 1.1rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
`;

export const FormFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #f0ebee;
`;

export const UploadArea = styled.label<{ $hasFile: boolean }>`
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
  padding: 17px;
  border: 1px dashed ${({ $hasFile }) => ($hasFile ? "#d9799a" : "#dcd2d8")};
  border-radius: 13px;
  background: ${({ $hasFile }) => ($hasFile ? "#fdf5f8" : "#fcfafb")};
  cursor: pointer;
  transition:
    border-color 150ms ease,
    background 150ms ease;

  &:hover {
    border-color: #d9799a;
    background: #fdf5f8;
  }
`;

export const UploadIcon = styled.div`
  display: grid;
  flex: 0 0 42px;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: 12px;
  background: #f8e5ed;
  color: #bd6486;
`;

export const UploadText = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
`;

export const UploadTitle = styled.strong`
  overflow-wrap: anywhere;
  color: #49434b;
  font-size: 0.87rem;
`;

export const UploadHint = styled.span`
  color: #858087;
  font-size: 0.77rem;
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
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 10px;
`;

export const TextButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 0;
  border: 0;
  background: transparent;
  color: #bd6486;
  font: inherit;
  font-size: 0.8rem;
  font-weight: 650;
  cursor: pointer;

  &:hover {
    color: #a74f73;
    text-decoration: underline;
  }
`;

export const Filters = styled.div`
  display: grid;
  grid-template-columns: minmax(180px, 1.5fr) repeat(3, minmax(130px, 1fr));
  gap: 12px;
  margin-bottom: 20px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

export const SearchWrapper = styled.div`
  position: relative;
  min-width: 0;

  > svg {
    position: absolute;
    top: 50%;
    left: 13px;
    color: #99919a;
    transform: translateY(-50%);
    pointer-events: none;
  }

  input {
    padding-left: 40px;
  }
`;

export const ResultsCount = styled.p`
  margin: 0 0 14px;
  color: #858087;
  font-size: 0.8rem;
`;

export const TransactionList = styled.div`
  display: flex;
  flex-direction: column;
`;

export const TransactionRow = styled.article`
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 14px;
  padding: 17px 0;
  border-bottom: 1px solid #f0ebee;

  &:last-child {
    border-bottom: 0;
  }

  @media (max-width: 600px) {
    grid-template-columns: 40px minmax(0, 1fr) auto;
    gap: 10px;
  }
`;

export const TransactionIcon = styled.div<{
  $type: "income" | "expense" | "transfer";
}>`
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: 13px;
  background: ${({ $type }) =>
    $type === "income"
      ? "#e6f7ed"
      : $type === "expense"
        ? "#fdeaf0"
        : "#f0ebfa"};
  color: ${({ $type }) =>
    $type === "income"
      ? "#16834b"
      : $type === "expense"
        ? "#c34b70"
        : "#7958b5"};
`;

export const TransactionInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
`;

export const TransactionTitle = styled.strong`
  overflow: hidden;
  color: #29252a;
  font-size: 0.9rem;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const TransactionMeta = styled.span`
  overflow: hidden;
  color: #858087;
  font-size: 0.77rem;
  line-height: 1.5;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const TransactionAmount = styled.strong<{
  $type: "income" | "expense" | "transfer";
}>`
  color: ${({ $type }) =>
    $type === "income"
      ? "#16834b"
      : $type === "expense"
        ? "#c34b70"
        : "#7958b5"};
  font-size: 0.9rem;
  font-weight: 750;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
`;

export const RowActions = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;

  @media (max-width: 600px) {
    grid-column: 2 / -1;
    justify-content: flex-end;
  }
`;

export const IconButton = styled.button`
  display: inline-grid;
  width: 35px;
  height: 35px;
  place-items: center;
  border: 1px solid transparent;
  border-radius: 9px;
  background: transparent;
  color: #858087;
  cursor: pointer;

  &:hover {
    border-color: #eee8ec;
    background: #faf7f9;
    color: #bd6486;
  }

  &:focus-visible {
    outline: 3px solid #d9799a;
    outline-offset: 2px;
  }
`;

export const AttachmentBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  width: fit-content;
  color: #bd6486;
  font-size: 0.72rem;
  font-weight: 600;
`;

export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 48px 20px;
  text-align: center;
`;

export const EmptyIcon = styled.div`
  display: grid;
  width: 58px;
  height: 58px;
  place-items: center;
  border-radius: 18px;
  background: #f9edf2;
  color: #bd6486;
`;

export const EmptyTitle = styled.h3`
  margin: 0;
  color: #49434b;
  font-size: 1rem;
`;

export const EmptyDescription = styled.p`
  max-width: 340px;
  margin: 0;
  color: #858087;
  font-size: 0.85rem;
  line-height: 1.6;
`;

export const ErrorMessage = styled.p`
  margin: 0;
  color: #c24155;
  font-size: 0.8rem;
  line-height: 1.5;
`;

export const Notice = styled.div`
  padding: 12px 14px;
  border: 1px solid #f2d2de;
  border-radius: 11px;
  background: #fdf5f8;
  color: #8e4562;
  font-size: 0.85rem;
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
