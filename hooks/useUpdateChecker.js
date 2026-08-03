import { useEffect, useState } from "react";
import Constants from "expo-constants";

let sessionChecked = false; // In-memory session tracking

export const useUpdateChecker = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [changelog, setChangelog] = useState([]);
  const [remoteVersion, setRemoteVersion] = useState("");

  const localVersion = Constants.expoConfig?.version || "1.0.0";

  useEffect(() => {
    if (sessionChecked) return;

    const checkUpdate = async () => {
      try {
        console.log(`[UpdateChecker] Local version: ${localVersion}. Checking remote update...`);
        const response = await fetch(
          "https://raw.githubusercontent.com/amit265/coderespite/main/version.json",
          {
            headers: {
              "Cache-Control": "no-cache, no-store, must-revalidate",
              Pragma: "no-cache",
              Expires: "0",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch version manifest");
        }

        const data = await response.json();
        const latestVersion = data.latestVersion;
        
        console.log(`[UpdateChecker] Remote version: ${latestVersion}`);

        if (isNewerVersion(latestVersion, localVersion)) {
          setUpdateAvailable(true);
          setChangelog(data.whatsNew || []);
          setRemoteVersion(latestVersion);
          sessionChecked = true; // Mark as shown for the current session
        }
      } catch (error) {
        console.log("[UpdateChecker] Error check failed:", error);
      }
    };

    checkUpdate();
  }, [localVersion]);

  return { updateAvailable, changelog, remoteVersion, setUpdateAvailable };
};

const isNewerVersion = (remote, local) => {
  const parseVersion = (v) => v.split(".").map(Number);
  const rParts = parseVersion(remote);
  const lParts = parseVersion(local);

  for (let i = 0; i < Math.max(rParts.length, lParts.length); i++) {
    const rVal = rParts[i] || 0;
    const lVal = lParts[i] || 0;
    if (rVal > lVal) return true;
    if (rVal < lVal) return false;
  }
  return false;
};
