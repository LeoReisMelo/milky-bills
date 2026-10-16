import styled from "styled-components";

export const Page = styled.main`
  display: flex;
  flex-direction: column;
  gap: 28px;
  min-width: 0;
  color: var(--color-text);
`;

export const PageHeader = styled.header`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;

  @media (max-width: 640px) {
    align-items: stretch;
    flex-direction: column;
  }
`;

export const Eyebrow = styled.p`
  margin: 0 0 8px;
  color: var(--color-primary);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
`;

export const Title = styled.h1`
  margin: 0;
  font-size: clamp(26px, 3vw, 32px);
  font-weight: 750;
  letter-spacing: -0.04em;
`;

export const Subtitle = styled.p`
  margin: 8px 0 0;
  color: var(--color-text-secondary);
  font-size: 14px;
  line-height: 1.6;
`;

export const PrimaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  min-height: 42px;
  padding: 0 16px;
  border: 1px solid var(--color-primary);
  border-radius: 10px;
  background: var(--color-primary);
  color: #fff;
  font: inherit;
  font-size: 13px;
  font-weight: 650;
  white-space: nowrap;
  cursor: pointer;
  transition:
    background 160ms ease,
    border-color 160ms ease,
    transform 160ms ease;

  &:hover:not(:disabled) {
    background: var(--color-primary-hover);
    border-color: var(--color-primary-hover);
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.65;
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 3px;
  }

  @media (max-width: 640px) {
    width: 100%;
  }
`;

export const SecondaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  padding: 0 16px;
  border: 1px solid var(--color-border-strong);
  border-radius: 10px;
  background: var(--color-surface);
  color: var(--color-text);
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: var(--color-background);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.65;
  }
`;

export const SummaryGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 820px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 520px) {
    grid-template-columns: minmax(0, 1fr);
    gap: 12px;
  }
`;

export const SummaryCard = styled.article`
  min-width: 0;
  padding: 20px;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background: var(--color-surface);
`;

export const SummaryLabel = styled.p`
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 12px;
  font-weight: 550;
`;

export const SummaryValue = styled.p`
  overflow-wrap: anywhere;
  margin: 12px 0 6px;
  font-size: clamp(21px, 2.2vw, 27px);
  font-weight: 750;
  letter-spacing: -0.04em;
  font-variant-numeric: tabular-nums;
`;

export const SummaryHint = styled.p`
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 11px;
  line-height: 1.5;
`;

export const SectionHeader = styled.header`
  margin-bottom: -10px;
`;

export const SectionTitle = styled.h2`
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.02em;
`;

export const SectionDescription = styled.p`
  margin: 6px 0 0;
  color: var(--color-text-secondary);
  font-size: 12px;
  line-height: 1.5;
`;

export const EmptyState = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  padding: 32px 20px;
  border: 1px dashed var(--color-border-strong);
  border-radius: 16px;
  background: var(--color-surface);
  text-align: center;

  > button {
    margin-top: 20px;
  }
`;

export const EmptyIcon = styled.div`
  display: grid;
  place-items: center;
  width: 58px;
  height: 58px;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  background: var(--color-background);
  color: var(--color-primary);
`;

export const EmptyTitle = styled.h2`
  margin: 18px 0 0;
  font-size: 17px;
  font-weight: 700;
`;

export const EmptyDescription = styled.p`
  max-width: 410px;
  margin: 8px 0 0;
  color: var(--color-text-secondary);
  font-size: 13px;
  line-height: 1.7;
`;

export const CardGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;

  @media (max-width: 700px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const CreditCard = styled.article<{ $color: string }>`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  min-width: 0;
  min-height: 210px;
  padding: 22px;
  border: 1px solid rgb(255 255 255 / 14%);
  border-radius: 17px;
  background:
    radial-gradient(circle at 100% 0%, rgb(255 255 255 / 18%), transparent 43%),
    linear-gradient(135deg, ${({ $color }) => $color}, #19191f);
  color: #fff;
  box-shadow: 0 12px 30px rgb(0 0 0 / 12%);

  &::after {
    position: absolute;
    right: -42px;
    bottom: -82px;
    width: 190px;
    height: 190px;
    border: 1px solid rgb(255 255 255 / 13%);
    border-radius: 50%;
    content: "";
    pointer-events: none;
  }
`;

export const CardTop = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

export const CardBank = styled.span`
  overflow: hidden;
  font-size: 12px;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const CardName = styled.p`
  position: relative;
  z-index: 1;
  overflow: hidden;
  margin: 22px 0 5px;
  font-size: 19px;
  font-weight: 750;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const CardNumber = styled.p`
  position: relative;
  z-index: 1;
  margin: 0;
  color: rgb(255 255 255 / 82%);
  font-size: 14px;
  letter-spacing: 0.08em;
  font-variant-numeric: tabular-nums;
`;

export const CardBottom = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  margin-top: 25px;
`;

export const CardMetaLabel = styled.span`
  display: block;
  margin-bottom: 5px;
  color: rgb(255 255 255 / 65%);
  font-size: 9px;
  font-weight: 650;
  letter-spacing: 0.1em;
`;

export const CardMetaValue = styled.span`
  display: block;
  overflow: hidden;
  max-width: 220px;
  font-size: 11px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const Brand = styled.span`
  font-size: 13px;
  font-weight: 750;
  font-style: italic;
`;

export const ListHeader = styled.header`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: -12px;
`;

export const CardCount = styled.span`
  display: grid;
  place-items: center;
  min-width: 24px;
  height: 24px;
  padding: 0 7px;
  border-radius: 8px;
  background: var(--color-primary-soft);
  color: var(--color-primary);
  font-size: 11px;
  font-weight: 700;
`;

export const CardList = styled.section`
  display: flex;
  flex-direction: column;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background: var(--color-surface);
`;

export const CardRow = styled.article`
  position: relative;
  display: grid;
  grid-template-columns: 44px minmax(130px, 1fr) minmax(180px, 0.9fr) 36px;
  align-items: center;
  gap: 16px;
  min-width: 0;
  padding: 18px;

  & + & {
    border-top: 1px solid var(--color-border);
  }

  @media (max-width: 760px) {
    grid-template-columns: 40px minmax(0, 1fr) 36px;
    gap: 12px;
  }

  @media (max-width: 420px) {
    padding: 14px 12px;
    gap: 10px;
  }
`;

export const CardRowIcon = styled.div<{ $color: string }>`
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border: 1px solid ${({ $color }) => `${$color}35`};
  border-radius: 12px;
  background: ${({ $color }) => `${$color}18`};
  color: ${({ $color }) => $color};
`;

export const CardInfo = styled.div`
  min-width: 0;
`;

export const CardRowTitle = styled.p`
  overflow: hidden;
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const CardRowSubtitle = styled.p`
  overflow: hidden;
  margin: 5px 0 0;
  color: var(--color-text-secondary);
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const MobileLimit = styled.p`
  display: none;
  margin: 8px 0 0;
  font-size: 11px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;

  @media (max-width: 760px) {
    display: block;
  }
`;

export const LimitInfo = styled.div`
  min-width: 0;

  @media (max-width: 760px) {
    display: none;
  }
`;

export const LimitValues = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 9px;
  font-size: 11px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;

  > span {
    min-width: 0;
  }
`;

export const MutedText = styled.span`
  color: var(--color-text-secondary);
  font-size: 10px;
  font-weight: 450;
`;

export const ProgressTrack = styled.div`
  overflow: hidden;
  width: 100%;
  height: 5px;
  border-radius: 999px;
  background: var(--color-background);
`;

export const ProgressBar = styled.div<{
  $usage: number;
  $color: string;
}>`
  width: ${({ $usage }) => `${$usage}%`};
  height: 100%;
  border-radius: inherit;
  background: ${({ $color }) => $color};
  transition: width 180ms ease;
`;

export const CardSchedule = styled.p`
  margin: 8px 0 0;
  color: var(--color-text-secondary);
  font-size: 10px;
`;

export const MenuWrapper = styled.div`
  position: relative;
  justify-self: end;
`;

export const MenuButton = styled.button`
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border: 1px solid transparent;
  border-radius: 9px;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;

  &:hover {
    border-color: var(--color-border);
    background: var(--color-background);
    color: var(--color-text);
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
`;

export const MenuPopover = styled.div`
  position: absolute;
  z-index: 5;
  top: calc(100% + 5px);
  right: 0;
  display: flex;
  flex-direction: column;
  width: 145px;
  padding: 5px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-surface);
  box-shadow: 0 10px 28px rgb(0 0 0 / 14%);
`;

export const MenuItem = styled.button<{ $danger?: boolean }>`
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  padding: 10px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: ${({ $danger }) => ($danger ? "#e05252" : "var(--color-text)")};
  font: inherit;
  font-size: 12px;
  text-align: left;
  cursor: pointer;

  &:hover {
    background: var(--color-background);
  }
`;

export const ModalOverlay = styled.div`
  position: fixed;
  z-index: 1000;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  padding: 24px;
  background: rgb(0 0 0 / 58%);
  backdrop-filter: blur(4px);

  @media (max-width: 540px) {
    align-items: flex-end;
    padding: 0;
  }
`;

export const Modal = styled.div`
  width: min(100%, 620px);
  max-height: min(90vh, 850px);
  overflow-y: auto;
  border: 1px solid var(--color-border);
  border-radius: 18px;
  background: var(--color-surface);
  box-shadow: 0 24px 80px rgb(0 0 0 / 25%);

  @media (max-width: 540px) {
    width: 100%;
    max-height: 94vh;
    border-radius: 18px 18px 0 0;
  }
`;

export const ModalHeader = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 24px 24px 20px;
  border-bottom: 1px solid var(--color-border);

  @media (max-width: 540px) {
    padding: 20px 18px 16px;
  }
`;

export const ModalTitle = styled.h2`
  margin: 0;
  font-size: 19px;
  font-weight: 750;
  letter-spacing: -0.03em;
`;

export const ModalDescription = styled.p`
  margin: 7px 0 0;
  color: var(--color-text-secondary);
  font-size: 12px;
  line-height: 1.6;
`;

export const IconButton = styled.button`
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  width: 34px;
  height: 34px;
  border: 1px solid var(--color-border);
  border-radius: 9px;
  background: var(--color-background);
  color: var(--color-text-secondary);
  cursor: pointer;

  &:hover {
    color: var(--color-text);
  }
`;

export const Form = styled.form`
  padding: 22px 24px 24px;

  @media (max-width: 540px) {
    padding: 18px;
  }
`;

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 17px 14px;

  @media (max-width: 480px) {
    grid-template-columns: minmax(0, 1fr);
    gap: 14px;
  }
`;

export const Field = styled.div<{ $fullWidth?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 7px;
  min-width: 0;

  ${({ $fullWidth }) =>
    $fullWidth &&
    `
      grid-column: 1 / -1;
    `}
`;

export const Label = styled.label`
  color: var(--color-text);
  font-size: 12px;
  font-weight: 650;
`;

const controlStyles = `
  width: 100%;
  min-width: 0;
  min-height: 42px;
  padding: 10px 12px;
  border: 1px solid var(--color-border-strong);
  border-radius: 9px;
  outline: none;
  background: var(--color-background);
  color: var(--color-text);
  font: inherit;
  font-size: 12px;
  transition: border-color 140ms ease, box-shadow 140ms ease;

  &:focus {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px var(--color-primary-soft);
  }

  &::placeholder {
    color: var(--color-text-secondary);
    opacity: 0.8;
  }
`;

export const Input = styled.input`
  ${controlStyles}
`;

export const Select = styled.select`
  ${controlStyles}
  cursor: pointer;
`;

export const ReadOnlyValue = styled.div`
  display: flex;
  align-items: center;
  min-height: 42px;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: 9px;
  background: var(--color-background);
  color: var(--color-text-secondary);
  font-size: 12px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
`;

export const ColorOptions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 11px;
  padding: 4px 0;
`;

export const ColorOption = styled.button<{
  $color: string;
  $selected: boolean;
}>`
  width: 30px;
  height: 30px;
  padding: 0;
  border: 3px solid var(--color-surface);
  border-radius: 50%;
  outline: 1px solid
    ${({ $selected }) =>
      $selected ? "var(--color-primary)" : "var(--color-border)"};
  background: ${({ $color }) => $color};
  cursor: pointer;
  transform: ${({ $selected }) => ($selected ? "scale(1.08)" : "scale(1)")};
  transition:
    transform 140ms ease,
    outline-color 140ms ease;

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 3px;
  }
`;

export const ErrorMessage = styled.p`
  margin: 16px 0 0;
  color: #e05252;
  font-size: 12px;
  line-height: 1.5;
`;

export const ModalFooter = styled.footer`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 24px;
  padding-top: 18px;
  border-top: 1px solid var(--color-border);

  @media (max-width: 420px) {
    flex-direction: column-reverse;

    button {
      width: 100%;
    }
  }
`;
