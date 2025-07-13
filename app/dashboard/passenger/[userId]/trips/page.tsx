import { use } from "react";
import PassengerTripsPage from "./PassengerTripsClientPage"; // <- ton composant client déplacé ici

export default function Page({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = use(params);
  return <PassengerTripsPage userId={userId} />;
}
