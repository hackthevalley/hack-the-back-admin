import { useContext } from "react";
import { UserContext } from "@/utils/auth";
import { Button } from "./ui/button";
import { House, Newspaper, LogOut } from "lucide-react";
import { Link } from "react-router";

function NavMenu() {
  const { logout } = useContext(UserContext) ?? {};

  return (
    <div className="flex flex-col min-w-16 w-1/5 max-w-[16rem] border gap-4 justify-between p-4">
      <div className="flex flex-col gap-2">
        <h1 className="font-semibold text-md p-2">Hack The Back</h1>
        <Button
          variant="secondary"
          asChild
          className="inline-flex justify-start"
        >
          <Link to="/">
            <House />
            Home
          </Link>
        </Button>
        <Button variant="ghost" asChild className="inline-flex justify-start">
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
  );
}

export default NavMenu;
