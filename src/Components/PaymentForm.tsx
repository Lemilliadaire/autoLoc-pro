// src/Components/PaymentForm.tsx
import React, { useState } from 'react';
import { Form, Button, Alert, Card } from 'react-bootstrap';
import { createPaiement } from '../services/paiement';
import { Phone, PhoneFill, CashCoin } from 'react-bootstrap-icons';

interface PaymentFormProps {
    reservationId: number;
    amount: number;
    onSuccess: () => void;
    onCancel: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ reservationId, amount, onSuccess, onCancel }) => {
    const [method, setMethod] = useState('tmoney');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await createPaiement({
                reservation_id: reservationId,
                montant: amount,
                methode: method,
                statut: 'paye', // On assume que le paiement est immédiat pour la démo
                date_paiement: new Date().toISOString().split('T')[0]
            });
            onSuccess();
        } catch (err) {
            console.error(err);
            setError("Le paiement a échoué. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="shadow-sm border-0">
            <Card.Body>
                <h4 className="mb-4 text-center">Finaliser votre réservation</h4>
                <div className="mb-4 p-4 border rounded-3 d-flex justify-content-between align-items-center bg-light">
                    <span className="fw-bold text-secondary">Montant à régler :</span>
                    <span className="h3 mb-0 text-primary fw-bold">{amount} <small>FCFA</small></span>
                </div>

                {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-4">
                        <Form.Label className="fw-semibold mb-3">Choisissez votre moyen de paiement</Form.Label>
                        <div className="d-grid gap-3">
                            <Button
                                variant={method === 'tmoney' ? 'primary' : 'outline-light'}
                                className={`d-flex align-items-center justify-content-between p-3 border shadow-sm ${method === 'tmoney' ? 'text-white' : 'text-dark fw-medium'}`}
                                onClick={() => setMethod('tmoney')}
                                type="button"
                            >
                                <div className="d-flex align-items-center">
                                    <div className={`me-3 p-2 rounded-circle ${method === 'tmoney' ? 'bg-white bg-opacity-25' : 'bg-primary bg-opacity-10'}`}>
                                        <Phone className={method === 'tmoney' ? 'text-white' : 'text-primary'} />
                                    </div>
                                    <span className="fs-5">TMoney</span>
                                </div>
                                {method === 'tmoney' && <span className="badge bg-white text-primary rounded-pill">SÉLECTIONNÉ</span>}
                            </Button>

                            <Button
                                variant={method === 'flooz' ? 'primary' : 'outline-light'}
                                className={`d-flex align-items-center justify-content-between p-3 border shadow-sm ${method === 'flooz' ? 'text-white' : 'text-dark fw-medium'}`}
                                onClick={() => setMethod('flooz')}
                                type="button"
                            >
                                <div className="d-flex align-items-center">
                                    <div className={`me-3 p-2 rounded-circle ${method === 'flooz' ? 'bg-white bg-opacity-25' : 'bg-success bg-opacity-10'}`}>
                                        <PhoneFill className={method === 'flooz' ? 'text-white' : 'text-success'} />
                                    </div>
                                    <span className="fs-5">Flooz</span>
                                </div>
                                {method === 'flooz' && <span className="badge bg-white text-primary rounded-pill">SÉLECTIONNÉ</span>}
                            </Button>

                            <Button
                                variant={method === 'especes' ? 'primary' : 'outline-light'}
                                className={`d-flex align-items-center justify-content-between p-3 border shadow-sm ${method === 'especes' ? 'text-white' : 'text-dark fw-medium'}`}
                                onClick={() => setMethod('especes')}
                                type="button"
                            >
                                <div className="d-flex align-items-center">
                                    <div className={`me-3 p-2 rounded-circle ${method === 'especes' ? 'bg-white bg-opacity-25' : 'bg-secondary bg-opacity-10'}`}>
                                        <CashCoin className={method === 'especes' ? 'text-white' : 'text-secondary'} />
                                    </div>
                                    <span className="fs-5">En Espèce</span>
                                </div>
                                {method === 'especes' && <span className="badge bg-white text-primary rounded-pill">SÉLECTIONNÉ</span>}
                            </Button>
                        </div>
                    </Form.Group>

                    <div className="d-flex gap-2">
                        <Button variant="secondary" onClick={onCancel} disabled={loading} className="w-50">
                            Annuler
                        </Button>
                        <Button variant="success" type="submit" disabled={loading} className="w-50">
                            {loading ? 'Traitement...' : 'Payer maintenant'}
                        </Button>
                    </div>
                </Form>
            </Card.Body>
        </Card>
    );
};

export default PaymentForm;
