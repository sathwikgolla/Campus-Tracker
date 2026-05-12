import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const positions = new Map();

export function ScrollRestoration() {
  const location = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    const key = location.key;
    if (navigationType === "POP") {
      const saved = positions.get(key);
      window.requestAnimationFrame(() => window.scrollTo(0, saved ?? 0));
    } else {
      window.requestAnimationFrame(() => window.scrollTo(0, 0));
    }

    return () => {
      positions.set(key, window.scrollY);
    };
  }, [location.key, navigationType]);

  return null;
}
