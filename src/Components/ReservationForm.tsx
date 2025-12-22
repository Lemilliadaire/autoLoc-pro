import React, { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

import { getVoiture } from '../services/voiture';
import { getAgences } from '../services/agence';
import { createReservation, type ReservationCreationData } from '../services/reservation';
import { me } from '../services/auth';
import { useAuth } from '../hooks/useAuth';
import type { Agence, Voiture, User } from '../types/api';
;
// Schéma de validation avec Zod, correspondant à la validation Laravel
const reservationSchema = z.object({
    date_debut: z.string().min(1, "La date de début est requise."),
    date_fin: z.string().min(1, "La date de fin est requise."),
    agence_retrait_id: z.string().min(1, "L'agence de retrait est requise.").refine(val => !isNaN(parseInt(val, 10)), { message: "Veuillez sélectionner une agence." }),
    agence_retour_id: z.string().min(1, "L'agence de retour est requise.").refine(val => !isNaN(parseInt(val, 10)), { message: "Veuillez sélectionner une agence." }),
}).refine(data => new Date(data.date_fin) > new Date(data.date_debut), {
    message: "La date de fin doit être après la date de début.",
    path: ["date_fin"],
});

type ReservationFormInputs = z.infer<typeof reservationSchema>;

interface ReservationFormProps {
    voitureId: number;
}

const ReservationForm: React.FC<ReservationFormProps> = ({ voitureId }) => {
    const { user, token, refreshUser } = useAuth();
    const navigate = useNavigate();

    const [agences, setAgences] = useState<Agence[]>([]);
    const [voiture, setVoiture] = useState<Voiture | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [prixTotal, setPrixTotal] = useState<number>(0);

    const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<ReservationFormInputs>({
        resolver: zodResolver(reservationSchema),
    });

    const dateDebut = watch('date_debut');
    const dateFin = watch('date_fin');

    // Fetch des données nécessaires (agences, voiture)
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [agencesData, voitureData] = await Promise.all([
                    getAgences(),
                    getVoiture(voitureId)
                ]);
                setAgences(agencesData);
                setVoiture(voitureData);
            } catch (err) {
                setError("Erreur lors du chargement des données pour la réservation.");
                console.error(err);
            }
        };
        fetchData();
    }, [voitureId]);

    // Calcul dynamique du prix total
    useEffect(() => {
        if (dateDebut && dateFin && voiture?.prix_journalier) {
            const debut = new Date(dateDebut);
            const fin = new Date(dateFin);
            if (fin > debut) {
                const diffTime = Math.abs(fin.getTime() - debut.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                setPrixTotal(diffDays * voiture.prix_journalier);
            } else {
                setPrixTotal(0);
            }
        }
    }, [dateDebut, dateFin, voiture]);

    const onSubmit: SubmitHandler<ReservationFormInputs> = async (data) => {
        let currentUser: User | null = user;

        // Tentative de rafraîchissement du profil si les données locales semblent incomplètes
        if ((!currentUser || !currentUser.client) && token) {
            try {
                const freshUser = await me(token);
                if (freshUser) {
                    currentUser = freshUser;
                    refreshUser(); // Met à jour le contexte en arrière-plan
                }
            } catch (authErr) {
                console.error("Impossible de rafraîchir les données utilisateur", authErr);
            }
        }

        // Vérification robuste du profil client avec les données potentiellement rafraîchies
        if (!currentUser || !currentUser.client || !currentUser.client.id) {
            setError("Votre profil client est incomplet. Veuillez le compléter sur votre page de profil avant de réserver.");
            return;
        }

        if (!voiture) {
            setError("Les données de la voiture sont manquantes. Impossible de réserver.");
            return;
        }
        setError(null);

        const reservationData: ReservationCreationData = {
            client_id: currentUser.client.id,
            voiture_id: voiture.id,
            date_depart: data.date_debut,
            date_retour: data.date_fin,
            agence_depart_id: parseInt(data.agence_retrait_id, 10),
            agence_retour_id: parseInt(data.agence_retour_id, 10),
            prix_total: prixTotal,
            statut: 'en attente', // Statut par défaut à la création
        };

        try {
            await createReservation(reservationData);
            // Rediriger vers le dashboard après succès
            navigate(`/dashboard?reservation=success`);
        } catch (err: any) {
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message); // Affiche l'erreur de l'API (ex: "Car not available")
            } else {
                setError("Une erreur est survenue lors de la création de la réservation.");
            }
            console.error(err);
        }
    };

    const today = new Date().toISOString().split('T')[0];

    if (!voiture) {
        return <div className="text-center"><Spinner animation="border" /></div>;
    }

    return (
        <Form onSubmit={handleSubmit(onSubmit)} noValidate>
            <h3 className="mb-4">Réserver {voiture.marque} {voiture.modele}</h3>
            {error && <Alert variant="danger">{error}</Alert>}

            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="date_debut">
                        <Form.Label>Date de début</Form.Label>
                        <Form.Control type="date" {...register('date_debut')} isInvalid={!!errors.date_debut} min={today} />
                        <Form.Control.Feedback type="invalid">{errors.date_debut?.message}</Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="date_fin">
                        <Form.Label>Date de fin</Form.Label>
                        <Form.Control type="date" {...register('date_fin')} isInvalid={!!errors.date_fin} min={dateDebut || today} />
                        <Form.Control.Feedback type="invalid">{errors.date_fin?.message}</Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>

            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="agence_retrait_id">
                        <Form.Label>Agence de retrait</Form.Label>
                        <Form.Select {...register('agence_retrait_id')} isInvalid={!!errors.agence_retrait_id}>
                            <option value="">Sélectionnez une agence</option>
                            {agences.map(agence => <option key={agence.id} value={agence.id}>{agence.nom}</option>)}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">{errors.agence_retrait_id?.message}</Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="agence_retour_id">
                        <Form.Label>Agence de retour</Form.Label>
                        <Form.Select {...register('agence_retour_id')} isInvalid={!!errors.agence_retour_id}>
                            <option value="">Sélectionnez une agence</option>
                            {agences.map(agence => <option key={agence.id} value={agence.id}>{agence.nom}</option>)}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">{errors.agence_retour_id?.message}</Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>

            <div className="d-grid gap-2 mt-4">
                <div className="text-center fs-5 mb-3">
                    <strong>Prix total estimé : {prixTotal.toFixed(2)} €</strong>
                </div>
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Envoi...</> : 'Confirmer la réservation'}
                </Button>
            </div>
        </Form>
    );
};

export default ReservationForm;