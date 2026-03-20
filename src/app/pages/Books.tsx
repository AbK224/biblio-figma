import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Loader2 } from 'lucide-react';
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
import { toast } from 'sonner';
import { booksAPI } from '../services/api';
import Swal from "sweetalert2";

interface Book {
  id: string;
  titre: string;
  auteur: string;
  isbn: string;
  categorie: string;
  statut: string;
  nbr_emprunts: string;
}

export default function Books() {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titre: '',
    author: '',
    isbn: '',
    category: '',
  });

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const data = await booksAPI.getAll();
      setBooks(data);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des livres: ' + error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (book?: Book) => {
    if (book) {
      setEditingBook(book);
      setFormData({
        titre: book.titre,
        author: book.auteur,
        isbn: book.isbn,
        category: book.categorie,
      });
    } else {
      setEditingBook(null);
      setFormData({ titre: '', author: '', isbn: '', category: '' });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingBook) {
        await booksAPI.update(editingBook.id, formData);
        toast.success('Livre modifié avec succès');
      } else {
        await booksAPI.create(formData);
        toast.success('Livre ajouté avec succès');
      }
      setIsDialogOpen(false);
      loadBooks();
    } catch (error: any) {
      toast.error('Erreur: ' + error.message);
      console.error(error);
    }
  };

  /* const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce livre ?')) {
      try {
        await booksAPI.delete(id);
        toast.success('Livre supprimé avec succès');
        loadBooks();
      } catch (error: any) {
        toast.error('Erreur lors de la suppression: ' + error.message);
        console.error(error);
      }
    }
  }; */

    const handleDelete = async (id: string) => {
      const result = await Swal.fire({
        title: "Supprimer le livre ?",
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
          await booksAPI.delete(id);

          await Swal.fire({
            title: "Supprimé !",
            text: "Le livre a été supprimé avec succès.",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          });

          loadBooks();
        } catch (error: any) {
          Swal.fire({
            title: "Erreur",
            text: error.message,
            icon: "error",
          });
        }
      }
    };

  const filteredBooks = books.filter(
    (book) =>
      book.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.auteur.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn.includes(searchTerm)
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Gestion des livres</h1>
        <p className="text-gray-600">Gérez votre collection de livres</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Rechercher par titre, auteur ou ISBN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un livre
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
                  <TableHead>Titre</TableHead>
                  <TableHead>Auteur</TableHead>
                  <TableHead>ISBN</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Emprunts</TableHead>

                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBooks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500">
                      Aucun livre trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBooks.map((book) => (
                    <TableRow key={book.id}>
                      <TableCell>{book.titre}</TableCell>
                      <TableCell>{book.auteur}</TableCell>
                      <TableCell>{book.isbn}</TableCell>
                      <TableCell>{book.categorie}</TableCell>
                      <TableCell>
                      <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        book.statut === "disponible"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    ></span>
                      {book.statut}</TableCell>
                      <TableCell>{book.nbr_emprunts}</TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(book)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(book.id)}
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
              {editingBook ? 'Modifier le livre' : 'Ajouter un livre'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="title">Titre</Label>
                <Input
                  id="title"
                  value={formData.titre}
                  onChange={(e) =>
                    setFormData({ ...formData, titre: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="author">Auteur</Label>
                <Input
                  id="author"
                  value={formData.author}
                  onChange={(e) =>
                    setFormData({ ...formData, author: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="isbn">ISBN</Label>
                <Input
                  id="isbn"
                  value={formData.isbn}
                  onChange={(e) =>
                    setFormData({ ...formData, isbn: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Catégorie</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  required
                />
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
              <Button type="submit">
                {editingBook ? 'Modifier' : 'Ajouter'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}