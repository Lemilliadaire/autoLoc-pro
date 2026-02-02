// src/components/CategorieTable.tsx
import React, { useEffect, useState } from "react";
import { getCategories, deleteCategorie, updateCategorie } from "../services/categorie";
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, TablePagination, TextField, IconButton, Button,
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import type { Categorie } from "../types/api";

const CategorieTable: React.FC<{ token: string }> = ({ token }) => {
    const [categories, setCategories] = useState<Categorie[]>([]);
    const [filteredCategories, setFilteredCategories] = useState<Categorie[]>([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editData, setEditData] = useState<Partial<Categorie>>({});
    const [deleteCandidateId, setDeleteCandidateId] = useState<number | null>(null);

    const fetchCategories = () => {
        getCategories()
            .then(data => {
                console.log("Catégories récupérées:", data);
                setCategories(data);
                setFilteredCategories(data);
            })
            .catch(err => console.error("Erreur lors de la récupération des catégories:", err));
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        setFilteredCategories(
            categories.filter(c =>
                c.nom.toLowerCase().includes(search.toLowerCase()) ||
                (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
            )
        );
    }, [search, categories]);

    const handleDelete = async (id: number) => {
        try {
            await deleteCategorie(id, token);
            setCategories(prev => prev.filter(c => c.id !== id));
            setDeleteCandidateId(null);
        } catch (err) {
            console.error("Erreur lors de la suppression:", err);
        }
    };

    const openDeleteDialog = (id: number) => {
        setDeleteCandidateId(id);
    };

    const handleEdit = (categorie: Categorie) => {
        setEditingId(categorie.id);
        setEditData({ ...categorie });
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditData({});
    };

    const handleSave = async () => {
        if (editingId) {
            try {
                const response = await updateCategorie(editingId, editData, token);
                setCategories(prev => prev.map(c => c.id === editingId ? response.categorie : c));
                setEditingId(null);
                setEditData({});
            } catch (err) {
                console.error("Erreur lors de la mise à jour:", err);
            }
        }
    };

    const handleEditDataChange = (field: keyof Categorie, value: any) => {
        setEditData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <>
            <Paper>
                <TextField
                    label="Rechercher une catégorie (nom, description)"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Nom</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Prix Journalier (FCFA)</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredCategories
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map(categorie => (
                                    <TableRow key={categorie.id}>
                                        <TableCell>
                                            {editingId === categorie.id ? (
                                                <TextField
                                                    value={editData.nom || ""}
                                                    onChange={e => handleEditDataChange('nom', e.target.value)}
                                                    size="small"
                                                />
                                            ) : (
                                                categorie.nom
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {editingId === categorie.id ? (
                                                <TextField
                                                    value={editData.description || ""}
                                                    onChange={e => handleEditDataChange('description', e.target.value)}
                                                    size="small"
                                                    multiline
                                                />
                                            ) : (
                                                categorie.description || "-"
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {editingId === categorie.id ? (
                                                <TextField
                                                    type="number"
                                                    value={editData.prix_journalier || 0}
                                                    onChange={e => handleEditDataChange('prix_journalier', Number(e.target.value))}
                                                    size="small"
                                                />
                                            ) : (
                                                `${categorie.prix_journalier} FCFA`
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {editingId === categorie.id ? (
                                                <>
                                                    <IconButton onClick={handleSave} color="primary"><SaveIcon /></IconButton>
                                                    <IconButton onClick={handleCancel}><CancelIcon /></IconButton>
                                                </>
                                            ) : (
                                                <>
                                                    <IconButton onClick={() => handleEdit(categorie)} color="primary"><EditIcon /></IconButton>
                                                    <IconButton onClick={() => openDeleteDialog(categorie.id)} color="error"><DeleteIcon /></IconButton>
                                                </>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50, 100]}
                    component="div"
                    count={filteredCategories.length}
                    page={page}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={e => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                />
            </Paper>

            <Dialog open={deleteCandidateId !== null} onClose={() => setDeleteCandidateId(null)}>
                <DialogTitle>Confirmer la suppression</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Êtes-vous sûr de vouloir supprimer cette catégorie ? Cette action est irréversible.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteCandidateId(null)}>Annuler</Button>
                    <Button onClick={() => handleDelete(deleteCandidateId!)} color="error">
                        Supprimer
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default CategorieTable;
