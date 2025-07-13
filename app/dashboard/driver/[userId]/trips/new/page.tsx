/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Calendar, Users, Euro, Loader2, Check } from "lucide-react";
import { createTrip } from "@/app/actions/trips";

// Type pour les suggestions de l'API OpenCage Geocoder
interface GeocodeSuggestion {
  formatted: string;
  geometry: {
    lat: number;
    lng: number;
  };
}

export default function CreateTripPage({
  params,
}: {
  params: { userId: string };
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // États pour suggestions, affichage et chargement
  const [departureSuggestions, setDepartureSuggestions] = useState<
    GeocodeSuggestion[]
  >([]);
  const [arrivalSuggestions, setArrivalSuggestions] = useState<
    GeocodeSuggestion[]
  >([]);
  const [showDepartureSuggestions, setShowDepartureSuggestions] =
    useState(false);
  const [showArrivalSuggestions, setShowArrivalSuggestions] = useState(false);
  const [isLoadingDeparture, setIsLoadingDeparture] = useState(false);
  const [isLoadingArrival, setIsLoadingArrival] = useState(false);

  // Données du formulaire
  const [tripData, setTripData] = useState({
    departureCity: "",
    arrivalCity: "",
    departureDate: "",
    departureTime: "",
    availableSeats: 1,
    pricePerSeat: 0,
    description: "",
    departureCoords: "",
    arrivalCoords: "",
  });

  // Refs pour fermer dropdowns
  const departureRef = useRef<HTMLDivElement>(null);
  const arrivalRef = useRef<HTMLDivElement>(null);

  // Refs pour debounce timers
  const departureTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const arrivalTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fermer suggestions en cliquant en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        departureRef.current &&
        !departureRef.current.contains(event.target as Node)
      ) {
        setShowDepartureSuggestions(false);
      }
      if (
        arrivalRef.current &&
        !arrivalRef.current.contains(event.target as Node)
      ) {
        setShowArrivalSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Recherche géocodée avec debounce et paramètres
  const searchLocation = async (
    query: string,
    isArrival: boolean,
    setLoading: (b: boolean) => void,
    setSuggestions: (arr: GeocodeSuggestion[]) => void,
    setShow: (b: boolean) => void,
    timeoutRef: React.MutableRefObject<NodeJS.Timeout | null>
  ) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShow(false);
      return;
    }
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const apiKey = process.env.NEXT_PUBLIC_OPENCAGE_KEY;
        if (!apiKey) {
          console.error("Clé API OpenCage non définie");
          return;
        }
        const paramsUrl = new URLSearchParams({
          q: query,
          key: apiKey,
          language: "fr",
          limit: "5",
          countrycode: "cm",
        });
        const url = `https://api.opencagedata.com/geocode/v1/json?${paramsUrl.toString()}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.results?.length) {
          setSuggestions(data.results);
          setShow(true);
        } else {
          setSuggestions([]);
          setShow(false);
        }
      } catch (err) {
        console.error("Erreur lors de la recherche géocodée:", err);
        setSuggestions([]);
        setShow(false);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  // Gestion des champs de localisation
  const handleLocationInputChange = (
    field: "departureCity" | "arrivalCity",
    value: string
  ) => {
    setTripData((prev) => ({
      ...prev,
      [field]: value,
      [field === "departureCity" ? "departureCoords" : "arrivalCoords"]: "",
    }));
    if (field === "departureCity") {
      searchLocation(
        value,
        false,
        setIsLoadingDeparture,
        setDepartureSuggestions,
        setShowDepartureSuggestions,
        departureTimeoutRef
      );
    } else {
      searchLocation(
        value,
        true,
        setIsLoadingArrival,
        setArrivalSuggestions,
        setShowArrivalSuggestions,
        arrivalTimeoutRef
      );
    }
  };

  // Sélection d'une suggestion
  const handleSelectSuggestion = (
    suggestion: GeocodeSuggestion,
    field: "departureCity" | "arrivalCity"
  ) => {
    const coords = `${suggestion.geometry.lat},${suggestion.geometry.lng}`;
    setTripData((prev) => ({
      ...prev,
      [field]: suggestion.formatted,
      [field === "departureCity" ? "departureCoords" : "arrivalCoords"]: coords,
    }));
    if (field === "departureCity") {
      setShowDepartureSuggestions(false);
    } else {
      setShowArrivalSuggestions(false);
    }
  };

  // Champs classiques
  const handleInputChange = (field: string, value: string | number) => {
    setTripData((prev) => ({ ...prev, [field]: value }));
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    if (!tripData.departureCoords || !tripData.arrivalCoords) {
      setError("Veuillez sélectionner des villes valides dans les suggestions");
      setIsLoading(false);
      return;
    }
    try {
      const res = await createTrip(tripData, params.userId);
      if (res.success) {
        router.push(`/dashboard/driver/${params.userId}/trips`);
      } else {
        setError(res.message || "Erreur lors de la création du trajet");
      }
    } catch (err) {
      console.error(err);
      setError("Une erreur est survenue lors de la création du trajet");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <DriverSidebar userId={params.userId} />
        <SidebarInset className="flex-1">
          <header className="flex h-16 items-center gap-2 border-b px-4">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href={`/dashboard/driver/${params.userId}`}>
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink
                    href={`/dashboard/driver/${params.userId}/trips`}
                  >
                    Mes trajets
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Nouveau trajet</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <div className="p-6 max-w-2xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Créer un trajet</h1>
              <p className="text-muted-foreground">
                Proposez votre trajet à la communauté
              </p>
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
                {error}
              </div>
            )}
            <Card>
              <CardHeader>
                <CardTitle>Informations du trajet</CardTitle>
                <CardDescription>
                  Remplissez les détails de votre trajet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Itinéraire */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-blue-600" /> Itinéraire
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Ville de départ */}
                      <div className="relative" ref={departureRef}>
                        <Label htmlFor="departureCity">Point de départ</Label>
                        <Input
                          id="departureCity"
                          placeholder="Douala"
                          value={tripData.departureCity}
                          onChange={(e) =>
                            handleLocationInputChange(
                              "departureCity",
                              e.target.value
                            )
                          }
                          required
                          className={
                            tripData.departureCoords
                              ? "pr-8 border-green-500"
                              : ""
                          }
                        />
                        {isLoadingDeparture && (
                          <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                        {tripData.departureCoords && (
                          <Check className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                        )}
                        {showDepartureSuggestions && (
                          <ul className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                            {departureSuggestions.map((s, i) => (
                              <li
                                key={i}
                                className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectSuggestion(s, "departureCity");
                                }}
                              >
                                {s.formatted}
                              </li>
                            ))}
                          </ul>
                        )}
                        <input
                          type="hidden"
                          name="departureCoords"
                          value={tripData.departureCoords}
                        />
                      </div>
                      {/* Ville d'arrivée */}
                      <div className="relative" ref={arrivalRef}>
                        <Label htmlFor="arrivalCity">Point d'arrivée</Label>
                        <Input
                          id="arrivalCity"
                          placeholder="Yaoundé"
                          value={tripData.arrivalCity}
                          onChange={(e) =>
                            handleLocationInputChange(
                              "arrivalCity",
                              e.target.value
                            )
                          }
                          required
                          className={
                            tripData.arrivalCoords
                              ? "pr-8 border-green-500"
                              : ""
                          }
                        />
                        {isLoadingArrival && (
                          <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                        {tripData.arrivalCoords && (
                          <Check className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                        )}
                        {showArrivalSuggestions && (
                          <ul className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                            {arrivalSuggestions.map((s, i) => (
                              <li
                                key={i}
                                className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectSuggestion(s, "arrivalCity");
                                }}
                              >
                                {s.formatted}
                              </li>
                            ))}
                          </ul>
                        )}
                        <input
                          type="hidden"
                          name="arrivalCoords"
                          value={tripData.arrivalCoords}
                        />
                      </div>
                    </div>
                  </div>
                  {/* Date et heure */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-green-600" /> Date et
                      heure
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="departureDate">Date de départ</Label>
                        <Input
                          id="departureDate"
                          type="date"
                          value={tripData.departureDate}
                          onChange={(e) =>
                            handleInputChange("departureDate", e.target.value)
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="departureTime">Heure de départ</Label>
                        <Input
                          id="departureTime"
                          type="time"
                          value={tripData.departureTime}
                          onChange={(e) =>
                            handleInputChange("departureTime", e.target.value)
                          }
                          required
                        />
                      </div>
                    </div>
                  </div>
                  {/* Places et tarif */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Users className="h-5 w-5 text-purple-600" /> Places et
                      tarif
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="availableSeats">
                          Places disponibles
                        </Label>
                        <Input
                          id="availableSeats"
                          type="number"
                          min="1"
                          max="8"
                          value={tripData.availableSeats}
                          onChange={(e) =>
                            handleInputChange(
                              "availableSeats",
                              parseInt(e.target.value)
                            )
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pricePerSeat">
                          Prix par place (FCFA)
                        </Label>
                        <Input
                          id="pricePerSeat"
                          type="number"
                          min="0"
                          step="0.5"
                          value={tripData.pricePerSeat}
                          onChange={(e) =>
                            handleInputChange(
                              "pricePerSeat",
                              parseFloat(e.target.value)
                            )
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-700 mb-2">
                        <Euro className="h-4 w-4" />{" "}
                        <span className="font-medium">Paiement en espèces</span>
                      </div>
                      <p className="text-sm text-blue-600">
                        Le paiement se fera directement en espèces avec les
                        passagers lors du trajet.
                      </p>
                    </div>
                  </div>
                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (optionnel)</Label>
                    <Textarea
                      id="description"
                      placeholder="Ajoutez des détails sur votre trajet, points de rendez-vous, etc."
                      value={tripData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      rows={3}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                        Création en cours...
                      </>
                    ) : (
                      "Créer le trajet"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
