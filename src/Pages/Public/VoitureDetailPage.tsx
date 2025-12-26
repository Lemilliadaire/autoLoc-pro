// src/Pages/Public/VoitureDetailPage.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button, Badge, ListGroup, Nav } from "react-bootstrap";
import { ArrowLeft, Speedometer, Calendar, Palette, GeoAlt, Tag, CheckCircle } from "react-bootstrap-icons";
import type { Voiture } from "../../types/api";
import { getVoiture } from "../../services/voiture";
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

  useEffect(() => {
    if (id) {
      fetchVoiture(Number(id));
    }
  }, [id]);

  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tous' | 'exterieur' | 'interieur' | 'autre'>('tous');

  useEffect(() => {
    if (voiture) {
      if (voiture.photo) {
        setActiveImage(getImagePath(voiture.photo));
      } else if (voiture.images && voiture.images.length > 0) {
        setActiveImage(getImagePath(voiture.images[0].path));
      }
    }
  }, [voiture]);

  const fetchVoiture = async (voitureId: number) => {
    try {
      const data = await getVoiture(voitureId);
      console.log('🚗 Données de la voiture chargées:', data);
      console.log('📸 Images de galerie:', data.images?.length || 0);
      if (data.images && data.images.length > 0) {
        data.images.forEach((img, i) => {
          console.log(`  ${i + 1}. ${img.path} (${img.type})`);
        });
      }
      setVoiture(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredImages = voiture?.images?.filter(img => activeTab === 'tous' || img.type === activeTab) || [];

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
              {activeImage ? (
                <div style={{ height: '450px', position: 'relative', overflow: 'hidden' }}>
                  <Card.Img
                    src={activeImage}
                    alt="Main view"
                    className="w-100 h-100 animate-in"
                    style={{ objectFit: 'cover', transition: 'all 0.5s ease' }}
                    key={activeImage}
                  />
                  <div className="position-absolute bottom-0 start-0 w-100 p-4" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }}>
                    <h2 className="text-white mb-0 fw-bold">{voiture.marque} {voiture.modele}</h2>
                    <span className="text-white-50">{voiture.annee} • Premium Edition</span>
                  </div>
                </div>
              ) : (
                <div className="bg-light d-flex align-items-center justify-content-center" style={{ height: '450px' }}>
                  <span className="text-muted">Aucune image disponible</span>
                </div>
              )}
            </div>

            <Card.Body className="p-4 bg-white">
              {hasGallery && (
                <>
                  {/* Category Toggles */}
                  <Nav variant="pills" className="gallery-nav mb-4 gap-2">
                    <Nav.Item>
                      <Nav.Link active={activeTab === 'tous'} onClick={() => setActiveTab('tous')} className="rounded-pill">Tous</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link active={activeTab === 'exterieur'} onClick={() => setActiveTab('exterieur')} className="rounded-pill">Extérieur</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link active={activeTab === 'interieur'} onClick={() => setActiveTab('interieur')} className="rounded-pill">Intérieur</Nav.Link>
                    </Nav.Item>
                  </Nav>
                </>
              )}

              {/* Thumbnails */}
              <div className="d-flex gap-3 overflow-auto pb-2 scrollbar-none" style={{ scrollSnapType: 'x mandatory' }}>
                {voiture.photo && (
                  <div
                    className={`flex-shrink-0 cursor-pointer rounded-4 overflow-hidden border-2 transition-all ${activeImage === getImagePath(voiture.photo) ? 'border-primary ring-2 ring-primary' : 'border-transparent'}`}
                    style={{ width: '100px', height: '70px', scrollSnapAlign: 'start' }}
                    onClick={() => setActiveImage(getImagePath(voiture.photo!))}
                  >
                    <img src={getImagePath(voiture.photo)} className="w-100 h-100 object-fit-cover" alt="Main" />
                  </div>
                )}
                {filteredImages.map((img) => (
                  <div
                    key={img.id}
                    className={`flex-shrink-0 cursor-pointer rounded-4 overflow-hidden border-2 transition-all ${activeImage === getImagePath(img.path) ? 'border-primary ring-2 ring-primary' : 'border-transparent'}`}
                    style={{ width: '100px', height: '70px', scrollSnapAlign: 'start' }}
                    onClick={() => setActiveImage(getImagePath(img.path))}
                  >
                    <img src={getImagePath(img.path)} className="w-100 h-100 object-fit-cover" alt={img.type} />
                  </div>
                ))}
              </div>
            </Card.Body>

            <Card.Body className="p-4 border-top">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex gap-2">
                  <Badge bg="light" text="dark" className="border px-3 py-2 rounded-pill fw-medium">{voiture.categorie?.nom}</Badge>
                  <Badge bg={voiture.statut === 'disponible' ? 'success' : 'warning'} className="px-3 py-2 rounded-pill">
                    {voiture.statut === 'disponible' ? 'Disponible Immédiatement' : 'Temporairement Indisponible'}
                  </Badge>
                </div>
              </div>

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
          <Card className="shadow-sm border-0 sticky-top" style={{ top: '2rem' }}>
            <Card.Body>
              <h4 className="mb-4">Réserver ce véhicule</h4>
              <ListGroup variant="flush" className="mb-4">
                <ListGroup.Item className="d-flex justify-content-between align-items-center px-0">
                  <span>Prix par jour</span>
                  <strong>{voiture.prix_journalier} €</strong>
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
                {voiture.statut === 'disponible' ? 'Réserver maintenant' : 'Non disponible'}
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

      <ReservationModal
        show={showReservationModal}
        onHide={() => setShowReservationModal(false)}
        voiture={voiture}
      />
    </Container>
  );
};

export default VoitureDetailPage;
