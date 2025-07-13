// app/dashboard/driver/[userId]/page.tsx

import { use } from "react";
import DriverDashboardClient from "./DriverDashboardClient";

export default function DriverDashboardPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = use(params);
  return <DriverDashboardClient userId={userId} />;
}
