"use client";

import React from "react";
import { AuthProvider } from "@/lib/providers/AuthProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
