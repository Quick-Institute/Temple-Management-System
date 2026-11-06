import { useState } from "react";
import { Icon, addIcon } from "@iconify/react";
import type { RefObject } from "react";
import type { UserRole } from "../types";

// Register the exact Iconify assets locally so the header does not wait on an API request.
addIcon("fa6-solid:circle-user", {"width": 512, "height": 512, "body": "<path fill=\"currentColor\" d=\"M399 384.2c-22.1-38.4-63.6-64.2-111-64.2h-64c-47.4 0-88.9 25.8-111 64.2c35.2 39.2 86.2 63.8 143 63.8s107.8-24.7 143-63.8M0 256a256 256 0 1 1 512 0a256 256 0 1 1-512 0m256 16a72 72 0 1 0 0-144a72 72 0 1 0 0 144\"/>"});
addIcon("iconamoon:search-light", {"width": 24, "height": 24, "body": "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"m21 21l-4.343-4.343m0 0A8 8 0 1 0 5.343 5.343a8 8 0 0 0 11.314 11.314\"/>"});
addIcon("iconamoon:notification", {"width": 24, "height": 24, "body": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M6 19v-9a6 6 0 0 1 6-6v0a6 6 0 0 1 6 6v9M6 19h12M6 19H4m14 0h2m-9 3h2\"/><circle cx=\"12\" cy=\"3\" r=\"1\"/></g>"});
addIcon("iconamoon:arrow-down-2", {"width": 24, "height": 24, "body": "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"m7 10l5 5m0 0l5-5\"/>"});

const roleDetails = {
  family: {
    name: "Kamal Perera",
    role: "Family User",
    placeholder: "Search events, dana schedule, or temple information...",
  },
  templeAdmin: {
    name: "Ven. Dammika Thero",
    role: "Temple Admin",
    placeholder: "Search families, dana bookings, events, or temple information...",
  },
  coAdmin: {
    name: "Nimal Perera",
    role: "Co-Administrator",
    placeholder: "Search families, dana bookings, events, or temple information...",
  },
  superAdmin: {
    name: "Super Admin",
    role: "System Administrator",
    placeholder: "Search temples, users, registrations, reports...",
  },
};

function Topbar({
  role = "family",
  userName,
  avatarSrc,
  onMenuClick,
  mobileNavOpen = false,
  menuButtonRef,
  hideMenuButtonOnTablet = false,
}) {
  const [language, setLanguage] = useState("EN");
  const [profileOpen, setProfileOpen] = useState(false);

  const currentUser = roleDetails[role] ?? roleDetails.family;
  const displayName = userName || currentUser.name;

  return (
    <header className="relative z-20 flex h-16 w-full shrink-0 items-center gap-2 border-b border-[#EAE7DF] bg-[#FFFFFF] px-3 sm:gap-4 sm:px-5 xl:justify-between xl:gap-8 xl:px-7">

      {/* Mobile navigation toggle */}
      <button
        type="button"
        ref={menuButtonRef}
        onClick={onMenuClick}
        aria-label={mobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={mobileNavOpen}
        aria-controls="primary-navigation"
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#234936] hover:bg-[#F2F4F1] focus-visible:outline-2 focus-visible:outline-[#B99A39] xl:hidden ${hideMenuButtonOnTablet ? "md:max-xl:invisible" : ""}`}
      >
        <Icon icon={mobileNavOpen ? "material-symbols:close-rounded" : "material-symbols:menu-rounded"} className="h-6 w-6" />
      </button>

      {/* Search bar */}
      <div className="flex h-9 min-w-0 w-full max-w-[480px] flex-1 items-center gap-2 rounded-full bg-[#F2F1EE] px-2.5 transition-shadow focus-within:ring-2 focus-within:ring-[#D8C99E]/60 sm:px-3.5">
        <Icon
          icon="iconamoon:search-light"
          className="h-[18px] w-[18px] shrink-0 text-[#3F4D47]"
        />

        <input
          type="search"
          aria-label="Search temple information"
          placeholder={currentUser.placeholder}
          className="w-full min-w-0 bg-transparent font-lora! text-[11px]! font-normal! text-[#263B35] outline-none placeholder:text-[#85847F] sm:text-[13px]!"
        />
      </div>

      {/* Right side controls */}
      <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-3 xl:ml-0 xl:gap-4">

        {/* Notifications */}
        <button
          type="button"
          aria-label="Notifications, 3 unread"
          className="relative flex h-9 w-8 items-center justify-center rounded-full text-[#263B35] transition hover:bg-[#F2F4F1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B99A39]"
        >
          <Icon
            icon="iconamoon:notification"
            className="h-6 w-6"
          />

          <span className="absolute right-0 top-0.5 flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-[#E94235] px-[3px] font-sans text-[9px] font-bold text-white">
            3
          </span>
        </button>

        {/* Language selector */}
        <div className="flex h-[30px] shrink-0 items-center rounded-full border border-[#D8C99E] bg-gradient-to-b sm:flex from-[#FFFFFF] to-[#F3EFE3] p-0.5 shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(35,73,54,0.05)]">

          <button
            type="button"
            onClick={() => setLanguage("EN")}
            aria-label="English"
            aria-pressed={language === "EN"}
            className={`flex h-6 min-w-[30px] items-center justify-center rounded-full px-2 font-lora! text-[11px]! font-medium! transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B99A39] sm:min-w-8 sm:px-2 sm:text-[11px]! ${
              language === "EN"
                ? "bg-[#174A3A] text-white shadow-sm"
                : "text-[#263B35]"
            }`}
          >
            EN
          </button>

          <button
            type="button"
            onClick={() => setLanguage("SI")}
            aria-label="සිංහල"
            aria-pressed={language === "SI"}
            className={`flex h-6 min-w-[30px] items-center justify-center rounded-full px-2 font-lora! text-[11px]! font-medium! transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B99A39] sm:min-w-8 sm:px-2 sm:text-[11px]! ${
              language === "SI"
                ? "bg-[#D8AD43] text-[#263B35] shadow-sm"
                : "text-[#263B35]"
            }`}
          >
            සිං
          </button>
        </div>

        {/* Vertical divider */}
        <div aria-hidden="true" className="hidden h-6 w-px bg-[#D9D5CB] sm:block" />

        {/* User profile */}
        <div className="relative">

          <button
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            aria-expanded={profileOpen}
            className="flex items-center gap-2 rounded-full text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B99A39] sm:gap-2"
          >
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt=""
                className="h-8 w-8 shrink-0 rounded-full object-cover sm:h-9 sm:w-9"
              />
            ) : (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#234936] text-[#E7EDE9] sm:h-9 sm:w-9">
                <Icon
                  icon="fa6-solid:circle-user"
                  className="h-9 w-9"
                />
              </div>
            )}

            <div className="hidden min-w-0 leading-tight md:block">
              <p className="max-w-[170px] truncate font-lora text-[13px] font-semibold leading-[18px] text-[#172E27]">
                {displayName}
              </p>

              <p className="font-lora text-[11px] font-normal leading-4 text-[#77766F]">
                {currentUser.role}
              </p>
            </div>

            <Icon
              icon="iconamoon:arrow-down-2"
              className={`h-4 w-4 shrink-0 text-[#172E27] transition-transform ${
                profileOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Profile dropdown */}
          {profileOpen && (
            <div className="absolute right-0 top-full mt-3 z-50 w-48 rounded-xl border border-[#E8E1D2] bg-white p-2 shadow-lg">
              <button
                type="button"
                onClick={() => setProfileOpen(false)}
                className="w-full rounded-lg px-3 py-2 text-left font-lora! text-sm! text-[#234936] hover:bg-[#F3F5F0]"
              >
                My Profile
              </button>

              <button
                type="button"
                onClick={() => setProfileOpen(false)}
                className="w-full rounded-lg px-3 py-2 text-left font-lora! text-sm! text-[#234936] hover:bg-[#F3F5F0]"
              >
                Settings
              </button>

              <div className="my-1 border-t border-[#EEEAE2]" />

              <button
                type="button"
                onClick={() => setProfileOpen(false)}
                className="w-full rounded-lg px-3 py-2 text-left font-lora! text-sm! text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          )}

        </div>
      </div>
    </header>
  );
}

export default Topbar;
