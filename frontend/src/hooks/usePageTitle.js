import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function usePageTitle() {
  const { pathname } = useLocation();

  useEffect(() => {
    switch (pathname) {
      case "/":
        document.title = "Home | Campus Connect";
        break;
      case "/moderate/users":
        document.title = "User Moderation | Campus Connect";
        break;
      case "/discover":
        document.title = "Discover | Campus Connect";
        break;
      case "/qr/scan":
        document.title = "Scan QR | Campus Connect";
        break;
      /*case "/qr/generate":
        document.title = "Generate QR | Campus Connect";
        break;*/
      case "/register":
        document.title = "Register | Campus Connect";
        break;
      case "/login":
        document.title = "Log In | Campus Connect";
        break;
      case "/logout":
        document.title = "Log Out | Campus Connect";
        break;
      case "/signup":
        document.title = "Create Account | Campus Connect";
        break;
      default:
        document.title = "Campus Connect";
    }
  }, [pathname]);
};