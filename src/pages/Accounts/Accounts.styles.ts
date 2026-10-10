import styled from "styled-components";

export const AccountsContainer = styled.main`
  display: flex;
  flex-direction: column;
  gap: 28px;
  width: 100%;
  min-width: 0;
  color: #29252a;
`;

export const AccountHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;

  @media (max-width: 640px) {
    align-items: flex-start;
    flex-direction: column;
  }
`;

export const AccountName = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: -0.04em;
`;

export const FormSubtitle = styled.p`
  margin: 7px 0 0;
  color: #77717a;
  font-size: 0.875rem;
  line-height: 1.6;
`;

export const PrimaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  padding: 0 17px;
  border: 1px solid #d9799a;
  border-radius: 12px;
  background: #d9799a;
  color: #fff;
  font: inherit;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 160ms ease,
    border-color 160ms ease,
    transform 160ms ease;

  &:hover:not(:disabled) {
    background: #c76689;
    border-color: #c76689;
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:focus-visible {
    outline: 3px solid #f2bfd0;
    outline-offset: 3px;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.65;
  }
`;

export const SummaryGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

export const SummaryCard = styled.article`
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr);
  align-content: center;
  align-items: center;
  column-gap: 14px;
  row-gap: 5px;
  min-height: 116px;
  padding: 22px;
  border: 1px solid #eee9ed;
  border-radius: 16px;
  background: #fff;
`;

export const AccountIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  grid-row: span 2;
  width: 44px;
  height: 44px;
  border-radius: 13px;
  background: #fff0f5;
  color: #c76689;
`;

export const SummaryLabel = styled.p`
  margin: 0;
  color: #77717a;
  font-size: 0.8125rem;
`;

export const SummaryValue = styled.p`
  margin: 0;
  overflow-wrap: anywhere;
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: -0.035em;
`;

export const AccountsToolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  @media (max-width: 560px) {
    align-items: stretch;
    flex-direction: column;
  }
`;

export const SearchBox = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  width: min(100%, 460px);
  min-height: 46px;
  padding: 0 13px;
  border: 1px solid #e9e3e8;
  border-radius: 12px;
  background: #fff;
  color: #89818b;

  &:focus-within {
    border-color: #d9799a;
    box-shadow: 0 0 0 3px rgb(217 121 154 / 12%);
  }

  @media (max-width: 560px) {
    width: 100%;
  }
`;

export const Input = styled.input`
  width: 100%;
  min-width: 0;
  min-height: 42px;
  padding: 0;
  border: 0;
  outline: none;
  background: transparent;
  color: #29252a;
  font: inherit;
  font-size: 0.875rem;

  &::placeholder {
    color: #a49ca5;
  }

  &:focus-visible {
    outline: none;
  }
`;

export const ToolbarCount = styled.span`
  color: #77717a;
  font-size: 0.8125rem;
  white-space: nowrap;
`;

export const AccountGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;

  @media (min-width: 1450px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

export const AccountCard = styled.article`
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
  padding: 21px;
  border: 1px solid #eee9ed;
  border-radius: 16px;
  background: #fff;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease;

  &:hover {
    border-color: #e6c5d2;
    box-shadow: 0 8px 24px rgb(41 37 42 / 4%);
  }
`;

export const AccountDetails = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`;

export const AccountIdentity = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
`;

export const InstitutionLogo = styled.div`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  overflow: hidden;
  border: 1px solid #f0ebef;
  border-radius: 12px;
  background: #fff;

  svg {
    display: block;
    width: 32px;
    height: 32px;
    max-width: 100%;
    max-height: 100%;
  }
`;

export const AccountInstitution = styled.p`
  margin: 0 0 4px;
  color: #77717a;
  font-size: 0.75rem;
`;

export const AccountTypeBadge = styled.span`
  display: inline-flex;
  align-self: flex-start;
  align-items: center;
  width: fit-content;
  padding: 6px 10px;
  border: 1px solid #f0e5eb;
  border-radius: 999px;
  background: #fff7fa;
  color: #a44f70;
  font-size: 0.75rem;
  font-weight: 600;
`;

export const AccountActions = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

export const ActionButton = styled.button`
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 10px;
  background: transparent;
  color: #77717a;
  cursor: pointer;
  transition:
    color 150ms ease,
    background 150ms ease,
    border-color 150ms ease;

  &:hover:not(:disabled) {
    border-color: #f0e5eb;
    background: #fff3f7;
    color: #bd5e82;
  }

  &:focus-visible {
    outline: 2px solid #d9799a;
    outline-offset: 2px;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

export const AccountBalance = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-top: 17px;
  border-top: 1px solid #f0ebef;
`;

export const BalanceLabel = styled.span`
  color: #77717a;
  font-size: 0.8125rem;
`;

export const BalanceValue = styled.p`
  margin: 0;
  overflow-wrap: anywhere;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.04em;
  font-variant-numeric: tabular-nums;
`;

export const AccountsEmpty = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 290px;
  padding: 32px 20px;
  border: 1px dashed #e7dce4;
  border-radius: 16px;
  background: #fff;

  ${AccountIcon} {
    margin-bottom: 4px;
  }

  ${FormSubtitle} {
    max-width: 380px;
    margin-top: 0;
    text-align: center;
  }

  ${PrimaryButton} {
    margin-top: 8px;
  }
`;

export const FormOverlay = styled.div`
  position: fixed;
  z-index: 1000;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  padding: 24px;
  background: rgb(25 20 25 / 48%);
  backdrop-filter: blur(4px);

  @media (max-width: 560px) {
    align-items: flex-end;
    padding: 0;
  }
`;

export const FormPanel = styled.div`
  width: min(100%, 650px);
  max-height: min(90dvh, 850px);
  overflow-y: auto;
  padding: 26px;
  border: 1px solid #f0e9ee;
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 24px 80px rgb(25 20 25 / 18%);

  @media (max-width: 560px) {
    width: 100%;
    max-height: 92dvh;
    padding: 22px 18px;
    border-radius: 20px 20px 0 0;
  }
`;

export const FormHeading = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
`;

export const FormTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.035em;
`;

export const AccountForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 22px;
`;

export const Field = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 9px;
  min-width: 0;
`;

export const Label = styled.label`
  color: #39333b;
  font-size: 0.8125rem;
  font-weight: 600;

  span {
    color: #8d848e;
    font-weight: 400;
  }
`;

export const InstitutionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 9px;

  @media (max-width: 560px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 360px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

export const InstitutionButton = styled.button<{
  $selected: boolean;
}>`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 0;
  min-height: 94px;
  padding: 10px 6px;
  border: 1px solid ${({ $selected }) => ($selected ? "#d9799a" : "#eee7ed")};
  border-radius: 12px;
  background: ${({ $selected }) => ($selected ? "#fff5f8" : "#fff")};
  color: #39333b;
  font: inherit;
  cursor: pointer;
  transition:
    border-color 150ms ease,
    background 150ms ease;

  &:hover {
    border-color: #d9799a;
  }

  &:focus-visible {
    outline: 2px solid #d9799a;
    outline-offset: 2px;
  }

  > svg:last-child {
    position: absolute;
    top: 6px;
    right: 6px;
    color: #c76689;
  }
`;

export const InstitutionName = styled.span`
  width: 100%;
  overflow-wrap: anywhere;
  color: #4d454e;
  font-size: 0.6875rem;
  font-weight: 600;
  line-height: 1.35;
  text-align: center;
`;

export const Select = styled.select`
  width: 100%;
  min-height: 46px;
  appearance: none;
  padding: 0 38px 0 12px;
  border: 1px solid #e9e3e8;
  border-radius: 10px;
  outline: none;
  background: #fff;
  color: #29252a;
  font: inherit;
  font-size: 0.875rem;

  &:focus {
    border-color: #d9799a;
    box-shadow: 0 0 0 3px rgb(217 121 154 / 12%);
  }
`;

export const InputAdornment = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 46px;
  padding: 0 12px;
  border: 1px solid #e9e3e8;
  border-radius: 10px;
  background: #fff;
  color: #77717a;

  &:focus-within {
    border-color: #d9799a;
    box-shadow: 0 0 0 3px rgb(217 121 154 / 12%);
  }

  > span {
    font-size: 0.875rem;
  }

  ${Input} {
    min-height: 42px;
    color: #29252a;
    text-align: right;
    font-variant-numeric: tabular-nums;
  }
`;

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }

  ${Field} > svg {
    position: absolute;
    right: 12px;
    bottom: 15px;
    pointer-events: none;
    color: #77717a;
  }
`;

export const FieldError = styled.p`
  margin: 0;
  padding: 11px 12px;
  border: 1px solid #f2c8cf;
  border-radius: 10px;
  background: #fff5f5;
  color: #a72c42;
  font-size: 0.8125rem;
  line-height: 1.5;
`;

export const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 6px;

  @media (max-width: 400px) {
    flex-direction: column-reverse;

    button {
      width: 100%;
    }
  }
`;

export const CancelButton = styled.button`
  min-height: 44px;
  padding: 0 16px;
  border: 1px solid #e9e3e8;
  border-radius: 12px;
  background: #fff;
  color: #4d454e;
  font: inherit;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: #faf7f9;
  }

  &:focus-visible {
    outline: 2px solid #d9799a;
    outline-offset: 2px;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;
