"use client";

import React from "react";
import { PassDashboardClient } from "@/components/dashboard/pass-dashboard-client";

interface UserDashboardProps {
  onViewShowcase?: () => void;
}

export function UserDashboard({ onViewShowcase }: UserDashboardProps) {
  return <PassDashboardClient onViewShowcase={onViewShowcase} />;
}
