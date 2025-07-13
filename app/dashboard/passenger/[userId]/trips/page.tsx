import PassengerTripsPage from "./PassengerTripsClientPage"; // <- ton composant client déplacé ici

export default function Page({ params }: { params: { userId: string } }) {
  return <PassengerTripsPage userId={params.userId} />;
}
