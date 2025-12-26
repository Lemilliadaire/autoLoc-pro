// src/components/ForgotPasswordForm.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, Form, Button, Alert } from "react-bootstrap";
import { Envelope, ArrowLeft, Send } from "react-bootstrap-icons";
import { forgotPassword } from "../services/auth";

const ForgotPasswordForm: React.FC = () => {
    const [email, setEmail] = useState("");
    const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFeedback(null);
        try {
            const response = await forgotPassword(email);
            setFeedback({
                type: "success",
                message: response.message || "Un email de réinitialisation a été envoyé à votre adresse."
            });
            setEmail("");
        } catch (err: any) {
            console.error("Erreur de réinitialisation :", err);
            setFeedback({
                type: "error",
                message: err.response?.data?.message || "Une erreur est survenue. Veuillez réessayer."
            });
        } finally {
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
                            <Send size={24} />
                        </div>
                        <span className="fs-3 fw-bold tracking-tight">AutoLoc Pro</span>
                    </Link>
                    <h1 className="display-4 fw-bold mb-3">Mot de passe oublié ? 🔐</h1>
                    <p className="fs-5 text-white-50">Pas de souci ! Entrez votre email et nous vous enverrons un lien de réinitialisation.</p>
                </div>

                <div className="mt-auto">
                    <div className="p-4 bg-white bg-opacity-10 rounded-4 backdrop-blur">
                        <p className="mb-0 italic">"La sécurité de votre compte est notre priorité."</p>
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
                                <h2 className="fw-bold h3 mb-2">Réinitialiser le mot de passe</h2>
                                <p className="text-muted">Entrez votre adresse email pour recevoir un lien de réinitialisation.</p>
                            </div>

                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="auth-input-group" controlId="email">
                                    <Form.Label>Adresse Email</Form.Label>
                                    <div className="position-relative">
                                        <Form.Control
                                            type="email"
                                            placeholder="nom@exemple.com"
                                            required
                                            autoFocus
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="auth-control shadow-none"
                                        />
                                        <Envelope className="floating-icon" />
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
                                            <Send className="me-2" size={18} />
                                            Envoyer le lien
                                        </>
                                    )}
                                </Button>

                                <div className="text-center">
                                    <Link to="/login" className="text-muted small text-decoration-none d-inline-flex align-items-center gap-1">
                                        <ArrowLeft size={16} />
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

export default ForgotPasswordForm;
