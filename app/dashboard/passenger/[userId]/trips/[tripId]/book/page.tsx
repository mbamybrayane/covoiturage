import BookTripClientPage from "./BookTripClientPage";

export default function Page({
  params,
}: {
  params: { userId: string; tripId: string };
}) {
  return <BookTripClientPage userId={params.userId} tripId={params.tripId} />;
}
