"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Car, Edit, Save, X } from "lucide-react"

interface DriverProfileProps {
  userId: string
}

export function DriverProfile({ userId }: DriverProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    firstName: "Jean",
    lastName: "Dupont",
    email: "jean.dupont@email.com",
    phone: "+33 6 12 34 56 78",
    avatar: "/placeholder.svg?height=100&width=100",
    vehicleBrand: "Renault",
    vehicleModel: "Clio",
    vehicleColor: "Bleu",
    licensePlate: "AB-123-CD",
    defaultRate: 0.15,
  })

  const handleSave = () => {
    // Ici vous feriez l'appel API pour sauvegarder
    setIsEditing(false)
  }

  const handleCancel = () => {
    // Reset des changements
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mon Profil</h1>
          <p className="text-muted-foreground">Gérez vos informations personnelles et de véhicule</p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </Button>
        ) : (
          <div className="space-x-2">
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Sauvegarder
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Annuler
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Informations personnelles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Car className="h-4 w-4 text-blue-600" />
              </div>
              Informations personnelles
            </CardTitle>
            <CardDescription>Vos informations de base</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.avatar || "/placeholder.svg"} alt="Avatar" />
                <AvatarFallback>
                  {profile.firstName[0]}
                  {profile.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Chauffeur vérifié
                </Badge>
                <p className="text-sm text-muted-foreground">Membre depuis janvier 2024</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  value={profile.firstName}
                  onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  value={profile.lastName}
                  onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                disabled={!isEditing}
              />
            </div>
          </CardContent>
        </Card>

        {/* Informations véhicule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Car className="h-4 w-4 text-green-600" />
              </div>
              Mon véhicule
            </CardTitle>
            <CardDescription>Informations sur votre véhicule</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehicleBrand">Marque</Label>
                <Input
                  id="vehicleBrand"
                  value={profile.vehicleBrand}
                  onChange={(e) => setProfile({ ...profile, vehicleBrand: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicleModel">Modèle</Label>
                <Input
                  id="vehicleModel"
                  value={profile.vehicleModel}
                  onChange={(e) => setProfile({ ...profile, vehicleModel: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicleColor">Couleur</Label>
              <Input
                id="vehicleColor"
                value={profile.vehicleColor}
                onChange={(e) => setProfile({ ...profile, vehicleColor: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="licensePlate">Plaque d'immatriculation</Label>
              <Input
                id="licensePlate"
                value={profile.licensePlate}
                onChange={(e) => setProfile({ ...profile, licensePlate: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultRate">Tarif par défaut (FCFA/km)</Label>
              <Input
                id="defaultRate"
                type="number"
                step="0.01"
                value={profile.defaultRate}
                onChange={(e) => setProfile({ ...profile, defaultRate: Number.parseFloat(e.target.value) })}
                disabled={!isEditing}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
