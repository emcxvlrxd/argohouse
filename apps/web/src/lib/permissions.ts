export type Role = "user" | "moderator" | "admin" | "owner";

const ROLE_HIERARCHY: Record<Role, number> = {
  user: 0,
  moderator: 1,
  admin: 2,
  owner: 3,
};

export function hasPermission(userRole: string, requiredRole: Role): boolean {
  const userLevel = ROLE_HIERARCHY[userRole as Role] ?? -1;
  const requiredLevel = ROLE_HIERARCHY[requiredRole];
  return userLevel >= requiredLevel;
}

export function isAdmin(role: string): boolean {
  return hasPermission(role, "admin");
}

export function isModerator(role: string): boolean {
  return hasPermission(role, "moderator");
}

export function isOwner(role: string): boolean {
  return role === "owner";
}

export function canManageRole(actorRole: string, targetRole: string): boolean {
  const actorLevel = ROLE_HIERARCHY[actorRole as Role] ?? -1;
  const targetLevel = ROLE_HIERARCHY[targetRole as Role] ?? -1;
  return actorLevel > targetLevel;
}
