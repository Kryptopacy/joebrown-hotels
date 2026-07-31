export type StaffRole = 'developer' | 'super_admin' | 'receptionist' | 'kitchen_staff' | 'housekeeping' | 'lounge_staff';

export interface StaffMember {
  id: string;
  user_id?: string;
  full_name: string;
  email: string;
  role: StaffRole;
  department: string;
  phone?: string;
  is_active: boolean;
}

export const ROLE_PERMISSIONS: Record<StaffRole, { title: string; desc: string; allowedRoutes: string[] }> = {
  developer: {
    title: 'Developer / Technical Support',
    desc: 'Full system access for technical maintenance without being tagged as business owner or manager.',
    allowedRoutes: ['/admin', '/admin/analytics', '/admin/concierge', '/admin/intercom', '/admin/staff', '/admin/bookings', '/admin/orders', '/admin/rooms', '/admin/menu', '/admin/branding', '/admin/qr', '/admin/settings'],
  },
  super_admin: {
    title: 'General Manager (Super Admin)',
    desc: 'Full operational, financial, staffing, and branding control.',
    allowedRoutes: ['/admin', '/admin/analytics', '/admin/concierge', '/admin/intercom', '/admin/staff', '/admin/bookings', '/admin/orders', '/admin/rooms', '/admin/menu', '/admin/branding', '/admin/qr', '/admin/settings'],
  },
  receptionist: {
    title: 'Front Desk / Receptionist',
    desc: 'Manage room bookings, guest check-ins, and customer live intercom desk.',
    allowedRoutes: ['/admin', '/admin/bookings', '/admin/rooms', '/admin/qr', '/admin/intercom'],
  },
  lounge_staff: {
    title: 'Lounge & Bar Staff (Mixologist)',
    desc: 'Lounge menu management, cocktail/shisha availability, table QR scanner, and lounge intercom channel.',
    allowedRoutes: ['/admin', '/admin/menu', '/admin/qr', '/admin/intercom'],
  },
  kitchen_staff: {
    title: 'Kitchen & Culinary Staff',
    desc: 'Digital menu availability, kitchen order tickets, and staff kitchen channel.',
    allowedRoutes: ['/admin', '/admin/menu', '/admin/intercom'],
  },
  housekeeping: {
    title: 'Housekeeping & Maintenance',
    desc: 'Bungalow cleaning statuses and housekeeping intercom alerts.',
    allowedRoutes: ['/admin', '/admin/rooms', '/admin/intercom'],
  },
};

export function isRouteAllowed(role: StaffRole, route: string): boolean {
  const allowed = ROLE_PERMISSIONS[role]?.allowedRoutes || [];
  return allowed.some(r => route === r || (r !== '/admin' && route.startsWith(r)));
}
