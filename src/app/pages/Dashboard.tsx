import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Book, Users, FileText, TrendingUp, Loader2 } from 'lucide-react';
import { statsAPI } from '../services/api';
import { toast } from 'sonner';

interface Stats {
  totalBooks: number;
  totalMembers: number;
  activeLoans: number;
  overdueLoans: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalBooks: 0,
    totalMembers: 0,
    activeLoans: 0,
    overdueLoans: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await statsAPI.get();
      setStats(data);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des statistiques: ' + error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Livres',
      value: stats.totalBooks,
      icon: Book,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Membres',
      value: stats.totalMembers,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Emprunts Actifs',
      value: stats.activeLoans,
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Retards',
      value: stats.overdueLoans,
      icon: TrendingUp,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
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
                    <div className="text-3xl">{stat.value}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Activité Récente</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 text-sm">
                  Les emprunts et retours récents apparaîtront ici.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Livres Populaires</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 text-sm">
                  Les livres les plus empruntés seront affichés ici.
                </p>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}