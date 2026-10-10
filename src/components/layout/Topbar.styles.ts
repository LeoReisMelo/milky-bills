import styled from "styled-components";

export const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
  min-height: 64px;
  padding: 0 32px;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text);
  transition:
    background-color 180ms ease,
    border-color 180ms ease,
    color 180ms ease;

  @media (max-width: 640px) {
    min-height: 60px;
    padding: 0 16px;
  }
`;

export const HeaderStart = styled.div`
  display: flex;
  align-items: center;
  min-width: 0;
`;

export const PageTitle = styled.p`
  margin: 0;
  overflow: hidden;
  color: var(--color-text-secondary);
  font-size: 12px;
  font-weight: 500;
  line-height: 1.5;
  letter-spacing: 0.01em;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex-shrink: 0;
`;

export const IconButton = styled.button`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition:
    background-color 150ms ease,
    border-color 150ms ease,
    color 150ms ease;

  &:hover {
    background: var(--color-elevated);
    color: var(--color-text);
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  &[aria-expanded="true"] {
    background: var(--color-elevated);
    color: var(--color-text);
  }

  &:active {
    transform: scale(0.96);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;

    &:active {
      transform: none;
    }
  }
`;

export const AvatarButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  padding: 0;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: 50%;
  background: var(--color-elevated);
  color: var(--color-text);
  cursor: pointer;
  transition:
    border-color 150ms ease,
    box-shadow 150ms ease,
    transform 150ms ease;

  &:hover {
    border-color: var(--color-primary);
    transform: scale(1.04);
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 3px;
  }

  img {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }
`;

export const Popover = styled.div`
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  z-index: 50;
  width: min(340px, calc(100vw - 32px));
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-surface);
  color: var(--color-text);
  box-shadow: 0 12px 36px rgb(0 0 0 / 12%);
  animation: popover-in 140ms ease-out;

  @keyframes popover-in {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

export const PopoverHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-border);

  h2 {
    margin: 0;
    font-size: 13px;
    font-weight: 600;
  }
`;

export const PopoverAction = styled.button`
  padding: 4px;
  border: 0;
  border-radius: 5px;
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 11px;
  cursor: pointer;

  &:hover {
    color: var(--color-primary);
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
`;

export const NotificationList = styled.div`
  display: flex;
  flex-direction: column;
  max-height: 320px;
  overflow-y: auto;
`;

export const NotificationItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-border);

  &:last-child {
    border-bottom: 0;
  }
`;

export const NotificationDot = styled.span<{
  $tone: "primary" | "warning" | "success";
}>`
  flex: 0 0 8px;
  width: 8px;
  height: 8px;
  margin-top: 5px;
  border-radius: 50%;
  background: ${({ $tone }) =>
    $tone === "warning"
      ? "var(--color-expense)"
      : $tone === "success"
        ? "var(--color-income)"
        : "var(--color-primary)"};
`;

export const NotificationText = styled.div`
  min-width: 0;

  h3 {
    margin: 0;
    font-size: 12px;
    font-weight: 600;
    line-height: 1.5;
  }

  p {
    margin: 3px 0 0;
    color: var(--color-text-secondary);
    font-size: 11px;
    line-height: 1.6;
  }
`;

export const NotificationTime = styled.span`
  display: block;
  margin-top: 5px;
  color: var(--color-text-secondary);
  font-size: 10px;
`;

export const PopoverFooter = styled.div`
  padding: 10px 16px;
  border-top: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  font-size: 11px;
`;

export const MenuDivider = styled.div`
  height: 1px;
  background: var(--color-border);
`;

export const ProfileMenuItem = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 11px 14px;
  border: 0;
  background: transparent;
  color: var(--color-text);
  text-align: left;
  font-size: 12px;
  cursor: pointer;

  &:hover {
    background: var(--color-elevated);
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: -2px;
  }
`;

export const ActionAnchor = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

export const UnreadIndicator = styled.span`
  position: absolute;
  top: 6px;
  right: 6px;
  width: 7px;
  height: 7px;
  border: 1px solid var(--color-surface);
  border-radius: 50%;
  background: var(--color-primary);
`;
