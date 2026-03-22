import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Book, Users, FileText, TrendingUp, Loader2 } from "lucide-react";
import { statsAPI } from "../services/api";
import { toast } from "sonner";

/**
 * Type pour une activité récente renvoyée par l'API
 */
interface RecentActivity {
  id: number;
  type: string;
  message: string;
  date: string;
  statut: string;
}

/**
 * Type pour un livre populaire renvoyé par l'API
 */
interface PopularBook {
  isbn: string;
  titre: string;
  auteur: string;
  categorie: string;
  nbr_emprunts: number;
}

/**
 * Type global des statistiques du dashboard
 */
interface Stats {
  total_livres: number;
  total_membres: number;
  emprunts_actifs: number;
  retards: number;
  activite_recente: RecentActivity[];
  livres_populaires: PopularBook[];
}

export default function Dashboard() {
  // Etat principal contenant toutes les statistiques du tableau de bord
  const [stats, setStats] = useState<Stats>({
    total_livres: 0,
    total_membres: 0,
    emprunts_actifs: 0,
    retards: 0,
    activite_recente: [],
    livres_populaires: [],
  });

  // Etat de chargement pour afficher le spinner pendant l'appel API
  const [loading, setLoading] = useState(false);

  // Charger les statistiques une seule fois au montage du composant
  useEffect(() => {
    loadStats();
  }, []);

  /**
   * Appel à l'API backend /stats
   */
  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await statsAPI.get();
      setStats(data);
    } catch (error: any) {
      toast.error("Erreur lors du chargement des statistiques: " + error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Petit helper pour afficher une date au format français
   */
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  /**
   * Configuration des cartes de statistiques
   */
  const statCards = [
    {
      title: "Total Livres",
      value: stats.total_livres,
      icon: Book,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Membres",
      value: stats.total_membres,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Emprunts Actifs",
      value: stats.emprunts_actifs,
      icon: FileText,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Retards",
      value: stats.retards,
      icon: TrendingUp,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Tableau de bord</h1>
        <p className="text-gray-600">Vue d'ensemble de votre bibliothèque</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          {/* Cartes principales des statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.title}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm text-gray-600">
                      {stat.title}
                    </CardTitle>
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-semibold">{stat.value}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Bloc du bas : activité récente + livres populaires */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Activité récente */}
            <Card>
              <CardHeader>
                <CardTitle>Activité Récente</CardTitle>
              </CardHeader>
              <CardContent>
                {stats.activite_recente.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    Aucune activité récente disponible.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {stats.activite_recente.map((activity) => (
                      <div
                        key={activity.id}
                        className="border rounded-lg p-4 flex items-start justify-between gap-4"
                      >
                        <div>
                          <p className="text-sm font-medium">{activity.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(activity.date)}
                          </p>
                        </div>

                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 whitespace-nowrap">
                          {activity.statut}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Livres populaires */}
            <Card>
              <CardHeader>
                <CardTitle>Livres Populaires</CardTitle>
              </CardHeader>
              <CardContent>
                {stats.livres_populaires.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    Aucun livre populaire disponible.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {stats.livres_populaires.map((book) => (
                      <div
                        key={book.isbn}
                        className="border rounded-lg p-4 flex items-start justify-between gap-4"
                      >
                        <div>
                          <p className="font-medium">{book.titre}</p>
                          <p className="text-sm text-gray-600">{book.auteur}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {book.categorie}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-semibold">{book.nbr_emprunts}</p>
                          <p className="text-xs text-gray-500">emprunts</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}