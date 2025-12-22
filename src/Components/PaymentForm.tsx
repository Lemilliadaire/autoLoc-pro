// src/Components/PaymentForm.tsx
import React, { useState } from 'react';
import { Form, Button, Alert, Card } from 'react-bootstrap';
import { createPaiement } from '../services/paiement';
import { CreditCard, CashCoin, Paypal } from 'react-bootstrap-icons';

interface PaymentFormProps {
    reservationId: number;
    amount: number;
    onSuccess: () => void;
    onCancel: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ reservationId, amount, onSuccess, onCancel }) => {
    const [method, setMethod] = useState('carte_bancaire');
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
                <h4 className="mb-4">Paiement sécurisé</h4>
                <div className="mb-4 p-3 bg-light rounded d-flex justify-content-between align-items-center">
                    <span className="text-muted">Montant à payer :</span>
                    <span className="h4 mb-0 text-primary">{amount} €</span>
                </div>

                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-4">
                        <Form.Label>Méthode de paiement</Form.Label>
                        <div className="d-grid gap-2">
                            <Button
                                variant={method === 'carte_bancaire' ? 'primary' : 'outline-secondary'}
                                className="d-flex align-items-center justify-content-between p-3"
                                onClick={() => setMethod('carte_bancaire')}
                                type="button"
                            >
                                <span><CreditCard className="me-2" /> Carte Bancaire</span>
                                {method === 'carte_bancaire' && <span>✓</span>}
                            </Button>

                            <Button
                                variant={method === 'paypal' ? 'primary' : 'outline-secondary'}
                                className="d-flex align-items-center justify-content-between p-3"
                                onClick={() => setMethod('paypal')}
                                type="button"
                            >
                                <span><Paypal className="me-2" /> PayPal</span>
                                {method === 'paypal' && <span>✓</span>}
                            </Button>

                            <Button
                                variant={method === 'especes' ? 'primary' : 'outline-secondary'}
                                className="d-flex align-items-center justify-content-between p-3"
                                onClick={() => setMethod('especes')}
                                type="button"
                            >
                                <span><CashCoin className="me-2" /> Espèces (en agence)</span>
                                {method === 'especes' && <span>✓</span>}
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
