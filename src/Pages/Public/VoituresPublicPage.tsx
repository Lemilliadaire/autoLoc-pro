// src/Pages/Public/VoituresPublicPage.tsx
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getVoitures } from "../../services/voiture";
import { getCategories } from "../../services/categorie";
import { getAgences } from "../../services/agence";
import type { Voiture, Categorie, Agence } from "../../types/api";
import { Container, Row, Col, Card, Button, Form, Pagination, Badge, InputGroup } from "react-bootstrap";
import { Search, FunnelFill, GeoAltFill, Speedometer, Calendar, Palette, XCircle, Whatsapp } from "react-bootstrap-icons";
import LoadingSpinner from "../../Components/LoadingSpinner";

const VoituresPublicPage: React.FC = () => {
  const getPhotoUrl = (photo: string | undefined, images?: any[]) => {
    if (!photo && (!images || images.length === 0)) return null;
    const path = photo || images![0].path;
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/storage/') ? path.substring(9) :
      path.startsWith('storage/') ? path.substring(8) : path;
    return `http://127.0.0.1:8000/storage/${cleanPath}`;
  };
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [voitures, setVoitures] = useState<Voiture[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [agences, setAgences] = useState<Agence[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  // Filters
  const [search, setSearch] = useState("");
  const [categorieId, setCategorieId] = useState<string>(searchParams.get("categorie") || "");
  const [agenceId, setAgenceId] = useState<string>("");
  const [statut, setStatut] = useState<string>(""); // Default ALL to show rented cars too

  useEffect(() => {
    Promise.all([
      getCategories(),
      getAgences()
    ]).then(([cats, ags]) => {
      setCategories(cats);
      setAgences(ags);
    });
  }, []);

  useEffect(() => {
    fetchVoitures();
  }, [categorieId, agenceId, statut, page]);

  const fetchVoitures = () => {
    setLoading(true);
    getVoitures({
      categorie_id: categorieId ? Number(categorieId) : undefined,
      agence_id: agenceId ? Number(agenceId) : undefined,
      statut: statut || undefined,
      page,
      per_page: 12,
    })
      .then((data: any) => {
        setVoitures(data.data);
        setLastPage(data.last_page);
      })
      .catch((err: any) => console.error(err))
      .finally(() => setLoading(false));
  };

  // Filter locally for search text (since API might not support it yet)
  const filteredVoitures = voitures.filter(v =>
    search === "" ||
    v.marque.toLowerCase().includes(search.toLowerCase()) ||
    v.modele.toLowerCase().includes(search.toLowerCase())
  );

  const resetFilters = () => {
    setSearch("");
    setCategorieId("");
    setAgenceId("");
    setStatut(""); // Reset to ALL
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="bg-light min-vh-100 py-5">
      <Container>
        <div className="mb-5">
          <h1 className="fw-bold mb-3">Notre Catalogue</h1>
          <p className="text-muted lead">
            Découvrez notre large sélection de véhicules disponibles à la location.
          </p>
        </div>

        <Row>
          {/* Sidebar Filters */}
          <Col lg={3} className="mb-4">
            <Card className="border-0 shadow-sm sticky-top" style={{ top: '2rem', zIndex: 1 }}>
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="mb-0 fw-bold"><FunnelFill className="me-2" /> Filtres</h5>
                  {(search || categorieId || agenceId || statut !== '') && (
                    <Button variant="link" size="sm" className="text-danger text-decoration-none p-0" onClick={resetFilters}>
                      Réinitialiser
                    </Button>
                  )}
                </div>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold small text-muted">Recherche</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-white border-end-0"><Search /></InputGroup.Text>
                    <Form.Control
                      type="search"
                      placeholder="Marque, modèle..."
                      className="border-start-0 ps-0"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold small text-muted">Catégorie</Form.Label>
                  <Form.Select
                    value={categorieId}
                    onChange={(e) => {
                      setCategorieId(e.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="">Toutes les catégories</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.nom}</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold small text-muted">Agence</Form.Label>
                  <Form.Select
                    value={agenceId}
                    onChange={(e) => {
                      setAgenceId(e.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="">Toutes les agences</option>
                    {agences.map(a => (
                      <option key={a.id} value={a.id}>{a.nom} - {a.ville}</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold small text-muted">Disponibilité</Form.Label>
                  <Form.Select
                    value={statut}
                    onChange={(e) => {
                      setStatut(e.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="">Tous les statuts</option>
                    <option value="disponible">Disponible uniquement</option>
                    <option value="loue">Loué</option>
                    <option value="maintenance">En maintenance</option>
                  </Form.Select>
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>

          {/* Car Grid */}
          <Col lg={9}>
            {loading ? (
              <LoadingSpinner />
            ) : filteredVoitures.length === 0 ? (
              <div className="text-center py-5">
                <XCircle size={48} className="text-muted mb-3" />
                <h4>Aucun véhicule trouvé</h4>
                <p className="text-muted">Essayez de modifier vos filtres de recherche.</p>
                <Button variant="primary" onClick={resetFilters}>Voir tous les véhicules</Button>
              </div>
            ) : (
              <>
                <Row xs={1} md={2} className="g-4 mb-5">
                  {filteredVoitures.map(v => (
                    <Col key={v.id}>
                      <Card className="h-100 border-0 shadow-sm card-hover">
                        <div className="position-relative">
                          {getPhotoUrl(v.photo, v.images) ? (
                            <Card.Img
                              variant="top"
                              src={getPhotoUrl(v.photo, v.images)!}
                              style={{ height: '220px', objectFit: 'cover' }}
                            />
                          ) : (
                            <div className="bg-light d-flex align-items-center justify-content-center" style={{ height: '220px' }}>
                              <span className="text-muted">Photo non disponible</span>
                            </div>
                          )}
                          <Badge
                            bg={v.statut === 'disponible' ? 'success' : v.statut === 'loue' ? 'warning' : 'danger'}
                            className="position-absolute top-0 end-0 m-3 px-3 py-2 rounded-pill shadow-sm"
                          >
                            {v.statut === 'disponible' ? 'Disponible' : v.statut === 'loue' ? 'Loué' : 'Indisponible'}
                          </Badge>
                          {v.statut === 'loue' && v.reservations && v.reservations.length > 0 && (
                            (() => {
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              const activeRes = [...v.reservations]
                                .filter(r => (r.statut === 'confirmee' || r.statut === 'en_cours'))
                                .sort((a, b) => new Date(a.date_retour || a.date_fin).getTime() - new Date(b.date_retour || b.date_fin).getTime())
                                .find(r => new Date(r.date_retour || r.date_fin) >= today);

                              return activeRes ? (
                                <Badge
                                  bg="info"
                                  className="position-absolute top-0 end-0 mt-5 mx-3 px-3 py-1 rounded-pill shadow-sm"
                                  style={{ fontSize: '0.7rem' }}
                                >
                                  Dispo le {new Date(activeRes.date_retour || activeRes.date_fin).toLocaleDateString('fr-FR')}
                                </Badge>
                              ) : null;
                            })()
                          )}
                          <Badge
                            bg="light"
                            text="dark"
                            className="position-absolute bottom-0 start-0 m-3 px-3 py-2 rounded-pill shadow-sm"
                          >
                            {v.categorie?.nom}
                          </Badge>
                        </div>

                        <Card.Body className="p-4">
                          <Card.Title className="h5 fw-bold mb-3">{v.marque} {v.modele}</Card.Title>

                          <Row className="g-2 mb-4 small text-muted">
                            <Col xs={6} className="d-flex align-items-center">
                              <Calendar className="me-2" /> {v.annee}
                            </Col>
                            <Col xs={6} className="d-flex align-items-center">
                              <Speedometer className="me-2" /> {v.kilometrage} km
                            </Col>
                            <Col xs={6} className="d-flex align-items-center">
                              <Palette className="me-2" /> {v.couleur}
                            </Col>
                            <Col xs={6} className="d-flex align-items-center">
                              <GeoAltFill className="me-2" /> {v.agence?.ville}
                            </Col>
                          </Row>

                          <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                            <div>
                              <span className="h4 fw-bold text-primary mb-0">{v.prix_journalier} FCFA</span>
                              <span className="text-muted small"> / jour</span>
                            </div>
                            <div className="d-flex gap-2">
                              <Button
                                variant="success"
                                size="sm"
                                className="rounded-pill px-2 d-flex align-items-center gap-2 shadow-sm"
                                style={{ backgroundColor: '#25D366', borderColor: '#25D366' }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const phone = '22879808915';
                                  const msg = encodeURIComponent(`Bonjour, je suis intéressé par la ${v.marque} ${v.modele} à ${v.prix_journalier} FCFA/jour.`);
                                  window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
                                }}
                                title="Contacter sur WhatsApp"
                              >
                                <Whatsapp size={16} />
                                <span>WhatsApp</span>
                              </Button>
                              <Button
                                onClick={() => navigate(`/voitures-public/${v.id}`)}
                                variant={v.statut === 'disponible' ? 'primary' : 'outline-secondary'}
                                size="sm"
                                className="rounded-pill px-3"
                              >
                                {v.statut === 'disponible' ? 'Réserver' : 'Détails'}
                              </Button>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>

                {/* Pagination */}
                {lastPage > 1 && (
                  <div className="d-flex justify-content-center">
                    <Pagination>
                      <Pagination.First onClick={() => setPage(1)} disabled={page === 1} />
                      <Pagination.Prev onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} />

                      {Array.from({ length: lastPage }, (_, i) => i + 1).map(number => (
                        <Pagination.Item key={number} active={number === page} onClick={() => setPage(number)}>
                          {number}
                        </Pagination.Item>
                      ))}

                      <Pagination.Next onClick={() => setPage(p => Math.min(lastPage, p + 1))} disabled={page === lastPage} />
                      <Pagination.Last onClick={() => setPage(lastPage)} disabled={page === lastPage} />
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </Col>
        </Row>
      </Container>
    </div >
  );
};

export default VoituresPublicPage;
