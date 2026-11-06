import { useEffect, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import type { MainLayoutProps } from "../types";

function MainLayout({
  children,
  role = "family",
  basePath = "",
  userName,
  avatarSrc,
}: MainLayoutProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [tabletExpanded, setTabletExpanded] = useState(false);
  const [viewport, setViewport] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 1440
  );
  const isMobile = viewport < 768;
  const isTablet = viewport >= 768 && viewport < 1280;
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const wasMobileNavOpen = useRef(false);

  useEffect(() => {
    const updateViewport = () => {
      setViewport(window.innerWidth);
      if (window.innerWidth >= 768) setMobileNavOpen(false);
      if (window.innerWidth < 768 || window.innerWidth >= 1280) setTabletExpanded(false);
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  useEffect(() => {
    if (wasMobileNavOpen.current && !mobileNavOpen && isMobile) {
      menuButtonRef.current?.focus();
    }
    wasMobileNavOpen.current = mobileNavOpen;
  }, [mobileNavOpen, isMobile]);

  /* Return focus to the Topbar hamburger after the sidebar's X collapses it. */
  const wasTabletExpanded = useRef(false);
  useEffect(() => {
    if (wasTabletExpanded.current && !tabletExpanded && isTablet) {
      menuButtonRef.current?.focus();
    }
    wasTabletExpanded.current = tabletExpanded;
  }, [tabletExpanded, isTablet]);

  const closeMobileNav = () => setMobileNavOpen(false);

  return (
    <div className="portal-scope flex h-dvh w-full overflow-hidden bg-[#FFFDF8]">
      {/* Shared navigation: collapsible drawer on mobile/tablet, fixed sidebar on wide desktop. */}
      <Sidebar
        role={role}
        basePath={basePath}
        mobileOpen={mobileNavOpen}
        isMobile={isMobile}
        isTablet={isTablet}
        tabletExpanded={tabletExpanded}
        onNavigate={isMobile ? closeMobileNav : undefined}
        onClose={closeMobileNav}
        onCollapseTablet={() => setTabletExpanded(false)}
      />

      {/* Backdrop for the collapsible mobile/tablet navigation drawer. */}
      {isMobile && mobileNavOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={closeMobileNav}
          className="fixed inset-0 z-30 bg-[#10251E]/55 backdrop-blur-[1px] xl:hidden"
        />
      )}

      <div className="flex h-dvh min-h-0 min-w-0 flex-1 flex-col">
        <Topbar
          role={role}
          userName={userName}
          avatarSrc={avatarSrc}
          onMenuClick={() => {
            if (isTablet) setTabletExpanded((expanded) => !expanded);
            else if (isMobile) setMobileNavOpen((open) => !open);
          }}
          mobileNavOpen={isMobile ? mobileNavOpen : tabletExpanded}
          menuButtonRef={menuButtonRef}
          hideMenuButtonOnTablet={isTablet && tabletExpanded}
        />

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto bg-[#FBF8EF] p-3 sm:p-4 lg:p-5">
          {children}
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
