// src/components/CategorieForm.tsx
import React, { useState } from "react";
import { Form, Button, Card, Row, Col } from "react-bootstrap";

interface CategorieFormProps {
  onSubmit: (data: { nom: string; description: string; prix_journalier: number }, resetForm: () => void) => void;
}

const CategorieForm: React.FC<CategorieFormProps> = ({ onSubmit }) => {
  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [prix_journalier, setPrixJournalier] = useState<number>(0);

  const resetForm = () => {
    setNom("");
    setDescription("");
    setPrixJournalier(0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ nom, description, prix_journalier }, resetForm);
  };

  return (
    <Card className="shadow-sm mb-4">
      <Card.Body>
        <Card.Title as="h5" className="mb-3">Ajouter / Modifier une catégorie 📂</Card.Title>
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Form.Group as={Col} md="6" controlId="catNom">
              <Form.Label>Nom</Form.Label>
              <Form.Control
                required
                type="text"
                value={nom}
                onChange={e => setNom(e.target.value)}
                placeholder="Ex: SUV, Berline, Citadine..."
              />
            </Form.Group>
            <Form.Group as={Col} md="6" controlId="catPrixJournalier">
              <Form.Label>Prix Journalier (€)</Form.Label>
              <Form.Control
                required
                type="number"
                min="0"
                step="0.01"
                value={prix_journalier}
                onChange={e => setPrixJournalier(Number(e.target.value))}
                placeholder="Ex: 50.00"
              />
            </Form.Group>
          </Row>
          <Form.Group className="mb-3" controlId="catDescription">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Description de la catégorie..."
            />
          </Form.Group>
          <Button type="submit" variant="primary">
            Enregistrer
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default CategorieForm;
