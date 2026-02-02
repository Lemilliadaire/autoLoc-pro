import React, { useEffect, useState, useMemo } from 'react';
import {
  Container, Row, Col, Card, Table, Badge, Button, Alert,
  Form, InputGroup, Modal, Spinner, Image
} from 'react-bootstrap';
import {
  Search, PlusCircle, Pencil, Trash, XCircle,
  CarFront, FuelPump, Speedometer, GeoAlt, CheckCircle,
  Tools, XOctagon, Upload, Images, Calendar
} from 'react-bootstrap-icons';
import { useAuth } from '../../hooks/useAuth';
import { getVoitures, getVoiture, createVoiture, updateVoiture, deleteVoiture } from '../../services/voiture';
import { getCategories } from '../../services/categorie';
import { getAgences } from '../../services/agence';
import type { Voiture, Categorie, Agence } from '../../types/api';

const VoituresAdminPage: React.FC = () => {
  const { token } = useAuth();

  // Data
  const [voitures, setVoitures] = useState<Voiture[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [agences, setAgences] = useState<Agence[]>([]);

  // UI State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingVoiture, setEditingVoiture] = useState<Voiture | null>(null);
  const [deletingVoiture, setDeletingVoiture] = useState<Voiture | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Form Data
  const initialState = {
    marque: '', modele: '', annee: new Date().getFullYear(),
    couleur: '', immatriculation: '', kilometrage: 0,
    prix_journalier: 0, statut: 'disponible',
    categorie_id: '' as number | '', agence_id: '' as number | ''
  };
  const [formData, setFormData] = useState(initialState);

  // Image Handling
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Gallery Handling
  const [galleryImages, setGalleryImages] = useState<{ file: File; preview: string; type: string }[]>([]);
  const [existingGalleryImages, setExistingGalleryImages] = useState<any[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  // Cleanup previews
  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
      galleryImages.forEach(img => URL.revokeObjectURL(img.preview));
    };
  }, [photoPreview, galleryImages]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [voituresRes, catsRes, agencesRes] = await Promise.all([
        getVoitures({ per_page: 1000 }),
        getCategories(),
        getAgences()
      ]);

      // Handle PaginatedResponse or Array
      const voituresData = (voituresRes as any).data || voituresRes;
      setVoitures(Array.isArray(voituresData) ? voituresData : []);
      setCategories(catsRes);
      setAgences(agencesRes);
    } catch (err) {
      console.error(err);
      setError('Erreur lors du chargement des données.');
    } finally {
      setLoading(false);
    }
  };

  // Filtered List
  const filteredVoitures = useMemo(() => {
    return voitures.filter(v => {
      const searchLower = searchTerm.toLowerCase();
      return !searchTerm ||
        v.marque.toLowerCase().includes(searchLower) ||
        v.modele.toLowerCase().includes(searchLower) ||
        v.immatriculation.toLowerCase().includes(searchLower);
    });
  }, [voitures, searchTerm]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: voitures.length,
      disponible: voitures.filter(v => v.statut === 'disponible').length,
      maintenance: voitures.filter(v => v.statut === 'maintenance').length
    };
  }, [voitures]);

  // Helpers
  const getPhotoUrl = (path?: string) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const cleanPath = path.replace(/^\/?storage\//, '');
    return `http://localhost:8000/storage/${cleanPath}`;
  };

  const getStatusBadge = (voiture: Voiture) => {
    switch (voiture.statut) {
      case 'disponible': return <Badge bg="success">Disponible</Badge>;
      case 'loue':
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const activeRes = voiture.reservations && voiture.reservations.length > 0
          ? [...voiture.reservations]
            .filter(r => (r.statut === 'confirmee' || r.statut === 'en_cours'))
            .sort((a, b) => new Date(a.date_retour || a.date_fin).getTime() - new Date(b.date_retour || b.date_fin).getTime())
            .find(r => new Date(r.date_retour || r.date_fin) >= today)
          : null;

        return (
          <>
            <Badge bg="warning" text="dark">Loué</Badge>
            {activeRes && (
              <div className="small text-muted mt-1" style={{ fontSize: '0.75rem' }}>
                Dispo: {new Date(activeRes.date_retour || activeRes.date_fin).toLocaleDateString('fr-FR')}
              </div>
            )}
          </>
        );
      case 'maintenance': return <Badge bg="danger">Maintenance</Badge>;
      default: return <Badge bg="secondary">{voiture.statut}</Badge>;
    }
  };

  // Modal Actions
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingVoiture(null);
    setFormData(initialState);
    setPhotoFile(null);
    setPhotoPreview(null);
    setGalleryImages([]);
    setExistingGalleryImages([]);
    setImagesToDelete([]);
  };

  const handleShowCreate = () => {
    handleCloseModal();
    setShowModal(true);
  };

  const handleShowEdit = async (voiture: Voiture) => {
    setEditingVoiture(voiture);
    // Load full details including images
    setModalLoading(true);
    setShowModal(true);

    try {
      const fullVoiture = await getVoiture(voiture.id);
      setEditingVoiture(fullVoiture);
      setFormData({
        marque: fullVoiture.marque,
        modele: fullVoiture.modele,
        annee: fullVoiture.annee,
        couleur: fullVoiture.couleur,
        immatriculation: fullVoiture.immatriculation,
        kilometrage: fullVoiture.kilometrage,
        prix_journalier: fullVoiture.prix_journalier,
        statut: fullVoiture.statut,
        categorie_id: fullVoiture.categorie_id,
        agence_id: fullVoiture.agence_id
      });
      setExistingGalleryImages(fullVoiture.images || []);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les détails de la voiture");
    } finally {
      setModalLoading(false);
    }
  };

  // Form Handlers
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files).map(file => ({
        file,
        preview: URL.createObjectURL(file),
        type: 'exterieur'
      }));
      setGalleryImages(prev => [...prev, ...newImages]);
    }
  };

  const removeGalleryImage = (index: number) => {
    URL.revokeObjectURL(galleryImages[index].preview);
    setGalleryImages(prev => prev.filter((_, i) => i !== index));
  };

  const markExistingImageForDeletion = (id: number) => {
    setImagesToDelete(prev => [...prev, id]);
    setExistingGalleryImages(prev => prev.filter(img => img.id !== id));
  };

  const handleSave = async () => {
    if (!token) return;

    // Validation simple
    if (!formData.marque || !formData.modele || !formData.immatriculation || !formData.categorie_id || !formData.agence_id) {
      alert("Veuillez remplir les champs obligatoires (*)");
      return;
    }

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, String(value));
    });

    if (photoFile) data.append('photo', photoFile);

    galleryImages.forEach(img => {
      data.append('gallery_images[]', img.file);
      data.append('gallery_types[]', img.type);
    });

    if (imagesToDelete.length > 0) {
      data.append('delete_images', JSON.stringify(imagesToDelete));
    }

    if (editingVoiture) data.append('_method', 'PUT');

    try {
      if (editingVoiture) {
        await updateVoiture(editingVoiture.id, data, token);
        setSuccess('Voiture mise à jour avec succès');
      } else {
        await createVoiture(data, token);
        setSuccess('Voiture créée avec succès');
      }
      fetchAllData(); // Reload list
      handleCloseModal();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Erreur lors de l'enregistrement");
    }
  };

  const handleDelete = async () => {
    if (!deletingVoiture || !token) return;
    try {
      await deleteVoiture(deletingVoiture.id, token);
      setSuccess('Voiture supprimée avec succès');
      setVoitures(prev => prev.filter(v => v.id !== deletingVoiture.id));
      setShowDeleteModal(false);
    } catch (err) {
      setError("Impossible de supprimer cette voiture");
    }
  };

  if (loading && voitures.length === 0) return <div className="text-center py-5"><Spinner animation="border" /></div>;

  return (
    <Container fluid className="py-4">
      <h1 className="mb-4">Gestion du Parc Automobile</h1>

      {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess(null)}>{success}</Alert>}

      {/* Stats Cards */}
      <Row className="mb-4 g-3">
        <Col md={4}>
          <Card className="shadow-sm border-0 h-100" style={{ background: 'linear-gradient(135deg, #0dcaf0 0%, #3dd5f3 100%)', color: 'white' }}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div><h6 className="opacity-75">Total Voitures</h6><h2 className="fw-bold mb-0">{stats.total}</h2></div>
                <CarFront size={40} className="opacity-50" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm border-0 h-100" style={{ background: 'linear-gradient(135deg, #198754 0%, #20c997 100%)', color: 'white' }}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div><h6 className="opacity-75">Disponibles</h6><h2 className="fw-bold mb-0">{stats.disponible}</h2></div>
                <CheckCircle size={40} className="opacity-50" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm border-0 h-100" style={{ background: 'linear-gradient(135deg, #dc3545 0%, #f8d7da 100%)', color: 'white' }}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div><h6 className="opacity-75">Maintenance</h6><h2 className="fw-bold mb-0">{stats.maintenance}</h2></div>
                <Tools size={40} className="opacity-50" />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Actions & Filters */}
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text><Search /></InputGroup.Text>
                <Form.Control placeholder="Rechercher (marque, modèle, plaque)..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                {searchTerm && <Button variant="outline-secondary" onClick={() => setSearchTerm('')}><XCircle /></Button>}
              </InputGroup>
            </Col>
            <Col md={6} className="text-end">
              <Button variant="primary" onClick={handleShowCreate}><PlusCircle className="me-2" /> Ajout Rapide</Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Voitures Table */}
      <Card className="shadow-sm">
        <Card.Body className="p-0">
          <Table hover responsive className="mb-0 align-middle">
            <thead className="bg-light">
              <tr>
                <th className="ps-4">Véhicule</th>
                <th>Agence/Catégorie</th>
                <th>Immatriculation</th>
                <th>Prix/Jour</th>
                <th>Statut</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVoitures.map(v => (
                <tr key={v.id}>
                  <td className="ps-4">
                    <div className="d-flex align-items-center">
                      <Image
                        src={getPhotoUrl(v.photo) || 'https://placehold.co/60x40?text=No+Img'}
                        rounded
                        width={60} height={40}
                        className="me-3 object-fit-cover"
                      />
                      <div>
                        <div className="fw-bold">{v.marque} {v.modele}</div>
                        <small className="text-muted">{v.annee} • {v.kilometrage} km</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="small"><GeoAlt className="me-1" />{v.agence?.nom || 'N/A'}</div>
                    <Badge bg="light" text="dark" className="border">{v.categorie?.nom || 'N/A'}</Badge>
                  </td>
                  <td className="font-monospace">{v.immatriculation}</td>
                  <td className="fw-bold text-success">{v.prix_journalier.toLocaleString()} FCFA</td>
                  <td>{getStatusBadge(v)}</td>
                  <td className="text-center">
                    <Button variant="outline-primary" size="sm" className="me-1" onClick={() => handleShowEdit(v)}><Pencil /></Button>
                    <Button variant="outline-danger" size="sm" onClick={() => { setDeletingVoiture(v); setShowDeleteModal(true); }}><Trash /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {filteredVoitures.length === 0 && <Alert variant="info" className="m-3">Aucun véhicule trouvé.</Alert>}
        </Card.Body>
      </Card>

      {/* Modal Create/Edit */}
      <Modal show={showModal} onHide={handleCloseModal} size="xl" backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>{editingVoiture ? `Modifier ${editingVoiture.marque} ${editingVoiture.modele}` : 'Nouveau Véhicule'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalLoading ? <div className="text-center py-5"><Spinner animation="border" /></div> : (
            <Form>
              <Row>
                <Col lg={8}>
                  <h6 className="fw-bold mb-3 border-bottom pb-2">Informations Générales</h6>
                  <Row className="g-3 mb-4">
                    <Col md={6}>
                      <Form.Label>Marque *</Form.Label>
                      <Form.Control value={formData.marque} onChange={e => setFormData({ ...formData, marque: e.target.value })} />
                    </Col>
                    <Col md={6}>
                      <Form.Label>Modèle *</Form.Label>
                      <Form.Control value={formData.modele} onChange={e => setFormData({ ...formData, modele: e.target.value })} />
                    </Col>
                    <Col md={4}>
                      <Form.Label>Année</Form.Label>
                      <Form.Control type="number" value={formData.annee} onChange={e => setFormData({ ...formData, annee: parseInt(e.target.value) })} />
                    </Col>
                    <Col md={4}>
                      <Form.Label>Couleur</Form.Label>
                      <Form.Control value={formData.couleur} onChange={e => setFormData({ ...formData, couleur: e.target.value })} />
                    </Col>
                    <Col md={4}>
                      <Form.Label>Plaque (Immat.) *</Form.Label>
                      <Form.Control value={formData.immatriculation} onChange={e => setFormData({ ...formData, immatriculation: e.target.value })} />
                    </Col>
                    <Col md={6}>
                      <Form.Label>Catégorie *</Form.Label>
                      <Form.Select value={formData.categorie_id} onChange={e => setFormData({ ...formData, categorie_id: parseInt(e.target.value) })}>
                        <option value="">Choisir...</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                      </Form.Select>
                    </Col>
                    <Col md={6}>
                      <Form.Label>Agence *</Form.Label>
                      <Form.Select value={formData.agence_id} onChange={e => setFormData({ ...formData, agence_id: parseInt(e.target.value) })}>
                        <option value="">Choisir...</option>
                        {agences.map(a => <option key={a.id} value={a.id}>{a.nom}</option>)}
                      </Form.Select>
                    </Col>
                    <Col md={4}>
                      <Form.Label>Prix Journalier *</Form.Label>
                      <Form.Control type="number" value={formData.prix_journalier} onChange={e => setFormData({ ...formData, prix_journalier: parseInt(e.target.value) })} />
                    </Col>
                    <Col md={4}>
                      <Form.Label>Kilométrage</Form.Label>
                      <Form.Control type="number" value={formData.kilometrage} onChange={e => setFormData({ ...formData, kilometrage: parseInt(e.target.value) })} />
                    </Col>
                    <Col md={4}>
                      <Form.Label>Statut</Form.Label>
                      <Form.Select value={formData.statut} onChange={e => setFormData({ ...formData, statut: e.target.value })}>
                        <option value="disponible">Disponible</option>
                        <option value="loue">Loué</option>
                        <option value="maintenance">Maintenance</option>
                      </Form.Select>
                      {formData.statut === 'loue' && editingVoiture?.reservations && (
                        (() => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const activeRes = [...editingVoiture.reservations]
                            .filter(r => (r.statut === 'confirmee' || r.statut === 'en_cours'))
                            .sort((a, b) => new Date(a.date_retour || a.date_fin).getTime() - new Date(b.date_retour || b.date_fin).getTime())
                            .find(r => new Date(r.date_retour || r.date_fin) >= today);

                          return activeRes ? (
                            <div className="mt-2 small text-warning fw-bold">
                              <Calendar className="me-1" /> Retour prévu : {new Date(activeRes.date_retour || activeRes.date_fin).toLocaleDateString('fr-FR')}
                            </div>
                          ) : (
                            <div className="mt-2 small text-muted italic">Aucune réservation active trouvée.</div>
                          );
                        })()
                      )}
                    </Col>
                  </Row>
                </Col>
                <Col lg={4} className="bg-light p-3 rounded">
                  <h6 className="fw-bold mb-3 border-bottom pb-2">Photos & Galerie</h6>

                  <div className="mb-3">
                    <Form.Label>Photo Principale</Form.Label>
                    <div className="ratio ratio-16x9 mb-2 bg-white border rounded d-flex align-items-center justify-content-center overflow-hidden">
                      {(photoPreview || editingVoiture?.photo) ? (
                        <Image src={photoPreview || getPhotoUrl(editingVoiture?.photo)!} className="object-fit-cover w-100 h-100" />
                      ) : <CarFront size={40} className="text-muted" />}
                    </div>
                    <Form.Control type="file" size="sm" onChange={handlePhotoChange} accept="image/*" />
                  </div>

                  <hr />
                  <Form.Label>Galerie ({existingGalleryImages.length + galleryImages.length})</Form.Label>
                  <div className="d-flex flex-wrap gap-2 mb-2">
                    {existingGalleryImages.map(img => (
                      <div key={img.id} className="position-relative border rounded" style={{ width: 60, height: 60 }}>
                        <Image src={getPhotoUrl(img.path)!} className="w-100 h-100 object-fit-cover rounded" />
                        <div className="position-absolute top-0 start-0 w-100 h-100 bg-danger bg-opacity-50 text-white d-flex justify-content-center align-items-center opacity-0 hover-opacity-100 rounded"
                          style={{ cursor: 'pointer' }} onClick={() => markExistingImageForDeletion(img.id)}>
                          <Trash />
                        </div>
                      </div>
                    ))}
                    {galleryImages.map((img, idx) => (
                      <div key={idx} className="position-relative border rounded border-primary" style={{ width: 60, height: 60 }}>
                        <Image src={img.preview} className="w-100 h-100 object-fit-cover rounded" />
                        <div className="position-absolute top-0 start-0 w-100 h-100 bg-danger bg-opacity-50 text-white d-flex justify-content-center align-items-center opacity-0 hover-opacity-100 rounded"
                          style={{ cursor: 'pointer' }} onClick={() => removeGalleryImage(idx)}>
                          <Trash />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="d-grid">
                    <Form.Label htmlFor="gallery-upload" className="btn btn-outline-secondary btn-sm"><Images className="me-2" />Ajouter photos</Form.Label>
                    <Form.Control id="gallery-upload" type="file" multiple className="d-none" onChange={handleGalleryChange} accept="image/*" />
                  </div>
                </Col>
              </Row>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>Annuler</Button>
          <Button variant="primary" onClick={handleSave} disabled={modalLoading}>Enregistrer</Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton><Modal.Title>Confirmation</Modal.Title></Modal.Header>
        <Modal.Body>Voulez-vous vraiment supprimer ce véhicule ?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Annuler</Button>
          <Button variant="danger" onClick={handleDelete}>Supprimer</Button>
        </Modal.Footer>
      </Modal>

      <style>{`
                .hover-opacity-100:hover { opacity: 1 !important; }
            `}</style>
    </Container>
  );
};

export default VoituresAdminPage;
