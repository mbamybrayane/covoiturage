"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Plus, Edit, Trash2 } from "lucide-react";
import { getDriverTrips, deleteTrip } from "@/app/actions/trips";

interface Trip {
  id: string;
  departureCity: string;
  arrivalCity: string;
  departureDate: Date;
  departureTime: string;
  availableSeats: number;
  pricePerSeat: number;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED";
  bookings: Array<any>;
}

interface DriverTripsProps {
  userId: string;
}

export function DriverTrips({ userId }: DriverTripsProps) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrips = async () => {
      setIsLoading(true);
      try {
        const response = await getDriverTrips(userId);
        if (response.success && response.trips) {
          setTrips(response.trips as Trip[]);
        } else {
          setError(
            response.message || "Erreur lors de la récupération des trajets"
          );
        }
      } catch (err) {
        setError("Une erreur est survenue lors de la récupération des trajets");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrips();
  }, [userId]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Actif
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            Terminé
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            Annulé
          </Badge>
        );
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const handleDeleteTrip = async (tripId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce trajet ?")) {
      try {
        const response = await deleteTrip(tripId, userId);
        if (response.success) {
          // Mettre à jour la liste des trajets
          setTrips((prevTrips) =>
            prevTrips.filter((trip) => trip.id !== tripId)
          );
        } else {
          alert(response.message || "Erreur lors de la suppression du trajet");
        }
      } catch (err) {
        alert("Une erreur est survenue lors de la suppression du trajet");
        console.error(err);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mes trajets</h1>
            <p className="text-muted-foreground">Chargement en cours...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mes trajets</h1>
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mes trajets</h1>
          <p className="text-muted-foreground">Gérez vos trajets proposés</p>
        </div>
        <Link href={`/dashboard/driver/${userId}/trips/new`}>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Créer un trajet
          </Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {trips.map((trip) => (
          <Card key={trip.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {trip.departureCity} → {trip.arrivalCity}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(trip.departureDate).toLocaleDateString(
                      "fr-FR"
                    )} à {trip.departureTime}
                  </CardDescription>
                </div>
                {getStatusBadge(trip.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Places disponibles
                  </p>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{trip.availableSeats}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Prix par place
                  </p>
                  <p className="font-medium text-green-600">
                    {trip.pricePerSeat}FCFA
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Réservations</p>
                  <p className="font-medium">
                    {trip.bookings.length} réservation
                    {trip.bookings.length > 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {trip.status === "ACTIVE" && (
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4 mr-1" />
                    Modifier
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteTrip(trip.id)}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Supprimer
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {trips.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun trajet</h3>
            <p className="text-muted-foreground mb-4">
              Vous n'avez pas encore créé de trajet.
            </p>
            <Link href={`/dashboard/driver/${userId}/trips/new`}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Créer votre premier trajet
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
