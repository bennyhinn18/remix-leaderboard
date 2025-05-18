import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useNavigation,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";
import iconImage from "~/assets/bashers.png";
import "./tailwind.css";
import { BottomNav } from "./components/bottom-nav";
import { AuthProvider } from "~/contexts/auth";
import { Suspense, useEffect, useState } from "react";

import "./styles/global-spinner.css";
import "./styles/transitions.css";
import "./styles/loading-effects.css";
import TechLoader from "./components/main-loader";
export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0f172a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Basher Terminal" />
        <meta name="description" content="Track coding journey, earn points, and climb the leaderboard with Byte Bash Blitz" />
        <title>Basher Terminal</title>
        <link rel="apple-touch-icon" href={iconImage} sizes="180x180" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="icon" href={iconImage} />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        <BottomNav />
      </body>
    </html>
  );
}

export default function App() {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    // Mark initial load as complete after first render
    if (isInitialLoad) {
      setIsInitialLoad(false);
    }
    
    // Only show loading indicator for document navigation, not fetcher actions
    // and only when changing to a completely different route
    if (navigation.state === "loading" && navigation.location && 
        navigation.location.pathname !== window.location.pathname.split('?')[0]) {
      setIsLoading(true);
      // Scroll to top for better user experience during navigation
      window.scrollTo(0, 0);
    } else {
      // Add a small delay to ensure smooth transition
      const timeout = setTimeout(() => {
        setIsLoading(false);
      }, 300); // Reduced from 500ms for a snappier feel
      return () => clearTimeout(timeout);
    }
  }, [navigation.state, navigation.location, isInitialLoad]);
  
  return (
    <AuthProvider>
      {/* Only show the PageLoadingIndicator on initial app load or major route changes */}
      {(isInitialLoad || isLoading) && (
        <div style={{ 
          opacity: navigation.state === "idle" ? 0 : 1, 
          transition: "opacity 0.3s ease-out",
          pointerEvents: "none" // Prevent interaction with loading overlay
        }}>
          <TechLoader />
        </div>
      )}
      <Suspense fallback={
        // For component-level suspense, use a less intrusive indicator
        <div className="flex justify-center p-4">
          <div className="loading-spinner-small"></div>
        </div>
      }>
        <Outlet />
      </Suspense>
    </AuthProvider>
  );
}

