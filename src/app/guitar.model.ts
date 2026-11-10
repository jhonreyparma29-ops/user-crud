export interface Guitar {
  id?: string;
  brand: string;
  model: string;
  type: string;
  price: number;
  stock: number;
  status: string;
  renter: string;
  createdAt?: any;
}

export const GUITAR_TYPES = ['Acoustic', 'Electric', 'Bass', 'Classical', 'Ukulele'];
export const GUITAR_STATUSES = ['Available', 'Rented', 'Under Repair'];

