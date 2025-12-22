import React, { useState, useEffect } from "react";
import { createVoiture } from "../services/voiture";
import { getCategories } from "../services/categorie";
import { getAgences } from "../services/agence";
import type { Categorie } from "../types/api";
import { Form, Button, Row, Col, Card, Alert, Image } from "react-bootstrap";
import type { Agence } from "../types/api";

const VoitureForm: React.FC<{ token: string }> = ({ token }) => {
  const [marque, setMarque] = useState("");
  const [modele, setModele] = useState("");
  const [annee, setAnnee] = useState<number>(new Date().getFullYear());
  const [couleur, setCouleur] = useState("");
  const [immatriculation, setImmatriculation] = useState("");
  const [kilometrage, setKilometrage] = useState<number>(0);
  const [prix_journalier, setPrixJournalier] = useState<number>(0);
  const [statut, setStatut] = useState("disponible");
  const [categorieId, setCategorieId] = useState<number | "">("");
  const [agenceId, setAgenceId] = useState<number | "">("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [categories, setCategories] = useState<Categorie[]>([]);
  const [agences, setAgences] = useState<Agence[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
    getAgences().then(setAgences).catch(console.error);

    // Nettoyage de l'URL de l'objet pour éviter les fuites de mémoire
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setPhoto(file);

    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

    if (file) setPhotoPreview(URL.createObjectURL(file));
    else setPhotoPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!categorieId || !agenceId) {
      setFeedback({ type: 'error', message: "Veuillez sélectionner une catégorie et une agence." });
      return;
    }

    const formData = new FormData();
    formData.append("marque", marque);
    formData.append("modele", modele);
    formData.append("annee", String(annee));
    formData.append("couleur", couleur);
    formData.append("immatriculation", immatriculation);
    formData.append("kilometrage", String(kilometrage));
    formData.append("prix_journalier", String(prix_journalier));
    formData.append("statut", statut);
    formData.append("categorie_id", String(categorieId));
    formData.append("agence_id", String(agenceId));
    if (photo) {
      formData.append("photo", photo);
    }

    setIsSubmitting(true);
    try {
      const data = await createVoiture(formData, token);
      setFeedback({ type: 'success', message: data.message || "Voiture créée avec succès !" });
      // Réinitialiser le formulaire après succès
      setMarque('');
      setModele('');
      setAnnee(new Date().getFullYear());
      setCouleur('');
      setImmatriculation('');
      setKilometrage(0);
      setPrixJournalier(0);
      setCategorieId('');
      setAgenceId('');
      setPhoto(null);
      setPhotoPreview(null);
    } catch (err) {
      setFeedback({ type: 'error', message: "Erreur lors de la création de la voiture." });
      console.error(err);
    }
    setIsSubmitting(false);
  };

  // perm
  return (
    <Card className="shadow-sm mb-4">
      <Card.Body>
        <Card.Title as="h5" className="mb-3">Ajouter une nouvelle voiture</Card.Title>
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Form.Group as={Col} md="6" controlId="voitureMarque"><Form.Label>Marque</Form.Label><Form.Control required value={marque} onChange={e => setMarque(e.target.value)} /></Form.Group>
            <Form.Group as={Col} md="6" controlId="voitureModele"><Form.Label>Modèle</Form.Label><Form.Control required value={modele} onChange={e => setModele(e.target.value)} /></Form.Group>
          </Row>
          <Row className="mb-3">
            <Form.Group as={Col} md="6" controlId="voitureImmatriculation"><Form.Label>Immatriculation</Form.Label><Form.Control required value={immatriculation} onChange={e => setImmatriculation(e.target.value)} /></Form.Group>
            <Form.Group as={Col} md="6" controlId="voitureAnnee"><Form.Label>Année</Form.Label><Form.Control required type="number" value={annee} onChange={e => setAnnee(Number(e.target.value))} /></Form.Group>
          </Row>
          <Row className="mb-3">
            <Form.Group as={Col} md="6" controlId="voitureCouleur"><Form.Label>Couleur</Form.Label><Form.Control required value={couleur} onChange={e => setCouleur(e.target.value)} /></Form.Group>
            <Form.Group as={Col} md="6" controlId="voitureKilometrage"><Form.Label>Kilométrage</Form.Label><Form.Control required type="number" value={kilometrage} onChange={e => setKilometrage(Number(e.target.value))} /></Form.Group>
          </Row>
          <Row className="mb-3">
            <Form.Group as={Col} md="6" controlId="voiturePrix"><Form.Label>Prix Journalier (FCFA)</Form.Label><Form.Control required type="number" value={prix_journalier} onChange={e => setPrixJournalier(Number(e.target.value))} /></Form.Group>
            <Form.Group as={Col} md="6" controlId="voitureStatut"><Form.Label>Statut</Form.Label><Form.Select value={statut} onChange={e => setStatut(e.target.value)}>
              <option value="disponible">Disponible</option>
              <option value="reserve">Réservée</option>
              <option value="en_service">En service</option>
            </Form.Select></Form.Group>
          </Row>
          <Row className="mb-3">
            <Form.Group as={Col} md="6" controlId="voitureCategorie"><Form.Label>Catégorie</Form.Label><Form.Select required value={categorieId} onChange={e => setCategorieId(Number(e.target.value))}>
              <option value="">Choisir...</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </Form.Select></Form.Group>
            <Form.Group as={Col} md="6" controlId="voitureAgence"><Form.Label>Agence</Form.Label><Form.Select required value={agenceId} onChange={e => setAgenceId(Number(e.target.value))}>
              <option value="">Choisir...</option>
              {agences.map(a => <option key={a.id} value={a.id}>{a.nom}</option>)}
            </Form.Select></Form.Group>
          </Row>
          <Form.Group controlId="voiturePhoto" className="mb-3">
            <Form.Label>Photo</Form.Label>
            <Form.Control type="file" accept="image/*" onChange={handlePhotoChange} />
            {photoPreview && (
              <Image src={photoPreview} alt="Aperçu de la voiture" thumbnail className="mt-2" style={{ maxHeight: '150px' }} />
            )}
          </Form.Group>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Création en cours...' : 'Créer la voiture'}
          </Button>
        </Form>
        {feedback && <Alert variant={feedback.type === 'success' ? 'success' : 'danger'} className="mt-3">{feedback.message}</Alert>}
      </Card.Body>
    </Card>
  );
};

export default VoitureForm;