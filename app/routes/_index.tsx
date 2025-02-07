import type { MetaFunction } from "@remix-run/node";
import { useEffect } from "react";
import { useNavigate } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "Byte Bash Blitz" },
    { name: "description", content: "Welcome to Byte-Bash-Blitz" },
  ];
};

export default function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/leaderboard");
  }, [navigate]);

  return null;
}
