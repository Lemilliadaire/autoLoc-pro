// src/Pages/Home/HomePage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Button, Row, Col, Card, Badge } from 'react-bootstrap';
import { getVoitures } from '../../services/voiture';
import type { Voiture } from '../../types/api';
import LoadingSpinner from '../../Components/LoadingSpinner';
import { CarFrontFill, ShieldCheck, ClockHistory, GeoAltFill } from 'react-bootstrap-icons';
import './HomePage.css';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [featuredVoitures, setFeaturedVoitures] = useState<Voiture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getVoitures({ statut: 'disponible', page: 1 })
      .then(data => {
        setFeaturedVoitures(data.data.slice(0, 3));
      })
      .catch(err => {
        console.error("Erreur lors de la récupération des voitures :", err);
        setError("Impossible de charger les voitures en vedette.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="bg-light min-vh-100">
      {/* Hero Section */}
      <div className="hero-section text-white text-center position-relative mb-5" style={{
        background: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url("https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '150px 0'
      }}>
        <Container>
          <h1 className="display-3 fw-bold mb-4">Louez la voiture de vos rêves</h1>
          <p className="lead fs-4 mb-5 mx-auto" style={{ maxWidth: '800px' }}>
            Une expérience de location simple, rapide et transparente.
            Découvrez notre large gamme de véhicules pour tous vos besoins.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Button onClick={() => navigate("/voitures-public")} variant="primary" size="lg" className="px-5 py-3 fw-bold rounded-pill shadow">
              Voir nos voitures
            </Button>
            <Button onClick={() => navigate("/agences-public")} variant="outline-light" size="lg" className="px-5 py-3 fw-bold rounded-pill">
              Nos agences
            </Button>
          </div>
        </Container>
      </div>

      {/* Features Section */}
      <Container className="mb-5">
        <Row className="g-4 text-center">
          <Col md={4}>
            <div className="p-4 bg-white rounded-4 shadow-sm h-100">
              <div className="mb-3 text-primary">
                <CarFrontFill size={50} />
              </div>
              <h3 className="h4 mb-3">Large Choix</h3>
              <p className="text-muted mb-0">
                Des citadines aux SUV, trouvez le véhicule parfait pour votre trajet parmi notre flotte diversifiée.
              </p>
            </div>
          </Col>
          <Col md={4}>
            <div className="p-4 bg-white rounded-4 shadow-sm h-100">
              <div className="mb-3 text-primary">
                <ShieldCheck size={50} />
              </div>
              <h3 className="h4 mb-3">Sécurité Garantie</h3>
              <p className="text-muted mb-0">
                Tous nos véhicules sont révisés régulièrement et assurés tous risques pour votre tranquillité.
              </p>
            </div>
          </Col>
          <Col md={4}>
            <div className="p-4 bg-white rounded-4 shadow-sm h-100">
              <div className="mb-3 text-primary">
                <ClockHistory size={50} />
              </div>
              <h3 className="h4 mb-3">Réservation Rapide</h3>
              <p className="text-muted mb-0">
                Réservez en quelques clics et récupérez votre véhicule dans l'agence de votre choix.
              </p>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Featured Cars Section */}
      <Container className="py-5">
        <div className="d-flex justify-content-between align-items-end mb-4">
          <div>
            <h2 className="fw-bold mb-1">Nos voitures en vedette</h2>
            <p className="text-muted mb-0">Les modèles les plus populaires du moment</p>
          </div>
          <Button variant="link" onClick={() => navigate("/voitures-public")} className="text-decoration-none fw-bold">
            Voir tout le catalogue &rarr;
          </Button>
        </div>

        {loading && <LoadingSpinner />}
        {error && <p className="text-danger text-center">{error}</p>}

        {!loading && !error && (
          <Row xs={1} md={2} lg={3} className="g-4">
            {featuredVoitures.map((voiture) => (
              <Col key={voiture.id}>
                <Card className="h-100 border-0 shadow-sm card-hover">
                  <div className="position-relative">
                    {voiture.photo ? (
                      <Card.Img
                        variant="top"
                        src={`http://127.0.0.1:8000/storage/${voiture.photo}`}
                        alt={`${voiture.marque} ${voiture.modele}`}
                        style={{ height: '250px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="bg-light d-flex align-items-center justify-content-center" style={{ height: '250px' }}>
                        <span className="text-muted">Photo non disponible</span>
                      </div>
                    )}
                    <Badge bg="primary" className="position-absolute top-0 end-0 m-3 px-3 py-2 rounded-pill">
                      {voiture.categorie?.nom}
                    </Badge>
                  </div>

                  <Card.Body className="p-4">
                    <div className="mb-2 text-muted small">{voiture.annee} • {voiture.kilometrage} km</div>
                    <Card.Title className="h5 fw-bold mb-3">{voiture.marque} {voiture.modele}</Card.Title>

                    <div className="d-flex align-items-center text-muted mb-3 small">
                      <GeoAltFill className="me-1" />
                      {voiture.agence?.ville}
                    </div>

                    <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                      <div>
                        <span className="h4 fw-bold text-primary mb-0">{voiture.prix_journalier} €</span>
                        <span className="text-muted small"> / jour</span>
                      </div>
                      <Button
                        onClick={() => navigate(`/voitures-public/${voiture.id}`)}
                        variant="outline-primary"
                        className="rounded-pill px-4"
                      >
                        Détails
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>

      {/* Call to Action */}
      <div className="bg-primary text-white py-5 mt-5">
        <Container className="text-center py-4">
          <h2 className="fw-bold mb-3">Prêt à prendre la route ?</h2>
          <p className="lead mb-4 opacity-75">
            Rejoignez des milliers de clients satisfaits et profitez de nos offres exclusives.
          </p>
          <Button onClick={() => navigate("/register")} variant="light" size="lg" className="px-5 py-3 fw-bold rounded-pill shadow">
            Créer un compte gratuitement
          </Button>
        </Container>
      </div>
    </div>
  );
};

export default HomePage;