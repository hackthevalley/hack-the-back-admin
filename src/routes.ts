export const ROUTES = {
  home: "/",
  login: "/login",
  apps: "/apps",
  applicant: "/apps/:app_id",
  rank: "/rank",
  food: "/food",
  emails: "/emails",
  registration: "/registration",
} as const;

export type RouteKey = keyof typeof ROUTES;

export const ROUTE_MODULES = {
  home: () => import("./pages/Home.tsx"),
  login: () => import("./pages/Login.tsx"),
  apps: () => import("./pages/Apps.tsx"),
  applicant: () => import("./pages/ViewApplicant.tsx"),
  rank: () => import("./pages/Rank.tsx"),
  food: () => import("./pages/Food.tsx"),
  emails: () => import("./pages/Emails.tsx"),
  registration: () => import("./pages/Registration.tsx"),
} satisfies Record<RouteKey, () => Promise<{ default: ComponentType }>>;

export function routeIsActive(key: RouteKey, pathname: string): boolean {
  if (key === "apps" || key === "applicant")
    return pathname.startsWith(ROUTES.apps);
  return pathname === ROUTES[key];
}

export function prefetchRoute(key: RouteKey): void {
  void ROUTE_MODULES[key]();
}
import type { ComponentType } from "react";
