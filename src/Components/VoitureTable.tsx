// src/components/VoitureTable.tsx
import React, { useEffect, useState } from "react";
import { getVoitures, deleteVoiture } from "../services/voiture";
import type { Voiture } from "../types/api";
import { Table, Button, Form, Modal, Card, Badge, Image } from "react-bootstrap";
import { PencilFill, TrashFill, Eye } from 'react-bootstrap-icons';
import { useNavigate } from "react-router-dom";

const VoitureTable: React.FC<{ token: string }> = ({ token }) => {
  const navigate = useNavigate();
  const [voitures, setVoitures] = useState<Voiture[]>([]);
  const [filteredVoitures, setFilteredVoitures] = useState<Voiture[]>([]);
  const [search, setSearch] = useState("");
  const [deleteCandidateId, setDeleteCandidateId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchVoitures = () => {
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

  const getPhotoUrl = (photo: string | undefined) => {
    if (!photo) return null;
    if (photo.startsWith('http')) return photo;
    const cleanPath = photo.startsWith('/storage/') ? photo.substring(9) :
      photo.startsWith('storage/') ? photo.substring(8) : photo;
    return `http://127.0.0.1:8000/storage/${cleanPath}`;
  };

  const getStatusBadge = (statut: string) => {
    const variants: Record<string, string> = {
      'disponible': 'success',
      'loue': 'warning',
      'maintenance': 'danger'
    };
    return <Badge bg={variants[statut] || 'secondary'}>{statut}</Badge>;
  };

  return (
    <Card className="shadow-sm mt-4">
      <Card.Header className="bg-white border-0 py-3">
        <h5 className="mb-0 fw-bold">Liste des véhicules</h5>
      </Card.Header>
      <Card.Body>
        <Form.Control
          type="search"
          placeholder=" Rechercher une voiture (marque, modèle, immatriculation)"
          className="mb-4 rounded-pill"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="table-responsive">
          <Table hover className="align-middle">
            <thead className="table-light">
              <tr>
                <th style={{ width: '80px' }}>Photo</th>
                <th>Véhicule</th>
                <th>Immatriculation</th>
                <th>Prix/jour</th>
                <th>Statut</th>
                <th className="text-center" style={{ width: '200px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVoitures.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-4">
                    Aucune voiture trouvée
                  </td>
                </tr>
              ) : (
                filteredVoitures.map(voiture => (
                  <tr key={voiture.id}>
                    <td>
                      {getPhotoUrl(voiture.photo) ? (
                        <Image
                          src={getPhotoUrl(voiture.photo)!}
                          rounded
                          style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                        />
                      ) : (
                        <div
                          className="bg-light rounded d-flex align-items-center justify-content-center"
                          style={{ width: '60px', height: '60px' }}
                        >
                          <span className="text-muted small">N/A</span>
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="fw-bold">{voiture.marque} {voiture.modele}</div>
                      <small className="text-muted">{voiture.annee} • {voiture.couleur}</small>
                    </td>
                    <td><code className="bg-light px-2 py-1 rounded">{voiture.immatriculation}</code></td>
                    <td className="fw-bold text-primary">{voiture.prix_journalier} FCFA</td>
                    <td>{getStatusBadge(voiture.statut)}</td>
                    <td>
                      <div className="d-flex gap-2 justify-content-center">
                        <Button
                          variant="outline-info"
                          size="sm"
                          onClick={() => navigate(`/voitures-public/${voiture.id}`)}
                          title="Voir"
                        >
                          <Eye />
                        </Button>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => navigate(`/admin/voitures/edit/${voiture.id}`)}
                          title="Modifier"
                        >
                          <PencilFill />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => openDeleteDialog(voiture.id)}
                          title="Supprimer"
                        >
                          <TrashFill />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
        <div className="text-muted small mt-3">
          Total : {filteredVoitures.length} véhicule(s)
        </div>
      </Card.Body>

      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title>Confirmer la suppression</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Êtes-vous sûr de vouloir supprimer cette voiture ? Cette action est irréversible.
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="secondary" onClick={handleCloseDeleteModal}>Annuler</Button>
          <Button variant="danger" onClick={() => handleDelete(deleteCandidateId!)}>Supprimer</Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

export default VoitureTable;