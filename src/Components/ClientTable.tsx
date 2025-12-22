// src/components/ClientTable.tsx
import React, { useEffect, useState } from "react";
import { getClients, deleteClient, updateClient } from "../services/client";
import type { Client } from "../types/api";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TablePagination, TextField, IconButton, Button
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";

const ClientTable: React.FC<{ token: string }> = ({ token }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Client>>({});

  useEffect(() => {
    getClients(token)
      .then((data: any) => {
        setClients(data);
        setFilteredClients(data);
      })
      .catch((err: any) => console.error(err));
  }, [token]);

  useEffect(() => {
    setFilteredClients(
      clients.filter(c =>
        c.user?.name.toLowerCase().includes(search.toLowerCase()) ||
        c.numero_permis.toLowerCase().includes(search.toLowerCase()) ||
        c.telephone.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, clients]);

  const handleDelete = async (id: number) => {
    await deleteClient(id, token);
    setClients(prev => prev.filter(c => c.id !== id));
  };

  const handleEdit = (client: Client) => {
    setEditingId(client.id);
    setEditData({ ...client });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleSave = async () => {
    if (editingId) {
      const updated = await updateClient(editingId, editData, token);
      setClients(prev =>
        prev.map(c => (c.id === editingId ? updated.client : c))
      );
      setEditingId(null);
      setEditData({});
    }
  };

  return (
    <Paper>
      <TextField
        label="Rechercher un client"
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
              <TableCell>Numéro Permis</TableCell>
              <TableCell>Téléphone</TableCell>
              <TableCell>Adresse</TableCell>
              <TableCell>Date Naissance</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredClients
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map(client => (
                <TableRow key={client.id}>
                  <TableCell>
                    {client.user?.name}
                  </TableCell>
                  <TableCell>
                    {editingId === client.id ? (
                      <TextField
                        value={editData.numero_permis || ""}
                        onChange={e => setEditData({ ...editData, numero_permis: e.target.value })}
                      />
                    ) : (
                      client.numero_permis
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === client.id ? (
                      <TextField
                        value={editData.telephone || ""}
                        onChange={e => setEditData({ ...editData, telephone: e.target.value })}
                      />
                    ) : (
                      client.telephone
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === client.id ? (
                      <TextField
                        value={editData.adresse || ""}
                        onChange={e => setEditData({ ...editData, adresse: e.target.value })}
                      />
                    ) : (
                      client.adresse
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === client.id ? (
                      <TextField
                        type="date"
                        value={editData.date_naissance || ""}
                        onChange={e => setEditData({ ...editData, date_naissance: e.target.value })}
                      />
                    ) : (
                      client.date_naissance
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === client.id ? (
                      <>
                        <IconButton onClick={handleSave} color="primary">
                          <SaveIcon />
                        </IconButton>
                        <IconButton onClick={handleCancel} color="secondary">
                          <CancelIcon />
                        </IconButton>
                      </>
                    ) : (
                      <>
                        <IconButton onClick={() => handleEdit(client)} color="primary">
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(client.id)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filteredClients.length}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={e => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
      />
    </Paper>
  );
};

export default ClientTable;
