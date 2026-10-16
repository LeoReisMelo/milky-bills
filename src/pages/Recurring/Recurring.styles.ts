import styled, { css } from "styled-components";
import type { RecurrenceStatus } from "../../db/database";

const surface = "var(--color-surface, #111113)";
const background = "var(--color-background, #09090b)";
const surfaceSoft = "var(--color-primary-soft, #18181b)";
const borderColor = "var(--color-border, #27272a)";
const borderStrong = "var(--color-border-strong, #3f3f46)";
const textColor = "var(--color-text, #fafafa)";
const mutedColor = "var(--color-text-secondary, #a1a1aa)";
const accentColor = "var(--color-primary, #efa7be)";
const accentHover = "var(--color-primary-hover, #d9799a)";
const dangerColor = "var(--color-danger, #ef4444)";
const successColor = "var(--color-income, #22c55e)";

const interactiveTransition = css`
  transition:
    background 150ms ease,
    color 150ms ease,
    border-color 150ms ease,
    box-shadow 150ms ease,
    transform 150ms ease;
`;

const focusStyles = css`
  &:focus-visible {
    outline: 3px solid rgb(50 104 233 / 25%);
    outline-offset: 2px;
  }
`;

export const Page = styled.main`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  min-width: 0;
  color: ${textColor};

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
`;

export const Header = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  min-width: 0;
  flex-wrap: wrap;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const Eyebrow = styled.p`
  display: none;
`;

export const Title = styled.h1<{ $small?: boolean }>`
  margin: 0;
  color: ${textColor};
  font-size: ${({ $small }) =>
    $small ? "1rem" : "clamp(1.55rem, 2.4vw, 1.9rem)"};
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: -0.035em;
`;

export const Subtitle = styled.p`
  margin: 5px 0 0;
  color: ${mutedColor};
  font-size: 0.875rem;
  line-height: 1.5;
`;

const buttonBase = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 40px;
  padding: 0 14px;
  border-radius: 8px;
  font: inherit;
  font-size: 0.84rem;
  font-weight: 600;
  line-height: 1.2;
  text-align: center;
  white-space: nowrap;
  cursor: pointer;
  ${interactiveTransition};
  ${focusStyles};

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    transform: none;
  }
`;

export const PrimaryButton = styled.button`
  ${buttonBase};
  flex-shrink: 0;
  min-height: 38px;
  padding: 0 16px;
  border: 1px solid ${accentColor};
  border-radius: 7px;
  background: ${accentColor};
  color: #fff;
  box-shadow: 0 2px 4px rgb(0 0 0 / 14%);

  &:not(:disabled):hover {
    background: ${accentHover};
    border-color: ${accentHover};
    transform: translateY(-1px);
  }

  @media (max-width: 640px) {
    width: 100%;
  }
`;

export const SecondaryButton = styled.button`
  ${buttonBase};
  border: 1px solid ${borderColor};
  border-radius: 8px;
  background: ${surface};
  color: ${textColor};

  &:not(:disabled):hover {
    background: ${background};
  }
`;

export const SummaryGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  min-width: 0;

  @media (max-width: 760px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 480px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const SummaryCard = styled.article`
  min-width: 0;
  padding: 16px;
  border: 1px solid ${borderColor};
  border-radius: 9px;
  background: ${surface};
  color: ${textColor};
  ${interactiveTransition};

  &:hover {
    border-color: ${borderStrong};
  }

  @media (max-width: 480px) {
    padding: 14px;
  }
`;

export const SummaryLabel = styled.p`
  margin: 0;
  color: ${mutedColor};
  font-size: 0.8rem;
  line-height: 1.5;
`;

export const SummaryValue = styled.p`
  margin: 10px 0 5px;
  color: ${textColor};
  font-size: clamp(1.3rem, 2.5vw, 1.7rem);
  font-weight: 700;
  line-height: 1.25;
  overflow-wrap: anywhere;
  font-variant-numeric: tabular-nums;
`;

export const SummaryHint = styled.p`
  margin: 0;
  color: ${mutedColor};
  font-size: 0.75rem;
  line-height: 1.5;
`;

export const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const controlBase = css`
  display: block;
  width: 100%;
  min-width: 0;
  min-height: 40px;
  padding: 9px 11px;
  border: 1px solid ${borderStrong};
  border-radius: 7px;
  background: ${surface};
  color: ${textColor};
  font: inherit;
  font-size: 0.84rem;
  line-height: 1.4;
  ${interactiveTransition};

  &::placeholder {
    color: ${mutedColor};
    opacity: 1;
  }

  &:hover:not(:disabled) {
    border-color: ${borderStrong};
  }

  &:focus {
    outline: none;
    border-color: ${accentColor};
    box-shadow: 0 0 0 3px rgb(50 104 233 / 12%);
  }

  &:disabled {
    background: ${background};
    cursor: not-allowed;
    opacity: 0.6;
  }

  option,
  optgroup {
    background: ${surface};
    color: ${textColor};
  }
`;

export const SearchInput = styled.input`
  ${controlBase};
  flex: 1;
`;

export const FilterSelect = styled.select`
  ${controlBase};
  width: auto;
  min-width: 160px;
  cursor: pointer;

  @media (max-width: 640px) {
    width: 100%;
  }
`;

export const List = styled.section`
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
`;

export const RecurrenceCard = styled.article`
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(150px, 0.8fr) auto;
  align-items: center;
  gap: 18px;
  min-width: 0;
  padding: 16px;
  border: 1px solid ${borderColor};
  border-radius: 9px;
  background: ${surface};
  color: ${textColor};
  ${interactiveTransition};

  &:hover {
    border-color: ${borderStrong};
  }

  @media (max-width: 860px) {
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 14px;
  }

  @media (max-width: 560px) {
    grid-template-columns: minmax(0, 1fr);
    gap: 14px;
    padding: 14px;
  }
`;

export const RecurrenceMain = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
`;

export const RecurrenceIcon = styled.div<{
  $type: "income" | "expense";
}>`
  display: grid;
  flex: 0 0 40px;
  width: 40px;
  height: 40px;
  place-items: center;
  border-radius: 9px;
  background: ${surfaceSoft};
  color: ${({ $type }) =>
    $type === "income"
      ? "var(--color-income, #22c55e)"
      : "var(--color-expense, #c34b70)"};
  font-size: 1.2rem;
  font-weight: 700;
`;

export const RecurrenceInfo = styled.div`
  min-width: 0;
`;

export const RecurrenceTitle = styled.h2`
  margin: 0;
  color: ${textColor};
  font-size: 0.875rem;
  font-weight: 700;
  line-height: 1.45;
  overflow-wrap: anywhere;
`;

export const RecurrenceMeta = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 5px;
  color: ${mutedColor};
  font-size: 0.75rem;
  line-height: 1.5;
  overflow-wrap: anywhere;
`;

export const Dot = styled.span`
  flex: 0 0 3px;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: ${mutedColor};
`;

export const RecurrenceDetails = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  min-width: 0;

  @media (max-width: 860px) {
    grid-column: 1;
    padding-left: 52px;
  }

  @media (max-width: 560px) {
    padding-left: 0;
  }
`;

export const Amount = styled.p<{ $type: "income" | "expense" }>`
  margin: 0;
  color: ${({ $type }) =>
    $type === "income"
      ? "var(--color-income, #22c55e)"
      : "var(--color-expense, var(--color-text, #fafafa))"};
  font-size: 0.95rem;
  font-weight: 750;
  line-height: 1.4;
  overflow-wrap: anywhere;
  font-variant-numeric: tabular-nums;
`;

export const StatusPill = styled.span<{ $status: RecurrenceStatus }>`
  display: inline-flex;
  align-items: center;
  width: fit-content;
  max-width: 100%;
  padding: 4px 8px;
  border: 1px solid
    ${({ $status }) =>
      $status === "active"
        ? "var(--color-primary-border, #3f3f46)"
        : borderColor};
  border-radius: 999px;
  background: ${({ $status }) =>
    $status === "active" ? surfaceSoft : background};
  color: ${({ $status }) =>
    $status === "active"
      ? accentColor
      : $status === "paused"
        ? textColor
        : mutedColor};
  font-size: 0.7rem;
  font-weight: 600;
  line-height: 1.4;
`;

export const NextDate = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin-top: 2px;

  span {
    color: ${mutedColor};
    font-size: 0.72rem;
    line-height: 1.4;
  }

  strong {
    color: ${textColor};
    font-size: 0.8rem;
    font-weight: 600;
    line-height: 1.4;
  }
`;

export const Remaining = styled.span`
  color: ${mutedColor};
  font-size: 0.72rem;
  line-height: 1.5;
`;

export const Actions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  min-width: 0;

  @media (max-width: 860px) {
    grid-column: 2;
    grid-row: 1 / span 2;
    align-self: center;
  }

  @media (max-width: 560px) {
    grid-column: auto;
    grid-row: auto;
    justify-content: flex-start;
    padding-top: 12px;
    border-top: 1px solid ${borderColor};
  }
`;

export const ActionButton = styled.button<{ $danger?: boolean }>`
  display: inline-grid;
  flex: 0 0 30px;
  width: 30px;
  height: 30px;
  place-items: center;
  border: 1px solid transparent;
  border-radius: 7px;
  background: transparent;
  color: ${({ $danger }) => ($danger ? dangerColor : mutedColor)};
  font: inherit;
  font-size: 1rem;
  cursor: pointer;
  ${interactiveTransition};
  ${focusStyles};

  &:hover:not(:disabled) {
    border-color: ${borderColor};
    background: ${background};
    color: ${({ $danger }) => ($danger ? dangerColor : textColor)};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 0;
  min-height: 240px;
  padding: 28px 20px;
  border: 1px dashed ${borderStrong};
  border-radius: 9px;
  background: ${surface};
  color: ${textColor};
  text-align: center;
`;

export const EmptyIcon = styled.div`
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  margin-bottom: 14px;
  border-radius: 10px;
  background: ${surfaceSoft};
  color: ${mutedColor};
  font-size: 1.5rem;
`;

export const EmptyTitle = styled.h2`
  margin: 0;
  color: ${textColor};
  font-size: 0.95rem;
  font-weight: 700;
`;

export const EmptyDescription = styled.p`
  max-width: 410px;
  margin: 8px 0 16px;
  color: ${mutedColor};
  font-size: 0.83rem;
  line-height: 1.6;
`;

export const ErrorBanner = styled.div`
  padding: 11px 13px;
  border: 1px solid var(--color-danger-border, rgb(239 68 68 / 25%));
  border-radius: 8px;
  background: var(--color-danger-soft, rgb(239 68 68 / 8%));
  color: var(--color-danger-text, #fca5a5);
  font-size: 0.84rem;
  line-height: 1.5;
`;

export const ModalBackdrop = styled.div`
  position: fixed;
  z-index: 1000;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow-x: hidden;
  overflow-y: auto;
  background: rgb(0 0 0 / 68%);

  @media (max-width: 560px) {
    align-items: flex-end;
    padding: 0;
  }
`;

export const Modal = styled.div`
  width: min(100%, 620px);
  max-height: min(90dvh, 850px);
  overflow-x: hidden;
  overflow-y: auto;
  border: 1px solid ${borderColor};
  border-radius: 12px;
  background: ${surface};
  color: ${textColor};
  box-shadow: 0 24px 80px rgb(0 0 0 / 35%);

  @media (max-width: 560px) {
    width: 100%;
    max-height: 94dvh;
    border-radius: 14px 14px 0 0;
  }
`;

export const ModalHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 18px;
  border-bottom: 1px solid ${borderColor};
  background: ${surface};

  @media (max-width: 560px) {
    padding: 17px 18px;
  }
`;

export const CloseButton = styled.button`
  display: grid;
  flex: 0 0 34px;
  width: 34px;
  height: 34px;
  place-items: center;
  border: 1px solid ${borderColor};
  border-radius: 7px;
  background: ${surface};
  color: ${mutedColor};
  font: inherit;
  font-size: 1.2rem;
  cursor: pointer;
  ${interactiveTransition};
  ${focusStyles};

  &:hover:not(:disabled) {
    background: ${background};
    color: ${textColor};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px 22px 22px;
  background: ${surface};
  color: ${textColor};

  @media (max-width: 560px) {
    padding: 17px 18px 20px;
  }
`;

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  min-width: 0;

  @media (max-width: 480px) {
    grid-template-columns: minmax(0, 1fr);
    gap: 13px;
  }
`;

export const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 7px;
  min-width: 0;
`;

export const FieldLabel = styled.label`
  color: ${textColor};
  font-size: 0.82rem;
  font-weight: 650;
  line-height: 1.4;
`;

export const TextInput = styled.input`
  ${controlBase};
`;

export const SelectInput = styled.select`
  ${controlBase};
  cursor: pointer;
`;

export const FieldHint = styled.p`
  margin: 0;
  color: ${mutedColor};
  font-size: 0.74rem;
  line-height: 1.5;
`;

export const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 2px;
  padding-top: 18px;
  border-top: 1px solid ${borderColor};

  @media (max-width: 400px) {
    > button {
      flex: 1 1 auto;
    }
  }
`;
