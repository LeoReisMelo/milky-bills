import styled from "styled-components";

type PopoverProps = {
  $menu: "notifications" | "profile";
};

export const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 100;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  width: 100%;
  min-width: 0;
  min-height: calc(64px + env(safe-area-inset-top, 0px));

  /*
   * O padding superior ocupa a área segura do iPhone.
   * O fundo do header também cobre essa região.
   */
  padding: env(safe-area-inset-top, 0px) 32px 0;

  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text);

  isolation: isolate;

  transition:
    background-color 180ms ease,
    border-color 180ms ease,
    color 180ms ease;

  @media (max-width: 640px) {
    min-height: calc(60px + env(safe-area-inset-top, 0px));
    padding-right: 16px;
    padding-left: 16px;
    gap: 8px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

export const HeaderStart = styled.div`
  display: flex;
  align-items: center;
  min-width: 0;
  flex: 1;
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

  @media (max-width: 380px) {
    font-size: 11px;
  }
`;

export const HeaderActions = styled.div`
  position: relative;

  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex-shrink: 0;

  @media (max-width: 380px) {
    gap: 4px;
  }
`;

export const IconButton = styled.button`
  position: relative;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  width: 36px;
  height: 36px;
  padding: 0;

  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: var(--color-text-secondary);

  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

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

  &.popover-close {
    width: 28px;
    height: 28px;
  }

  @media (max-width: 380px) {
    width: 34px;
    height: 34px;
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
  flex-shrink: 0;

  width: 34px;
  height: 34px;
  padding: 0;
  overflow: hidden;

  border: 1px solid var(--color-border);
  border-radius: 50%;
  background: var(--color-elevated);
  color: var(--color-text);

  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

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

  &[aria-expanded="true"] {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px
      color-mix(in srgb, var(--color-primary) 20%, transparent);
  }

  img {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;

    &:hover {
      transform: none;
    }
  }
`;

export const ActionAnchor = styled.div`
  position: relative;

  display: flex;
  align-items: center;
  flex-shrink: 0;
`;

export const Popover = styled.div<PopoverProps>`
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  z-index: 110;

  width: ${({ $menu }) =>
    $menu === "profile"
      ? "min(260px, calc(100vw - 24px))"
      : "min(340px, calc(100vw - 24px))"};

  max-height: min(
    480px,
    calc(
      100dvh - env(safe-area-inset-top, 0px) - env(
          safe-area-inset-bottom,
          0px
        ) -
        88px
    )
  );

  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;

  border: 1px solid var(--color-border);
  border-radius: 12px;

  background: var(--color-surface);
  color: var(--color-text);

  box-shadow: 0 12px 36px rgb(0 0 0 / 16%);

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

  @media (max-width: 640px) {
    /*
     * Mantém o menu dentro da largura visível do celular,
     * mesmo quando o botão está perto da borda direita.
     */
    position: fixed;
    top: calc(env(safe-area-inset-top, 0px) + 68px);
    right: max(12px, env(safe-area-inset-right, 0px));

    width: min(
      ${({ $menu }) => ($menu === "profile" ? "260px" : "340px")},
      calc(
        100vw -
          24px - env(safe-area-inset-left, 0px) - env(
            safe-area-inset-right,
            0px
          )
      )
    );

    max-height: calc(
      100dvh - env(safe-area-inset-top, 0px) - env(
          safe-area-inset-bottom,
          0px
        ) -
        84px
    );
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
    overflow-wrap: anywhere;
  }

  .popover-header-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    flex-shrink: 0;
  }

  .profile-subtitle {
    display: block;
    margin-top: 3px;
    color: var(--color-text-secondary);
    font-size: 11px;
  }
`;

export const PopoverAction = styled.button`
  padding: 6px 4px;

  border: 0;
  border-radius: 5px;
  background: transparent;

  color: var(--color-text-secondary);
  font-size: 11px;
  white-space: nowrap;
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
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;

  @media (max-width: 640px) {
    max-height: min(320px, 42dvh);
  }
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
  flex: 1;

  h3 {
    margin: 0;
    font-size: 12px;
    font-weight: 600;
    line-height: 1.5;
    overflow-wrap: anywhere;
  }

  p {
    margin: 3px 0 0;
    color: var(--color-text-secondary);
    font-size: 11px;
    line-height: 1.6;
    overflow-wrap: anywhere;
  }

  .read-indicator {
    flex-shrink: 0;
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
  line-height: 1.5;
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
  padding: 12px 14px;

  border: 0;
  background: transparent;
  color: var(--color-text);

  text-align: left;
  font-size: 12px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  &:hover {
    background: var(--color-elevated);
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: -2px;
  }

  .profile-chevron {
    margin-left: auto;
    opacity: 0.5;
  }
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
