import { useState, useEffect } from "react";
import { Plus, Search, Trash2, Edit, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { toast } from "sonner";
import { loansAPI, booksAPI, membersAPI } from "../services/api";
import Swal from "sweetalert2";

interface Loan {
  id: string;
  utilisateur_id: string;
  livre_isbn: string;
  date_emprunt: string;
  date_retour_prevue?: string;
  date_retour_effective?: string;
  statut?: string;
  renouvellements?: string | number;
}

export default function Loans() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    livre_isbn: "",
    utilisateur_id: "",
    date_emprunt: "",
    statut: "en cours",
  });

  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);

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
      toast.error("Erreur lors du chargement des données: " + error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  //Gestion du retard
  const isOverdue = (loan: Loan) => {
    if (loan.statut === "retourné") return false;
    if (!loan.date_retour_prevue) return false;

    const today = new Date();
    const dueDate = new Date(loan.date_retour_prevue);

    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    return today > dueDate;
  };

  const handleOpenDialog = (loan?: Loan) => {
    if (loan) {
      setEditingLoan(loan);
      setFormData({
        livre_isbn: String(loan.livre_isbn || ""),
        utilisateur_id: String(loan.utilisateur_id || ""),
        date_emprunt: loan.date_emprunt
          ? loan.date_emprunt.split("T")[0]
          : "",
        statut: loan.statut || "en cours",
      });
    } else {
      setEditingLoan(null);
      setFormData({
        livre_isbn: "",
        utilisateur_id: "",
        date_emprunt: "",
        statut: "en cours",
      });
    }

    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingLoan) {
        await loansAPI.update(editingLoan.id, {
          utilisateur_id: formData.utilisateur_id,
          livre_isbn: formData.livre_isbn,
          date_emprunt: formData.date_emprunt,
          statut: formData.statut,
        });

        toast.success("Emprunt modifié avec succès");
      } else {
        await loansAPI.create({
          utilisateur_id: formData.utilisateur_id,
          livre_isbn: formData.livre_isbn,
          date_emprunt: formData.date_emprunt,
        });

        toast.success("Emprunt enregistré avec succès");
      }

      setIsDialogOpen(false);
      loadData();
    } catch (error: any) {
      toast.error("Erreur: " + error.message);
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Supprimer l'emprunt ?",
      text: "Cette action est irréversible !",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
    });

    if (result.isConfirmed) {
      try {
        await loansAPI.delete(id);

        await Swal.fire({
          title: "Supprimé !",
          text: "L'emprunt a été supprimé avec succès.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });

        loadData();
      } catch (error: any) {
        Swal.fire({
          title: "Erreur",
          text: error.message,
          icon: "error",
        });
      }
    }
  };

  const getBookTitle = (isbn: string) => {
    const book = books.find((b) => b.isbn === isbn);
    return book ? book.titre : "Inconnu";
  };

  const getMemberName = (id: string) => {
    const member = members.find((m) => String(m.id) === String(id));
    return member ? `${member.nom} ${member.prenom}` : "Inconnu";
  };

  const getMemberType = (id: string) => {
    const member = members.find((m) => String(m.id) === String(id));
    return member ? `${member.type}` : "Inconnu";
  };

  const filteredLoans = loans.filter((loan) => {
    const bookTitle = getBookTitle(loan.livre_isbn).toLowerCase();
    const memberName = getMemberName(loan.utilisateur_id).toLowerCase();
    const search = searchTerm.toLowerCase();

    return bookTitle.includes(search) || memberName.includes(search);
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Gestion des emprunts</h1>
        <p className="text-gray-600">Suivez les emprunts et retours de livres</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Rechercher par livre ou membre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => handleOpenDialog()}>
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
                  <TableHead>ID</TableHead>
                  <TableHead>Livre</TableHead>
                  <TableHead>Membre</TableHead>
                  <TableHead>Type membre</TableHead>
                  <TableHead>Date d'emprunt</TableHead>
                  <TableHead>Date de retour prévue</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Retard</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLoans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-gray-500">
                      Aucun emprunt trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLoans.map((loan) => (
                    <TableRow key={loan.id}>
                      <TableCell>{loan.id}</TableCell>
                      <TableCell>{getBookTitle(loan.livre_isbn)}</TableCell>
                      <TableCell>{getMemberName(loan.utilisateur_id)}</TableCell>
                      <TableCell>{getMemberType(loan.utilisateur_id)}</TableCell>
                      <TableCell>
                        {loan.date_emprunt
                          ? new Date(loan.date_emprunt).toLocaleDateString("fr-FR")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {loan.date_retour_prevue
                          ? new Date(loan.date_retour_prevue).toLocaleDateString("fr-FR")
                          : "-"}
                      </TableCell>
                      <TableCell>{loan.statut || "-"}</TableCell>
                      <TableCell>{isOverdue(loan) ? "Oui" : "Non"}</TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(loan)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(loan.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
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
            <DialogTitle>
              {editingLoan ? "Modifier l'emprunt" : "Nouvel emprunt"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div>
                <Label>Livre</Label>
                <Select
                  value={formData.livre_isbn}
                  onValueChange={(value) =>
                    setFormData({ ...formData, livre_isbn: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un livre" />
                  </SelectTrigger>
                  <SelectContent>
                    {books.map((book) => (
                      <SelectItem key={book.isbn} value={book.isbn}>
                        {book.titre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Emprunteur</Label>
                <Select
                  value={formData.utilisateur_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, utilisateur_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un membre" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((m) => (
                      <SelectItem key={m.id} value={String(m.id)}>
                        {m.nom} {m.prenom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Date d'emprunt</Label>
                <Input
                  type="date"
                  value={formData.date_emprunt}
                  onChange={(e) =>
                    setFormData({ ...formData, date_emprunt: e.target.value })
                  }
                  required
                />
              </div>

              {editingLoan && (
                <div>
                  <Label>Statut</Label>
                  <Select
                    value={formData.statut}
                    onValueChange={(value) =>
                      setFormData({ ...formData, statut: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en cours">En cours</SelectItem>
                      <SelectItem value="retourné">Retourné</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit">
                {editingLoan ? "Modifier" : "Enregistrer l'emprunt"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}