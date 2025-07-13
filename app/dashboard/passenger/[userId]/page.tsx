import PassengerDashboardClient from "./PassengerDashboardClient";

interface PageParams {
  params: { userId: string };
}

export default function PassengerDashboardPage({ params }: PageParams) {
  return <PassengerDashboardClient userId={params.userId} />;
}
