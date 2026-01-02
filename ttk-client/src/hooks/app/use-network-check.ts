import { useEffect, useState } from "react";

export function useNetworkCheck() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const updateNetwork = () => setIsOnline(navigator.onLine);

  useEffect(() => {
    window.addEventListener("online", updateNetwork);
    window.addEventListener("offline", updateNetwork);

    return () => {
      window.removeEventListener("online", updateNetwork);
      window.removeEventListener("offline", updateNetwork);
    };
  }, []);

  return isOnline;
}
