// src/components/VoitureTable.tsx
import React, { useEffect, useState } from "react";
import { getVoitures, deleteVoiture, updateVoiture } from "../services/voiture";
import type { Voiture } from "../types/api";
import { Table, Button, Form, Pagination, Modal, Card } from "react-bootstrap";
import { PencilFill, TrashFill, Save, XCircle } from 'react-bootstrap-icons';

const VoitureTable: React.FC<{ token: string }> = ({ token }) => {
  const [voitures, setVoitures] = useState<Voiture[]>([]);
  const [filteredVoitures, setFilteredVoitures] = useState<Voiture[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Voiture>>({});
  const [deleteCandidateId, setDeleteCandidateId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchVoitures = () => {
    // On récupère toutes les voitures, sans pagination côté API pour simplifier
    getVoitures({})
      .then(data => {
        setVoitures(data.data);
        setFilteredVoitures(data.data);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchVoitures();
  }, []);

  useEffect(() => {
    setFilteredVoitures(
      voitures.filter(v =>
        v.marque.toLowerCase().includes(search.toLowerCase()) ||
        v.modele.toLowerCase().includes(search.toLowerCase()) ||
        v.immatriculation.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, voitures]);

  const handleDelete = async (id: number) => {
    await deleteVoiture(id, token);
    // Met à jour l'état localement pour une meilleure réactivité
    setVoitures(prev => prev.filter(v => v.id !== id));
    handleCloseDeleteModal();
  };

  const openDeleteDialog = (id: number) => {
    setDeleteCandidateId(id);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteCandidateId(null);
  };

  const handleEdit = (voiture: Voiture) => {
    setEditingId(voiture.id);
    setEditData({ ...voiture });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleSave = async () => {
    if (editingId) {
      const updatedVoiture = await updateVoiture(editingId, editData, token);
      // Met à jour l'état localement
      setVoitures(prev => prev.map(v => v.id === editingId ? updatedVoiture : v));
      setEditingId(null);
      setEditData({});
    }
  };

  const handleEditDataChange = (field: keyof Voiture, value: any) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="shadow-sm">
      <Card.Body>
        <Form.Control
            type="search"
            placeholder="Rechercher une voiture (marque, modèle, immatriculation)"
            className="mb-3"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Marque</th>
              <th>Modèle</th>
              <th>Immatriculation</th>
              <th>Prix/jour</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
              {filteredVoitures
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map(voiture => (
                  <tr key={voiture.id}>
                    <td>
                      {editingId === voiture.id ? (
                        <Form.Control size="sm" value={editData.marque || ""} onChange={e => handleEditDataChange('marque', e.target.value)} />
                      ) : (
                        voiture.marque
                      )}
                    </td>
                    <td>
                      {editingId === voiture.id ? (
                        <Form.Control size="sm" value={editData.modele || ""} onChange={e => handleEditDataChange('modele', e.target.value)} />
                      ) : (
                        voiture.modele
                      )}
                    </td>
                    <td>
                      {editingId === voiture.id ? (
                        <Form.Control size="sm" value={editData.immatriculation || ""} onChange={e => handleEditDataChange('immatriculation', e.target.value)} />
                      ) : (
                        voiture.immatriculation
                      )}
                    </td>
                    <td>
                      {editingId === voiture.id ? (
                        <Form.Control size="sm" type="number" value={editData.prix_journalier || ""} onChange={e => handleEditDataChange('prix_journalier', Number(e.target.value))} />
                      ) : (
                        `${voiture.prix_journalier} €`
                      )}
                    </td>
                    <td>{voiture.statut}</td>
                    <td>
                      {editingId === voiture.id ? (
                        <>
                          <Button variant="success" size="sm" onClick={handleSave} className="me-2"><Save /></Button>
                          <Button variant="secondary" size="sm" onClick={handleCancel}><XCircle /></Button>
                        </>
                      ) : (
                        <>
                          <Button variant="outline-primary" size="sm" onClick={() => handleEdit(voiture)} className="me-2"><PencilFill /></Button>
                          <Button variant="outline-danger" size="sm" onClick={() => openDeleteDialog(voiture.id)}><TrashFill /></Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
          </tbody>
        </Table>
        {/* Pagination à implémenter si nécessaire */}
      </Card.Body>

      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmer la suppression</Modal.Title>
        </Modal.Header>
        <Modal.Body>Êtes-vous sûr de vouloir supprimer cette voiture ? Cette action est irréversible.</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>Annuler</Button>
          <Button variant="danger" onClick={() => handleDelete(deleteCandidateId!)}>Supprimer</Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

export default VoitureTable;