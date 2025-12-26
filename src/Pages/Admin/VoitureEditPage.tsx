// src/Pages/Admin/VoitureEditPage.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Card, Form, Button, Row, Col, Alert, Image } from "react-bootstrap";
import { ArrowLeft, Save, Trash } from "react-bootstrap-icons";
import { getVoiture, updateVoiture } from "../../services/voiture";
import { getCategories } from "../../services/categorie";
import { getAgences } from "../../services/agence";
import { useAuth } from "../../hooks/useAuth";
import type { Voiture, Categorie, Agence } from "../../types/api";
import LoadingSpinner from "../../Components/LoadingSpinner";

const VoitureEditPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { token } = useAuth();

    const [loading, setLoading] = useState(true);
    const [voiture, setVoiture] = useState<Voiture | null>(null);
    const [categories, setCategories] = useState<Categorie[]>([]);
    const [agences, setAgences] = useState<Agence[]>([]);

    // Form states
    const [marque, setMarque] = useState("");
    const [modele, setModele] = useState("");
    const [annee, setAnnee] = useState<number>(new Date().getFullYear());
    const [couleur, setCouleur] = useState("");
    const [immatriculation, setImmatriculation] = useState("");
    const [kilometrage, setKilometrage] = useState<number>(0);
    const [prixJournalier, setPrixJournalier] = useState<number>(0);
    const [statut, setStatut] = useState("disponible");
    const [categorieId, setCategorieId] = useState<number | "">("");
    const [agenceId, setAgenceId] = useState<number | "">("");
    const [photo, setPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [existingPhoto, setExistingPhoto] = useState<string | null>(null);

    // Gallery management
    const [galleryImages, setGalleryImages] = useState<{ file: File; preview: string; type: string }[]>([]);
    const [existingGalleryImages, setExistingGalleryImages] = useState<any[]>([]);
    const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);

    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        Promise.all([
            getCategories(),
            getAgences(),
            id ? getVoiture(parseInt(id)) : Promise.resolve(null)
        ]).then(([cats, ags, car]) => {
            setCategories(cats);
            setAgences(ags);

            if (car) {
                setVoiture(car);
                setMarque(car.marque);
                setModele(car.modele);
                setAnnee(car.annee);
                setCouleur(car.couleur);
                setImmatriculation(car.immatriculation);
                setKilometrage(car.kilometrage);
                setPrixJournalier(car.prix_journalier);
                setStatut(car.statut);
                setCategorieId(car.categorie_id);
                setAgenceId(car.agence_id);
                setExistingPhoto(car.photo || null);
                setExistingGalleryImages(car.images || []);

                console.log('🚗 Voiture chargée:', car);
                console.log('📸 Images de galerie:', car.images?.length || 0);
            }
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, [id]);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files ? e.target.files[0] : null;
        setPhoto(file);
        if (photoPreview) URL.revokeObjectURL(photoPreview);
        if (file) setPhotoPreview(URL.createObjectURL(file));
        else setPhotoPreview(null);
    };

    const getPhotoUrl = (photo: string | undefined) => {
        if (!photo) return null;
        if (photo.startsWith('http')) return photo;
        const cleanPath = photo.startsWith('/storage/') ? photo.substring(9) :
            photo.startsWith('storage/') ? photo.substring(8) : photo;
        return `http://127.0.0.1:8000/storage/${cleanPath}`;
    };

    const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const newImages = Array.from(files).map(file => ({
                file,
                preview: URL.createObjectURL(file),
                type: 'exterieur'
            }));
            setGalleryImages(prev => [...prev, ...newImages]);
        }
    };

    const removeGalleryImage = (index: number) => {
        setGalleryImages(prev => {
            const img = prev[index];
            URL.revokeObjectURL(img.preview);
            return prev.filter((_, i) => i !== index);
        });
    };

    const updateImageType = (index: number, type: string) => {
        setGalleryImages(prev => prev.map((img, i) => i === index ? { ...img, type } : img));
    };

    const markExistingImageForDeletion = (imageId: number) => {
        setImagesToDelete(prev => [...prev, imageId]);
        setExistingGalleryImages(prev => prev.filter(img => img.id !== imageId));
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
        formData.append("prix_journalier", String(prixJournalier));
        formData.append("statut", statut);
        formData.append("categorie_id", String(categorieId));
        formData.append("agence_id", String(agenceId));

        if (photo) {
            formData.append("photo", photo);
        }

        // Append new gallery images
        galleryImages.forEach((img, index) => {
            formData.append(`gallery_images[]`, img.file);
            formData.append(`gallery_types[]`, img.type);
        });

        // Append images to delete
        if (imagesToDelete.length > 0) {
            formData.append('delete_images', JSON.stringify(imagesToDelete));
        }

        console.log('📤 Envoi de la mise à jour avec:');
        console.log('- Nouvelles images galerie:', galleryImages.length);
        console.log('- Images à supprimer:', imagesToDelete.length);

        setIsSubmitting(true);
        try {
            await updateVoiture(parseInt(id!), formData, token!);
            setFeedback({ type: 'success', message: "Voiture mise à jour avec succès !" });
            setTimeout(() => navigate('/admin/voitures'), 1500);
        } catch (err: any) {
            setFeedback({ type: 'error', message: err.response?.data?.message || "Erreur lors de la mise à jour." });
        }
        setIsSubmitting(false);
    };

    if (loading) return <LoadingSpinner />;
    if (!voiture) return <Alert variant="danger">Voiture introuvable</Alert>;

    return (
        <Container className="py-4">
            <Button variant="outline-secondary" className="mb-3" onClick={() => navigate('/admin/voitures')}>
                <ArrowLeft className="me-2" />
                Retour à la liste
            </Button>

            <Card className="shadow-sm">
                <Card.Header className="bg-primary text-white">
                    <h4 className="mb-0">Modifier la voiture #{voiture.id}</h4>
                </Card.Header>
                <Card.Body className="p-4">
                    <Form onSubmit={handleSubmit}>
                        <Row className="mb-4">
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Marque</Form.Label>
                                    <Form.Control required value={marque} onChange={e => setMarque(e.target.value)} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Modèle</Form.Label>
                                    <Form.Control required value={modele} onChange={e => setModele(e.target.value)} />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row className="mb-4">
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Année</Form.Label>
                                    <Form.Control type="number" required value={annee} onChange={e => setAnnee(Number(e.target.value))} />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Couleur</Form.Label>
                                    <Form.Control required value={couleur} onChange={e => setCouleur(e.target.value)} />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Immatriculation</Form.Label>
                                    <Form.Control required value={immatriculation} onChange={e => setImmatriculation(e.target.value)} />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row className="mb-4">
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Kilométrage</Form.Label>
                                    <Form.Control type="number" required value={kilometrage} onChange={e => setKilometrage(Number(e.target.value))} />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Prix journalier (€)</Form.Label>
                                    <Form.Control type="number" required value={prixJournalier} onChange={e => setPrixJournalier(Number(e.target.value))} />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Statut</Form.Label>
                                    <Form.Select value={statut} onChange={e => setStatut(e.target.value)}>
                                        <option value="disponible">Disponible</option>
                                        <option value="loue">Loué</option>
                                        <option value="maintenance">En maintenance</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row className="mb-4">
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Catégorie</Form.Label>
                                    <Form.Select required value={categorieId} onChange={e => setCategorieId(Number(e.target.value))}>
                                        <option value="">-- Sélectionner --</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Agence</Form.Label>
                                    <Form.Select required value={agenceId} onChange={e => setAgenceId(Number(e.target.value))}>
                                        <option value="">-- Sélectionner --</option>
                                        {agences.map(a => <option key={a.id} value={a.id}>{a.nom}</option>)}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="bg-light p-4 rounded-4 mb-4">
                            <h5 className="mb-3 fw-bold">Photo principale</h5>
                            {(existingPhoto || photoPreview) && (
                                <div className="mb-3">
                                    <Image
                                        src={photoPreview || getPhotoUrl(existingPhoto)!}
                                        rounded
                                        style={{ maxWidth: '300px', maxHeight: '200px', objectFit: 'cover' }}
                                    />
                                </div>
                            )}
                            <Form.Control type="file" accept="image/*" onChange={handlePhotoChange} />
                            <Form.Text className="text-muted">Laissez vide pour conserver la photo actuelle</Form.Text>
                        </div>

                        {/* Gallery Management Section */}
                        <div className="bg-light p-4 rounded-4 mb-4">
                            <h5 className="mb-3 fw-bold">Galerie d'images</h5>

                            {/* Existing Gallery Images */}
                            {existingGalleryImages.length > 0 && (
                                <div className="mb-4">
                                    <h6 className="text-muted mb-3">Images actuelles ({existingGalleryImages.length})</h6>
                                    <Row className="g-3">
                                        {existingGalleryImages.map((img) => (
                                            <Col key={img.id} xs={6} md={4} lg={3}>
                                                <Card className="border-0 shadow-sm h-100 overflow-hidden rounded-3">
                                                    <div className="position-relative" style={{ height: '150px' }}>
                                                        <Image
                                                            src={getPhotoUrl(img.path)!}
                                                            className="w-100 h-100 object-fit-cover"
                                                        />
                                                        <Button
                                                            variant="danger"
                                                            size="sm"
                                                            className="position-absolute top-0 end-0 m-2 rounded-circle py-0 px-2"
                                                            onClick={() => markExistingImageForDeletion(img.id)}
                                                        >
                                                            ×
                                                        </Button>
                                                    </div>
                                                    <Card.Body className="p-2 bg-white text-center">
                                                        <small className="text-muted">{img.type}</small>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                        ))}
                                    </Row>
                                </div>
                            )}

                            {/* New Gallery Images */}
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

                            {galleryImages.length > 0 && (
                                <div>
                                    <h6 className="text-muted mb-3">Nouvelles images ({galleryImages.length})</h6>
                                    <Row className="g-3">
                                        {galleryImages.map((img, index) => (
                                            <Col key={index} xs={6} md={4} lg={3}>
                                                <Card className="border-0 shadow-sm h-100 overflow-hidden rounded-3">
                                                    <div className="position-relative" style={{ height: '150px' }}>
                                                        <Image src={img.preview} className="w-100 h-100 object-fit-cover" />
                                                        <Button
                                                            variant="danger"
                                                            size="sm"
                                                            className="position-absolute top-0 end-0 m-2 rounded-circle py-0 px-2"
                                                            onClick={() => removeGalleryImage(index)}
                                                        >
                                                            ×
                                                        </Button>
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
                            )}

                            {existingGalleryImages.length === 0 && galleryImages.length === 0 && (
                                <Alert variant="info" className="mb-0">
                                    <small>Aucune image dans la galerie. Cliquez sur le bouton ci-dessus pour en ajouter.</small>
                                </Alert>
                            )}
                        </div>

                        {feedback && (
                            <Alert variant={feedback.type === 'success' ? 'success' : 'danger'} className="mb-3">
                                {feedback.message}
                            </Alert>
                        )}

                        <div className="d-flex gap-2">
                            <Button type="submit" variant="primary" size="lg" disabled={isSubmitting}>
                                <Save className="me-2" />
                                {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
                            </Button>
                            <Button variant="outline-secondary" size="lg" onClick={() => navigate('/admin/voitures')}>
                                Annuler
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default VoitureEditPage;
