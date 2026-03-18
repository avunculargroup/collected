"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, MessageCircle, User } from "lucide-react";

const navItems = [
  { href: "/today", icon: Home, label: "Today" },
  { href: "/week", icon: Calendar, label: "History" },
  { href: "/coach", icon: MessageCircle, label: "Coach" },
  { href: "/settings", icon: User, label: "Profile" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: 480,
        backgroundColor: "#FFFCF7",
        borderTop: "1px solid #E8DCC8",
        display: "flex",
        zIndex: 50,
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {navItems.map(({ href, icon: Icon, label }) => {
        const isActive = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "10px 4px",
              gap: 3,
              textDecoration: "none",
            }}
          >
            <Icon
              size={20}
              strokeWidth={1.5}
              color={isActive ? "#3D2B1F" : "#C4A882"}
            />
            <span
              style={{
                fontFamily: "var(--font-source-sans), sans-serif",
                fontSize: 10,
                fontWeight: 600,
                color: isActive ? "#3D2B1F" : "#C4A882",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
