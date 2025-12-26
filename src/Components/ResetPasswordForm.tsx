// src/components/ResetPasswordForm.tsx
import React, { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Card, Form, Button, Alert, Row, Col } from "react-bootstrap";
import { Lock, CheckCircle } from "react-bootstrap-icons";
import { resetPassword } from "../services/auth";

const ResetPasswordForm: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFeedback(null);

        if (password !== passwordConfirmation) {
            setFeedback({
                type: "error",
                message: "Les mots de passe ne correspondent pas."
            });
            setIsSubmitting(false);
            return;
        }

        if (!token) {
            setFeedback({
                type: "error",
                message: "Token invalide. Veuillez demander un nouveau lien de réinitialisation."
            });
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await resetPassword(token, password, passwordConfirmation);
            setFeedback({
                type: "success",
                message: response.message || "Mot de passe réinitialisé avec succès !"
            });
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (err: any) {
            console.error("Erreur de réinitialisation :", err);
            setFeedback({
                type: "error",
                message: err.response?.data?.message || "Une erreur est survenue. Le lien a peut-être expiré."
            });
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-split-container">
            {/* Sidebar Section */}
            <div className="auth-sidebar">
                <div className="mb-5">
                    <Link to="/" className="text-white text-decoration-none d-flex align-items-center gap-2 mb-4">
                        <div className="bg-white p-2 rounded-3 text-primary">
                            <Lock size={24} />
                        </div>
                        <span className="fs-3 fw-bold tracking-tight">AutoLoc Pro</span>
                    </Link>
                    <h1 className="display-4 fw-bold mb-3">Nouveau mot de passe 🔑</h1>
                    <p className="fs-5 text-white-50">Choisissez un mot de passe sécurisé pour protéger votre compte.</p>
                </div>

                <div className="mt-auto">
                    <div className="p-4 bg-white bg-opacity-10 rounded-4 backdrop-blur">
                        <p className="mb-0 italic">"Utilisez au moins 8 caractères avec des lettres et des chiffres."</p>
                    </div>
                </div>
            </div>

            {/* Form Section */}
            <div className="auth-form-section">
                <div style={{ maxWidth: '440px', width: '100%' }}>
                    <div className="mb-4 text-center d-lg-none">
                        <h2 className="fw-bold text-primary">AutoLoc Pro</h2>
                    </div>

                    <Card className="glass-card border-0 rounded-4 overflow-hidden">
                        <Card.Body className="p-4 p-md-5">
                            <div className="mb-4">
                                <h2 className="fw-bold h3 mb-2">Définir un nouveau mot de passe</h2>
                                <p className="text-muted">Entrez votre nouveau mot de passe ci-dessous.</p>
                            </div>

                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="auth-input-group" controlId="password">
                                    <Form.Label>Nouveau mot de passe</Form.Label>
                                    <div className="position-relative">
                                        <Form.Control
                                            type="password"
                                            placeholder="••••••••"
                                            required
                                            autoFocus
                                            minLength={8}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="auth-control shadow-none"
                                        />
                                        <Lock className="floating-icon" />
                                    </div>
                                </Form.Group>

                                <Form.Group className="auth-input-group" controlId="passwordConfirmation">
                                    <Form.Label>Confirmer le mot de passe</Form.Label>
                                    <div className="position-relative">
                                        <Form.Control
                                            type="password"
                                            placeholder="••••••••"
                                            required
                                            minLength={8}
                                            value={passwordConfirmation}
                                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                                            className="auth-control shadow-none"
                                        />
                                        <Lock className="floating-icon" />
                                    </div>
                                </Form.Group>

                                {feedback && (
                                    <Alert variant={feedback.type === 'success' ? 'success' : 'danger'} className="mb-4 border-0 rounded-3 py-2 small">
                                        {feedback.message}
                                    </Alert>
                                )}

                                <Button variant="primary" size="lg" type="submit" disabled={isSubmitting} className="w-100 rounded-3 py-3 fw-bold shadow-sm mb-3">
                                    {isSubmitting ? (
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                    ) : (
                                        <>
                                            <CheckCircle className="me-2" size={18} />
                                            Réinitialiser le mot de passe
                                        </>
                                    )}
                                </Button>

                                <div className="text-center">
                                    <Link to="/login" className="text-muted small text-decoration-none">
                                        Retour à la connexion
                                    </Link>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordForm;
