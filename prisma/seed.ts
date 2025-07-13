import { PrismaClient, TripStatus, BookingStatus } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Début du seeding...");

  // Suppression des données existantes
  await prisma.booking.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.driverProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log("Base de données nettoyée");

  // Création des utilisateurs
  const passwordHash = await hash("password123", 10);

  // Chauffeurs
  const driverKamga = await prisma.user.create({
    data: {
      id: "driver-kamga-001",
      email: "jean.kamga@example.com",
      firstName: "Jean",
      lastName: "Kamga",
      phone: "+237699123456",
      avatar: "https://i.pravatar.cc/150?u=jean.kamga",
      isDriver: true,
      password: passwordHash,
      driverProfile: {
        create: {
          vehicleBrand: "Toyota",
          vehicleModel: "Corolla",
          vehicleColor: "Noir",
          licensePlate: "CE 1234 AB",
          defaultRate: 2000,
        },
      },
    },
  });

  const driverFotso = await prisma.user.create({
    data: {
      id: "driver-fotso-002",
      email: "marie.fotso@example.com",
      firstName: "Marie",
      lastName: "Fotso",
      phone: "+237677456789",
      avatar: "https://i.pravatar.cc/150?u=marie.fotso",
      isDriver: true,
      password: passwordHash,
      driverProfile: {
        create: {
          vehicleBrand: "Honda",
          vehicleModel: "Civic",
          vehicleColor: "Blanc",
          licensePlate: "LT 5678 CD",
          defaultRate: 1800,
        },
      },
    },
  });

  // Passagers
  const passengerMbarga = await prisma.user.create({
    data: {
      id: "passenger-mbarga-001",
      email: "paul.mbarga@example.com",
      firstName: "Paul",
      lastName: "Mbarga",
      phone: "+237655987654",
      avatar: "https://i.pravatar.cc/150?u=paul.mbarga",
      isDriver: false,
      password: passwordHash,
    },
  });

  const passengerNgono = await prisma.user.create({
    data: {
      id: "passenger-ngono-002",
      email: "sophie.ngono@example.com",
      firstName: "Sophie",
      lastName: "Ngono",
      phone: "+237699876543",
      avatar: "https://i.pravatar.cc/150?u=sophie.ngono",
      isDriver: false,
      password: passwordHash,
    },
  });

  const passengerEtoga = await prisma.user.create({
    data: {
      id: "passenger-etoga-003",
      email: "pierre.etoga@example.com",
      firstName: "Pierre",
      lastName: "Etoga",
      phone: "+237677123987",
      avatar: "https://i.pravatar.cc/150?u=pierre.etoga",
      isDriver: false,
      password: passwordHash,
    },
  });

  console.log("Utilisateurs créés");

  // Création des trajets
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  const tripDoualYaounde = await prisma.trip.create({
    data: {
      driverId: driverKamga.id,
      departureCity: "Douala",
      arrivalCity: "Yaoundé",
      departureCoords: "4.0511,9.7679", // Coordonnées approximatives de Douala
      arrivalCoords: "3.8480,11.5021", // Coordonnées approximatives de Yaoundé
      departureDate: tomorrow,
      departureTime: "08:00",
      availableSeats: 4,
      pricePerSeat: 5000, // Prix en FCFA
      description: "Départ de Akwa, arrivée à Mvan. Véhicule climatisé.",
      status: TripStatus.ACTIVE,
    },
  });

  const tripYaoundeBamenda = await prisma.trip.create({
    data: {
      driverId: driverFotso.id,
      departureCity: "Yaoundé",
      arrivalCity: "Bamenda",
      departureCoords: "3.8480,11.5021", // Coordonnées approximatives de Yaoundé
      arrivalCoords: "5.9631,10.1591", // Coordonnées approximatives de Bamenda
      departureDate: tomorrow,
      departureTime: "10:30",
      availableSeats: 3,
      pricePerSeat: 7000, // Prix en FCFA
      description: "Départ du centre-ville, arrêt possible à Bafoussam.",
      status: TripStatus.ACTIVE,
    },
  });

  const tripBafoussamDouala = await prisma.trip.create({
    data: {
      driverId: driverKamga.id,
      departureCity: "Bafoussam",
      arrivalCity: "Douala",
      departureCoords: "5.4768,10.4214", // Coordonnées approximatives de Bafoussam
      arrivalCoords: "4.0511,9.7679", // Coordonnées approximatives de Douala
      departureDate: nextWeek,
      departureTime: "07:00",
      availableSeats: 4,
      pricePerSeat: 6000, // Prix en FCFA
      description: "Départ tôt le matin, voyage direct sans arrêt.",
      status: TripStatus.ACTIVE,
    },
  });

  const tripKribiBuea = await prisma.trip.create({
    data: {
      driverId: driverFotso.id,
      departureCity: "Kribi",
      arrivalCity: "Buea",
      departureCoords: "2.9405,9.9095", // Coordonnées approximatives de Kribi
      arrivalCoords: "4.1537,9.2920", // Coordonnées approximatives de Buea
      departureDate: nextWeek,
      departureTime: "14:00",
      availableSeats: 3,
      pricePerSeat: 8000, // Prix en FCFA
      description: "Trajet côtier avec vue sur la mer. Véhicule confortable.",
      status: TripStatus.ACTIVE,
    },
  });

  console.log("Trajets créés");

  // Création des réservations
  const bookingMbargaToYaounde = await prisma.booking.create({
    data: {
      tripId: tripDoualYaounde.id,
      userId: passengerMbarga.id,
      seats: 2,
      totalPrice: 2 * tripDoualYaounde.pricePerSeat,
      status: BookingStatus.CONFIRMED,
    },
  });

  const bookingNgonoToBamenda = await prisma.booking.create({
    data: {
      tripId: tripYaoundeBamenda.id,
      userId: passengerNgono.id,
      seats: 1,
      totalPrice: tripYaoundeBamenda.pricePerSeat,
      status: BookingStatus.PENDING,
    },
  });

  const bookingEtogaToDouala = await prisma.booking.create({
    data: {
      tripId: tripBafoussamDouala.id,
      userId: passengerEtoga.id,
      seats: 1,
      totalPrice: tripBafoussamDouala.pricePerSeat,
      status: BookingStatus.CONFIRMED,
    },
  });

  const bookingNgonoToBuea = await prisma.booking.create({
    data: {
      tripId: tripKribiBuea.id,
      userId: passengerNgono.id,
      seats: 2,
      totalPrice: 2 * tripKribiBuea.pricePerSeat,
      status: BookingStatus.PENDING,
    },
  });

  const bookingEtogaToYaounde = await prisma.booking.create({
    data: {
      tripId: tripDoualYaounde.id,
      userId: passengerEtoga.id,
      seats: 1,
      totalPrice: tripDoualYaounde.pricePerSeat,
      status: BookingStatus.CANCELLED,
    },
  });

  console.log("Réservations créées");
  console.log("Seeding terminé avec succès!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
