import type { MetaFunction } from "@remix-run/node";
import { useEffect, useState } from "react";
import { useNavigate } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "Byte Bash Blitz" },
    { name: "description", content: "Welcome to Byte-Bash-Blitz" },
  ];
};

export default function Index() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    } else {
      navigate("/leaderboard");
    }
  }, [isLoggedIn, navigate]);

  // Simulate login success for demonstration purposes
  useEffect(() => {
    // Replace this with your actual login logic
    const loginSuccess = true; // This should be the result of your login logic
    if (loginSuccess) {
      setIsLoggedIn(true);
    }
  }, []);

  return null;
}
