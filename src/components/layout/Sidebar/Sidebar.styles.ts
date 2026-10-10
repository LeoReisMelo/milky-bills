import styled from "styled-components";

export const SidebarContainer = styled.aside`
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  width: 240px;
  min-width: 0;
  height: 100dvh;
  padding: 24px 14px 16px;
  overflow-x: hidden;
  overflow-y: auto;

  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  color: var(--color-text);
  z-index: 20;

  @media (max-width: 768px) {
    position: fixed;
    inset: 0 auto 0 0;
    width: min(270px, 85vw);
    height: 100dvh;
    transform: translateX(-100%);
    transition: transform 200ms ease;
    box-shadow: none;

    &[data-open="true"] {
      transform: translateX(0);
      box-shadow: 12px 0 32px rgb(0 0 0 / 12%);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

export const SidebarBrand = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 44px;
  margin-bottom: 36px;
  padding: 0 8px;

  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--color-text);
  text-align: left;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 3px;
  }
`;

export const BrandLogo = styled.img`
  display: block;
  flex: 0 0 34px;
  width: 90px;
  height: 90px;
  object-fit: contain;
`;

export const BrandName = styled.span`
  font-family: "Plus Jakarta Sans", sans-serif;
  font-size: 21px;
  font-weight: 500;
  letter-spacing: -0.6px;
  white-space: nowrap;

  strong {
    color: var(--color-primary);
    font-weight: 600;
  }
`;

export const SidebarSectionLabel = styled.p`
  margin: 0 0 12px;
  padding: 0 10px;

  color: var(--color-text-secondary);
  font-family: "Plus Jakarta Sans", sans-serif;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 1.1px;
  line-height: 1.5;
`;

export const SidebarNavigation = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

export const NavigationItem = styled.button<{ $active: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 42px;
  padding: 0 12px;

  border: 1px solid
    ${({ $active }) =>
      $active ? "var(--color-primary-border, transparent)" : "transparent"};

  border-radius: 8px;

  background: ${({ $active }) =>
    $active
      ? "var(--color-primary-soft, rgb(31 70 120 / 10%))"
      : "transparent"};

  color: ${({ $active }) =>
    $active ? "var(--color-primary)" : "var(--color-text-secondary)"};

  font-family: "Plus Jakarta Sans", sans-serif;
  font-size: 13px;
  font-weight: ${({ $active }) => ($active ? 600 : 400)};
  text-align: left;
  cursor: pointer;

  transition:
    color 150ms ease,
    background-color 150ms ease,
    border-color 150ms ease;

  svg {
    flex-shrink: 0;
  }

  &:hover {
    background: ${({ $active }) =>
      $active
        ? "var(--color-primary-soft, rgb(31 70 120 / 12%))"
        : "var(--color-elevated)"};

    color: var(--color-primary);
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

export const SidebarBottom = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid var(--color-border);
`;

export const MobileBottomBar = styled.nav`
  display: none;

  @media (max-width: 768px) {
    position: fixed;
    z-index: 1000;
    right: 0;
    bottom: 0;
    left: 0;

    display: flex;
    align-items: stretch;
    gap: 4px;

    width: 100%;
    padding: 8px 8px max(8px, env(safe-area-inset-bottom));

    overflow-x: auto;
    overscroll-behavior-x: contain;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;

    border-top: 1px solid var(--color-border);
    background: var(--color-surface);

    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

export const MobileNavigationItem = styled.button<{
  $active: boolean;
}>`
  display: flex;
  flex: 0 0 76px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;

  min-width: 76px;
  min-height: 58px;
  padding: 7px 4px;

  border: 1px solid transparent;
  border-radius: 12px;
  background: transparent;

  color: var(--color-text-secondary);
  cursor: pointer;
  font: inherit;

  svg {
    flex-shrink: 0;
    color: ${({ $active }) =>
      $active ? "var(--color-primary)" : "currentColor"};
  }

  span {
    max-width: 100%;
    overflow: hidden;

    font-size: 10px;
    font-weight: ${({ $active }) => ($active ? 700 : 500)};
    line-height: 1.3;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  ${({ $active }) =>
    $active &&
    `
      background: color-mix(
        in srgb,
        var(--color-primary) 10%,
        transparent
      );
      border-color: color-mix(
        in srgb,
        var(--color-primary) 18%,
        transparent
      );
      color: var(--color-text);
    `}

  &:hover {
    background: color-mix(
      in srgb,
      var(--color-primary) 8%,
      transparent
    );
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: -2px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;
