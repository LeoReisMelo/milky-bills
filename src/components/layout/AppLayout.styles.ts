import styled from "styled-components";

export const AppShell = styled.div`
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  width: 100%;
  min-height: 100dvh;
  background: var(--color-background);
  color: var(--color-text);

  @media (max-width: 768px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const MainContent = styled.main`
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 100dvh;
`;

export const PageContent = styled.div`
  flex: 1;
  width: 100%;
  min-width: 0;
  padding: 28px 32px;

  @media (max-width: 1024px) {
    padding: 24px;
  }

  @media (max-width: 640px) {
    padding: 20px 16px;
  }
`;

export const MobileOverlay = styled.button<{ $visible: boolean }>`
  display: none;

  @media (max-width: 768px) {
    display: ${({ $visible }) => ($visible ? "block" : "none")};
    position: fixed;
    inset: 0;
    z-index: 99;
    width: 100%;
    height: 100%;
    border: 0;
    background: var(--color-overlay);
  }
`;
