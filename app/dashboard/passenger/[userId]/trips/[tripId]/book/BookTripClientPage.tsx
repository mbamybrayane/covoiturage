"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PassengerSidebar } from "@/components/passenger-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MapPin,
  Calendar,
  Car,
  Users,
  CreditCard,
  Loader2,
} from "lucide-react";
import { createBooking, getTripForBooking } from "@/app/actions/bookings";

// Type pour les données du trajet
type TripDetails = {
  id: string;
  driver: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    vehicle: string;
  };
  from: string;
  to: string;
  date: string;
  time: string;
  availableSeats: number;
  pricePerSeat: number;
  description: string;
};

export default function BookTripPage({
  userId,
  tripId,
}: {
  userId: string;
  tripId: string;
}) {
  const router = useRouter();
  const [seats, setSeats] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trip, setTrip] = useState<TripDetails | null>(null);
  const [isLoadingTrip, setIsLoadingTrip] = useState(true);

  // Calculer le prix total
  const totalPrice = trip ? seats * trip.pricePerSeat : 0;

  // Charger les détails du trajet
  useEffect(() => {
    const loadTripDetails = async () => {
      setIsLoadingTrip(true);
      try {
        const response = await getTripForBooking(tripId);
        if (response.success && response.trip) {
          setTrip(response.trip as TripDetails);
        } else {
          setError(
            response.message ||
              "Erreur lors de la récupération des détails du trajet"
          );
        }
      } catch (err) {
        setError(
          "Une erreur est survenue lors de la récupération des détails du trajet"
        );
        console.error(err);
      } finally {
        setIsLoadingTrip(false);
      }
    };

    loadTripDetails();
  }, [tripId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await createBooking({
        tripId: tripId,
        userId: userId,
        seats: seats,
      });

      if (response.success) {
        // Redirection vers les réservations du passager
        router.push(`/dashboard/passenger/${userId}/reservations`);
      } else {
        setError(response.message || "Erreur lors de la réservation");
      }
    } catch (err) {
      setError("Une erreur est survenue lors de la réservation");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <PassengerSidebar userId={userId} />
        <SidebarInset className="flex-1 overflow-auto">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href={`/dashboard/passenger/${userId}`}>
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href={`/dashboard/passenger/${userId}/trips`}>
                    Trajets
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Réserver ce trajet</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>

          <div className="p-6 space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Réserver ce trajet
              </h1>
              {trip && (
                <p className="text-muted-foreground">
                  {trip.from} → {trip.to}
                </p>
              )}
            </div>

            {isLoadingTrip ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-lg">
                  Chargement des détails du trajet...
                </span>
              </div>
            ) : error ? (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-8">
                    <h3 className="text-lg font-semibold text-red-600 mb-2">
                      Erreur
                    </h3>
                    <p>{error}</p>
                    <Button className="mt-4" onClick={() => router.back()}>
                      Retour aux trajets
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : trip ? (
              <div className="max-w-2xl space-y-6">
                {/* Détails du trajet */}
                <Card>
                  <CardHeader>
                    <CardTitle>Détails du trajet</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Chauffeur */}
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={trip.driver.avatar}
                          alt={trip.driver.name}
                        />
                        <AvatarFallback>
                          {trip.driver.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{trip.driver.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Chauffeur
                        </p>
                      </div>
                    </div>

                    {/* Itinéraire */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-green-600">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm font-medium">Départ</span>
                        </div>
                        <p className="text-sm">{trip.from}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-red-600">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm font-medium">Arrivée</span>
                        </div>
                        <p className="text-sm">{trip.to}</p>
                      </div>
                    </div>

                    {/* Date et véhicule */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {new Date(trip.date).toLocaleDateString("fr-FR", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}{" "}
                          à {trip.time}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Car className="h-4 w-4 text-muted-foreground" />
                        <span>{trip.driver.vehicle}</span>
                      </div>
                    </div>

                    {/* Description */}
                    {trip.description && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Description</h4>
                        <p className="text-sm text-muted-foreground">
                          {trip.description}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Réservation */}
                <Card>
                  <CardHeader>
                    <CardTitle>Réservation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
                          {error}
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label
                          htmlFor="seats"
                          className="flex items-center gap-2"
                        >
                          <Users className="h-4 w-4" />
                          Nombre de places
                        </Label>
                        <Input
                          id="seats"
                          type="number"
                          min="1"
                          max={trip.availableSeats}
                          value={seats}
                          onChange={(e) =>
                            setSeats(Number.parseInt(e.target.value))
                          }
                          required
                        />
                        <p className="text-sm text-muted-foreground">
                          {trip.availableSeats} places disponibles
                        </p>
                      </div>

                      {/* Calcul du prix */}
                      <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between text-sm">
                          <span>Prix par place</span>
                          <span>{trip.pricePerSeat.toLocaleString()} FCFA</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Nombre de places</span>
                          <span>{seats}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-semibold">
                          <span>Total</span>
                          <span>{totalPrice.toLocaleString()} FCFA</span>
                        </div>
                      </div>

                      {/* Paiement */}
                      <div className="p-4 bg-orange-50 rounded-lg">
                        <div className="flex items-center gap-2 text-orange-700 mb-2">
                          <CreditCard className="h-4 w-4" />
                          <span className="font-medium">
                            Paiement en espèces
                          </span>
                        </div>
                        <p className="text-sm text-orange-600">
                          Vous paierez directement le chauffeur en espèces (
                          {totalPrice.toLocaleString()} FCFA) au moment du
                          trajet. Préparez la monnaie exacte si possible.
                        </p>
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading || seats > trip.availableSeats}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Réservation en cours...
                          </>
                        ) : (
                          `Réserver ${seats} place${
                            seats > 1 ? "s" : ""
                          } pour ${totalPrice.toLocaleString()} FCFA`
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            ) : null}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
