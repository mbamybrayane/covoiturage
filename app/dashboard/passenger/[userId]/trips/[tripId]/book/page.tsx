import { use } from "react";
import BookTripClientPage from "./BookTripClientPage";

export default function Page({
  params,
}: {
  params: Promise<{ userId: string; tripId: string }>;
}) {
  const { userId, tripId } = use(params);
  return <BookTripClientPage userId={userId} tripId={tripId} />;
}
