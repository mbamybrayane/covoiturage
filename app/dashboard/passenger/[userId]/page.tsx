// app/dashboard/passenger/[userId]/page.tsx

import PassengerDashboardClient from "./PassengerDashboardClient";

interface PageProps {
  params: {
    userId: string;
  };
}

export default function PassengerDashboardPage({ params }: PageProps) {
  // params n'est pas une promesse, juste un objet { userId }
  return <PassengerDashboardClient userId={params.userId} />;
}
