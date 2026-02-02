// src/Pages/Public/VoitureDetailPage.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button, Badge, ListGroup, Nav, Carousel } from "react-bootstrap";
import { ArrowLeft, Speedometer, Calendar, Palette, GeoAlt, Tag, CheckCircle, Whatsapp, Images } from "react-bootstrap-icons";
import type { Voiture } from "../../types/api";
import { getVoiture, getVoitures } from "../../services/voiture";
import LoadingSpinner from "../../Components/LoadingSpinner";
import ReservationModal from "../User/ReservationModal";
import { useAuth } from "../../hooks/useAuth";

const VoitureDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [voiture, setVoiture] = useState<Voiture | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [similarCars, setSimilarCars] = useState<Voiture[]>([]);

  useEffect(() => {
    if (voiture && voiture.statut !== 'disponible') {
      getVoitures({
        categorie_id: voiture.categorie_id,
        statut: 'disponible',
        per_page: 3
      })
        .then((res: any) => {
          const suggestions = res.data.filter((v: Voiture) => v.id !== voiture.id).slice(0, 3);
          setSimilarCars(suggestions);
        })
        .catch(console.error);
    } else {
      setSimilarCars([]);
    }
  }, [voiture]);

  useEffect(() => {
    if (id) {
      fetchVoiture(Number(id));
    }
  }, [id]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'tous' | 'exterieur' | 'interieur' | 'autre'>('tous');

  // Reset index on tab change
  useEffect(() => {
    setActiveIndex(0);
  }, [activeTab, voiture]);

  const carouselImages = React.useMemo(() => {
    if (!voiture) return [];
    const images: { path: string, type: string, id: string | number }[] = [];
    if (voiture.photo) {
      images.push({ path: voiture.photo, type: 'main', id: 'main' });
    }
    const gallery = voiture.images || [];
    const filtered = gallery.filter(img => activeTab === 'tous' || img.type === activeTab);
    images.push(...filtered);
    return images;
  }, [voiture, activeTab]);

  const fetchVoiture = async (voitureId: number) => {
    try {
      const data = await getVoiture(voitureId);
      console.log('🚗 Données de la voiture chargées:', data);
      console.log('🔑 Clés disponibles:', Object.keys(data));
      console.log('📸 Images de galerie:', data.images?.length || 0);
      console.log('📅 Réservations:', data.reservations?.length || 0);
      console.log('🔍 Statut de la voiture:', data.statut);

      if (data.reservations && data.reservations.length > 0) {
        console.log('📋 Détails des réservations:');
        data.reservations.forEach((res, i) => {
          console.log(`  ${i + 1}. Statut: ${res.statut}, Date retour: ${res.date_retour || res.date_fin}`);
        });
      } else {
        console.warn('⚠️ Aucune réservation trouvée pour cette voiture');
      }

      if (data.images && data.images.length > 0) {
        console.log('📸 Images trouvées:');
        data.images.forEach((img, i) => {
          console.log(`  ${i + 1}. ${img.path} (${img.type})`);
        });
      } else {
        console.warn('⚠️ Aucune image de galerie trouvée');
      }
      setVoiture(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReservationClick = () => {
    if (!user) {
      // Rediriger vers login si non connecté
      navigate("/login", { state: { from: `/voitures-public/${id}` } });
      return;
    }

    // Vérifier si le profil client est complet
    if (!('client' in user) || !user.client) {
      navigate("/profil", { state: { message: "Veuillez compléter votre profil client pour pouvoir réserver un véhicule." } });
      return;
    }

    setShowReservationModal(true);
  };

  const getImagePath = (path: string | undefined) => {
    if (!path) return "";
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/storage/') ? path.substring(9) :
      path.startsWith('storage/') ? path.substring(8) : path;
    return `http://127.0.0.1:8000/storage/${cleanPath}`;
  };

  if (loading) return <LoadingSpinner />;
  if (!voiture) return <div className="text-center py-5">Voiture non trouvée</div>;

  const hasGallery = (voiture.images?.length ?? 0) > 0;

  return (
    <Container className="py-5">
      <Button variant="outline-secondary" className="mb-4 shadow-sm" onClick={() => navigate(-1)}>
        <ArrowLeft className="me-2" /> Retour au catalogue
      </Button>

      <Row>
        <Col lg={8}>
          {/* Gallery Section */}
          <Card className="shadow-lg border-0 mb-4 overflow-hidden" style={{ borderRadius: '1.5rem' }}>
            <div className="position-relative">
              {carouselImages.length > 0 ? (
                <Carousel
                  activeIndex={activeIndex}
                  onSelect={(selectedIndex) => setActiveIndex(selectedIndex)}
                  interval={null}
                  className="custom-carousel rounded-top-4 overflow-hidden"
                >
                  {carouselImages.map((img, idx) => (
                    <Carousel.Item key={idx}>
                      <div style={{ height: '450px', position: 'relative', overflow: 'hidden', background: '#212529' }}>
                        <img
                          className="d-block w-100 h-100"
                          src={getImagePath(img.path)}
                          alt={img.type}
                          style={{ objectFit: 'contain' }}
                        />
                      </div>
                    </Carousel.Item>
                  ))}
                </Carousel>
              ) : (
                <div className="bg-light d-flex align-items-center justify-content-center" style={{ height: '450px' }}>
                  <span className="text-muted">Aucune image disponible</span>
                </div>
              )}
            </div>

            <Card.Body className="p-4 bg-white">
              <div className="d-flex align-items-center justify-content-between mb-4">
                <div className="d-flex align-items-center">
                  <Images className="text-primary me-2" size={24} />
                  <h5 className="fw-bold mb-0">Galerie photos</h5>
                </div>
                {hasGallery && (
                  <Badge bg="light" text="dark" className="border px-3 py-2 rounded-pill shadow-sm">
                    {voiture.images?.length ? voiture.images.length + 1 : 1} photos
                  </Badge>
                )}
              </div>

              {hasGallery && (
                <Nav variant="pills" className="gallery-nav mb-4 gap-2">
                  <Nav.Item>
                    <Nav.Link active={activeTab === 'tous'} onClick={() => setActiveTab('tous')} className="rounded-pill px-3 py-1 small">Tous</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link active={activeTab === 'exterieur'} onClick={() => setActiveTab('exterieur')} className="rounded-pill px-3 py-1 small">Extérieur</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link active={activeTab === 'interieur'} onClick={() => setActiveTab('interieur')} className="rounded-pill px-3 py-1 small">Intérieur</Nav.Link>
                  </Nav.Item>
                </Nav>
              )}

              <div className="d-flex gap-3 overflow-auto pb-3 scrollbar-none" style={{ scrollSnapType: 'x mandatory' }}>
                {carouselImages.map((img, idx) => (
                  <div
                    key={idx}
                    className={`flex-shrink-0 cursor-pointer rounded-4 overflow-hidden border border-2 transition-all position-relative shadow-sm`}
                    style={{
                      width: '120px',
                      height: '80px',
                      scrollSnapAlign: 'start',
                      borderColor: activeIndex === idx ? 'var(--bs-primary)' : 'transparent',
                      opacity: activeIndex === idx ? 1 : 0.6,
                      transform: activeIndex === idx ? 'scale(1.05)' : 'scale(1)'
                    }}
                    onClick={() => setActiveIndex(idx)}
                  >
                    <img src={getImagePath(img.path)} className="w-100 h-100 object-fit-cover" alt={img.type} />
                    {activeIndex === idx && (
                      <div className="position-absolute top-0 end-0 m-1 bg-primary rounded-circle shadow-sm" style={{ width: '10px', height: '10px', border: '2px solid white' }}></div>
                    )}
                  </div>
                ))}
              </div>
            </Card.Body>

            <Card.Body className="p-4 border-top">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex gap-2">
                  <Badge bg="light" text="dark" className="border px-3 py-2 rounded-pill fw-medium">{voiture.categorie?.nom}</Badge>
                  <Badge bg={voiture.statut === 'disponible' ? 'success' : voiture.statut === 'loue' ? 'warning' : 'danger'} className="px-3 py-2 rounded-pill">
                    {voiture.statut === 'disponible' ? 'Disponible Immédiatement' : voiture.statut === 'loue' ? 'Loué' : 'Temporairement Indisponible'}
                  </Badge>
                </div>
              </div>

              {voiture.statut === 'loue' && (
                <div className="alert alert-warning border-0 shadow-sm mb-4 d-flex align-items-center gap-3 p-3" style={{ borderRadius: '1rem' }}>
                  <div className="bg-warning bg-opacity-25 p-2 rounded-circle">
                    <Calendar size={24} className="text-warning-emphasis" />
                  </div>
                  <div className="flex-grow-1">
                    <h6 className="fw-bold mb-1">Véhicule actuellement loué</h6>
                    {voiture.reservations && voiture.reservations.length > 0 ? (
                      (() => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);

                        // Trouver la réservation active ou la plus proche de se terminer
                        const activeRes = [...voiture.reservations]
                          .filter(r => (r.statut === 'confirmee' || r.statut === 'en_cours'))
                          .sort((a, b) => new Date(a.date_retour || a.date_fin).getTime() - new Date(b.date_retour || b.date_fin).getTime())
                          .find(r => new Date(r.date_retour || r.date_fin) >= today);

                        if (activeRes) {
                          return (
                            <p className="mb-0 small text-muted">
                              Sera de nouveau disponible à partir du <strong className="text-dark">{new Date(activeRes.date_retour || activeRes.date_fin).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>.
                            </p>
                          );
                        } else {
                          return <p className="mb-0 small text-muted">Date de retour non précisée.</p>;
                        }
                      })()
                    ) : (
                      <p className="mb-0 small text-muted">Les détails de disponibilité ne sont pas accessibles pour le moment.</p>
                    )}
                  </div>
                </div>
              )}

              <h5 className="mb-4 fw-bold">Spécifications techniques</h5>
              <Row xs={2} md={4} className="g-4 mb-4">
                <Col>
                  <div className="d-flex align-items-center">
                    <Speedometer className="text-primary me-3" size={24} />
                    <div>
                      <small className="text-muted d-block">Kilométrage</small>
                      <strong>{voiture.kilometrage} km</strong>
                    </div>
                  </div>
                </Col>
                <Col>
                  <div className="d-flex align-items-center">
                    <Calendar className="text-primary me-3" size={24} />
                    <div>
                      <small className="text-muted d-block">Année</small>
                      <strong>{voiture.annee}</strong>
                    </div>
                  </div>
                </Col>
                <Col>
                  <div className="d-flex align-items-center">
                    <Palette className="text-primary me-3" size={24} />
                    <div>
                      <small className="text-muted d-block">Couleur</small>
                      <strong>{voiture.couleur}</strong>
                    </div>
                  </div>
                </Col>
                <Col>
                  <div className="d-flex align-items-center">
                    <Tag className="text-primary me-3" size={24} />
                    <div>
                      <small className="text-muted d-block">Immatriculation</small>
                      <strong>{voiture.immatriculation}</strong>
                    </div>
                  </div>
                </Col>
                {voiture.statut === 'loue' && voiture.reservations && voiture.reservations.length > 0 && (() => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const activeRes = [...voiture.reservations]
                    .filter(r => (r.statut === 'confirmee' || r.statut === 'en_cours'))
                    .sort((a, b) => new Date(a.date_retour || a.date_fin).getTime() - new Date(b.date_retour || b.date_fin).getTime())
                    .find(r => new Date(r.date_retour || r.date_fin) >= today);

                  if (activeRes) {
                    return (
                      <Col>
                        <div className="d-flex align-items-center">
                          <Calendar className="text-warning me-3" size={24} />
                          <div>
                            <small className="text-muted d-block">Date de retour prévue</small>
                            <strong className="text-warning">
                              {new Date(activeRes.date_retour || activeRes.date_fin).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </strong>
                          </div>
                        </div>
                      </Col>
                    );
                  }
                  return null;
                })()}
              </Row>

              <h5 className="mb-3">Localisation</h5>
              <div className="d-flex align-items-center mb-4">
                <GeoAlt className="text-danger me-3" size={24} />
                <div>
                  <small className="text-muted d-block">Agence actuelle</small>
                  <strong>{voiture.agence?.nom}</strong>
                  <span className="text-muted d-block small">{voiture.agence?.ville}</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="shadow-sm border-0 sticky-top-responsive">
            <Card.Body>
              <h4 className="mb-4">Réserver ce véhicule</h4>
              <ListGroup variant="flush" className="mb-4">
                <ListGroup.Item className="d-flex justify-content-between align-items-center px-0">
                  <span>Prix par jour</span>
                  <strong>{voiture.prix_journalier} FCFA</strong>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center px-0">
                  <span>Assurance incluse</span>
                  <CheckCircle className="text-success" />
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center px-0">
                  <span>Annulation gratuite</span>
                  <CheckCircle className="text-success" />
                </ListGroup.Item>
              </ListGroup>

              <Button
                variant="primary"
                size="lg"
                className="w-100"
                disabled={voiture.statut !== 'disponible'}
                onClick={handleReservationClick}
              >
                {voiture.statut === 'disponible' ? 'Réserver maintenant' : (
                  (() => {
                    if (voiture.statut === 'loue' && voiture.reservations && voiture.reservations.length > 0) {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const activeRes = [...voiture.reservations]
                        .filter(r => (r.statut === 'confirmee' || r.statut === 'en_cours'))
                        .sort((a, b) => new Date(a.date_retour || a.date_fin).getTime() - new Date(b.date_retour || b.date_fin).getTime())
                        .find(r => new Date(r.date_retour || r.date_fin) >= today);

                      if (activeRes) {
                        return `Disponible le ${new Date(activeRes.date_retour || activeRes.date_fin).toLocaleDateString('fr-FR')}`;
                      }
                    }
                    return 'Non disponible';
                  })()
                )}
              </Button>

              <Button
                variant="success"
                size="lg"
                className="w-100 mt-3 d-flex align-items-center justify-content-center gap-2 shadow-sm"
                style={{ backgroundColor: '#25D366', borderColor: '#25D366' }}
                onClick={() => {
                  const phone = '22879808915';
                  const msg = encodeURIComponent(`Bonjour, je suis intéressé par la ${voiture.marque} ${voiture.modele} à ${voiture.prix_journalier} FCFA/jour (Réf: ${voiture.immatriculation}).`);
                  window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
                }}
              >
                <Whatsapp size={20} />
                Contacter sur WhatsApp
              </Button>

              {!user && (
                <div className="text-center mt-3">
                  <small className="text-muted">Connectez-vous pour réserver</small>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>



      {
        similarCars.length > 0 && (
          <div className="mt-5 animate-in">
            <h3 className="mb-4 fw-bold">Véhicules similaires disponibles</h3>
            <Row xs={1} md={3} className="g-4">
              {similarCars.map((v) => (
                <Col key={v.id}>
                  <Card className="h-100 border-0 shadow-sm hover-scale" style={{ transition: 'transform 0.2s' }}>
                    <div className="position-relative">
                      <Card.Img
                        variant="top"
                        src={getImagePath(v.photo || (v.images && v.images.length > 0 ? v.images[0].path : undefined))}
                        style={{ height: "200px", objectFit: "cover" }}
                      />
                      <Badge bg="success" className="position-absolute top-0 end-0 m-3 px-3 py-2 rounded-pill shadow-sm">
                        Disponible
                      </Badge>
                    </div>
                    <Card.Body>
                      <Card.Title className="h5 fw-bold mb-3">
                        {v.marque} {v.modele}
                      </Card.Title>
                      <Row className="g-2 mb-3 small text-muted">
                        <Col xs={6}>
                          <Calendar className="me-2" /> {v.annee}
                        </Col>
                        <Col xs={6}>
                          <Speedometer className="me-2" /> {v.kilometrage} km
                        </Col>
                      </Row>
                      <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                        <span className="fw-bold text-primary">{v.prix_journalier} FCFA / jour</span>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="rounded-pill px-4"
                          onClick={() => {
                            navigate(`/voitures-public/${v.id}`);
                            window.scrollTo(0, 0);
                          }}
                        >
                          Voir détails
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        )
      }

      <ReservationModal
        show={showReservationModal}
        onHide={() => setShowReservationModal(false)}
        voiture={voiture}
      />
    </Container >
  );
};

export default VoitureDetailPage;
