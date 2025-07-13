# Documentation de l'Application de Covoiturage

## Table des matières

1. [Introduction](#introduction)
2. [Architecture de l'application](#architecture-de-lapplication)
3. [Fonctionnalités](#fonctionnalités)
   - [Authentification](#authentification)
   - [Profils utilisateurs](#profils-utilisateurs)
   - [Gestion des trajets](#gestion-des-trajets)
   - [Réservations](#réservations)
   - [Tableau de bord](#tableau-de-bord)
4. [Modèles de données](#modèles-de-données)
5. [Limitations actuelles](#limitations-actuelles)
6. [Déploiement](#déploiement)
7. [Développement futur](#développement-futur)

## Introduction

L'application de covoiturage est une plateforme qui permet aux utilisateurs de partager des trajets entre différentes villes du Cameroun. Elle met en relation des chauffeurs qui proposent des places dans leur véhicule avec des passagers à la recherche de moyens de transport économiques et écologiques.

L'application est développée avec Next.js 15, utilise Prisma comme ORM et une base de données relationnelle pour stocker les informations des utilisateurs, des trajets et des réservations.

## Architecture de l'application

L'application est construite selon l'architecture App Router de Next.js avec une séparation claire entre:

- Les composants d'interface utilisateur (`/components`)
- Les pages de l'application (`/app`)
- Les actions serveur pour les opérations de données (`/app/actions`)
- Les modèles de données Prisma (`/prisma/schema.prisma`)

L'interface utilisateur est développée avec Shadcn UI, offrant une expérience moderne et responsive.

## Fonctionnalités

### Authentification

- **Inscription**: Les utilisateurs peuvent créer un compte en tant que chauffeur ou passager
- **Connexion**: Système de connexion sécurisé avec email et mot de passe
- **Déconnexion**: Les utilisateurs peuvent se déconnecter de l'application

### Profils utilisateurs

#### Profil Chauffeur

- Informations personnelles (nom, prénom, email, téléphone)
- Informations sur le véhicule (marque, modèle, couleur, plaque d'immatriculation)
- Tarif par défaut par kilomètre
- Statut de vérification du compte

#### Profil Passager

- Informations personnelles (nom, prénom, email, téléphone)
- Historique des trajets effectués
- Statut de vérification du compte

### Gestion des trajets

#### Pour les chauffeurs

- **Création de trajet**: Les chauffeurs peuvent créer de nouveaux trajets en spécifiant:

  - Ville de départ et d'arrivée
  - Date et heure de départ
  - Nombre de places disponibles
  - Prix par place
  - Description optionnelle du trajet

- **Visualisation des trajets**: Les chauffeurs peuvent consulter la liste de leurs trajets actifs, passés et à venir

#### Pour les passagers

- **Recherche de trajets**: Les passagers peuvent rechercher des trajets disponibles selon:

  - Ville de départ et d'arrivée
  - Date de voyage
  - Nombre de places nécessaires

- **Visualisation des détails**: Les passagers peuvent consulter les détails d'un trajet avant de réserver:
  - Informations sur le chauffeur
  - Détails du véhicule
  - Prix et horaires
  - Nombre de places disponibles

### Réservations

#### Pour les passagers

- **Réservation de places**: Les passagers peuvent réserver une ou plusieurs places sur un trajet
- **Annulation de réservation**: Possibilité d'annuler une réservation (sous certaines conditions)
- **Visualisation des réservations**: Liste des réservations en attente, confirmées et passées

#### Pour les chauffeurs

- **Gestion des demandes**: Les chauffeurs peuvent accepter ou refuser les demandes de réservation
- **Visualisation des réservations**: Liste des réservations reçues avec statut (en attente, confirmée, annulée)

### Tableau de bord

#### Tableau de bord Chauffeur

- Statistiques sur les trajets effectués
- Revenus générés
- Nombre de passagers transportés
- Note moyenne
- Aperçu des réservations en attente
- Trajets actifs

#### Tableau de bord Passager

- Statistiques sur les trajets effectués
- Total dépensé
- Destination favorite
- Note moyenne en tant que passager
- Aperçu des réservations en cours
- Accès rapide aux fonctionnalités principales

## Modèles de données

L'application utilise les modèles de données suivants:

### User (Utilisateur)

- id: Identifiant unique
- name: Nom complet
- email: Adresse email
- password: Mot de passe (hashé)
- phone: Numéro de téléphone
- role: Rôle (DRIVER ou PASSENGER)
- avatar: URL de l'avatar
- createdAt: Date de création du compte
- updatedAt: Date de dernière mise à jour

### Driver (Chauffeur)

- id: Identifiant unique
- userId: Référence à l'utilisateur
- vehicleBrand: Marque du véhicule
- vehicleModel: Modèle du véhicule
- vehicleColor: Couleur du véhicule
- licensePlate: Plaque d'immatriculation
- defaultRate: Tarif par défaut par kilomètre
- isVerified: Statut de vérification
- createdAt: Date de création
- updatedAt: Date de dernière mise à jour

### Trip (Trajet)

- id: Identifiant unique
- driverId: Référence au chauffeur
- from: Ville de départ
- to: Ville d'arrivée
- date: Date du trajet
- time: Heure de départ
- availableSeats: Nombre de places disponibles
- pricePerSeat: Prix par place
- description: Description du trajet
- status: Statut du trajet (ACTIVE, COMPLETED, CANCELLED)
- createdAt: Date de création
- updatedAt: Date de dernière mise à jour

### Booking (Réservation)

- id: Identifiant unique
- tripId: Référence au trajet
- passengerId: Référence au passager
- seats: Nombre de places réservées
- totalPrice: Prix total
- status: Statut de la réservation (PENDING, CONFIRMED, CANCELLED)
- createdAt: Date de création
- updatedAt: Date de dernière mise à jour

## Limitations actuelles

L'application présente actuellement les limitations suivantes:

- **Modification des trajets**: Les chauffeurs ne peuvent pas encore modifier les détails d'un trajet après sa création
- **Suppression des trajets**: La fonctionnalité de suppression des trajets n'est pas encore implémentée
- **Système de paiement**: Le paiement se fait uniquement en espèces, sans intégration de paiement en ligne
- **Système de notation**: Bien que l'interface affiche des notes, le système de notation n'est pas encore fonctionnel
- **Messagerie**: Pas de système de messagerie entre chauffeurs et passagers
- **Notifications**: Absence de notifications push ou par email

## Déploiement

L'application est conçue pour être déployée sur des plateformes comme Vercel ou Netlify, avec une base de données PostgreSQL hébergée sur des services comme Supabase, Railway ou PlanetScale.

### Prérequis pour le déploiement

- Node.js 18+
- Base de données PostgreSQL
- Variables d'environnement configurées:
  - `DATABASE_URL`: URL de connexion à la base de données
  - `NEXTAUTH_SECRET`: Clé secrète pour l'authentification
  - `NEXTAUTH_URL`: URL de base de l'application

## Développement futur

Les fonctionnalités suivantes sont prévues pour les prochaines versions:

- Implémentation de la modification et suppression des trajets
- Intégration d'un système de paiement en ligne
- Ajout d'un système de messagerie entre utilisateurs
- Mise en place d'un système de notation fonctionnel
- Ajout de notifications par email et push
- Intégration de cartes pour visualiser les trajets
- Application mobile (iOS et Android)
- Support multilingue (français, anglais)
