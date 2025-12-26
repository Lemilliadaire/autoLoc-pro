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
  const [galleryImages, setGalleryImages] = useState<{ file: File; preview: string; type: string }[]>([]);

  const [categories, setCategories] = useState<Categorie[]>([]);
  const [agences, setAgences] = useState<Agence[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
    getAgences().then(setAgences).catch(console.error);

    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
      galleryImages.forEach(img => URL.revokeObjectURL(img.preview));
    };
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setPhoto(file);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    if (file) setPhotoPreview(URL.createObjectURL(file));
    else setPhotoPreview(null);
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      type: 'exterieur'
    }));
    setGalleryImages(prev => [...prev, ...newImages]);
  };

  const removeGalleryImage = (index: number) => {
    URL.revokeObjectURL(galleryImages[index].preview);
    setGalleryImages(prev => prev.filter((_, i) => i !== index));
  };

  const updateImageType = (index: number, type: string) => {
    setGalleryImages(prev => {
      const updated = [...prev];
      updated[index].type = type;
      return updated;
    });
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

    // Append gallery images - using a format Laravel can handle
    galleryImages.forEach((img, index) => {
      formData.append(`gallery_images[]`, img.file);
      formData.append(`gallery_types[]`, img.type);
    });

    // Debug: Log what we're sending
    console.log('📸 Envoi de la voiture avec:');
    console.log('- Photo principale:', photo ? photo.name : 'Aucune');
    console.log('- Images galerie:', galleryImages.length);
    galleryImages.forEach((img, i) => {
      console.log(`  ${i + 1}. ${img.file.name} (${img.type})`);
    });

    setIsSubmitting(true);
    try {
      const data = await createVoiture(formData, token);

      setFeedback({
        type: 'success',
        message: data.message || "Voiture créée avec succès !"
      });
      console.log('✅ Réponse du serveur:', data);

      // Reset form immediately
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
      setGalleryImages([]);

      // Clear success message after 3 seconds
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || "Erreur de création." });
    }
    setIsSubmitting(false);
  };

  return (
    <Card className="shadow-sm mb-4" style={{ borderRadius: '1rem' }}>
      <Card.Body className="p-4">
        <Card.Title as="h4" className="mb-4 fw-bold">Ajouter une voiture</Card.Title>
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Form.Group as={Col} md="6" controlId="voitureMarque"><Form.Label className="fw-medium">Marque</Form.Label><Form.Control required value={marque} onChange={e => setMarque(e.target.value)} /></Form.Group>
            <Form.Group as={Col} md="6" controlId="voitureModele"><Form.Label className="fw-medium">Modèle</Form.Label><Form.Control required value={modele} onChange={e => setModele(e.target.value)} /></Form.Group>
          </Row>

          <Row className="mb-3">
            <Form.Group as={Col} md="6" controlId="voitureImmatriculation"><Form.Label className="fw-medium">Immatriculation</Form.Label><Form.Control required value={immatriculation} onChange={e => setImmatriculation(e.target.value)} /></Form.Group>
            <Form.Group as={Col} md="6" controlId="voitureAnnee"><Form.Label className="fw-medium">Année</Form.Label><Form.Control required type="number" value={annee} onChange={e => setAnnee(Number(e.target.value))} /></Form.Group>
          </Row>

          <Row className="mb-3">
            <Form.Group as={Col} md="6" controlId="voitureCouleur"><Form.Label className="fw-medium">Couleur</Form.Label><Form.Control required value={couleur} onChange={e => setCouleur(e.target.value)} /></Form.Group>
            <Form.Group as={Col} md="6" controlId="voitureKilometrage"><Form.Label className="fw-medium">Kilométrage</Form.Label><Form.Control required type="number" value={kilometrage} onChange={e => setKilometrage(Number(e.target.value))} /></Form.Group>
          </Row>

          <Row className="mb-3">
            <Form.Group as={Col} md="6" controlId="voiturePrix"><Form.Label className="fw-medium">Prix Journalier (FCFA)</Form.Label><Form.Control required type="number" value={prix_journalier} onChange={e => setPrixJournalier(Number(e.target.value))} /></Form.Group>
            <Form.Group as={Col} md="6" controlId="voitureStatut"><Form.Label className="fw-medium">Statut</Form.Label><Form.Select value={statut} onChange={e => setStatut(e.target.value)}>
              <option value="disponible">Disponible</option>
              <option value="reserve">Réservée</option>
              <option value="en_service">En service</option>
            </Form.Select></Form.Group>
          </Row>

          <Row className="mb-3">
            <Form.Group as={Col} md="6" controlId="voitureCategorie"><Form.Label className="fw-medium">Catégorie</Form.Label><Form.Select required value={categorieId} onChange={e => setCategorieId(Number(e.target.value))}>
              <option value="">Choisir...</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </Form.Select></Form.Group>
            <Form.Group as={Col} md="6" controlId="voitureAgence"><Form.Label className="fw-medium">Agence</Form.Label><Form.Select required value={agenceId} onChange={e => setAgenceId(Number(e.target.value))}>
              <option value="">Choisir...</option>
              {agences.map(a => <option key={a.id} value={a.id}>{a.nom}</option>)}
            </Form.Select></Form.Group>
          </Row>

          <hr className="my-4" />

          {/* Main Photo Field (Preserved) */}
          <Form.Group controlId="voiturePhoto" className="mb-4">
            <Form.Label className="fw-bold">Photo Principale</Form.Label>
            <Form.Control type="file" accept="image/*" onChange={handlePhotoChange} />
            {photoPreview && (
              <div className="mt-2 text-center bg-light p-2 rounded">
                <Image src={photoPreview} alt="Aperçu" thumbnail style={{ maxHeight: '150px' }} />
              </div>
            )}
          </Form.Group>

          {/* New Gallery Section */}
          <div className="bg-light p-4 rounded-4 mb-4 border border-dashed">
            <h5 className="mb-3 fw-bold">Galerie Photo (Multiple)</h5>
            <Form.Control
              type="file"
              multiple
              accept="image/*"
              onChange={handleGalleryChange}
              className="d-none"
              id="gallery-input"
            />
            <label htmlFor="gallery-input" className="btn btn-outline-primary px-4 py-2 rounded-pill cursor-pointer mb-3">
              + Ajouter des photos à la galerie
            </label>

            <Row className="g-3">
              {galleryImages.map((img, index) => (
                <Col key={index} xs={12} md={6}>
                  <Card className="border-0 shadow-sm h-100 overflow-hidden rounded-3">
                    <div className="position-relative" style={{ height: '100px' }}>
                      <Image src={img.preview} className="w-100 h-100 object-fit-cover" />
                      <Button
                        variant="danger"
                        size="sm"
                        className="position-absolute top-0 end-0 m-2 rounded-circle py-0 px-2"
                        onClick={() => removeGalleryImage(index)}
                      >×</Button>
                    </div>
                    <Card.Body className="p-2 bg-white">
                      <Form.Select
                        size="sm"
                        value={img.type}
                        onChange={(e) => updateImageType(index, e.target.value)}
                        className="rounded-pill"
                      >
                        <option value="exterieur">Extérieur</option>
                        <option value="interieur">Intérieur</option>
                        <option value="autre">Autre</option>
                      </Form.Select>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-100 rounded-pill fw-bold" disabled={isSubmitting}>
            {isSubmitting ? 'Publication en cours...' : 'Enregistrer le véhicule'}
          </Button>
        </Form>
        {feedback && (
          <Alert variant={feedback.type === 'success' ? 'success' : 'danger'} className="mt-3 rounded-pill text-center py-2">
            {feedback.message}
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};

export default VoitureForm;