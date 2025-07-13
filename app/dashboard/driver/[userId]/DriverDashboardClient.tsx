"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DriverSidebar } from "@/components/driver-sidebar";
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
import { Car, Users, Calendar, TrendingUp, Euro, MapPin } from "lucide-react";

interface PageParams {
  userId: string;
}

export default function DriverDashboard({ userId }: { userId: string }) {
  // Mock data - statistiques du chauffeur
  const stats = {
    totalTrips: 24,
    totalEarnings: 1250,
    totalPassengers: 67,
    averageRating: 4.8,
    pendingReservations: 3,
    activeTrips: 2,
    completedTrips: 22,
    thisMonthEarnings: 320,
  };

  const recentTrips = [
    {
      id: "1",
      from: "Yaounde",
      to: "Douala",
      date: "2024-01-15",
      passengers: 2,
      earnings: 50,
      status: "ACTIVE",
    },
    {
      id: "2",
      from: "Douala",
      to: "Bafoussam",
      date: "2024-01-20",
      passengers: 1,
      earnings: 30,
      status: "ACTIVE",
    },
  ];

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <DriverSidebar userId={userId} />
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
                Aperçu de votre activité de chauffeur
              </p>
            </div>

            {/* Statistiques principales */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Trajets totaux
                  </CardTitle>
                  <Car className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalTrips}</div>
                  <p className="text-xs text-muted-foreground">+2 ce mois-ci</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Gains totaux
                  </CardTitle>
                  <Euro className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.totalEarnings} FCFA
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +{stats.thisMonthEarnings} FCFA ce mois-ci
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Passagers transportés
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.totalPassengers}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +12 ce mois-ci
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
                    ⭐ Excellent chauffeur
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Activité récente */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Réservations en attente</CardTitle>
                  <CardDescription>
                    {stats.pendingReservations} réservations nécessitent votre
                    attention
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Yaounde → Douala</span>
                      <Badge
                        variant="outline"
                        className="bg-yellow-50 text-yellow-700"
                      >
                        En attente
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Douala → Bafoussam</span>
                      <Badge
                        variant="outline"
                        className="bg-yellow-50 text-yellow-700"
                      >
                        En attente
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Yaounde → Edea</span>
                      <Badge
                        variant="outline"
                        className="bg-yellow-50 text-yellow-700"
                      >
                        En attente
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Trajets actifs</CardTitle>
                  <CardDescription>
                    Vos prochains trajets programmés
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentTrips.map((trip) => (
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
                            <Users className="h-3 w-3" />
                            <span>{trip.passengers} passagers</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-green-600">
                            {trip.earnings} FCFA
                          </p>
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700"
                          >
                            Actif
                          </Badge>
                        </div>
                      </div>
                    ))}
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
