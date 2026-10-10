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
import logo from "../../../assets/milky-bills-logo.png";
import type { SidebarProps } from "./interfaces/Sidebar.interface";

const navigationItems = [
  { id: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { id: "transactions", label: "Transações", Icon: ArrowLeftRight },
  { id: "accounts", label: "Contas", Icon: Wallet },
  { id: "cards", label: "Cartões", Icon: CreditCard },
  { id: "recurring", label: "Recorrência", Icon: Repeat },
  { id: "categories", label: "Categorias", Icon: Tags },
  { id: "reports", label: "Relatórios", Icon: ChartNoAxesCombined },
] as const;

export function Sidebar({ page, onNavigate, open = false }: SidebarProps) {
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
            Milky <strong>Bills</strong>
          </BrandName>
        </SidebarBrand>

        <SidebarSectionLabel>FINANÇAS PESSOAIS</SidebarSectionLabel>

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
            <span>Configurações</span>
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
          <span>Configurações</span>
        </MobileNavigationItem>
      </MobileBottomBar>
    </>
  );
}
