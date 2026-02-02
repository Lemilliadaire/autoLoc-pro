// src/Pages/Admin/AdminsManagementPage.tsx
import React, { useEffect, useState, useMemo } from 'react';
import {
    Container, Row, Col, Card, Table, Button, Badge,
    Form, InputGroup, Modal, Alert, Spinner, Image
} from 'react-bootstrap';
import {
    Search, PersonPlus, Eye, Trash, ShieldLock
} from 'react-bootstrap-icons';
import { useAuth } from '../../hooks/useAuth';
import { getAdmins, createAdmin, deleteAdmin } from '../../services/admin';
import type { Admin, User } from '../../types/api';
import api from '../../services/api';

const AdminsManagementPage: React.FC = () => {
    const { token } = useAuth();
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Search
    const [searchTerm, setSearchTerm] = useState('');

    // Modals
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);

    // Form data for create
    const [selectedUserId, setSelectedUserId] = useState<number>(0);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string>('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        if (!token) return;

        try {
            setLoading(true);
            const [adminsData, usersData] = await Promise.all([
                getAdmins(),
                api.get('/users').then(res => {
                    console.log('Users API response:', res.data);
                    return Array.isArray(res.data) ? res.data : res.data.data || [];
                }).catch(err => {
                    console.error('Error fetching users:', err);
                    return [];
                })
            ]);

            console.log('Admins data:', adminsData);
            console.log('Users data:', usersData);

            setAdmins(adminsData);
            setUsers(usersData);
            setLoading(false);
        } catch (err) {
            console.error('Erreur lors du chargement des données:', err);
            setError('Impossible de charger les données');
            setLoading(false);
        }
    };

    // Filtered and searched admins
    const filteredAdmins = useMemo(() => {
        return admins.filter(admin => {
            const searchLower = searchTerm.toLowerCase();
            return !searchTerm ||
                admin.user?.name?.toLowerCase().includes(searchLower) ||
                admin.user?.lastname?.toLowerCase().includes(searchLower) ||
                admin.user?.email?.toLowerCase().includes(searchLower);
        });
    }, [admins, searchTerm]);

    // Get available users (not already admins)
    const availableUsers = useMemo(() => {
        const adminUserIds = admins.map(a => a.user_id);
        const available = users.filter(u => !adminUserIds.includes(u.id) && u.role !== 'admin');
        console.log('Available users:', available);
        return available;
    }, [users, admins]);

    // Statistics
    const stats = useMemo(() => {
        return {
            total: admins.length,
            active: admins.length,
        };
    }, [admins]);

    const handleDelete = async (id: number) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet administrateur ?')) return;

        try {
            await deleteAdmin(id);
            setAdmins(prev => prev.filter(a => a.id !== id));
            setSuccess('Administrateur supprimé avec succès');
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Erreur lors de la suppression:', err);
            setError('Impossible de supprimer l\'administrateur');
        }
    };

    const handleShowDetails = (admin: Admin) => {
        setSelectedAdmin(admin);
        setShowDetailsModal(true);
    };

    const handleShowCreate = () => {
        setSelectedUserId(0);
        setPhotoFile(null);
        setPhotoPreview('');
        setShowCreateModal(true);
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhotoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCreate = async () => {
        if (!selectedUserId) {
            setError('Veuillez sélectionner un utilisateur');
            return;
        }

        try {
            await createAdmin({
                user_id: selectedUserId,
                photo_profil: photoFile || undefined
            });

            await fetchData(); // Refresh data
            setShowCreateModal(false);
            setSuccess('Administrateur créé avec succès');
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            console.error('Erreur lors de la création:', err);
            setError(err.response?.data?.message || 'Impossible de créer l\'administrateur');
        }
    };

    const getPhotoUrl = (photo: string | undefined) => {
        if (!photo) return null;
        if (photo.startsWith('http')) return photo;
        const baseUrl = 'http://127.0.0.1:8000';
        if (photo.startsWith('/storage/')) return `${baseUrl}${photo}`;
        return `${baseUrl}/storage/${photo}`;
    };

    if (!token) {
        return <Alert variant="danger">Vous devez être connecté pour accéder à cette page.</Alert>;
    }

    if (loading) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Chargement des administrateurs...</p>
            </div>
        );
    }

    return (
        <Container fluid className="py-4">
            <h1 className="mb-4">
                <ShieldLock className="me-2" />
                Gestion des Administrateurs
            </h1>

            {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
            {success && <Alert variant="success" dismissible onClose={() => setSuccess(null)}>{success}</Alert>}

            {/* Statistics Cards */}
            <Row className="mb-4 g-3">
                <Col md={4}>
                    <Card className="shadow-sm border-0" style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white'
                    }}>
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="mb-1 opacity-75">Total Administrateurs</h6>
                                    <h2 className="mb-0 fw-bold">{stats.total}</h2>
                                </div>
                                <div style={{ fontSize: '3rem', opacity: 0.3 }}>🛡️</div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="shadow-sm border-0" style={{
                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                        color: 'white'
                    }}>
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="mb-1 opacity-75">Administrateurs Actifs</h6>
                                    <h2 className="mb-0 fw-bold">{stats.active}</h2>
                                </div>
                                <div style={{ fontSize: '3rem', opacity: 0.3 }}>✓</div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="shadow-sm border-0" style={{
                        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                        color: 'white'
                    }}>
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="mb-1 opacity-75">Utilisateurs Disponibles</h6>
                                    <h2 className="mb-0 fw-bold">{availableUsers.length}</h2>
                                </div>
                                <div style={{ fontSize: '3rem', opacity: 0.3 }}>👤</div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Search and Add Button */}
            <Card className="shadow-sm mb-4">
                <Card.Body>
                    <Row className="g-3">
                        <Col md={8}>
                            <InputGroup>
                                <InputGroup.Text>
                                    <Search />
                                </InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    placeholder="Rechercher par nom, prénom ou email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                        <Col md={4}>
                            <Button
                                variant="primary"
                                className="w-100"
                                onClick={handleShowCreate}
                            >
                                <PersonPlus className="me-2" />
                                Ajouter un Administrateur
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Admins Table */}
            <Card className="shadow-sm">
                <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0">
                            Liste des administrateurs
                            <Badge bg="secondary" className="ms-2">{filteredAdmins.length}</Badge>
                        </h5>
                    </div>

                    {filteredAdmins.length === 0 ? (
                        <Alert variant="info">Aucun administrateur trouvé.</Alert>
                    ) : (
                        <div className="table-responsive">
                            <Table hover>
                                <thead className="table-light">
                                    <tr>
                                        <th>#</th>
                                        <th>Photo</th>
                                        <th>Nom Complet</th>
                                        <th>Email</th>
                                        <th>Téléphone</th>
                                        <th>Rôle</th>
                                        <th className="text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAdmins.map((admin, index) => (
                                        <tr key={admin.id}>
                                            <td className="align-middle">{index + 1}</td>
                                            <td className="align-middle">
                                                <Image
                                                    src={getPhotoUrl(admin.photo_profil || admin.photo) || 'https://via.placeholder.com/40'}
                                                    roundedCircle
                                                    width={40}
                                                    height={40}
                                                    style={{ objectFit: 'cover' }}
                                                />
                                            </td>
                                            <td className="align-middle">
                                                <div className="fw-bold">
                                                    {admin.user?.name} {admin.user?.lastname}
                                                </div>
                                            </td>
                                            <td className="align-middle">
                                                <small className="text-muted">{admin.user?.email}</small>
                                            </td>
                                            <td className="align-middle">
                                                {admin.user?.telephone || 'N/A'}
                                            </td>
                                            <td className="align-middle">
                                                <Badge bg="primary" pill>
                                                    <ShieldLock className="me-1" size={12} />
                                                    Administrateur
                                                </Badge>
                                            </td>
                                            <td className="align-middle">
                                                <div className="d-flex gap-1 justify-content-center">
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        title="Voir détails"
                                                        onClick={() => handleShowDetails(admin)}
                                                    >
                                                        <Eye />
                                                    </Button>
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        title="Supprimer"
                                                        onClick={() => handleDelete(admin.id)}
                                                    >
                                                        <Trash />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* Details Modal */}
            <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        Détails de l'Administrateur - {selectedAdmin?.user?.name} {selectedAdmin?.user?.lastname}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedAdmin && (
                        <>
                            <Card className="mb-3">
                                <Card.Header className="bg-primary text-white">
                                    <h6 className="mb-0">Informations Personnelles</h6>
                                </Card.Header>
                                <Card.Body>
                                    <div className="text-center mb-3">
                                        <Image
                                            src={getPhotoUrl(selectedAdmin.photo_profil || selectedAdmin.photo) || 'https://via.placeholder.com/150'}
                                            roundedCircle
                                            width={150}
                                            height={150}
                                            style={{ objectFit: 'cover' }}
                                        />
                                    </div>
                                    <Row>
                                        <Col md={6}>
                                            <p><strong>Nom complet:</strong> {selectedAdmin.user?.name} {selectedAdmin.user?.lastname}</p>
                                            <p><strong>Email:</strong> {selectedAdmin.user?.email}</p>
                                        </Col>
                                        <Col md={6}>
                                            <p><strong>Téléphone:</strong> {selectedAdmin.user?.telephone || 'N/A'}</p>
                                            <p><strong>Rôle:</strong> <Badge bg="primary">Administrateur</Badge></p>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
                        Fermer
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Create Modal */}
            <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Créer un Nouvel Administrateur</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {availableUsers.length === 0 ? (
                        <Alert variant="warning">
                            <strong>Aucun utilisateur disponible</strong>
                            <p className="mb-0 mt-2">
                                Tous les utilisateurs existants sont déjà administrateurs ou il n'y a pas d'utilisateurs enregistrés dans le système.
                            </p>
                        </Alert>
                    ) : (
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Sélectionner un Utilisateur *</Form.Label>
                                <Form.Select
                                    value={selectedUserId}
                                    onChange={(e) => setSelectedUserId(Number(e.target.value))}
                                    required
                                >
                                    <option value={0}>-- Choisir un utilisateur --</option>
                                    {availableUsers.map(user => (
                                        <option key={user.id} value={user.id}>
                                            {user.name} {user.lastname} ({user.email})
                                        </option>
                                    ))}
                                </Form.Select>
                                <Form.Text className="text-muted">
                                    Seuls les utilisateurs qui ne sont pas déjà administrateurs sont affichés.
                                </Form.Text>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Photo de Profil (Optionnel)</Form.Label>
                                <Form.Control
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                />
                                {photoPreview && (
                                    <div className="mt-3 text-center">
                                        <Image
                                            src={photoPreview}
                                            rounded
                                            width={150}
                                            height={150}
                                            style={{ objectFit: 'cover' }}
                                        />
                                    </div>
                                )}
                            </Form.Group>
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                        Annuler
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleCreate}
                        disabled={!selectedUserId}
                    >
                        <PersonPlus className="me-2" />
                        Créer l'Administrateur
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default AdminsManagementPage;
