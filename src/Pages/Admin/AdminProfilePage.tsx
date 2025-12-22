// src/Pages/Admin/AdminProfilePage.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Image, InputGroup } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';
import { updateAdminPhoto, updateAdminProfile, updateAdminPassword, getAdmins } from '../../services/admin';
import type { Admin } from '../../types/api';
import { PersonCircle, Camera, Save, ExclamationTriangle, Key, ShieldLock } from 'react-bootstrap-icons';
import LoadingSpinner from '../../Components/LoadingSpinner';

const AdminProfilePage: React.FC = () => {
    const { user, refreshUser, loading: authLoading } = useAuth();

    const [loading, setLoading] = useState(false);
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

    // Password Form State
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        password: '',
        password_confirmation: ''
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
        } catch (error) {
            console.error(error);
            setMessage({ type: 'danger', text: 'Erreur lors de la mise à jour du profil.' });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordData.password !== passwordData.password_confirmation) {
            setMessage({ type: 'danger', text: 'Les nouveaux mots de passe ne correspondent pas.' });
            return;
        }

        setLoading(true);
        setMessage(null);

        if (!adminId) {
            setMessage({ type: 'danger', text: 'Compte administrateur introuvable.' });
            setLoading(false);
            return;
        }

        try {
            await updateAdminPassword(adminId, passwordData);
            setPasswordData({ current_password: '', password: '', password_confirmation: '' });
            setMessage({ type: 'success', text: 'Mot de passe modifié avec succès !' });
        } catch (error) {
            console.error(error);
            setMessage({ type: 'danger', text: 'Erreur lors du changement de mot de passe. Vérifiez votre mot de passe actuel.' });
        } finally {
            setLoading(false);
        }
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
            <h1 className="h3 fw-bold mb-4">Mon Profil Administrateur</h1>

            {message && (
                <Alert variant={message.type} dismissible onClose={() => setMessage(null)}>
                    {message.text}
                </Alert>
            )}

            <Row className="g-4">
                <Col md={4}>
                    <Card className="border-0 shadow-sm text-center h-100">
                        <Card.Body className="d-flex flex-column align-items-center justify-content-center py-5">
                            <div className="position-relative mb-4">
                                {displayPhoto ? (
                                    <Image
                                        src={`${getPhotoUrl(displayPhoto)}?t=${new Date().getTime()}`}
                                        roundedCircle
                                        style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                                        className="border border-3 border-white shadow"
                                    />
                                ) : (
                                    <PersonCircle size={150} className="text-secondary opacity-25" />
                                )}
                                <Button
                                    variant="primary"
                                    size="sm"
                                    className="position-absolute bottom-0 end-0 rounded-circle p-2 shadow-sm"
                                    onClick={handlePhotoClick}
                                    disabled={loading}
                                >
                                    <Camera size={18} />
                                </Button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="d-none"
                                    accept="image/*"
                                />
                            </div>

                            <h4 className="fw-bold mb-1">{user.name} {user.lastname}</h4>
                            <span className="badge bg-danger bg-opacity-10 text-danger px-3 py-2 rounded-pill">
                                Administrateur
                            </span>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={8}>
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Header className="bg-white border-0 py-3 d-flex align-items-center">
                            <PersonCircle className="me-2 text-primary" size={20} />
                            <h5 className="mb-0 fw-bold">Informations Personnelles</h5>
                        </Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleProfileUpdate}>
                                <Row className="g-3">
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small text-muted">Prénom</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small text-muted">Nom</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={formData.lastname}
                                                onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small text-muted">Email</Form.Label>
                                            <Form.Control
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small text-muted">Téléphone</Form.Label>
                                            <Form.Control
                                                type="tel"
                                                value={formData.telephone}
                                                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col xs={12} className="text-end mt-3">
                                        <Button variant="primary" type="submit" disabled={loading}>
                                            <Save className="me-2" />
                                            Enregistrer les modifications
                                        </Button>
                                    </Col>
                                </Row>
                            </Form>
                        </Card.Body>
                    </Card>

                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-white border-0 py-3 d-flex align-items-center">
                            <ShieldLock className="me-2 text-danger" size={20} />
                            <h5 className="mb-0 fw-bold">Sécurité</h5>
                        </Card.Header>
                        <Card.Body>
                            <Form onSubmit={handlePasswordUpdate}>
                                <Row className="g-3">
                                    <Col md={12}>
                                        <Form.Group>
                                            <Form.Label className="small text-muted">Mot de passe actuel</Form.Label>
                                            <Form.Control
                                                type="password"
                                                value={passwordData.current_password}
                                                onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small text-muted">Nouveau mot de passe</Form.Label>
                                            <Form.Control
                                                type="password"
                                                value={passwordData.password}
                                                onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                                                required
                                                minLength={8}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small text-muted">Confirmer le nouveau mot de passe</Form.Label>
                                            <Form.Control
                                                type="password"
                                                value={passwordData.password_confirmation}
                                                onChange={(e) => setPasswordData({ ...passwordData, password_confirmation: e.target.value })}
                                                required
                                                minLength={8}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col xs={12} className="text-end mt-3">
                                        <Button variant="danger" type="submit" disabled={loading}>
                                            <Key className="me-2" />
                                            Changer le mot de passe
                                        </Button>
                                    </Col>
                                </Row>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default AdminProfilePage;
