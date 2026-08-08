import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useContext, useEffect } from "react";
import { createSession } from "@/api/auth";
import { useNavigate } from "react-router";
import { UserContext } from "@/utils/auth";
import { toast } from "sonner";

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
    try {
      const response = await createSession(formData.username, formData.password);

      if (response.access_token && login) {
        await login(response.access_token);
        navigate("/");
      } else {
        toast.error("Invalid credentials. Please try again.");
      }
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong while logging in.",
      );
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-1/4">
        <h1 className="font-semibold text-lg">
          Sign in to view admin dashboard
        </h1>
        <Label htmlFor="username">Email address</Label>
        <Input
          className="w-full"
          type="email"
          id="username"
          name="username"
          autoComplete="username"
          placeholder="Email"
          required
          onChange={handleChange}
        />
        <Label htmlFor="password">Password</Label>
        <Input
          type="password"
          id="password"
          name="password"
          autoComplete="current-password"
          placeholder="Password"
          required
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
