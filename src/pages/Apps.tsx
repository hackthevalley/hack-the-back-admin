import { useContext, useEffect } from "react";
import { UserContext } from "@/utils/auth";
import { useNavigate } from "react-router";
import NavMenu from "@/components/Navmenu";
import Applicant from "@/components/Applicant";

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
      <Applicant
        first_name="Conrad"
        last_name="Mo"
        email="conrad.mo@mail.utoronto.ca"
        status="Applied"
        updated_at="yes"
        created_at="yes"
      />
    </div>
  );
}

export default Apps;
