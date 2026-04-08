export type UserRole = 'super_admin' | 'admin' | 'pandit' | 'bhakt';

export interface UserProfile {
  uid: string;
  name: string;
  email?: string;
  phone?: string;
  role: UserRole;
  address?: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface PanditProfile {
  uid: string;
  specialization: string[];
  experience: number;
  bio: string;
  isVerified: boolean;
  rating: number;
}

export interface Puja {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid';

export interface Booking {
  id: string;
  bhaktId: string;
  panditId?: string;
  pujaId: string;
  date: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  videoLink?: string;
  address: string;
  vehiclePrepayment: boolean;
  vehicleStatus?: 'pending' | 'confirmed' | 'dispatched' | 'completed';
  createdAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  imageUrl?: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  upiId: string;
  transactionId: string;
  status: 'pending' | 'success' | 'failed';
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'booking' | 'event' | 'system';
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface Banner {
  id: string;
  imageUrl: string;
  linkUrl?: string;
  title: string;
  active: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  targetUserId: string;
  targetUserName: string;
  oldRole: UserRole;
  newRole: UserRole;
  timestamp: string;
}
