export interface Product {
  id: string;
  sku: string | null;
  name: string | null;
  brand: string | null;
  finish?: string | null;
  packageMl?: number | null;
  price?: number | null;
  currency?: string | null;
  stockQty?: number | null;
  hex?: string | null;
  imageUrl?: string | null;
  categoryIds?: number[] | null;
  createdAt?: string | null;
}
