"use client";

import type React from "react";

import { useState, useEffect, useMemo } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, MapPin, Calendar, Users, Car, Loader2 } from "lucide-react";
import { getAllTrips } from "@/app/actions/trips";

// Type pour les trajets
type Trip = {
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
  duration: string;
  departureCoords?: string;
  arrivalCoords?: string;
};

export default function PassengerTripsPage({ userId }: { userId: string }) {
  const router = useRouter();
  const [searchData, setSearchData] = useState({
    from: "",
    to: "",
    date: "",
    passengers: 1,
  });

  const [allTrips, setAllTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger tous les trajets disponibles au chargement de la page
  useEffect(() => {
    const loadTrips = async () => {
      setIsLoading(true);
      try {
        const response = await getAllTrips();
        if (response.success && response.trips) {
          setAllTrips(response.trips as Trip[]);
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

    loadTrips();
  }, []);

  // Filtrer les trajets côté client en fonction des critères de recherche
  const filteredTrips = useMemo(() => {
    return allTrips.filter((trip) => {
      // Filtrer par ville de départ
      if (
        searchData.from &&
        !trip.from.toLowerCase().includes(searchData.from.toLowerCase())
      ) {
        return false;
      }

      // Filtrer par ville d'arrivée
      if (
        searchData.to &&
        !trip.to.toLowerCase().includes(searchData.to.toLowerCase())
      ) {
        return false;
      }

      // Filtrer par date
      if (searchData.date && trip.date !== searchData.date) {
        return false;
      }

      // Filtrer par nombre de passagers
      if (searchData.passengers > trip.availableSeats) {
        return false;
      }

      return true;
    });
  }, [allTrips, searchData]);

  // Fonction pour rechercher des trajets (filtrage côté client)
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Le filtrage est automatique grâce au useMemo
  };

  const handleBookTrip = (tripId: string) => {
    router.push(`/dashboard/passenger/${userId}/trips/${tripId}/book`);
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
                <BreadcrumbItem>
                  <BreadcrumbPage>Trajets</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>

          <div className="p-6 space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Rechercher un trajet
              </h1>
              <p className="text-muted-foreground">
                Trouvez le trajet parfait pour votre destination
              </p>
            </div>

            {/* Formulaire de recherche */}
            <Card>
              <CardHeader>
                <CardTitle>Où souhaitez-vous aller ?</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="from">Départ</Label>
                      <Input
                        id="from"
                        placeholder="Yaoundé"
                        value={searchData.from}
                        onChange={(e) =>
                          setSearchData({ ...searchData, from: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="to">Arrivée</Label>
                      <Input
                        id="to"
                        placeholder="Douala"
                        value={searchData.to}
                        onChange={(e) =>
                          setSearchData({ ...searchData, to: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={searchData.date}
                        onChange={(e) =>
                          setSearchData({ ...searchData, date: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="passengers">Passagers</Label>
                      <Input
                        id="passengers"
                        type="number"
                        min="1"
                        max="8"
                        value={searchData.passengers}
                        onChange={(e) =>
                          setSearchData({
                            ...searchData,
                            passengers: Number.parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full md:w-auto">
                    <Search className="h-4 w-4 mr-2" />
                    Filtrer les résultats
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Message d'erreur */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
                {error}
              </div>
            )}

            {/* Résultats */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">
                  Trajets disponibles
                  {!isLoading && (
                    <span className="text-sm font-normal text-muted-foreground ml-2">
                      ({filteredTrips.length}{" "}
                      {filteredTrips.length > 1
                        ? "trajets trouvés"
                        : "trajet trouvé"}
                      )
                    </span>
                  )}
                </h2>
                {isLoading && (
                  <div className="flex items-center text-muted-foreground">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Chargement...
                  </div>
                )}
              </div>

              {!isLoading &&
                filteredTrips.map((trip) => (
                  <Card
                    key={trip.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
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
                            <h3 className="font-semibold">
                              {trip.driver.name}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Car className="h-3 w-3" />
                              <span>{trip.driver.vehicle}</span>
                              <Badge variant="secondary" className="ml-2">
                                ⭐ {trip.driver.rating}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">
                            {trip.pricePerSeat.toLocaleString()} FCFA
                          </p>
                          <p className="text-sm text-muted-foreground">
                            par personne
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {trip.from} → {trip.to}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {new Date(trip.date).toLocaleDateString("fr-FR")} à{" "}
                            {trip.time}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {trip.availableSeats} places disponibles
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Durée: {trip.duration}</span>
                          <span>Paiement en espèces</span>
                        </div>
                        <Button
                          onClick={() => handleBookTrip(trip.id)}
                          disabled={trip.availableSeats < searchData.passengers}
                        >
                          Réserver
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

              {!isLoading && filteredTrips.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      Aucun trajet trouvé
                    </h3>
                    <p className="text-muted-foreground">
                      Essayez de modifier vos critères de recherche ou revenez
                      plus tard.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
