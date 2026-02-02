// src/Pages/Admin/CategoriesAdminPage.tsx
import React, { useEffect, useState, useMemo } from 'react';
import {
    Container, Row, Col, Card, Table, Badge, Button, Alert,
    Form, InputGroup, Modal, Spinner
} from 'react-bootstrap';
import {
    Search, PlusCircle, Pencil, Trash,
    FileEarmarkText, Printer, XCircle
} from 'react-bootstrap-icons';
import { useAuth } from '../../hooks/useAuth';
import { getCategories, createCategorie, updateCategorie, deleteCategorie } from '../../services/categorie';
import { getVoitures } from '../../services/voiture';
import type { Categorie } from '../../types/api';

const CategoriesAdminPage: React.FC = () => {
    const { token } = useAuth();
    const [categories, setCategories] = useState<Categorie[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Search
    const [searchTerm, setSearchTerm] = useState('');

    // Modals
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Categorie | null>(null);
    const [deletingCategory, setDeletingCategory] = useState<Categorie | null>(null);

    // Form data
    const [formData, setFormData] = useState({
        nom: '',
        description: '',
        prix_journalier: 0
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [categoriesData, voituresResponse] = await Promise.all([
                getCategories(),
                getVoitures({ per_page: 1000 })
            ]);

            const allVoitures = voituresResponse.data || [];

            // Enrichir les catégories avec les voitures correspondantes
            const categoriesWithVoitures = categoriesData.map(cat => ({
                ...cat,
                voitures: allVoitures.filter(v => v.categorie_id === cat.id)
            }));

            setCategories(categoriesWithVoitures);
            setLoading(false);
        } catch (err) {
            console.error('Erreur lors du chargement des données:', err);
            setError('Impossible de charger les données');
            setLoading(false);
        }
    };

    // Filtered categories
    const filteredCategories = useMemo(() => {
        return categories.filter(cat => {
            const searchLower = searchTerm.toLowerCase();
            return !searchTerm ||
                cat.nom.toLowerCase().includes(searchLower) ||
                (cat.description && cat.description.toLowerCase().includes(searchLower));
        });
    }, [categories, searchTerm]);

    // Statistics
    const stats = useMemo(() => {
        const total = categories.length;
        const active = categories.filter(c => c.voitures && c.voitures.length > 0).length;

        return {
            total,
            active
        };
    }, [categories]);

    const handleShowCreateModal = () => {
        setEditingCategory(null);
        setFormData({ nom: '', description: '', prix_journalier: 0 });
        setShowModal(true);
    };

    const handleShowEditModal = (category: Categorie) => {
        setEditingCategory(category);
        setFormData({
            nom: category.nom,
            description: category.description || '',
            prix_journalier: category.prix_journalier
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingCategory(null);
        setFormData({ nom: '', description: '', prix_journalier: 0 });
    };

    const handleSave = async () => {
        if (!token) return;

        if (!formData.nom || formData.prix_journalier <= 0) {
            setError('Veuillez remplir tous les champs requis');
            return;
        }

        try {
            if (editingCategory) {
                // Update
                await updateCategorie(editingCategory.id, formData, token);
                setSuccess('Catégorie mise à jour avec succès');
            } else {
                // Create
                await createCategorie(formData, token);
                setSuccess('Catégorie créée avec succès');
            }

            await fetchData();
            handleCloseModal();
        } catch (err: any) {
            console.error('Erreur lors de la sauvegarde:', err);
            setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
        }
    };

    const handleShowDeleteModal = (category: Categorie) => {
        setDeletingCategory(category);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        if (!deletingCategory || !token) return;

        try {
            await deleteCategorie(deletingCategory.id, token);
            setCategories(prev => prev.filter(c => c.id !== deletingCategory.id));
            setSuccess('Catégorie supprimée avec succès');
            setShowDeleteModal(false);
            setDeletingCategory(null);
        } catch (err) {
            console.error('Erreur lors de la suppression:', err);
            setError('Impossible de supprimer cette catégorie');
        }
    };

    const exportToCSV = () => {
        const headers = ['ID', 'Nom', 'Description', 'Prix Journalier (FCFA)'];
        const rows = filteredCategories.map(c => [
            c.id,
            c.nom,
            c.description || '',
            c.prix_journalier
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `categories_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const handlePrint = () => {
        window.print();
    };

    if (!token) {
        return <Alert variant="danger">Vous devez être connecté pour accéder à cette page.</Alert>;
    }

    if (loading) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Chargement des catégories...</p>
            </div>
        );
    }

    return (
        <Container fluid className="py-4">
            <h1 className="mb-4">Gestion des Catégories</h1>

            {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
            {success && <Alert variant="success" dismissible onClose={() => setSuccess(null)}>{success}</Alert>}


            {/* Statistics Cards */}
            <Row className="mb-4 g-3">
                <Col md={6}>
                    <Card className="shadow-sm border-0" style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white'
                    }}>
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="mb-1 opacity-75">Total Catégories</h6>
                                    <h2 className="mb-0 fw-bold">{stats.total}</h2>
                                </div>
                                <div style={{ fontSize: '3rem', opacity: 0.3 }}>📂</div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card className="shadow-sm border-0" style={{
                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                        color: 'white'
                    }}>
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="mb-1 opacity-75">Catégories Actives</h6>
                                    <h2 className="mb-0 fw-bold">{stats.active}</h2>
                                </div>
                                <div style={{ fontSize: '3rem', opacity: 0.3 }}>✓</div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>


            {/* Search and Actions */}
            <Card className="shadow-sm mb-4">
                <Card.Body>
                    <Row className="g-3 align-items-center">
                        <Col md={6}>
                            <InputGroup>
                                <InputGroup.Text>
                                    <Search />
                                </InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    placeholder="Rechercher par nom ou description..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && (
                                    <Button variant="outline-secondary" onClick={() => setSearchTerm('')}>
                                        <XCircle />
                                    </Button>
                                )}
                            </InputGroup>
                        </Col>
                        <Col md={6}>
                            <div className="d-flex gap-2 justify-content-end">
                                <Button variant="primary" onClick={handleShowCreateModal}>
                                    <PlusCircle className="me-2" />
                                    Nouvelle Catégorie
                                </Button>
                                <Button variant="outline-success" size="sm" onClick={exportToCSV} title="Export CSV">
                                    <FileEarmarkText />
                                </Button>
                                <Button variant="outline-secondary" size="sm" onClick={handlePrint} title="Imprimer">
                                    <Printer />
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Categories Table */}
            <Card className="shadow-sm">
                <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0">
                            Liste des catégories
                            <Badge bg="secondary" className="ms-2">{filteredCategories.length}</Badge>
                        </h5>
                    </div>

                    {filteredCategories.length === 0 ? (
                        <Alert variant="info">Aucune catégorie trouvée.</Alert>
                    ) : (
                        <div className="table-responsive">
                            <Table hover className="align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>#</th>
                                        <th>Nom</th>
                                        <th>Description</th>
                                        <th>Prix Journalier</th>
                                        <th>Nb. Voitures</th>
                                        <th className="text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCategories.map((category) => (
                                        <tr key={category.id}>
                                            <td>{category.id}</td>
                                            <td className="fw-bold">{category.nom}</td>
                                            <td>
                                                <small className="text-muted">
                                                    {category.description || '-'}
                                                </small>
                                            </td>
                                            <td>
                                                <Badge bg="success" pill>
                                                    {(category.prix_journalier || 0).toLocaleString('fr-FR')} FCFA
                                                </Badge>
                                            </td>
                                            <td>
                                                <Badge bg="info" pill>
                                                    {category.voitures?.length || 0}
                                                </Badge>
                                            </td>
                                            <td>
                                                <div className="d-flex gap-1 justify-content-center">
                                                    <Button
                                                        variant="outline-warning"
                                                        size="sm"
                                                        title="Modifier"
                                                        onClick={() => handleShowEditModal(category)}
                                                    >
                                                        <Pencil />
                                                    </Button>
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        title="Supprimer"
                                                        onClick={() => handleShowDeleteModal(category)}
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

            {/* Add/Edit Modal */}
            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {editingCategory ? 'Modifier la Catégorie' : 'Nouvelle Catégorie'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Nom *</Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.nom}
                                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                                placeholder="Ex: SUV, Berline, Citadine..."
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Description de la catégorie..."
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Prix Journalier (FCFA) *</Form.Label>
                            <Form.Control
                                type="number"
                                value={formData.prix_journalier}
                                onChange={(e) => setFormData({ ...formData, prix_journalier: Number(e.target.value) })}
                                min="0"
                                step="0.01"
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Annuler
                    </Button>
                    <Button variant="primary" onClick={handleSave}>
                        {editingCategory ? 'Mettre à jour' : 'Créer'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmer la suppression</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Êtes-vous sûr de vouloir supprimer la catégorie <strong>{deletingCategory?.nom}</strong> ?
                    Cette action est irréversible.
                    {deletingCategory?.voitures && deletingCategory.voitures.length > 0 && (
                        <Alert variant="warning" className="mt-3">
                            <strong>Attention :</strong> Cette catégorie contient {deletingCategory.voitures.length} voiture(s).
                        </Alert>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Annuler
                    </Button>
                    <Button variant="danger" onClick={handleDelete}>
                        Supprimer
                    </Button>
                </Modal.Footer>
            </Modal>

            <style>{`
                @media print {
                    .btn, .modal, nav, aside, .no-print {
                        display: none !important;
                    }
                    .table {
                        font-size: 10px;
                    }
                }
            `}</style>
        </Container>
    );
};

export default CategoriesAdminPage;
