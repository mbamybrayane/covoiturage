// app/dashboard/driver/[userId]/page.tsx

import DriverDashboardClient from "./DriverDashboardClient";

interface PageParams {
  params: { userId: string };
}

export default function DriverDashboardPage({ params }: PageParams) {
  return <DriverDashboardClient userId={params.userId} />;
}
