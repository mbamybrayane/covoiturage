-- Seed the database with sample data
-- Run this after the init-database.sql script

-- Insert sample users
INSERT INTO users (id, email, "firstName", "lastName", phone, "isDriver") VALUES
('user1', 'jean.dupont@email.com', 'Jean', 'Dupont', '0612345678', true),
('user2', 'marie.martin@email.com', 'Marie', 'Martin', '0687654321', false),
('user3', 'pierre.bernard@email.com', 'Pierre', 'Bernard', '0698765432', true),
('user4', 'sophie.durand@email.com', 'Sophie', 'Durand', '0676543210', false);

-- Insert driver profiles
INSERT INTO driver_profiles (id, "userId", "vehicleBrand", "vehicleModel", "vehicleColor", "licensePlate", "defaultRate") VALUES
('driver1', 'user1', 'Renault', 'Clio', 'Bleu', 'AB-123-CD', 25.00),
('driver3', 'user3', 'Peugeot', '308', 'Gris', 'EF-456-GH', 30.00);

-- Insert sample trips
INSERT INTO trips (id, "driverId", "departureCity", "arrivalCity", "departureCoords", "arrivalCoords", "departureDate", "departureTime", "availableSeats", "pricePerSeat", description) VALUES
('trip1', 'user1', 'Paris', 'Lyon', '48.8566,2.3522', '45.7640,4.8357', '2024-12-20', '08:00', 3, 45.00, 'Trajet direct, arrêt possible à Mâcon'),
('trip2', 'user3', 'Marseille', 'Nice', '43.2965,5.3698', '43.7102,7.2620', '2024-12-21', '14:30', 2, 25.00, 'Route côtière, vue sur la mer'),
('trip3', 'user1', 'Toulouse', 'Bordeaux', '43.6047,1.4442', '44.8378,-0.5792', '2024-12-22', '10:15', 4, 35.00, 'Autoroute A62, trajet rapide');

-- Insert sample bookings
INSERT INTO bookings (id, "tripId", "userId", seats, "totalPrice", status) VALUES
('booking1', 'trip1', 'user2', 1, 45.00, 'CONFIRMED'),
('booking2', 'trip2', 'user4', 2, 50.00, 'CONFIRMED');
