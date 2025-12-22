// src/Pages/Public/CategoriesPublicPage.tsx
import React, { useEffect, useState } from "react";
import { getCategories } from "../../services/categorie";
import type { Categorie } from "../../types/api";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import LoadingSpinner from "../../Components/LoadingSpinner";
import { ArrowRight, TagFill } from "react-bootstrap-icons";

const CategoriesPublicPage: React.FC = () => {
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch((err: any) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="bg-light min-vh-100 py-5">
      <Container>
        <div className="text-center mb-5">
          <h1 className="fw-bold mb-3">Nos Catégories</h1>
          <p className="text-muted lead mx-auto" style={{ maxWidth: '600px' }}>
            Choisissez le type de véhicule qui correspond le mieux à vos besoins et à votre budget.
          </p>
        </div>

        <Row xs={1} md={2} lg={3} className="g-4">
          {categories.map(c => (
            <Col key={c.id}>
              <Card className="h-100 border-0 shadow-sm hover-lift overflow-hidden">
                <div className="bg-primary p-4 text-white text-center position-relative overflow-hidden">
                  <div className="position-absolute top-0 start-0 w-100 h-100 opacity-10"
                    style={{
                      backgroundImage: 'radial-gradient(circle at center, white 1px, transparent 1px)',
                      backgroundSize: '20px 20px'
                    }}>
                  </div>
                  <TagFill size={40} className="mb-3 position-relative" />
                  <h3 className="h4 fw-bold position-relative">{c.nom}</h3>
                </div>

                <Card.Body className="p-4 d-flex flex-column">
                  <Card.Text className="text-muted flex-grow-1 mb-4">
                    {c.description || "Une sélection de véhicules confortables et fiables pour tous vos déplacements."}
                  </Card.Text>

                  <div className="d-flex justify-content-between align-items-end border-top pt-3">
                    <div>
                      <small className="text-muted d-block mb-1">À partir de</small>
                      <span className="h4 fw-bold text-primary mb-0">{c.prix_journalier} €</span>
                      <small className="text-muted"> / jour</small>
                    </div>

                    <Link to={`/voitures-public?categorie=${c.id}`}>
                      <Button variant="outline-primary" className="rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                        <ArrowRight />
                      </Button>
                    </Link>
                  </div>
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

export default CategoriesPublicPage;
