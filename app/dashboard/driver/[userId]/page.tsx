// app/dashboard/driver/[userId]/page.tsx

import DriverDashboardClient from "./DriverDashboardClient";

interface PageProps {
  params: {
    userId: string;
  };
}

export default function DriverDashboardPage({ params }: PageProps) {
  return <DriverDashboardClient userId={params.userId} />;
}
