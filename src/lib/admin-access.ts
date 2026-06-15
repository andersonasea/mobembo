export function canAccessAdmin(role?: string | null) {
  return role === "ADMIN" || role === "COMPANY_ADMIN";
}

export function isPlatformAdmin(role?: string | null) {
  return role === "ADMIN";
}

export function isCompanyAdmin(role?: string | null) {
  return role === "COMPANY_ADMIN";
}
