// src/Pages/Public/AgencesPublicPage.tsx
import React, { useEffect, useState } from "react";
import { getAgences } from "../../services/agence";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import type { Agence } from "../../types/api";
import { GeoAltFill, TelephoneFill, Building } from "react-bootstrap-icons";
import LoadingSpinner from "../../Components/LoadingSpinner";

const AgencesPublicPage: React.FC = () => {
  const [agences, setAgences] = useState<Agence[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAgences()
      .then(setAgences)
      .catch((err: any) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="bg-light min-vh-100 py-5">
      <Container>
        <div className="text-center mb-5">
          <h1 className="fw-bold mb-3">Nos Agences</h1>
          <p className="text-muted lead mx-auto" style={{ maxWidth: '600px' }}>
            Trouvez l'agence la plus proche de chez vous parmi notre réseau national.
          </p>
        </div>

        <Row xs={1} md={2} lg={3} className="g-4">
          {agences.map(a => (
            <Col key={a.id}>
              <Card className="h-100 border-0 shadow-sm hover-lift">
                <div className="position-relative">
                  {a.logo ? (
                    <Card.Img
                      variant="top"
                      src={`http://127.0.0.1:8000/storage/${a.logo}`}
                      style={{ height: '200px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div className="bg-light d-flex align-items-center justify-content-center" style={{ height: '200px' }}>
                      <Building size={40} className="text-muted opacity-50" />
                    </div>
                  )}
                  <div className="position-absolute bottom-0 start-0 w-100 p-3 bg-gradient-dark text-white"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
                    <h5 className="mb-0">{a.ville}</h5>
                  </div>
                </div>

                <Card.Body className="p-4">
                  <Card.Title className="h5 fw-bold mb-3">{a.nom}</Card.Title>

                  <div className="d-flex align-items-start mb-3 text-muted">
                    <GeoAltFill className="me-2 mt-1 flex-shrink-0 text-primary" />
                    <span>{a.adresse}, {a.ville}</span>
                  </div>

                  <div className="d-flex align-items-center mb-4 text-muted">
                    <TelephoneFill className="me-2 text-primary" />
                    <span>{a.telephone}</span>
                  </div>

                  <Link to={`/agences-public/${a.id}`} className="text-decoration-none">
                    <Button variant="outline-primary" className="w-100 rounded-pill">
                      Voir les véhicules disponibles
                    </Button>
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      <style>{`
        .hover-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .hover-lift:hover {
          transform: translateY(-5px);
          box-shadow: 0 1rem 3rem rgba(0,0,0,.175)!important;
        }
      `}</style>
    </div>
  );
};

export default AgencesPublicPage;
