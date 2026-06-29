// ============================================================
// ROLES & MODULE PERMISSIONS
// Single source of truth for who can access what.
// ============================================================

export const ROLES = ['admin', 'agent', 'content_writer', 'back_office'];

export const ROLE_LABELS = {
  admin: 'Admin',
  agent: 'Agent',
  content_writer: 'Content Writer',
  back_office: 'Back Office',
};

export const ROLE_COLORS = {
  admin: '#2dd4bf',
  agent: '#60a5fa',
  content_writer: '#c084fc',
  back_office: '#fbbf24',
};

// Modules an admin can grant to a non-admin user. Each maps to a real
// section of the admin panel. `users` and `rotation` are intentionally
// excluded — they are admin-only and never assignable.
export const MODULES = [
  { key: 'leads', label: 'Leads CRM', description: 'View and manage leads' },
  { key: 'services', label: 'Services', description: 'Manage service content' },
  { key: 'blogs', label: 'Blogs', description: 'Write and manage blog posts' },
  { key: 'seo', label: 'SEO', description: 'Manage page SEO & metadata' },
];

export const ASSIGNABLE_MODULE_KEYS = MODULES.map((m) => m.key);

// Sensible starting permissions when a user of each role is created.
export const DEFAULT_MODULES_BY_ROLE = {
  admin: [], // admins bypass module checks entirely
  agent: ['leads'],
  back_office: ['leads'],
  content_writer: ['blogs', 'services', 'seo'],
};

// Does this user have access to a given module?
// Admins always do. Everyone else must have it in their module list.
export function canAccessModule(user, moduleKey) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  return Array.isArray(user.modules) && user.modules.includes(moduleKey);
}

// Only agents are restricted to leads assigned to them. Admin and
// back-office (lead coordinators) can see the whole pipeline.
export function canSeeAllLeads(user) {
  if (!user) return false;
  return user.role !== 'agent';
}
