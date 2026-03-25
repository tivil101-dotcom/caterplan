export type MenuType = "food" | "drinks";
export type ServiceStyle =
  | "plated"
  | "buffet"
  | "sharing"
  | "canapes"
  | "food_station";

export const SERVICE_STYLES: { value: ServiceStyle; label: string }[] = [
  { value: "plated", label: "Plated" },
  { value: "buffet", label: "Buffet" },
  { value: "sharing", label: "Sharing" },
  { value: "canapes", label: "Canapés" },
  { value: "food_station", label: "Food Station" },
];

export type DietaryFlag = "V" | "VG" | "GF" | "DF" | "NF" | "halal";

export const DIETARY_FLAGS: { value: DietaryFlag; label: string; color: string }[] = [
  { value: "V", label: "V", color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" },
  { value: "VG", label: "VG", color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" },
  { value: "GF", label: "GF", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400" },
  { value: "DF", label: "DF", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400" },
  { value: "NF", label: "NF", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400" },
  { value: "halal", label: "Halal", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400" },
];

export type Allergen =
  | "celery"
  | "cereals_containing_gluten"
  | "crustaceans"
  | "eggs"
  | "fish"
  | "lupin"
  | "milk"
  | "molluscs"
  | "mustard"
  | "nuts"
  | "peanuts"
  | "sesame"
  | "soya"
  | "sulphites";

export const ALLERGENS: { value: Allergen; label: string }[] = [
  { value: "celery", label: "Celery" },
  { value: "cereals_containing_gluten", label: "Gluten" },
  { value: "crustaceans", label: "Crustaceans" },
  { value: "eggs", label: "Eggs" },
  { value: "fish", label: "Fish" },
  { value: "lupin", label: "Lupin" },
  { value: "milk", label: "Milk" },
  { value: "molluscs", label: "Molluscs" },
  { value: "mustard", label: "Mustard" },
  { value: "nuts", label: "Nuts" },
  { value: "peanuts", label: "Peanuts" },
  { value: "sesame", label: "Sesame" },
  { value: "soya", label: "Soya" },
  { value: "sulphites", label: "Sulphites" },
];

export interface MenuItemAlternative {
  id: string;
  menu_item_id: string;
  alternative_item_id: string;
  alternative_item?: MenuItem;
  created_at: string;
}

export interface MenuItem {
  id: string;
  organisation_id: string;
  menu_section_id: string;
  name: string;
  description: string | null;
  dietary_flags: DietaryFlag[];
  allergens: Allergen[];
  portion_notes: string | null;
  prep_notes: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  menu_item_alternatives?: MenuItemAlternative[];
}

export interface MenuSection {
  id: string;
  organisation_id: string;
  menu_id: string;
  name: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  menu_items?: MenuItem[];
}

export interface Menu {
  id: string;
  organisation_id: string;
  name: string;
  description: string | null;
  menu_type: MenuType;
  service_style: ServiceStyle | null;
  is_template: boolean;
  event_service_id: string | null;
  created_at: string;
  updated_at: string;
  menu_sections?: MenuSection[];
}

/** Default sections to create based on service style */
export function getDefaultSections(style: ServiceStyle | null): string[] {
  switch (style) {
    case "plated":
      return ["Starter", "Main", "Dessert"];
    case "canapes":
      return ["Canapés"];
    default:
      return [];
  }
}
