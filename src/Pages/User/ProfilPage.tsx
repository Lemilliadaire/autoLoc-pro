// src/Pages/User/ProfilPage.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Image, Badge } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';
import { updateClientPhoto, updateClient, getClients, createClient } from '../../services/client';
import type { Client } from '../../types/api';
import {
    PersonCircle, Camera, Save, PersonVcard,
    Pencil, XCircle, Envelope, Telephone, Calendar, Award,
    CheckCircleFill, InfoCircle, GeoAlt, CreditCard, CalendarEvent
} from 'react-bootstrap-icons';
import LoadingSpinner from '../../Components/LoadingSpinner';

const ProfilPage: React.FC = () => {
    const { user, refreshUser, loading: authLoading, token } = useAuth();

    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'danger' | 'warning', text: string } | null>(null);
    const [clientId, setClientId] = useState<number | null>(null);
    const [clientData, setClientData] = useState<Client | null>(null);
    const [profileExists, setProfileExists] = useState<boolean>(true);
    const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Profile data for client
    const [formData, setFormData] = useState({
        numero_permis: '',
        adresse: '',
        telephone: '',
        date_naissance: '',
    });

    useEffect(() => {
        if (user && token) {
            // Initialize form with user data
            setFormData({
                numero_permis: user.client?.numero_permis || '',
                adresse: user.client?.adresse || '',
                telephone: user.client?.telephone || user.telephone || '',
                date_naissance: user.client?.date_naissance || '',
            });

            // Find the client ID matching the user
            getClients(token).then(clients => {
                const currentClient = clients.find(c => c.user_id === user.id);
                if (currentClient) {
                    setClientId(currentClient.id);
                    setClientData(currentClient);
                    setProfileExists(true);
                } else {
                    setProfileExists(false);
                    setMessage({
                        type: 'warning',
                        text: 'Votre profil client n\'est pas encore complet. Veuillez remplir vos informations et cliquer sur "Enregistrer" pour créer votre profil.'
                    });
                    setIsEditing(true); // Activer automatiquement le mode édition
                }
            }).catch(err => {
                console.error('Error fetching clients:', err);
                setProfileExists(false);
            });
        }
    }, [user, token]);

    if (authLoading) return <LoadingSpinner />;
    if (!user || !token) return null;

    const handlePhotoClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Si le profil n'existe pas encore, stocker la photo temporairement
        if (!profileExists || !clientId) {
            setSelectedPhoto(file);
            // Créer un aperçu de l'image
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
            setMessage({
                type: 'success',
                text: 'Photo sélectionnée ! Elle sera uploadée lors de la création de votre profil.'
            });
            return;
        }

        // Si le profil existe, uploader directement
        setLoading(true);
        setMessage(null);

        try {
            await updateClientPhoto(clientId, file, token);
            await refreshUser();
            setMessage({ type: 'success', text: 'Photo de profil mise à jour avec succès !' });
        } catch (error) {
            console.error(error);
            setMessage({ type: 'danger', text: 'Erreur lors de la mise à jour de la photo.' });
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        if (!user || !token) {
            setMessage({ type: 'danger', text: 'Session expirée. Veuillez vous reconnecter.' });
            setLoading(false);
            return;
        }

        try {
            if (!profileExists || !clientId) {
                // Créer un nouveau profil client
                const newClientData = {
                    user_id: user.id,
                    numero_permis: formData.numero_permis,
                    adresse: formData.adresse,
                    telephone: formData.telephone,
                    date_naissance: formData.date_naissance,
                };

                const response = await createClient(newClientData, token);

                if (response.client) {
                    const newClientId = response.client.id;
                    setClientId(newClientId);
                    setClientData(response.client);
                    setProfileExists(true);

                    // Si une photo a été sélectionnée, l'uploader maintenant
                    if (selectedPhoto) {
                        try {
                            await updateClientPhoto(newClientId, selectedPhoto, token);
                            setSelectedPhoto(null);
                            setPhotoPreview(null);
                        } catch (photoError) {
                            console.error('Error uploading photo:', photoError);
                            // Ne pas bloquer la création du profil si l'upload de la photo échoue
                        }
                    }
                }

                await refreshUser();
                setMessage({ type: 'success', text: 'Profil créé avec succès !' });
                setIsEditing(false);
            } else {
                // Mettre à jour le profil existant
                await updateClient(clientId, formData, token);
                await refreshUser();
                setMessage({ type: 'success', text: 'Informations mises à jour avec succès !' });
                setIsEditing(false);
            }
        } catch (error: any) {
            console.error('Error updating/creating profile:', error);
            const errorMessage = error?.response?.data?.message || 'Erreur lors de la sauvegarde du profil.';
            setMessage({ type: 'danger', text: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        if (user) {
            setFormData({
                numero_permis: user.client?.numero_permis || '',
                adresse: user.client?.adresse || '',
                telephone: user.client?.telephone || user.telephone || '',
                date_naissance: user.client?.date_naissance || '',
            });
        }
        setMessage(null);
    };

    const getPhotoUrl = (photo: string | undefined) => {
        if (!photo) return null;
        if (photo.startsWith('http')) return photo;
        const cleanPath = photo.startsWith('/storage/') ? photo.substring(9) :
            photo.startsWith('storage/') ? photo.substring(8) : photo;
        return `http://127.0.0.1:8000/storage/${cleanPath}`;
    };

    // Utiliser l'aperçu temporaire en priorité, sinon la photo du profil
    const displayPhoto = photoPreview || clientData?.photo_profil || clientData?.photo || user.photo;

    return (
        <Container fluid className="py-4">
            {/* Header avec bannière */}
            <Card className="border-0 shadow-sm mb-4 overflow-hidden">
                <div
                    className="position-relative"
                    style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        height: '200px'
                    }}
                >
                    <div className="position-absolute bottom-0 start-0 w-100 p-4">
                        <Row className="align-items-end">
                            <Col xs="auto">
                                <div className="position-relative" style={{ marginBottom: '-50px' }}>
                                    <div
                                        className="rounded-circle p-2 bg-white shadow-lg position-relative"
                                        style={{
                                            cursor: isEditing ? 'pointer' : 'default',
                                            transition: 'transform 0.3s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (isEditing) e.currentTarget.style.transform = 'scale(1.05)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'scale(1)';
                                        }}
                                    >
                                        {displayPhoto ? (
                                            <Image
                                                src={
                                                    displayPhoto.startsWith('data:')
                                                        ? displayPhoto
                                                        : `${getPhotoUrl(displayPhoto)}?t=${new Date().getTime()}`
                                                }
                                                roundedCircle
                                                style={{
                                                    width: '150px',
                                                    height: '150px',
                                                    objectFit: 'cover',
                                                    border: '4px solid white'
                                                }}
                                            />
                                        ) : (
                                            <PersonCircle size={150} className="text-secondary" />
                                        )}
                                        {isEditing && (
                                            <>
                                                <Button
                                                    variant="primary"
                                                    size="sm"
                                                    className="position-absolute bottom-0 end-0 rounded-circle shadow"
                                                    style={{ width: '45px', height: '45px' }}
                                                    onClick={handlePhotoClick}
                                                    disabled={loading}
                                                    title="Changer la photo"
                                                >
                                                    <Camera size={22} />
                                                </Button>
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    onChange={handleFileChange}
                                                    className="d-none"
                                                    accept="image/*"
                                                />
                                            </>
                                        )}
                                    </div>
                                </div>
                            </Col>
                            <Col>
                                <h2 className="text-white fw-bold mb-1">{user.name} {user.lastname}</h2>
                                <div className="d-flex align-items-center gap-3 text-white text-opacity-90">
                                    <span><Envelope size={16} className="me-1" />{user.email}</span>
                                    {(user.client?.telephone || user.telephone) && (
                                        <span><Telephone size={16} className="me-1" />{user.client?.telephone || user.telephone}</span>
                                    )}
                                </div>
                            </Col>
                            <Col xs="auto">
                                <Badge bg="light" text="dark" className="px-3 py-2 fs-6 fw-normal">
                                    <PersonCircle className="me-2" />
                                    Client
                                </Badge>
                            </Col>
                        </Row>
                    </div>
                </div>
                <Card.Body className="pt-5 mt-4">
                    {/* Stats Cards */}
                    <Row className="g-3 mb-3">
                        <Col md={4}>
                            <Card className="border-0 bg-primary bg-opacity-10 h-100">
                                <Card.Body className="text-center">
                                    <Award size={32} className="text-primary mb-2" />
                                    <h6 className="text-muted mb-1">Statut</h6>
                                    <h5 className="fw-bold text-primary mb-0">Client</h5>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4}>
                            <Card className="border-0 bg-success bg-opacity-10 h-100">
                                <Card.Body className="text-center">
                                    <CheckCircleFill size={32} className="text-success mb-2" />
                                    <h6 className="text-muted mb-1">Compte</h6>
                                    <h5 className="fw-bold text-success mb-0">Actif</h5>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4}>
                            <Card className="border-0 bg-info bg-opacity-10 h-100">
                                <Card.Body className="text-center">
                                    <Calendar size={32} className="text-info mb-2" />
                                    <h6 className="text-muted mb-1">Membre depuis</h6>
                                    <h5 className="fw-bold text-info mb-0">
                                        {new Date(user.created_at || Date.now()).toLocaleDateString('fr-FR', {
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </h5>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Messages */}
            {message && (
                <Alert
                    variant={message.type}
                    dismissible
                    onClose={() => setMessage(null)}
                    className="shadow-sm mb-4"
                >
                    {message.type === 'success' ? (
                        <CheckCircleFill className="me-2" />
                    ) : message.type === 'warning' ? (
                        <InfoCircle className="me-2" />
                    ) : (
                        <InfoCircle className="me-2" />
                    )}
                    {message.text}
                </Alert>
            )}

            {/* Informations du Profil */}
            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white py-3 border-0">
                    <div className="d-flex justify-content-between align-items-center">
                        <h5 className="fw-bold mb-0">
                            <PersonVcard className="me-2 text-primary" />
                            Informations du profil
                        </h5>
                        {!isEditing && (
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => setIsEditing(true)}
                            >
                                <Pencil className="me-2" size={16} />
                                Modifier
                            </Button>
                        )}
                    </div>
                </Card.Header>
                <Card.Body className="p-4">
                    <Row className="g-4">
                        <Col md={6}>
                            <div className="border rounded p-3 h-100">
                                <label className="text-muted small mb-2 d-block">
                                    <Envelope className="me-1" />
                                    Email
                                </label>
                                <h6 className="mb-0">{user.email}</h6>
                            </div>
                        </Col>
                        <Col md={6}>
                            <div className="border rounded p-3 h-100">
                                <label className="text-muted small mb-2 d-block">
                                    <Telephone className="me-1" />
                                    Téléphone
                                </label>
                                {isEditing ? (
                                    <Form.Control
                                        type="tel"
                                        value={formData.telephone}
                                        onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                                        placeholder="Entrez votre numéro"
                                    />
                                ) : (
                                    <h6 className="mb-0">{formData.telephone || 'Non renseigné'}</h6>
                                )}
                            </div>
                        </Col>
                        <Col md={6}>
                            <div className="border rounded p-3 h-100">
                                <label className="text-muted small mb-2 d-block">
                                    <CreditCard className="me-1" />
                                    Numéro de permis
                                </label>
                                {isEditing ? (
                                    <Form.Control
                                        type="text"
                                        value={formData.numero_permis}
                                        onChange={(e) => setFormData({ ...formData, numero_permis: e.target.value })}
                                        placeholder="Entrez votre numéro de permis"
                                    />
                                ) : (
                                    <h6 className="mb-0">{formData.numero_permis || 'Non renseigné'}</h6>
                                )}
                            </div>
                        </Col>
                        <Col md={6}>
                            <div className="border rounded p-3 h-100">
                                <label className="text-muted small mb-2 d-block">
                                    <CalendarEvent className="me-1" />
                                    Date de naissance
                                </label>
                                {isEditing ? (
                                    <Form.Control
                                        type="date"
                                        value={formData.date_naissance}
                                        onChange={(e) => setFormData({ ...formData, date_naissance: e.target.value })}
                                    />
                                ) : (
                                    <h6 className="mb-0">
                                        {formData.date_naissance ?
                                            new Date(formData.date_naissance).toLocaleDateString('fr-FR') :
                                            'Non renseigné'
                                        }
                                    </h6>
                                )}
                            </div>
                        </Col>
                        <Col md={12}>
                            <div className="border rounded p-3 h-100">
                                <label className="text-muted small mb-2 d-block">
                                    <GeoAlt className="me-1" />
                                    Adresse
                                </label>
                                {isEditing ? (
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        value={formData.adresse}
                                        onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                                        placeholder="Entrez votre adresse complète"
                                    />
                                ) : (
                                    <h6 className="mb-0">{formData.adresse || 'Non renseigné'}</h6>
                                )}
                            </div>
                        </Col>
                    </Row>

                    {isEditing && (
                        <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                            <Button
                                variant="outline-secondary"
                                onClick={handleCancelEdit}
                                disabled={loading}
                            >
                                <XCircle className="me-2" />
                                Annuler
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleProfileUpdate}
                                disabled={loading}
                            >
                                <Save className="me-2" />
                                Enregistrer les modifications
                            </Button>
                        </div>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
};

export default ProfilPage;
