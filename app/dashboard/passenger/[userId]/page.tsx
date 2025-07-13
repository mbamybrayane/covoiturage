// app/dashboard/passenger/[userId]/page.tsx
import PassengerDashboardClient from "./PassengerDashboardClient";

export default function Page({ params }: { params: { userId: string } }) {
  return <PassengerDashboardClient userId={params.userId} />;
}
