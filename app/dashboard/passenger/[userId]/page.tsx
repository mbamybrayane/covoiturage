"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  Users,
  Calendar,
  MapPin,
  Euro,
  TrendingUp,
  Search,
} from "lucide-react";

export default async function PassengerDashboard({
  params,
}: {
  params: { userId: string };
}) {
  const { userId } = params;
  // Mock data - statistiques du passager
  const stats = {
    totalTrips: 12,
    totalSpent: 450,
    favoriteDestination: "Douala",
    averageRating: 4.9,
    pendingReservations: 1,
    confirmedReservations: 2,
    completedTrips: 9,
    thisMonthTrips: 3,
  };

  const upcomingTrips = [
    {
      id: "1",
      from: "Yaounde",
      to: "Douala",
      date: "2024-01-15",
      driver: "Jean Dupont",
      price: 25,
      status: "CONFIRMED",
    },
    {
      id: "2",
      from: "Douala",
      to: "Bafoussam",
      date: "2024-01-20",
      driver: "Sophie Leblanc",
      price: 30,
      status: "PENDING",
    },
  ];

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <PassengerSidebar userId={userId} />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Tableau de bord</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>

          <div className="p-6 space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Tableau de bord
              </h1>
              <p className="text-muted-foreground">
                Aperçu de votre activité de passager
              </p>
            </div>

            {/* Statistiques principales */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Trajets effectués
                  </CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalTrips}</div>
                  <p className="text-xs text-muted-foreground">
                    +{stats.thisMonthTrips} ce mois-ci
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total dépensé
                  </CardTitle>
                  <Euro className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.totalSpent} FCFA
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Économies réalisées
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Destination favorite
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.favoriteDestination}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    5 trajets vers cette ville
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Note moyenne
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.averageRating}/5
                  </div>
                  <p className="text-xs text-muted-foreground">
                    ⭐ Excellent passager
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Activité récente */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Réservations en cours</CardTitle>
                  <CardDescription>
                    Vos prochains trajets programmés
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {upcomingTrips.map((trip) => (
                      <div
                        key={trip.id}
                        className="flex items-center justify-between"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span>
                              {trip.from} → {trip.to}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {new Date(trip.date).toLocaleDateString("fr-FR")}
                            </span>
                            <span>avec {trip.driver}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-green-600">
                            {trip.price}FCFA
                          </p>
                          <Badge
                            variant="outline"
                            className={
                              trip.status === "CONFIRMED"
                                ? "bg-green-50 text-green-700"
                                : "bg-yellow-50 text-yellow-700"
                            }
                          >
                            {trip.status === "CONFIRMED"
                              ? "Confirmé"
                              : "En attente"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Actions rapides</CardTitle>
                  <CardDescription>
                    Raccourcis vers vos actions fréquentes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Search className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">
                          Rechercher un trajet
                        </span>
                      </div>
                      <Badge variant="secondary">Nouveau</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium">
                          Mes réservations
                        </span>
                      </div>
                      <Badge variant="outline">
                        {stats.pendingReservations +
                          stats.confirmedReservations}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">Mon profil</span>
                      </div>
                      <Badge variant="outline">Vérifié</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
