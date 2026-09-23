"use client";
import { useEffect, useState } from "react";
import { brand } from "@/lib/brand";
interface InstallEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}
export function Pwa() {
  const [install, setInstall] = useState<InstallEvent | null>(null);
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production")
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    const onInstall = (event: Event) => {
      event.preventDefault();
      setInstall(event as InstallEvent);
    };
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("beforeinstallprompt", onInstall);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("beforeinstallprompt", onInstall);
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  return (
    <>
      {offline && (
        <div className="connection" role="status">
          You’re offline. Reconnect before updating your account or
          participation.
        </div>
      )}
      {install && (
        <button
          className="install button secondary small"
          onClick={async () => {
            await install.prompt();
            await install.userChoice;
            setInstall(null);
          }}
        >
          Install {brand.name}
        </button>
      )}
    </>
  );
}
