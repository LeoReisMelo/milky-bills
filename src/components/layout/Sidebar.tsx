
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  CreditCard,
  Repeat,
  Tags,
  ChartNoAxesCombined,
  Settings,
} from "lucide-react";

import logo from "../../assets/milky-bills-logo.png";

import {
  SidebarContainer,
  SidebarBrand,
  BrandLogo,
  BrandName,
  SidebarSectionLabel,
  SidebarNavigation,
  NavigationItem,
  SidebarBottom,
  MobileBottomBar,
  MobileNavigationItem,
} from "./Sidebar.styles";

export type AppPage =
  | "dashboard"
  | "transactions"
  | "accounts"
  | "cards"
  | "recurring"
  | "categories"
  | "reports"
  | "settings";

interface SidebarProps {
  page: AppPage;
  onNavigate: (page: AppPage) => void;
  open?: boolean;
}

const navigationItems = [
  { id: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { id: "transactions", label: "Transactions", Icon: ArrowLeftRight },
  { id: "accounts", label: "Accounts", Icon: Wallet },
  { id: "cards", label: "Cards", Icon: CreditCard },
  { id: "recurring", label: "Recurring", Icon: Repeat },
  { id: "categories", label: "Categories", Icon: Tags },
  { id: "reports", label: "Reports", Icon: ChartNoAxesCombined },
] as const;

export function Sidebar({
  page,
  onNavigate,
  open = false,
}: SidebarProps) {
  return (
    <>
      <SidebarContainer data-open={open}>
        <SidebarBrand
          type="button"
          onClick={() => onNavigate("dashboard")}
          aria-label="Milky Bills — Dashboard"
        >
          <BrandLogo src={logo} alt="" />
          <BrandName>
            milky <strong>bills</strong>
          </BrandName>
        </SidebarBrand>

        <SidebarSectionLabel>
          FINANÇAS PESSOAIS
        </SidebarSectionLabel>

        <SidebarNavigation aria-label="Navegação principal">
          {navigationItems.map(({ id, label, Icon }) => (
            <NavigationItem
              key={id}
              type="button"
              $active={page === id}
              aria-current={page === id ? "page" : undefined}
              onClick={() => onNavigate(id)}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
            </NavigationItem>
          ))}
        </SidebarNavigation>

        <SidebarBottom>
          <NavigationItem
            type="button"
            $active={page === "settings"}
            aria-current={page === "settings" ? "page" : undefined}
            onClick={() => onNavigate("settings")}
          >
            <Settings size={18} strokeWidth={1.8} />
            <span>Settings</span>
          </NavigationItem>
        </SidebarBottom>
      </SidebarContainer>

      <MobileBottomBar aria-label="Navegação principal para celular">
        {navigationItems.map(({ id, label, Icon }) => (
          <MobileNavigationItem
            key={id}
            type="button"
            $active={page === id}
            aria-current={page === id ? "page" : undefined}
            onClick={() => onNavigate(id)}
            aria-label={label}
            title={label}
          >
            <Icon size={20} strokeWidth={1.8} />
            <span>{label}</span>
          </MobileNavigationItem>
        ))}

        <MobileNavigationItem
          type="button"
          $active={page === "settings"}
          aria-current={page === "settings" ? "page" : undefined}
          onClick={() => onNavigate("settings")}
          aria-label="Settings"
          title="Settings"
        >
          <Settings size={20} strokeWidth={1.8} />
          <span>Settings</span>
        </MobileNavigationItem>
      </MobileBottomBar>
    </>
  );
}