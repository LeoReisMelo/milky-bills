export type AppPage =
  | "dashboard"
  | "transactions"
  | "accounts"
  | "cards"
  | "recurring"
  | "categories"
  | "reports"
  | "settings";

export interface SidebarProps {
  page: AppPage;
  onNavigate: (page: AppPage) => void;
  open?: boolean;
}
