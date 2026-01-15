import { useEffect, useState } from "react";

export function useShareableUrl(packages: string[]) {
  const [shareUrl, setShareUrl] = useState<string>("");

  useEffect(() => {
    if (packages.length > 0) {
      const url = new URL(window.location.href);
      url.searchParams.set("packages", packages.join(","));
      setShareUrl(url.toString());
    } else {
      setShareUrl(window.location.href);
    }
  }, [packages]);

  const copyToClipboard = async (): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      return true;
    } catch {
      return false;
    }
  };

  return { shareUrl, copyToClipboard };
}
