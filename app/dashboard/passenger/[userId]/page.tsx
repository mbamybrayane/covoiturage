// app/dashboard/passenger/[userId]/page.tsx

import { use } from "react";
import PassengerDashboardClient from "./PassengerDashboardClient";

export default function PassengerDashboardPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = use(params);
  return <PassengerDashboardClient userId={userId} />;
}
