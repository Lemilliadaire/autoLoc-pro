// src/pages/AgenceDetailPage.tsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getAgence } from "../../services/agence";
import { getVoitures } from "../../services/voiture";
import type { Voiture } from "../../types/api";
import { Container, Row, Col, Card, Button, Form, Image } from "react-bootstrap";
import type { Agence } from "../../types/api";

const AgenceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [agence, setAgence] = useState<Agence | null>(null);
  const [voitures, setVoitures] = useState<Voiture[]>([]);
  const [statut, setStatut] = useState<string>("");

  const fetchVoitures = () => {
    if (id) {
      getVoitures({ agence_id: Number(id), statut: statut || undefined })
        .then((data: any) => setVoitures(data.data))
        .catch((err: any) => console.error(err));
    }
  };

  useEffect(() => {
    if (id) {
      getAgence(Number(id))
        .then(setAgence)
        .catch((err: any) => console.error(err));
    }
  }, [id]);

  useEffect(() => {
    fetchVoitures();
  }, [id, statut]);

  if (!agence) {
    return <p>Chargement...</p>;
  }

  return (
    <Container className="py-4">
      <Row className="mb-4 align-items-center">
        <Col md={4}>
          {agence.logo && <Image src={`http://127.0.0.1:8000/storage/${agence.logo}`} alt={agence.nom} fluid rounded />}
        </Col>
        <Col md={8}>
          <h1>{agence.nom}</h1>
          <p className="lead">📍 {agence.adresse}, {agence.ville}</p>
          <p className="lead">📞 {agence.telephone}</p>
        </Col>
      </Row>

      {/* Filtre par statut */}
      <Form.Select value={statut} onChange={e => setStatut(e.target.value)} className="mb-4">
        <option value="">Toutes les voitures</option>
        <option value="disponible">Disponible</option>
        <option value="reserve">Réservée</option>
        <option value="en_service">En service</option>
      </Form.Select>

      <h2 className="mb-4">Voitures de l'agence 🚘</h2>
      <Row xs={1} sm={2} md={3} className="g-4">
        {voitures.map(v => (
          <Col key={v.id}>
            <Card className="h-100 shadow-sm">
              {v.photo && <Card.Img variant="top" src={`http://localhost:8000/storage/${v.photo}`} style={{ height: '200px', objectFit: 'cover' }} />}
              <Card.Body className="d-flex flex-column">
                <Card.Title>{v.marque} {v.modele}</Card.Title>
                <Card.Text className="text-muted">
                  Année : {v.annee} — Couleur : {v.couleur}
                </Card.Text>
                <h5 className="text-primary mt-auto">{v.prix_journalier} FCFA / jour</h5>
                <Link to={`/voitures-public/${v.id}`} style={{ textDecoration: 'none' }}>
                  <Button variant="primary" className="mt-2 w-100">
                    Voir détails
                  </Button>
                </Link>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      {voitures.length === 0 && (
        <div className="text-center p-5 border rounded bg-light">
          <p className="mb-0">Aucune voiture ne correspond à ce critère dans cette agence.</p>
        </div>
      )}
    </Container>
  );
};

export default AgenceDetailPage;
