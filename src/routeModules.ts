export const routeModules = {
  home: () => import("./pages/Home.tsx"),
  login: () => import("./pages/Login.tsx"),
  apps: () => import("./pages/Apps.tsx"),
  viewApplicant: () => import("./pages/ViewApplicant.tsx"),
  rank: () => import("./pages/Rank.tsx"),
  food: () => import("./pages/Food.tsx"),
  emails: () => import("./pages/Emails.tsx"),
};

export function prefetchRoute(pathname: string) {
  const loadRoute = pathname === "/"
    ? routeModules.home
    : pathname === "/apps"
      ? routeModules.apps
      : pathname.startsWith("/apps/")
        ? routeModules.viewApplicant
        : pathname === "/rank"
          ? routeModules.rank
          : pathname === "/food"
            ? routeModules.food
            : pathname === "/emails"
              ? routeModules.emails
              : pathname === "/login"
                ? routeModules.login
                : undefined;

  void loadRoute?.();
}
