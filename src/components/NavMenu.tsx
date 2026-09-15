import { useContext, type ReactElement } from "react";
import {
  House,
  CalendarDays,
  Newspaper,
  LogOut,
  Menu,
  UtensilsCrossed,
  Mail,
  Scale,
  type LucideIcon,
} from "lucide-react";
import { Link, useLocation } from "react-router";

import { prefetchRoute, routeIsActive, ROUTES, type RouteKey } from "@/routes";
import { UserContext } from "@/context/auth";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type NavigationItem = {
  label: string;
  route: string;
  routeKey: RouteKey;
  icon: LucideIcon;
};

const NAVIGATION_ITEMS: NavigationItem[] = [
  { label: "Home", route: ROUTES.home, routeKey: "home", icon: House },
  {
    label: "Registration Dates",
    route: ROUTES.registration,
    routeKey: "registration",
    icon: CalendarDays,
  },
  {
    label: "Hacker Apps",
    route: ROUTES.apps,
    routeKey: "apps",
    icon: Newspaper,
  },
  { label: "Rank", route: ROUTES.rank, routeKey: "rank", icon: Scale },
  {
    label: "Food",
    route: ROUTES.food,
    routeKey: "food",
    icon: UtensilsCrossed,
  },
  { label: "Emails", route: ROUTES.emails, routeKey: "emails", icon: Mail },
];

function CloseOnMobile({
  mobile,
  children,
}: {
  mobile: boolean;
  children: ReactElement;
}) {
  return mobile ? <SheetClose asChild>{children}</SheetClose> : children;
}

function NavigationLinks({ mobile }: { mobile: boolean }) {
  const { pathname } = useLocation();

  return NAVIGATION_ITEMS.map(({ label, route, routeKey, icon: Icon }) => {
    const active = routeIsActive(routeKey, pathname);
    return (
      <CloseOnMobile key={route} mobile={mobile}>
        <Button
          variant={active ? "secondary" : "ghost"}
          asChild
          className="inline-flex justify-start gap-2"
        >
          <Link
            to={route}
            aria-current={active ? "page" : undefined}
            onMouseEnter={() => {
              prefetchRoute(routeKey);
            }}
            onFocus={() => {
              prefetchRoute(routeKey);
            }}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        </Button>
      </CloseOnMobile>
    );
  });
}

function LogoutButton({ mobile }: { mobile: boolean }) {
  const { logout } = useContext(UserContext) ?? {};
  return (
    <CloseOnMobile mobile={mobile}>
      <Button
        onClick={logout}
        variant="secondary"
        className="inline-flex justify-start gap-2"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </Button>
    </CloseOnMobile>
  );
}

function NavMenu() {
  return (
    <>
      <div className="fixed left-5 top-6 z-50 lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              aria-label="Open navigation menu"
              className="bg-secondary shadow-sm"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[18rem] p-0">
            <SheetHeader className="px-4 pb-2 pt-4 text-left">
              <SheetTitle>Hack The Back</SheetTitle>
            </SheetHeader>
            <nav className="flex h-[calc(100%-4.5rem)] flex-col justify-between gap-4 border-t p-4">
              <div className="flex flex-col gap-2">
                <NavigationLinks mobile />
              </div>
              <LogoutButton mobile />
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      <nav className="hidden min-w-48 max-w-[16rem] flex-col justify-between gap-4 p-4 lg:flex">
        <div className="flex flex-col gap-2">
          <h1 className="p-2 text-md font-semibold">Hack The Back</h1>
          <NavigationLinks mobile={false} />
        </div>
        <LogoutButton mobile={false} />
      </nav>
    </>
  );
}

export default NavMenu;
