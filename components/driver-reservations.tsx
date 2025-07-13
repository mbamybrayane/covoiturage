"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  MapPin,
  Users,
  Phone,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  confirmBooking,
  cancelBooking,
  getDriverBookings,
} from "@/app/actions/bookings";

// Type pour les réservations
type Booking = {
  id: string;
  passenger: {
    id: string;
    name: string;
    avatar: string;
    phone: string;
  };
  trip: {
    id: string;
    from: string;
    to: string;
    date: string;
    time: string;
  };
  seats: number;
  totalPrice: number;
  status: string;
  createdAt: Date;
};

interface DriverReservationsProps {
  userId: string;
}

export function DriverReservations({ userId }: DriverReservationsProps) {
  const [reservations, setReservations] = useState<Booking[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<Booking[]>(
    []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<{
    id: string;
    action: string;
  } | null>(null);

  // Charger les réservations pour les trajets du chauffeur
  useEffect(() => {
    const loadReservations = async () => {
      setIsLoading(true);
      try {
        const response = await getDriverBookings(userId);
        if (response.success && response.bookings) {
          setReservations(response.bookings as Booking[]);
          setFilteredReservations(response.bookings as Booking[]);
        } else {
          setError(
            response.message ||
              "Erreur lors de la récupération des réservations"
          );
        }
      } catch (err) {
        setError(
          "Une erreur est survenue lors de la récupération des réservations"
        );
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadReservations();
  }, [userId]);

  // Filtrer les réservations en fonction de la recherche
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredReservations(reservations);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = reservations.filter(
      (reservation) =>
        reservation.passenger.name.toLowerCase().includes(query) ||
        reservation.trip.from.toLowerCase().includes(query) ||
        reservation.trip.to.toLowerCase().includes(query)
    );

    setFilteredReservations(filtered);
  }, [searchQuery, reservations]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            En attente
          </Badge>
        );
      case "CONFIRMED":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Confirmée
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            Annulée
          </Badge>
        );
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const handleConfirm = async (reservationId: string) => {
    setIsProcessing({ id: reservationId, action: "confirm" });
    try {
      const response = await confirmBooking(reservationId, userId);
      if (response.success) {
        // Mettre à jour la liste des réservations
        setReservations((prevReservations) =>
          prevReservations.map((reservation) =>
            reservation.id === reservationId
              ? { ...reservation, status: "CONFIRMED" }
              : reservation
          )
        );
      } else {
        alert(
          response.message || "Erreur lors de la confirmation de la réservation"
        );
      }
    } catch (err) {
      alert(
        "Une erreur est survenue lors de la confirmation de la réservation"
      );
      console.error(err);
    } finally {
      setIsProcessing(null);
    }
  };

  const handleCancel = async (reservationId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir refuser cette réservation ?")) {
      return;
    }

    setIsProcessing({ id: reservationId, action: "cancel" });
    try {
      const response = await cancelBooking(reservationId, userId, true);
      if (response.success) {
        // Mettre à jour la liste des réservations
        setReservations((prevReservations) =>
          prevReservations.map((reservation) =>
            reservation.id === reservationId
              ? { ...reservation, status: "CANCELLED" }
              : reservation
          )
        );
      } else {
        alert(
          response.message || "Erreur lors de l'annulation de la réservation"
        );
      }
    } catch (err) {
      alert("Une erreur est survenue lors de l'annulation de la réservation");
      console.error(err);
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Réservations reçues
          </h1>
          <p className="text-muted-foreground">
            Gérez les réservations sur vos trajets
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-sm">
            <Input
              placeholder="Rechercher une réservation..."
              className="w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-lg">Chargement des réservations...</span>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredReservations.map((reservation) => (
            <Card
              key={reservation.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage
                        src={reservation.passenger.avatar}
                        alt={reservation.passenger.name}
                      />
                      <AvatarFallback>
                        {reservation.passenger.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">
                        {reservation.passenger.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {reservation.passenger.phone}
                      </CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(reservation.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {reservation.trip.from} → {reservation.trip.to}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {new Date(reservation.trip.date).toLocaleDateString(
                          "fr-FR"
                        )}{" "}
                        à {reservation.trip.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {reservation.seats} place
                        {reservation.seats > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">
                        {reservation.totalPrice.toLocaleString()} FCFA
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Paiement en espèces
                      </p>
                    </div>
                  </div>
                </div>

                {reservation.status === "PENDING" && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => handleConfirm(reservation.id)}
                      disabled={isProcessing?.id === reservation.id}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isProcessing?.id === reservation.id &&
                      isProcessing.action === "confirm" ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4 mr-1" />
                      )}
                      Confirmer
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCancel(reservation.id)}
                      disabled={isProcessing?.id === reservation.id}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      {isProcessing?.id === reservation.id &&
                      isProcessing.action === "cancel" ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <X className="h-4 w-4 mr-1" />
                      )}
                      Refuser
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && filteredReservations.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune réservation</h3>
            <p className="text-muted-foreground">
              Vous n&apos;avez pas encore reçu de réservations sur vos trajets.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
