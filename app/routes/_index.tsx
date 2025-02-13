import type { MetaFunction } from "@remix-run/node";
import { useEffect, useState } from "react";
import { useNavigate } from "@remix-run/react";
import { LoaderFunction, redirect } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Byte Bash Blitz" },
    { name: "description", content: "Welcome to Byte-Bash-Blitz" },
  ];
};
export const loader: LoaderFunction = async ({ request }) => {
  // Replace this with your actual authentication logic
  const isLoggedIn = true; // This should be the result of your authentication logic

  if (isLoggedIn) {
    return redirect("/leaderboard");
  } else {
    return redirect("/login");
  }
};
export default function Index() {
  return null;
}
