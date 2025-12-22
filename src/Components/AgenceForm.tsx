import React, { useState, useEffect } from "react";
import { Form, Button, Row, Col, Card, Image } from "react-bootstrap";
 
interface AgenceFormProps {
  onSubmit: (data: FormData, resetForm: () => void) => void;
}

const AgenceForm: React.FC<AgenceFormProps> = ({ onSubmit }) => {
  const [nom, setNom] = useState("");
  const [adresse, setAdresse] = useState("");
  const [telephone, setTelephone] = useState("");
  const [ville, setVille] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const resetForm = () => {
    setNom("");
    setAdresse("");
    setTelephone("");
    setVille("");
    setLogo(null);
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
    }
    setLogoPreview(null);
  };

  useEffect(() => {
    // Nettoyage de l'URL de l'objet pour éviter les fuites de mémoire
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("nom", nom);
    formData.append("adresse", adresse);
    formData.append("telephone", telephone);
    formData.append("ville", ville);
    if (logo) formData.append("logo", logo);

    onSubmit(formData, resetForm);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setLogo(file);
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    if (file) setLogoPreview(URL.createObjectURL(file));
    else setLogoPreview(null);
  }

  return (
    <Card className="shadow-sm mb-4">
      <Card.Body>
        <Card.Title as="h5" className="mb-3">Ajouter / Modifier une agence 🏢</Card.Title>
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Form.Group as={Col} md="6" controlId="agenceNom">
              <Form.Label>Nom</Form.Label>
              <Form.Control required type="text" value={nom} onChange={(e) => setNom(e.target.value)} />
            </Form.Group>
            <Form.Group as={Col} md="6" controlId="agenceVille">
              <Form.Label>Ville</Form.Label>
              <Form.Control required type="text" value={ville} onChange={(e) => setVille(e.target.value)} />
            </Form.Group>
          </Row>
          <Row className="mb-3">
            <Form.Group as={Col} md="6" controlId="agenceAdresse">
              <Form.Label>Adresse</Form.Label>
              <Form.Control required type="text" value={adresse} onChange={(e) => setAdresse(e.target.value)} />
            </Form.Group>
            <Form.Group as={Col} md="6" controlId="agenceTelephone">
              <Form.Label>Téléphone</Form.Label>
              <Form.Control required type="tel" value={telephone} onChange={(e) => setTelephone(e.target.value)} />
            </Form.Group>
          </Row>
          <Form.Group controlId="agenceLogo" className="mb-3">
            <Form.Label>Logo</Form.Label>
            <Form.Control type="file" accept="image/*" onChange={handleLogoChange} />
            {logoPreview && (
              <Image src={logoPreview} alt="Aperçu du logo" thumbnail className="mt-2" style={{ maxHeight: '100px' }} />
            )}
          </Form.Group>
          <Button variant="primary" type="submit">
            Enregistrer
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default AgenceForm;
