"use server";

import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
import { getSession } from "./auth";

const prisma = new PrismaClient();

// Type pour les données de création de trajet
type CreateTripData = {
  departureCity: string;
  arrivalCity: string;
  departureDate: string;
  departureTime: string;
  availableSeats: number;
  pricePerSeat: number;
  description?: string;
  departureCoords?: string; // Nouvelles coordonnées de départ
  arrivalCoords?: string; // Nouvelles coordonnées d'arrivée
};

// Fonction pour créer un trajet
export async function createTrip(data: CreateTripData, driverId: string) {
  try {
    // Vérifier si l'utilisateur est un chauffeur
    const user = await prisma.user.findUnique({
      where: {
        id: driverId,
      },
      include: {
        driverProfile: true,
      },
    });

    if (!user || !user.isDriver) {
      return {
        success: false,
        message: "Vous n'êtes pas autorisé à créer un trajet",
      };
    }

    // Vérifier que les coordonnées sont présentes
    if (!data.departureCoords || !data.arrivalCoords) {
      return {
        success: false,
        message:
          "Les coordonnées des villes de départ et d'arrivée sont requises",
      };
    }

    // Créer le trajet
    const trip = await prisma.trip.create({
      data: {
        driverId,
        departureCity: data.departureCity,
        arrivalCity: data.arrivalCity,
        departureCoords: data.departureCoords, // Utiliser les coordonnées réelles
        arrivalCoords: data.arrivalCoords, // Utiliser les coordonnées réelles
        departureDate: new Date(data.departureDate),
        departureTime: data.departureTime,
        availableSeats: data.availableSeats,
        pricePerSeat: data.pricePerSeat,
        description: data.description,
      },
    });

    return { success: true, trip };
  } catch (error) {
    console.error("Erreur de création de trajet:", error);
    return {
      success: false,
      message: "Une erreur est survenue lors de la création du trajet",
    };
  }
}

// Fonction pour récupérer les trajets d'un chauffeur
export async function getDriverTrips(driverId: string) {
  try {
    const trips = await prisma.trip.findMany({
      where: {
        driverId,
      },
      include: {
        bookings: true,
      },
      orderBy: {
        departureDate: "asc",
      },
    });

    return { success: true, trips };
  } catch (error) {
    console.error("Erreur de récupération des trajets:", error);
    return {
      success: false,
      message: "Une erreur est survenue lors de la récupération des trajets",
    };
  }
}

// Fonction pour récupérer tous les trajets disponibles avec détails complets
export async function getAllTrips() {
  try {
    // Récupérer tous les trajets actifs et futurs
    const trips = await prisma.trip.findMany({
      where: {
        status: "ACTIVE",
        departureDate: {
          gte: new Date(), // Seulement les trajets futurs
        },
      },
      include: {
        driver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            driverProfile: true,
          },
        },
        bookings: true,
      },
      orderBy: {
        departureDate: "asc",
      },
    });

    // Transformer les données pour le format attendu par le frontend
    const formattedTrips = trips.map((trip) => {
      // Calculer le nombre de places restantes en tenant compte des réservations
      const bookedSeats = trip.bookings.reduce((total, booking) => {
        return booking.status === "CONFIRMED" ? total + booking.seats : total;
      }, 0);

      const remainingSeats = trip.availableSeats - bookedSeats;

      // Estimer la durée du trajet (à remplacer par un calcul réel basé sur les coordonnées)
      const estimateDuration = () => {
        // Logique simplifiée pour estimer la durée
        // Dans une version plus avancée, utiliser les coordonnées et une API de calcul d'itinéraire
        const randomHours = Math.floor(Math.random() * 5) + 2; // Entre 2 et 7 heures
        const randomMinutes = Math.floor(Math.random() * 6) * 10; // 0, 10, 20, 30, 40, ou 50 minutes
        return `${randomHours}h${randomMinutes > 0 ? randomMinutes : ""}`;
      };

      // Construire le nom complet du chauffeur
      const driverName = `${trip.driver.firstName} ${trip.driver.lastName}`;

      // Récupérer les informations du véhicule
      const vehicleInfo = trip.driver.driverProfile
        ? `${trip.driver.driverProfile.vehicleBrand} ${trip.driver.driverProfile.vehicleModel} ${trip.driver.driverProfile.vehicleColor}`
        : "Véhicule non spécifié";

      return {
        id: trip.id,
        driver: {
          id: trip.driver.id,
          name: driverName,
          avatar: trip.driver.avatar || "/placeholder.svg?height=40&width=40",
          rating: 4.8, // À remplacer par une vraie note moyenne
          vehicle: vehicleInfo,
        },
        from: trip.departureCity,
        to: trip.arrivalCity,
        date: trip.departureDate.toISOString().split("T")[0],
        time: trip.departureTime,
        availableSeats: remainingSeats,
        pricePerSeat: trip.pricePerSeat,
        duration: estimateDuration(),
        departureCoords: trip.departureCoords,
        arrivalCoords: trip.arrivalCoords,
      };
    });

    return { success: true, trips: formattedTrips };
  } catch (error) {
    console.error("Erreur de récupération des trajets:", error);
    return {
      success: false,
      message: "Une erreur est survenue lors de la récupération des trajets",
    };
  }
}

// Fonction pour supprimer un trajet
export async function deleteTrip(tripId: string, userId: string) {
  try {
    // Vérifier si l'utilisateur est le propriétaire du trajet
    const trip = await prisma.trip.findUnique({
      where: {
        id: tripId,
      },
    });

    if (!trip) {
      return { success: false, message: "Trajet non trouvé" };
    }

    if (trip.driverId !== userId) {
      return {
        success: false,
        message: "Vous n'êtes pas autorisé à supprimer ce trajet",
      };
    }

    // Supprimer le trajet
    await prisma.trip.delete({
      where: {
        id: tripId,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Erreur de suppression de trajet:", error);
    return {
      success: false,
      message: "Une erreur est survenue lors de la suppression du trajet",
    };
  }
}
