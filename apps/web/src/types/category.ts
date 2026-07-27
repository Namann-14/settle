export interface Category {
  id: string;
  name: string;
  is_system: boolean;
  user_id?: string | null;
}

export interface CreateCategoryPayload {
  name: string;
}

export interface UpdateCategoryPayload {
  name?: string | null;
}
