// src/components/AgenceTable.tsx
import React, { useEffect, useState } from "react";
import { getAgences, deleteAgence, updateAgence } from "../services/agence";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TablePagination, TextField, IconButton, Button, Avatar,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import type { Agence } from "../types/api";

const AgenceTable: React.FC<{ token: string }> = ({ token }) => {
  const [agences, setAgences] = useState<Agence[]>([]);
  const [filteredAgences, setFilteredAgences] = useState<Agence[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Agence>>({});
  const [deleteCandidateId, setDeleteCandidateId] = useState<number | null>(null);


  const fetchAgences = () => {
    getAgences()
      .then(data => {
        setAgences(data);
        setFilteredAgences(data);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchAgences();
  }, []);

  useEffect(() => {
    setFilteredAgences(
      agences.filter(a =>
        a.nom.toLowerCase().includes(search.toLowerCase()) ||
        a.ville.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, agences]);

  const handleDelete = async (id: number) => {
    await deleteAgence(id, token);
    setAgences(prev => prev.filter(a => a.id !== id));
    setDeleteCandidateId(null);
  };

  const openDeleteDialog = (id: number) => {
    setDeleteCandidateId(id);
  };

  const handleEdit = (agence: Agence) => {
    setEditingId(agence.id);
    setEditData({ ...agence });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleSave = async () => {
    if (editingId) {
      const updatedAgence = await updateAgence(editingId, editData, token);
      setAgences(prev => prev.map(a => a.id === editingId ? updatedAgence : a));
      setEditingId(null);
      setEditData({});
    }
  };

  const handleEditDataChange = (field: keyof Agence, value: any) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <Paper>
        <TextField
          label="Rechercher une agence (nom, ville)"
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
                <TableCell>Logo</TableCell>
                <TableCell>Nom</TableCell>
                <TableCell>Ville</TableCell>
                <TableCell>Téléphone</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAgences
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map(agence => (
                  <TableRow key={agence.id}>
                    <TableCell><Avatar src={`http://localhost:8000/storage/${agence.logo}`} alt={agence.nom} /></TableCell>
                    <TableCell>{editingId === agence.id ? <TextField value={editData.nom || ""} onChange={e => handleEditDataChange('nom', e.target.value)} /> : agence.nom}</TableCell>
                    <TableCell>{editingId === agence.id ? <TextField value={editData.ville || ""} onChange={e => handleEditDataChange('ville', e.target.value)} /> : agence.ville}</TableCell>
                    <TableCell>{editingId === agence.id ? <TextField value={editData.telephone || ""} onChange={e => handleEditDataChange('telephone', e.target.value)} /> : agence.telephone}</TableCell>
                    <TableCell>
                      {editingId === agence.id ? (
                        <>
                          <IconButton onClick={handleSave} color="primary"><SaveIcon /></IconButton>
                          <IconButton onClick={handleCancel}><CancelIcon /></IconButton>
                        </>
                      ) : (
                        <>
                          <IconButton onClick={() => handleEdit(agence)} color="primary"><EditIcon /></IconButton>
                          <IconButton onClick={() => openDeleteDialog(agence.id)} color="error"><DeleteIcon /></IconButton>
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
          count={filteredAgences.length}
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
            Êtes-vous sûr de vouloir supprimer cette agence ? Cette action est irréversible.
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

export default AgenceTable;