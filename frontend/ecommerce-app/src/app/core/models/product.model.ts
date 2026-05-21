export type ProductSize = 7 | 8 | 9 | 10;
export type ProductColor = 'White' | 'Black' | 'Gray';

export interface Product {
  id: string;
  code: string;
  name: string;
  description: string;
  imageUrl: string;
  size: ProductSize;
  color: ProductColor;
  price: number;
  stock: number;
  isAvailable: boolean;
}

export interface ProductFilters {
  name?: string;
  description?: string;
  code?: string;
  size?: ProductSize;
  color?: ProductColor;
}

export interface CreateProductRequest {
  code: string;
  name: string;
  description: string;
  imageUrl: string;
  size: ProductSize;
  color: ProductColor;
  price: number;
  stock: number;
}
