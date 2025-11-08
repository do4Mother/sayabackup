import { trpc } from "@/trpc/trpc";
import { useEffect } from "react";
import { isMatching, P } from "ts-pattern";

const isCredentials = isMatching({
  client_id: P.string,
  credential: P.string,
});

export default function GoogleSignInButton() {
  const clientUtils = trpc.useUtils();
  const signInMutation = trpc.auth.google.useMutation();

  useEffect(() => {
    const getScript = document.getElementById("google-signin-script");
    if (!getScript) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.id = "google-signin-script";
      document.body.appendChild(script);
    }

    setTimeout(() => {
      // @ts-ignore
      google.accounts.id.initialize({
        client_id:
          "27302795397-e6cpk83cbb6ig7vik2nkgva1h71ge348.apps.googleusercontent.com",
        callback: (response: any) => {
          if (isCredentials(response)) {
            signInMutation.mutate(response, {
              onSuccess() {
                clientUtils.auth.me.invalidate();
              },
            });
          }
        },
      });

      const parent = document.getElementById("google-signin-button");
      // @ts-ignore
      google.accounts.id.renderButton(parent, { theme: "filled_blue" });
    }, 500);
  }, []);

  return <div id="google-signin-button"></div>;
}
