// src/Pages/Admin/AdminProfilePage.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Image, Badge } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';
import { updateAdminPhoto, updateAdminProfile, getAdmins } from '../../services/admin';
import type { Admin } from '../../types/api';
import {
    PersonCircle, Camera, Save, ShieldLock, PersonVcard,
    Pencil, XCircle, Envelope, Telephone, Calendar, Award,
    CheckCircleFill, InfoCircle
} from 'react-bootstrap-icons';
import LoadingSpinner from '../../Components/LoadingSpinner';

const AdminProfilePage: React.FC = () => {
    const { user, refreshUser, loading: authLoading } = useAuth();

    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'danger', text: string } | null>(null);
    const [adminId, setAdminId] = useState<number | null>(null);
    const [adminData, setAdminData] = useState<Admin | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Profile pour admin
    const [formData, setFormData] = useState({
        name: '',
        lastname: '',
        email: '',
        telephone: '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                lastname: user.lastname || '',
                email: user.email || '',
                telephone: user.telephone || ''
            });

            // Find the admin ID matching the user
            getAdmins().then(admins => {
                const currentAdmin = admins.find(a => a.user_id === user.id);
                if (currentAdmin) {
                    setAdminId(currentAdmin.id);
                    setAdminData(currentAdmin);
                } else {
                    console.warn('User not found in admins list, using user.id as fallback');
                    setAdminId(user.id);
                }
            }).catch(err => {
                console.error('Error fetching admins:', err);
                setAdminId(user.id);
            });
        }
    }, [user]);

    if (authLoading) return <LoadingSpinner />;
    if (!user) return null;

    const handlePhotoClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setMessage(null);

        if (!adminId) {
            setMessage({ type: 'danger', text: 'Compte administrateur introuvable.' });
            setLoading(false);
            return;
        }

        try {
            await updateAdminPhoto(adminId, file);
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

        if (!adminId) {
            setMessage({ type: 'danger', text: 'Compte administrateur introuvable.' });
            setLoading(false);
            return;
        }

        try {
            await updateAdminProfile(adminId, formData);
            await refreshUser();
            setMessage({ type: 'success', text: 'Informations mises à jour avec succès !' });
            setIsEditing(false);
        } catch (error) {
            console.error(error);
            setMessage({ type: 'danger', text: 'Erreur lors de la mise à jour du profil.' });
        } finally {
            setLoading(false);
        }
    };


    const handleCancelEdit = () => {
        setIsEditing(false);
        if (user) {
            setFormData({
                name: user.name || '',
                lastname: user.lastname || '',
                email: user.email || '',
                telephone: user.telephone || ''
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

    const displayPhoto = adminData?.photo_profil || user.photo;

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
                                                src={`${getPhotoUrl(displayPhoto)}?t=${new Date().getTime()}`}
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
                                    {user.telephone && (
                                        <span><Telephone size={16} className="me-1" />{user.telephone}</span>
                                    )}
                                </div>
                            </Col>
                            <Col xs="auto">
                                <Badge bg="light" text="dark" className="px-3 py-2 fs-6 fw-normal">
                                    <ShieldLock className="me-2" />
                                    Administrateur
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
                                    <h6 className="text-muted mb-1">Rôle</h6>
                                    <h5 className="fw-bold text-primary mb-0">Administrateur</h5>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4}>
                            <Card className="border-0 bg-success bg-opacity-10 h-100">
                                <Card.Body className="text-center">
                                    <CheckCircleFill size={32} className="text-success mb-2" />
                                    <h6 className="text-muted mb-1">Statut</h6>
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
                    {message.type === 'success' ?
                        <CheckCircleFill className="me-2" /> :
                        <InfoCircle className="me-2" />
                    }
                    {message.text}
                </Alert>
            )}

            {/* Informations du Profil */}
            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white py-3 border-0">
                    <div className="d-flex justify-content-between align-items-center">
                        <h5 className="fw-bold mb-0">
                            <PersonVcard className="me-2 text-primary" />
                            Informations du compte
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
                                <label className="text-muted small mb-2 d-block">Prénom</label>
                                {isEditing ? (
                                    <Form.Control
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                ) : (
                                    <h6 className="mb-0">{user.name}</h6>
                                )}
                            </div>
                        </Col>
                        <Col md={6}>
                            <div className="border rounded p-3 h-100">
                                <label className="text-muted small mb-2 d-block">Nom</label>
                                {isEditing ? (
                                    <Form.Control
                                        type="text"
                                        value={formData.lastname}
                                        onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                                        required
                                    />
                                ) : (
                                    <h6 className="mb-0">{user.lastname}</h6>
                                )}
                            </div>
                        </Col>
                        <Col md={6}>
                            <div className="border rounded p-3 h-100">
                                <label className="text-muted small mb-2 d-block">Email</label>
                                {isEditing ? (
                                    <Form.Control
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                ) : (
                                    <h6 className="mb-0">{user.email}</h6>
                                )}
                            </div>
                        </Col>
                        <Col md={6}>
                            <div className="border rounded p-3 h-100">
                                <label className="text-muted small mb-2 d-block">Téléphone</label>
                                {isEditing ? (
                                    <Form.Control
                                        type="tel"
                                        value={formData.telephone}
                                        onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                                    />
                                ) : (
                                    <h6 className="mb-0">{user.telephone || 'Non renseigné'}</h6>
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

export default AdminProfilePage;
