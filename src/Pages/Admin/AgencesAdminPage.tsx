import React, { useEffect, useState, useMemo } from 'react';
import {
  Container, Row, Col, Card, Table, Badge, Button, Alert,
  Form, InputGroup, Modal, Spinner, Image
} from 'react-bootstrap';
import {
  Search, PlusCircle, Pencil, Trash, XCircle,
  Building, GeoAlt, Telephone, Upload
} from 'react-bootstrap-icons';
import { useAuth } from '../../hooks/useAuth';
import { getAgences, createAgence, updateAgence, deleteAgence } from '../../services/agence';
import type { Agence } from '../../types/api';

const AgencesAdminPage: React.FC = () => {
  const { token } = useAuth();
  const [agences, setAgences] = useState<Agence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Search
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingAgence, setEditingAgence] = useState<Agence | null>(null);
  const [deletingAgence, setDeletingAgence] = useState<Agence | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    nom: '',
    adresse: '',
    telephone: '',
    ville: ''
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  // Clean up preview URL
  useEffect(() => {
    return () => {
      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getAgences();
      setAgences(data);
      setLoading(false);
    } catch (err) {
      console.error('Erreur lors du chargement des agences:', err);
      setError('Impossible de charger les agences');
      setLoading(false);
    }
  };

  // Filtered agences
  const filteredAgences = useMemo(() => {
    return agences.filter(agence => {
      const searchLower = searchTerm.toLowerCase();
      return !searchTerm ||
        agence.nom.toLowerCase().includes(searchLower) ||
        agence.ville.toLowerCase().includes(searchLower) ||
        agence.adresse.toLowerCase().includes(searchLower);
    });
  }, [agences, searchTerm]);

  // Statistics
  const stats = useMemo(() => {
    const total = agences.length;
    const villes = new Set(agences.map(a => a.ville)).size;

    return {
      total,
      villes
    };
  }, [agences]);

  const handleShowCreateModal = () => {
    setEditingAgence(null);
    setFormData({ nom: '', adresse: '', telephone: '', ville: '' });
    setLogoFile(null);
    setLogoPreview(null);
    setShowModal(true);
  };

  const handleShowEditModal = (agence: Agence) => {
    setEditingAgence(agence);
    setFormData({
      nom: agence.nom,
      adresse: agence.adresse,
      telephone: agence.telephone,
      ville: agence.ville
    });
    // Si l'agence a déjà un logo, on pourrait l'afficher, mais ici on gère le preview du NOUVEAU fichier
    // On pourrait afficher l'image actuelle à côté
    setLogoFile(null);
    setLogoPreview(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAgence(null);
    setFormData({ nom: '', adresse: '', telephone: '', ville: '' });
    setLogoFile(null);
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoPreview(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!token) return;

    if (!formData.nom || !formData.ville) {
      setError('Veuillez remplir au moins le nom et la ville');
      return;
    }

    try {
      const data = new FormData();
      data.append('nom', formData.nom);
      data.append('adresse', formData.adresse);
      data.append('telephone', formData.telephone);
      data.append('ville', formData.ville);
      if (logoFile) {
        data.append('logo', logoFile);
      }
      // Pour l'update, certaines APIs demandent _method: PUT dans le FormData
      if (editingAgence) {
        data.append('_method', 'PUT');
      }

      if (editingAgence) {

        await updateAgence(editingAgence.id, data, token);
        setSuccess('Agence mise à jour avec succès');
      } else {
        // Create
        await createAgence(data, token);
        setSuccess('Agence créée avec succès');
      }

      await fetchData();
      handleCloseModal();
    } catch (err: any) {
      console.error('Erreur lors de la sauvegarde:', err);
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleShowDeleteModal = (agence: Agence) => {
    setDeletingAgence(agence);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deletingAgence || !token) return;

    try {
      await deleteAgence(deletingAgence.id, token);
      setAgences(prev => prev.filter(a => a.id !== deletingAgence.id));
      setSuccess('Agence supprimée avec succès');
      setShowDeleteModal(false);
      setDeletingAgence(null);
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      setError('Impossible de supprimer cette agence');
    }
  };

  if (!token) {
    return <Alert variant="danger">Vous devez être connecté pour accéder à cette page.</Alert>;
  }

  if (loading && agences.length === 0) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Chargement des agences...</p>
      </div>
    );
  }

  return (
    <Container fluid className="py-4">
      <h1 className="mb-4">Gestion des Agences</h1>

      {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess(null)}>{success}</Alert>}


      {/* Statistics Cards */}
      <Row className="mb-4 g-3">
        <Col md={6}>
          <Card className="shadow-sm border-0" style={{
            background: 'linear-gradient(135deg, #0dcaf0 0%, #3dd5f3 100%)',
            color: 'white'
          }}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-1 opacity-75">Total Agences</h6>
                  <h2 className="mb-0 fw-bold">{stats.total}</h2>
                </div>
                <div style={{ fontSize: '3rem', opacity: 0.3 }}>
                  <Building />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="shadow-sm border-0" style={{
            background: 'linear-gradient(135deg, #ffc107 0%, #ffcd39 100%)',
            color: 'white'
          }}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-1 opacity-75">Villes Couvertes</h6>
                  <h2 className="mb-0 fw-bold">{stats.villes}</h2>
                </div>
                <div style={{ fontSize: '3rem', opacity: 0.3 }}>
                  <GeoAlt />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>


      {/* Search and Actions */}
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Row className="g-3 align-items-center">
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>
                  <Search />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Rechercher par nom, ville..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <Button variant="outline-secondary" onClick={() => setSearchTerm('')}>
                    <XCircle />
                  </Button>
                )}
              </InputGroup>
            </Col>
            <Col md={6}>
              <div className="d-flex gap-2 justify-content-end">
                <Button variant="primary" onClick={handleShowCreateModal}>
                  <PlusCircle className="me-2" />
                  Nouvelle Agence
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Agences Table */}
      <Card className="shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">
              Liste des agences
              <Badge bg="secondary" className="ms-2">{filteredAgences.length}</Badge>
            </h5>
          </div>

          {filteredAgences.length === 0 ? (
            <Alert variant="info">Aucune agence trouvée.</Alert>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Logo</th>
                    <th>Nom</th>
                    <th>Ville</th>
                    <th>Adresse</th>
                    <th>Téléphone</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAgences.map((agence) => (
                    <tr key={agence.id}>
                      <td>
                        {agence.logo ? (
                          <Image
                            src={`http://localhost:8000/storage/${agence.logo}`}
                            alt={agence.nom}
                            roundedCircle
                            width={40}
                            height={40}
                            style={{ objectFit: 'cover' }}
                          />
                        ) : (
                          <div className="bg-secondary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                            <Building className="text-muted" />
                          </div>
                        )}
                      </td>
                      <td className="fw-bold">{agence.nom}</td>
                      <td>
                        <Badge bg="info" className="text-dark bg-opacity-25">
                          {agence.ville}
                        </Badge>
                      </td>
                      <td>
                        <small className="text-muted">{agence.adresse}</small>
                      </td>
                      <td>{agence.telephone}</td>
                      <td>
                        <div className="d-flex gap-1 justify-content-center">
                          <Button
                            variant="outline-warning"
                            size="sm"
                            title="Modifier"
                            onClick={() => handleShowEditModal(agence)}
                          >
                            <Pencil />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            title="Supprimer"
                            onClick={() => handleShowDeleteModal(agence)}
                          >
                            <Trash />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingAgence ? 'Modifier l\'Agence' : 'Nouvelle Agence'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={12} className="text-center mb-4">
                <div className="position-relative d-inline-block">
                  <div
                    className="rounded-circle overflow-hidden bg-light d-flex align-items-center justify-content-center border"
                    style={{ width: '100px', height: '100px', margin: '0 auto' }}
                  >
                    {logoPreview ? (
                      <Image src={logoPreview} alt="Preview" width="100%" height="100%" style={{ objectFit: 'cover' }} />
                    ) : (editingAgence?.logo ? (
                      <Image src={`http://localhost:8000/storage/${editingAgence.logo}`} alt="Current" width="100%" height="100%" style={{ objectFit: 'cover' }} />
                    ) : (
                      <Building size={40} className="text-muted" />
                    ))}
                  </div>
                  <div className="mt-2">
                    <Form.Label htmlFor="logo-upload" className="btn btn-sm btn-outline-primary mb-0">
                      <Upload className="me-1" /> Changer le logo
                    </Form.Label>
                    <Form.Control
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Nom *</Form.Label>
              <Form.Control
                type="text"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                placeholder="Ex: Agence Aéroport"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Ville *</Form.Label>
              <Form.Control
                type="text"
                value={formData.ville}
                onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                placeholder="Ex: Lomé"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Adresse</Form.Label>
              <Form.Control
                type="text"
                value={formData.adresse}
                onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                placeholder="Adresse complète"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Téléphone</Form.Label>
              <Form.Control
                type="tel"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                placeholder="+228..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleSave}>
            {editingAgence ? 'Mettre à jour' : 'Créer'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmer la suppression</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Êtes-vous sûr de vouloir supprimer l'agence <strong>{deletingAgence?.nom}</strong> ?
          Cette action est irréversible.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Supprimer
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AgencesAdminPage;
