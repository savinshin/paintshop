export interface Category {
  id: number;
  name: string;
  slug?: string | null;
  parentId: number | null;
  sortOrder?: number | null;
  isActive?: boolean;
}
