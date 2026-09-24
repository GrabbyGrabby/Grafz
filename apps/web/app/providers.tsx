"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import React from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        loginMethods: ["email", "google", "github"],
        appearance: {
          theme: "dark",
          accentColor: "#10b981", // emerald-500
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
