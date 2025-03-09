import { Piechart } from "../components/Piechart";
import { useContext, useEffect } from "react";
import { UserContext } from "@/utils/auth";
import { useNavigate } from "react-router";
import NavMenu from "@/components/Navmenu";

function Home() {
  const { isAuthenticated } = useContext(UserContext) ?? {};
  const navigate = useNavigate();
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);
  return (
    <div className="flex h-screen gap-16">
      <NavMenu />
      <Piechart />
    </div>
  );
}

export default Home;
