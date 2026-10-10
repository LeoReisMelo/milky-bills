import { useEffect, useRef, useState } from "react";
import {
  Bell,
  Check,
  ChevronDown,
  Moon,
  Settings,
  Sun,
  UserRound,
  X,
} from "lucide-react";

import {
  ActionAnchor,
  AvatarButton,
  Header,
  HeaderActions,
  HeaderStart,
  IconButton,
  MenuDivider,
  NotificationDot,
  NotificationItem,
  NotificationList,
  NotificationText,
  NotificationTime,
  PageTitle,
  Popover,
  PopoverAction,
  PopoverFooter,
  PopoverHeader,
  ProfileMenuItem,
  UnreadIndicator,
} from "./Topbar.styles";

interface TopbarProps {
  darkMode: boolean;
  onToggleTheme: () => void;
  onOpenSettings?: () => void;
  profileImageUrl?: string;
  profileName?: string;
}

type OpenMenu = "notifications" | "profile" | null;

const notifications = [
  {
    id: 1,
    title: "Welcome to Milky Bills",
    message: "Your financial workspace is ready.",
    time: "Welcome",
    tone: "primary" as const,
  },
  {
    id: 2,
    title: "Keep your accounts updated",
    message: "Review your latest transactions to keep your balance accurate.",
    time: "Reminder",
    tone: "success" as const,
  },
  {
    id: 3,
    title: "Financial overview",
    message: "Check your income and expenses for this month.",
    time: "Suggestion",
    tone: "warning" as const,
  },
];

export function Topbar({
  darkMode,
  onToggleTheme,
  onOpenSettings,
  profileImageUrl,
  profileName = "Leonardo Reis",
}: TopbarProps) {
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const [readNotifications, setReadNotifications] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpenMenu(null);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenMenu(null);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function toggleMenu(menu: Exclude<OpenMenu, null>) {
    setOpenMenu((current) => (current === menu ? null : menu));
  }

  function handleThemeToggle() {
    setOpenMenu(null);
    onToggleTheme();
  }

  function handleSettings() {
    setOpenMenu(null);
    onOpenSettings?.();
  }

  return (
    <Header>
      <HeaderStart>
        <PageTitle>Your financial workspace</PageTitle>
      </HeaderStart>

      <HeaderActions ref={containerRef}>
        <IconButton
          type="button"
          aria-label={`Switch to ${darkMode ? "light" : "dark"} theme`}
          title={`Switch to ${darkMode ? "light" : "dark"} theme`}
          onClick={handleThemeToggle}
        >
          {darkMode ? <Sun size={17} /> : <Moon size={17} />}
        </IconButton>

        <ActionAnchor>
          <IconButton
            type="button"
            aria-label="Notifications"
            aria-haspopup="dialog"
            aria-expanded={openMenu === "notifications"}
            onClick={() => toggleMenu("notifications")}
          >
            <Bell size={17} />
            {!readNotifications && <UnreadIndicator />}
          </IconButton>

          {openMenu === "notifications" && (
            <Popover role="dialog" aria-label="Recent notifications">
              <PopoverHeader>
                <h2>Notifications</h2>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {!readNotifications && (
                    <PopoverAction
                      type="button"
                      onClick={() => setReadNotifications(true)}
                    >
                      Mark as read
                    </PopoverAction>
                  )}

                  <IconButton
                    type="button"
                    aria-label="Close notifications"
                    onClick={() => setOpenMenu(null)}
                    style={{ width: 28, height: 28 }}
                  >
                    <X size={15} />
                  </IconButton>
                </div>
              </PopoverHeader>

              <NotificationList>
                {notifications.map((notification) => (
                  <NotificationItem key={notification.id}>
                    <NotificationDot $tone={notification.tone} />

                    <NotificationText>
                      <h3>{notification.title}</h3>
                      <p>{notification.message}</p>
                      <NotificationTime>{notification.time}</NotificationTime>
                    </NotificationText>

                    {readNotifications && (
                      <Check
                        size={14}
                        aria-label="Read"
                        style={{ flexShrink: 0 }}
                      />
                    )}
                  </NotificationItem>
                ))}
              </NotificationList>

              <PopoverFooter>
                You're all caught up with your recent updates.
              </PopoverFooter>
            </Popover>
          )}
        </ActionAnchor>

        <ActionAnchor>
          <AvatarButton
            type="button"
            aria-label={`Open profile menu for ${profileName}`}
            aria-haspopup="menu"
            aria-expanded={openMenu === "profile"}
            onClick={() => toggleMenu("profile")}
          >
            {profileImageUrl ? (
              <img src={profileImageUrl} alt="" />
            ) : (
              <UserRound size={17} />
            )}
          </AvatarButton>

          {openMenu === "profile" && (
            <Popover
              role="menu"
              aria-label="Profile menu"
              style={{ width: 220 }}
            >
              <PopoverHeader>
                <div>
                  <h2>{profileName}</h2>
                  <span
                    style={{
                      display: "block",
                      marginTop: 3,
                      color: "var(--color-text-secondary)",
                      fontSize: 11,
                    }}
                  >
                    Personal account
                  </span>
                </div>

                <IconButton
                  type="button"
                  aria-label="Close profile menu"
                  onClick={() => setOpenMenu(null)}
                  style={{ width: 28, height: 28 }}
                >
                  <X size={15} />
                </IconButton>
              </PopoverHeader>

              <ProfileMenuItem
                type="button"
                role="menuitem"
                onClick={handleSettings}
              >
                <Settings size={16} />
                Settings
              </ProfileMenuItem>

              <MenuDivider />

              <ProfileMenuItem
                type="button"
                role="menuitem"
                onClick={() => setOpenMenu(null)}
              >
                <UserRound size={16} />
                My profile
                <ChevronDown
                  size={13}
                  style={{ marginLeft: "auto", opacity: 0.5 }}
                />
              </ProfileMenuItem>
            </Popover>
          )}
        </ActionAnchor>
      </HeaderActions>
    </Header>
  );
}
