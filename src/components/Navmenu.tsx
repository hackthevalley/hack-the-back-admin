import { useContext } from "react";
import { UserContext } from "@/utils/auth";
import { Button } from "./ui/button";
import { House, Newspaper, LogOut, Menu } from "lucide-react";
import { useLocation, Link } from "react-router";
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

  return (
    <>
      {/* Mobile */}
      <div className="p-1 lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              aria-label="Open navigation menu"
              className="mt-6 ml-5 bg-secondary"
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
                    <Link to="/" aria-current={isHome ? "page" : undefined}>
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
                    <Link to="/apps" aria-current={isApps ? "page" : undefined}>
                      <Newspaper className="h-4 w-4" />
                      Hacker Apps
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
            <Link to="/">
              <House />
              Home
            </Link>
          </Button>
          <Button
            variant={isApps ? "secondary" : "ghost"}
            asChild
            className="inline-flex justify-start"
          >
            <Link to="/apps">
              <Newspaper />
              Hacker Apps
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
