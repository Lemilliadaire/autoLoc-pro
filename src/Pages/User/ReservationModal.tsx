// src/Components/ReservationModal.tsx
import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';
import { createReservation } from '../../services/reservation';
import { getAgences } from '../../services/agence';
import type { Voiture, Agence } from '../../types/api';
import PaymentForm from '../../Components/PaymentForm';
import { CheckCircle } from 'react-bootstrap-icons';

interface ReservationModalProps {
    show: boolean;
    onHide: () => void;
    voiture: Voiture;
}

const ReservationModal: React.FC<ReservationModalProps> = ({ show, onHide, voiture }) => {
    const { user, token } = useAuth();
    const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');
    const [reservationId, setReservationId] = useState<number | null>(null);
    const [agences, setAgences] = useState<Agence[]>([]);

    // Form state
    const [dateDepart, setDateDepart] = useState('');
    const [dateRetour, setDateRetour] = useState('');
    const [agenceDepart, setAgenceDepart] = useState<string>('');
    const [agenceRetour, setAgenceRetour] = useState<string>('');
    const [totalPrice, setTotalPrice] = useState(0);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (show) {
            loadAgences();
            // Reset state on open
            setStep('details');
            setReservationId(null);
            setError(null);
            setDateDepart('');
            setDateRetour('');
        }
    }, [show]);

    // Calcul du prix total quand les dates changent
    useEffect(() => {
        if (dateDepart && dateRetour) {
            const start = new Date(dateDepart);
            const end = new Date(dateRetour);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // Si c'est le même jour, on compte au moins 1 jour (location de 24h)
            const rentalDays = diffDays === 0 ? 1 : diffDays;
            setTotalPrice(rentalDays * voiture.prix_journalier);
        }
    }, [dateDepart, dateRetour, voiture.prix_journalier]);

    const loadAgences = async () => {
        try {
            const data = await getAgences();
            setAgences(data);
            if (data.length > 0) {
                setAgenceDepart(data[0].id.toString());
                setAgenceRetour(data[0].id.toString());
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleReservationSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.client) {
            setError("Vous devez compléter votre profil client avant de réserver.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const reservationData = {
                user_id: user.id,
                voiture_id: voiture.id,
                client_id: user.client.id,
                agence_depart_id: parseInt(agenceDepart),
                agence_retour_id: parseInt(agenceRetour),
                agence_retrait_id: parseInt(agenceRetour),
                date_depart: dateDepart,
                date_retour: dateRetour,
                date_debut: dateDepart,
                date_fin: dateRetour,
                statut: 'en_attente',
                prix_total: totalPrice
            };

            console.log('Sending reservation data:', reservationData);
            console.log('Using token:', token ? 'Token exists' : 'No token');

            const response = await createReservation(reservationData);
            console.log('Reservation response:', response);
            setReservationId(response.reservation.id);
            setStep('payment');
        } catch (err: any) {
            console.error('Full Reservation Error:', err);
            if (err.response) {
                console.log('Error Data:', err.response.data);
                console.log('Error Status:', err.response.status);
            }
            setError(err.response?.data?.message || "Erreur lors de la création de la réservation.");
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentSuccess = () => {
        setStep('success');
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    {step === 'details' && `Réserver ${voiture.marque} ${voiture.modele}`}
                    {step === 'payment' && 'Paiement de la réservation'}
                    {step === 'success' && 'Réservation confirmée'}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {step === 'details' && (
                    <Form onSubmit={handleReservationSubmit}>
                        {error && <Alert variant="danger">{error}</Alert>}

                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Date de départ</Form.Label>
                                    <Form.Control
                                        type="date"
                                        required
                                        value={dateDepart}
                                        onChange={(e) => setDateDepart(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Date de retour</Form.Label>
                                    <Form.Control
                                        type="date"
                                        required
                                        value={dateRetour}
                                        onChange={(e) => setDateRetour(e.target.value)}
                                        min={dateDepart || new Date().toISOString().split('T')[0]}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Agence de départ</Form.Label>
                                    <Form.Select
                                        value={agenceDepart}
                                        onChange={(e) => setAgenceDepart(e.target.value)}
                                    >
                                        {agences.map(a => <option key={a.id} value={a.id}>{a.nom} - {a.ville}</option>)}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Agence de retour</Form.Label>
                                    <Form.Select
                                        value={agenceRetour}
                                        onChange={(e) => setAgenceRetour(e.target.value)}
                                    >
                                        {agences.map(a => <option key={a.id} value={a.id}>{a.nom} - {a.ville}</option>)}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Alert variant="info" className="d-flex justify-content-between align-items-center">
                            <span>Prix total estimé :</span>
                            <span className="h4 mb-0">{totalPrice} €</span>
                        </Alert>

                        <div className="d-flex justify-content-end gap-2">
                            <Button variant="secondary" onClick={onHide}>Annuler</Button>
                            <Button type="submit" variant="primary" disabled={loading || totalPrice <= 0}>
                                {loading ? 'Création...' : 'Continuer vers le paiement'}
                            </Button>
                        </div>
                    </Form>
                )}

                {step === 'payment' && reservationId && (
                    <PaymentForm
                        reservationId={reservationId}
                        amount={totalPrice}
                        onSuccess={handlePaymentSuccess}
                        onCancel={onHide}
                    />
                )}

                {step === 'success' && (
                    <div className="text-center py-4">
                        <CheckCircle className="text-success mb-3" size={64} />
                        <h4>Félicitations !</h4>
                        <p className="lead">Votre réservation a été confirmée et payée avec succès.</p>
                        <p className="text-muted">Un email de confirmation vous a été envoyé.</p>
                        <Button variant="primary" onClick={onHide} className="mt-3">
                            Fermer
                        </Button>
                    </div>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default ReservationModal;
