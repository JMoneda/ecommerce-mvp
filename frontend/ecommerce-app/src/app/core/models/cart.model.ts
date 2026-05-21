export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  imageUrl: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  total: number;
}
