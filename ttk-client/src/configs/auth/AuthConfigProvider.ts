import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { AuthConfig } from "./AuthConfig";
import React from "react";

export default function AuthConfigProvider({ children }: { children?: React.ReactNode }) {
  const msalInstance = new PublicClientApplication(AuthConfig.settings);

  return React.createElement(
    MsalProvider,
    {
      instance: msalInstance,
    },
    children
  );
}
