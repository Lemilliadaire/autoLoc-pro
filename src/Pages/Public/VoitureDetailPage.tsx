// src/Pages/Public/VoitureDetailPage.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button, Badge, ListGroup } from "react-bootstrap";
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

  const fetchVoiture = async (voitureId: number) => {
    try {
      const data = await getVoiture(voitureId);
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

  if (loading) return <LoadingSpinner />;
  if (!voiture) return <div className="text-center py-5">Voiture non trouvée</div>;

  return (
    <Container className="py-5">
      <Button variant="outline-secondary" className="mb-4" onClick={() => navigate(-1)}>
        <ArrowLeft className="me-2" /> Retour
      </Button>

      <Row>
        <Col lg={8}>
          <Card className="shadow-sm border-0 mb-4">
            {voiture.photo ? (
              <Card.Img
                variant="top"
                src={`http://127.0.0.1:8000/storage/${voiture.photo}`}
                alt={`${voiture.marque} ${voiture.modele}`}
                style={{ height: '400px', objectFit: 'cover' }}
              />
            ) : (
              <div className="bg-light d-flex align-items-center justify-content-center" style={{ height: '400px' }}>
                <span className="text-muted">Photo non disponible</span>
              </div>
            )}
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h2 className="mb-1">{voiture.marque} {voiture.modele}</h2>
                  <Badge bg="secondary" className="me-2">{voiture.categorie?.nom}</Badge>
                  <Badge bg={voiture.statut === 'disponible' ? 'success' : 'warning'}>
                    {voiture.statut === 'disponible' ? 'Disponible' : 'Indisponible'}
                  </Badge>
                </div>
                <div className="text-end">
                  <h3 className="text-primary mb-0">{voiture.prix_journalier} €</h3>
                  <small className="text-muted">par jour</small>
                </div>
              </div>

              <hr />

              <h5 className="mb-3">Caractéristiques</h5>
              <Row xs={1} md={2} className="g-3 mb-4">
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
