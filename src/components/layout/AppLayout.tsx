import { useState, type ReactNode } from "react";
import { Footer } from "./Footer";
import { Sidebar } from "./Sidebar/Sidebar";
import { Topbar } from "./Topbar/Topbar";
import {
  AppShell,
  MainContent,
  MobileOverlay,
  PageContent,
} from "./AppLayout.styles";
import type { AppPage } from "./Sidebar/interfaces/Sidebar.interface";

interface AppLayoutProps {
  page: AppPage;
  darkMode: boolean;
  onToggleTheme: () => void;
  onNavigate: (page: AppPage) => void;
  children: ReactNode;
}

export function AppLayout({
  page,
  darkMode,
  onToggleTheme,
  onNavigate,
  children,
}: AppLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  function navigate(nextPage: AppPage) {
    onNavigate(nextPage);
    setMenuOpen(false);
  }

  return (
    <AppShell>
      <Sidebar page={page} open={menuOpen} onNavigate={navigate} />

      {menuOpen && (
        <MobileOverlay
          $visible={false}
          type="button"
          aria-label="Fechar menu"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <MainContent>
        <Topbar
          darkMode={darkMode}
          onToggleTheme={onToggleTheme}
          onOpenSettings={() => {
          }}
        />

        <PageContent>{children}</PageContent>

        <Footer />
      </MainContent>
    </AppShell>
  );
}
