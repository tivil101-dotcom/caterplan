import {
  Home,
  Calendar,
  UtensilsCrossed,
  Users,
  MapPin,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Events", href: "/events", icon: Calendar },
  { label: "Menus", href: "/menus", icon: UtensilsCrossed },
  { label: "Clients", href: "/clients", icon: Users },
  { label: "Venues", href: "/venues", icon: MapPin },
];
