import { useState, useEffect } from 'react';
import { Plus, Search, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { toast } from 'sonner';
import { loansAPI, booksAPI, membersAPI } from '../services/api';

interface Loan {
  id: string;
  bookId: string;
  bookTitle: string;
  memberId: string;
  memberName: string;
  loanDate: string;
  dueDate: string;
  returnedDate?: string;
}

export default function Loans() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bookId: '',
    memberId: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [loansData, booksData, membersData] = await Promise.all([
        loansAPI.getAll(),
        booksAPI.getAll(),
        membersAPI.getAll(),
      ]);
      setLoans(loansData);
      setBooks(booksData);
      setMembers(membersData);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des données: ' + error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setFormData({ bookId: '', memberId: '' });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await loansAPI.create(formData);
      toast.success('Emprunt enregistré avec succès');
      setIsDialogOpen(false);
      loadData();
    } catch (error: any) {
      toast.error('Erreur: ' + error.message);
      console.error(error);
    }
  };

  const handleReturn = async (loanId: string) => {
    try {
      await loansAPI.returnLoan(loanId);
      toast.success('Retour enregistré avec succès');
      loadData();
    } catch (error: any) {
      toast.error('Erreur: ' + error.message);
      console.error(error);
    }
  };

  const isOverdue = (loan: Loan) => {
    if (loan.returnedDate) return false;
    const today = new Date();
    const dueDate = new Date(loan.dueDate);
    return dueDate < today;
  };

  const filteredLoans = loans.filter(
    (loan) =>
      loan.bookTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.memberName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const availableBooks = books.filter((book) => book.available);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Gestion des emprunts</h1>
        <p className="text-gray-600">Suivez les emprunts et retours de livres</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Rechercher par livre ou membre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={handleOpenDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Nouvel emprunt
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Livre</TableHead>
                  <TableHead>Membre</TableHead>
                  <TableHead>Date d'emprunt</TableHead>
                  <TableHead>Date de retour prévue</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLoans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500">
                      Aucun emprunt trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLoans.map((loan) => (
                    <TableRow key={loan.id}>
                      <TableCell>{loan.bookTitle}</TableCell>
                      <TableCell>{loan.memberName}</TableCell>
                      <TableCell>
                        {new Date(loan.loanDate).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        {new Date(loan.dueDate).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        {loan.returnedDate ? (
                          <span className="inline-flex px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                            Retourné
                          </span>
                        ) : isOverdue(loan) ? (
                          <span className="inline-flex px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                            En retard
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                            En cours
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {!loan.returnedDate && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReturn(loan.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Retourner
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvel emprunt</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="book">Livre</Label>
                <Select
                  value={formData.bookId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, bookId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un livre" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableBooks.length === 0 ? (
                      <div className="p-2 text-sm text-gray-500">
                        Aucun livre disponible
                      </div>
                    ) : (
                      availableBooks.map((book) => (
                        <SelectItem key={book.id} value={book.id}>
                          {book.title} - {book.author}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="member">Membre</Label>
                <Select
                  value={formData.memberId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, memberId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un membre" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.length === 0 ? (
                      <div className="p-2 text-sm text-gray-500">
                        Aucun membre enregistré
                      </div>
                    ) : (
                      members.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  Durée d'emprunt : 14 jours
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit">Enregistrer l'emprunt</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}