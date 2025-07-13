"use server";

import { PrismaClient } from "@prisma/client";
import { getSession } from "./auth";

const prisma = new PrismaClient();

// Type pour les données de réservation
export type BookingData = {
  tripId: string;
  userId: string;
  seats: number;
};

// Fonction pour créer une réservation
export async function createBooking(data: BookingData) {
  try {
    // Vérifier si l'utilisateur est connecté
    const session = await getSession();
    if (!session) {
      return {
        success: false,
        message: "Vous devez être connecté pour réserver un trajet",
      };
    }

    // Récupérer les informations du trajet
    const trip = await prisma.trip.findUnique({
      where: {
        id: data.tripId,
      },
      include: {
        bookings: true,
      },
    });

    if (!trip) {
      return { success: false, message: "Trajet non trouvé" };
    }

    // Vérifier si le trajet est actif
    if (trip.status !== "ACTIVE") {
      return { success: false, message: "Ce trajet n'est plus disponible" };
    }

    // Vérifier si la date de départ est dans le futur
    if (new Date(trip.departureDate) < new Date()) {
      return { success: false, message: "Ce trajet est déjà passé" };
    }

    // Calculer le nombre de places déjà réservées
    const bookedSeats = trip.bookings.reduce((total, booking) => {
      return booking.status !== "CANCELLED" ? total + booking.seats : total;
    }, 0);

    // Vérifier s'il y a assez de places disponibles
    if (trip.availableSeats - bookedSeats < data.seats) {
      return {
        success: false,
        message: "Il n'y a pas assez de places disponibles",
      };
    }

    // Calculer le prix total
    const totalPrice = trip.pricePerSeat * data.seats;

    // Créer la réservation
    const booking = await prisma.booking.create({
      data: {
        tripId: data.tripId,
        userId: data.userId,
        seats: data.seats,
        totalPrice: totalPrice,
        status: "PENDING", // Par défaut, la réservation est en attente
      },
    });

    return { success: true, booking };
  } catch (error) {
    console.error("Erreur de création de réservation:", error);
    return {
      success: false,
      message: "Une erreur est survenue lors de la réservation",
    };
  }
}

// Fonction pour récupérer les réservations d'un passager
export async function getPassengerBookings(userId: string) {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        userId: userId,
      },
      include: {
        trip: {
          include: {
            driver: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
                phone: true,
                driverProfile: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transformer les données pour le format attendu par le frontend
    const formattedBookings = bookings.map((booking) => {
      const driverName = `${booking.trip.driver.firstName} ${booking.trip.driver.lastName}`;
      const vehicleInfo = booking.trip.driver.driverProfile
        ? `${booking.trip.driver.driverProfile.vehicleBrand} ${booking.trip.driver.driverProfile.vehicleModel} ${booking.trip.driver.driverProfile.vehicleColor}`
        : "Véhicule non spécifié";

      return {
        id: booking.id,
        driver: {
          id: booking.trip.driver.id,
          name: driverName,
          avatar:
            booking.trip.driver.avatar || "/placeholder.svg?height=40&width=40",
          phone: booking.trip.driver.phone || "",
          vehicle: vehicleInfo,
        },
        trip: {
          id: booking.trip.id,
          from: booking.trip.departureCity,
          to: booking.trip.arrivalCity,
          date: booking.trip.departureDate.toISOString().split("T")[0],
          time: booking.trip.departureTime,
        },
        seats: booking.seats,
        totalPrice: booking.totalPrice,
        status: booking.status,
        createdAt: booking.createdAt,
      };
    });

    return { success: true, bookings: formattedBookings };
  } catch (error) {
    console.error("Erreur de récupération des réservations:", error);
    return {
      success: false,
      message:
        "Une erreur est survenue lors de la récupération des réservations",
    };
  }
}

// Fonction pour récupérer les réservations pour les trajets d'un chauffeur
export async function getDriverBookings(driverId: string) {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        trip: {
          driverId: driverId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            phone: true,
          },
        },
        trip: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transformer les données pour le format attendu par le frontend
    const formattedBookings = bookings.map((booking) => {
      const passengerName = `${booking.user.firstName} ${booking.user.lastName}`;

      return {
        id: booking.id,
        passenger: {
          id: booking.user.id,
          name: passengerName,
          avatar: booking.user.avatar || "/placeholder.svg?height=40&width=40",
          phone: booking.user.phone || "",
        },
        trip: {
          id: booking.trip.id,
          from: booking.trip.departureCity,
          to: booking.trip.arrivalCity,
          date: booking.trip.departureDate.toISOString().split("T")[0],
          time: booking.trip.departureTime,
        },
        seats: booking.seats,
        totalPrice: booking.totalPrice,
        status: booking.status,
        createdAt: booking.createdAt,
      };
    });

    return { success: true, bookings: formattedBookings };
  } catch (error) {
    console.error("Erreur de récupération des réservations:", error);
    return {
      success: false,
      message:
        "Une erreur est survenue lors de la récupération des réservations",
    };
  }
}

// Fonction pour confirmer une réservation
export async function confirmBooking(bookingId: string, driverId: string) {
  try {
    // Vérifier si la réservation existe
    const booking = await prisma.booking.findUnique({
      where: {
        id: bookingId,
      },
      include: {
        trip: true,
      },
    });

    if (!booking) {
      return { success: false, message: "Réservation non trouvée" };
    }

    // Vérifier si l'utilisateur est le propriétaire du trajet
    if (booking.trip.driverId !== driverId) {
      return {
        success: false,
        message: "Vous n'êtes pas autorisé à confirmer cette réservation",
      };
    }

    // Mettre à jour le statut de la réservation
    const updatedBooking = await prisma.booking.update({
      where: {
        id: bookingId,
      },
      data: {
        status: "CONFIRMED",
      },
    });

    return { success: true, booking: updatedBooking };
  } catch (error) {
    console.error("Erreur de confirmation de réservation:", error);
    return {
      success: false,
      message:
        "Une erreur est survenue lors de la confirmation de la réservation",
    };
  }
}

// Fonction pour annuler une réservation (par le chauffeur ou le passager)
export async function cancelBooking(
  bookingId: string,
  userId: string,
  isDriver: boolean
) {
  try {
    // Vérifier si la réservation existe
    const booking = await prisma.booking.findUnique({
      where: {
        id: bookingId,
      },
      include: {
        trip: true,
      },
    });

    if (!booking) {
      return { success: false, message: "Réservation non trouvée" };
    }

    // Vérifier les autorisations
    if (isDriver) {
      // Si c'est le chauffeur qui annule
      if (booking.trip.driverId !== userId) {
        return {
          success: false,
          message: "Vous n'êtes pas autorisé à annuler cette réservation",
        };
      }
    } else {
      // Si c'est le passager qui annule
      if (booking.userId !== userId) {
        return {
          success: false,
          message: "Vous n'êtes pas autorisé à annuler cette réservation",
        };
      }
    }

    // Mettre à jour le statut de la réservation
    const updatedBooking = await prisma.booking.update({
      where: {
        id: bookingId,
      },
      data: {
        status: "CANCELLED",
      },
    });

    return { success: true, booking: updatedBooking };
  } catch (error) {
    console.error("Erreur d'annulation de réservation:", error);
    return {
      success: false,
      message: "Une erreur est survenue lors de l'annulation de la réservation",
    };
  }
}

// Fonction pour récupérer les détails d'un trajet pour la réservation
export async function getTripForBooking(tripId: string) {
  try {
    const trip = await prisma.trip.findUnique({
      where: {
        id: tripId,
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
        bookings: {
          where: {
            status: {
              in: ["CONFIRMED", "PENDING"],
            },
          },
        },
      },
    });

    if (!trip) {
      return { success: false, message: "Trajet non trouvé" };
    }

    // Calculer le nombre de places déjà réservées
    const bookedSeats = trip.bookings.reduce((total, booking) => {
      return total + booking.seats;
    }, 0);

    // Calculer le nombre de places restantes
    const remainingSeats = trip.availableSeats - bookedSeats;

    // Construire le nom complet du chauffeur
    const driverName = `${trip.driver.firstName} ${trip.driver.lastName}`;

    // Récupérer les informations du véhicule
    const vehicleInfo = trip.driver.driverProfile
      ? `${trip.driver.driverProfile.vehicleBrand} ${trip.driver.driverProfile.vehicleModel} ${trip.driver.driverProfile.vehicleColor}`
      : "Véhicule non spécifié";

    const formattedTrip = {
      id: trip.id,
      driver: {
        id: trip.driver.id,
        name: driverName,
        avatar: trip.driver.avatar || "/placeholder.svg?height=60&width=60",
        rating: 4.8, // À remplacer par une vraie note moyenne
        vehicle: vehicleInfo,
      },
      from: trip.departureCity,
      to: trip.arrivalCity,
      date: trip.departureDate.toISOString().split("T")[0],
      time: trip.departureTime,
      availableSeats: remainingSeats,
      pricePerSeat: trip.pricePerSeat,
      description: trip.description || "",
    };

    return { success: true, trip: formattedTrip };
  } catch (error) {
    console.error("Erreur de récupération du trajet:", error);
    return {
      success: false,
      message: "Une erreur est survenue lors de la récupération du trajet",
    };
  }
}
