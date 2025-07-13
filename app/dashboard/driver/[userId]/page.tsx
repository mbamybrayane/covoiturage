// app/dashboard/driver/[userId]/page.tsx

import DriverDashboardClient from "./DriverDashboardClient";

export default function DriverDashboardPage({
  params,
}: {
  params: {
    userId: string;
  };
}) {
  return <DriverDashboardClient userId={params.userId} />;
}
