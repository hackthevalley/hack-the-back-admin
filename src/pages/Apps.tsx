import { useContext, useEffect } from "react";
import { UserContext } from "@/utils/auth";
import { useNavigate } from "react-router";
import NavMenu from "@/components/Navmenu";
import { Applicants } from "@/components/Applicants";

function Apps() {
  const { isAuthenticated } = useContext(UserContext) ?? {};
  const navigate = useNavigate();
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);
  return (
    <div className="flex h-screen">
      <NavMenu />
      <Applicants />
    </div>
  );
}

export default Apps;
