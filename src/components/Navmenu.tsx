import { useContext } from "react";
import { UserContext } from "@/utils/auth";
import { Button } from "./ui/button";
import {
  House,
  Newspaper,
  LogOut,
  Menu,
  UtensilsCrossed,
  Mail,
  Scale,
} from "lucide-react";
import { useLocation, Link } from "react-router";
import { prefetchRoute } from "@/routeModules";
import {
  Sheet,
  SheetContent,
  SheetClose,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

function NavMenu() {
  const { logout } = useContext(UserContext) ?? {};
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const isApps = pathname.startsWith("/apps");
  const isFood = pathname === "/food";
  const isEmails = pathname === "/emails";
  const isRank = pathname === "/rank";
  const preload = (route: string) => ({
    onMouseEnter: () => prefetchRoute(route),
    onFocus: () => prefetchRoute(route),
  });

  return (
    <>
      {/* Mobile */}
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

          <SheetContent side="left" className="p-0 w-[18rem]">
            <SheetHeader className="px-4 pt-4 pb-2 text-left">
              <SheetTitle>Hack The Back</SheetTitle>
            </SheetHeader>

            <nav className="flex h-[calc(100%-4.5rem)] flex-col justify-between gap-4 border-t p-4">
              <div className="flex flex-col gap-2">
                <SheetClose asChild>
                  <Button
                    variant={isHome ? "secondary" : "ghost"}
                    asChild
                    className="inline-flex justify-start gap-2"
                  >
                    <Link
                      to="/"
                      aria-current={isHome ? "page" : undefined}
                      {...preload("/")}
                    >
                      <House className="h-4 w-4" />
                      Home
                    </Link>
                  </Button>
                </SheetClose>

                <SheetClose asChild>
                  <Button
                    variant={isApps ? "secondary" : "ghost"}
                    asChild
                    className="inline-flex justify-start gap-2"
                  >
                    <Link
                      to="/apps"
                      aria-current={isApps ? "page" : undefined}
                      {...preload("/apps")}
                    >
                      <Newspaper className="h-4 w-4" />
                      Hacker Apps
                    </Link>
                  </Button>
                </SheetClose>

                <SheetClose asChild>
                  <Button
                    variant={isRank ? "secondary" : "ghost"}
                    asChild
                    className="inline-flex justify-start gap-2"
                  >
                    <Link
                      to="/rank"
                      aria-current={isRank ? "page" : undefined}
                      {...preload("/rank")}
                    >
                      <Scale className="h-4 w-4" />
                      Rank
                    </Link>
                  </Button>
                </SheetClose>

                <SheetClose asChild>
                  <Button
                    variant={isFood ? "secondary" : "ghost"}
                    asChild
                    className="inline-flex justify-start gap-2"
                  >
                    <Link
                      to="/food"
                      aria-current={isFood ? "page" : undefined}
                      {...preload("/food")}
                    >
                      <UtensilsCrossed className="h-4 w-4" />
                      Food
                    </Link>
                  </Button>
                </SheetClose>

                <SheetClose asChild>
                  <Button
                    variant={isEmails ? "secondary" : "ghost"}
                    asChild
                    className="inline-flex justify-start gap-2"
                  >
                    <Link
                      to="/emails"
                      aria-current={isEmails ? "page" : undefined}
                      {...preload("/emails")}
                    >
                      <Mail className="h-4 w-4" />
                      Emails
                    </Link>
                  </Button>
                </SheetClose>
              </div>

              <SheetClose asChild>
                <Button
                  onClick={logout}
                  variant="secondary"
                  className="inline-flex justify-start gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </SheetClose>
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop */}
      {/* w-1/5 */}
      <div className="hidden lg:flex flex-col min-w-48 max-w-[16rem] gap-4 justify-between p-4">
        <div className="flex flex-col gap-2">
          <h1 className="font-semibold text-md p-2">Hack The Back</h1>
          <Button
            variant={isHome ? "secondary" : "ghost"}
            asChild
            className="inline-flex justify-start"
          >
            <Link to="/" {...preload("/")}>
              <House />
              Home
            </Link>
          </Button>
          <Button
            variant={isApps ? "secondary" : "ghost"}
            asChild
            className="inline-flex justify-start"
          >
            <Link to="/apps" {...preload("/apps")}>
              <Newspaper />
              Hacker Apps
            </Link>
          </Button>
          <Button
            variant={isRank ? "secondary" : "ghost"}
            asChild
            className="inline-flex justify-start"
          >
            <Link to="/rank" {...preload("/rank")}>
              <Scale />
              Rank
            </Link>
          </Button>
          <Button
            variant={isFood ? "secondary" : "ghost"}
            asChild
            className="inline-flex justify-start"
          >
            <Link to="/food" {...preload("/food")}>
              <UtensilsCrossed />
              Food
            </Link>
          </Button>
          <Button
            variant={isEmails ? "secondary" : "ghost"}
            asChild
            className="inline-flex justify-start"
          >
            <Link to="/emails" {...preload("/emails")}>
              <Mail />
              Emails
            </Link>
          </Button>
        </div>
        <Button
          onClick={logout}
          variant="secondary"
          className="inline-flex justify-start"
        >
          <LogOut />
          Logout
        </Button>
      </div>
    </>
  );
}

export default NavMenu;
