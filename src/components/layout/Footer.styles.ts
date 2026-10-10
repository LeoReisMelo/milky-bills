import styled from "styled-components";

export const FooterContainer = styled.footer`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 36px;
  border-top: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  font-size: 11px;

  strong {
    color: var(--color-text);
    font-weight: 600;
  }

  @media (max-width: 640px) {
    align-items: flex-start;
    flex-direction: column;
    padding: 18px 16px;
  }
`;