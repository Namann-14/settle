export interface Category {
  id: string;
  name: string;
  /** lucide icon name, e.g. "utensils". */
  icon?: string | null;
  /** chart color token, e.g. "chart-3". */
  color?: string | null;
  is_system: boolean;
  user_id?: string | null;
}

export interface CreateCategoryPayload {
  name: string;
  icon?: string | null;
  color?: string | null;
}

export interface UpdateCategoryPayload {
  name?: string | null;
  icon?: string | null;
  color?: string | null;
}
