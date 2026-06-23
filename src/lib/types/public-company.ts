export type PublicCompany = {
  id: string;
  name: string;
  description: string | null;
  phone: string;
  email: string;
  isActive: boolean;
  _count: { routes: number; buses: number };
};

export type PublicCompanyRoute = {
  id: string;
  departure: string;
  destination: string;
  price: number;
  durationMinutes: number | null;
  _count: { schedules: number };
};

export type PublicCompanyDetail = Omit<PublicCompany, "_count"> & {
  routes: PublicCompanyRoute[];
};

export type DashboardStats = {
  companies: number;
  buses: number;
  routes: number;
  users: number;
  bookings: number;
};
