import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useContext, useEffect } from "react";
import fetchInstance from "@/utils/api";
import { useNavigate } from "react-router";
import { UserContext } from "@/utils/auth";

function Login() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const navigate = useNavigate();
  const { login, isAuthenticated } = useContext(UserContext) ?? {};
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const urlEncodedData = new URLSearchParams();
    urlEncodedData.append("username", formData.username);
    urlEncodedData.append("password", formData.password);
    try {
      const response = await fetchInstance("account/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: urlEncodedData.toString(),
      });
      if (response.access_token && login) {
        await login(response.access_token);
        navigate("/");
      }
    } catch (err) {
      console.log(err);
    }
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };
  return (
    <div className="flex justify-center items-center h-screen">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4  w-1/4">
        <h1 className="font-semibold text-lg">
          Sign in to view admin dashboard
        </h1>
        <Label htmlFor="email">Email address</Label>
        <Input
          className="w-full"
          type="email"
          id="username"
          placeholder="Email"
          onChange={handleChange}
        />
        <Label htmlFor="email">Password</Label>
        <Input
          type="password"
          id="password"
          placeholder="Password"
          onChange={handleChange}
        />
        <Button type="submit" variant="secondary" className="w-min">
          Sign In
        </Button>
      </form>
    </div>
  );
}

export default Login;
