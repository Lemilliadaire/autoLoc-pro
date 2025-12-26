// src/components/LoginForm.tsx
import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";
import { Container, Card, Form, Button, Alert, InputGroup } from "react-bootstrap";
import { Envelope, Lock, BoxArrowInRight } from "react-bootstrap-icons";

const LoginForm: React.FC = () => {
  const { loginUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);
    try {
      await loginUser(email, password);
    } catch (err) {
      console.error("Erreur de connexion :", err);
      setFeedback({
        type: "error",
        message: "Email ou mot de passe incorrect."
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
              <BoxArrowInRight size={24} />
            </div>
            <span className="fs-3 fw-bold tracking-tight">AutoLoc Pro</span>
          </Link>
          <h1 className="display-4 fw-bold mb-3">Rebonjour</h1>
          <p className="fs-5 text-white-50">L'aventure recommence ici. Connectez-vous pour continuer votre trajet.</p>
        </div>

        <div className="mt-auto">
          <div className="p-4 bg-white bg-opacity-10 rounded-4 backdrop-blur">
            <p className="mb-0 italic">"La location de véhicules n'a jamais été aussi fluide et élégante."</p>
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
                <h2 className="text-center fw-bold h3 mb-2">Connectez-vous</h2>
                <p className="text-muted">Entrez vos identifiants pour accéder à votre compte.</p>
              </div>

              <Form onSubmit={handleSubmit}>
                <Form.Group className="auth-input-group" controlId="email">
                  <Form.Label>Email</Form.Label>
                  <div className="position-relative">
                    <Form.Control
                      type="email"
                      placeholder="veillez entrer votre email"
                      required
                      autoFocus
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="auth-control shadow-none"
                    />
                    
                  </div>
                </Form.Group>

                <Form.Group className="auth-input-group" controlId="password">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <Form.Label className="mb-0">Mot de passe</Form.Label>
                  </div>
                  <div className="position-relative">
                    <Form.Control
                      type="password"
                      placeholder="veillez entrer votre mot de passe"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="auth-control shadow-none"
                    />
                    
                  </div>
                </Form.Group>

                {feedback && (
                  <Alert variant="danger" className="mb-4 border-0 rounded-3 py-2 small d-flex align-items-center">
                    <i className="bi bi-exclamation-circle me-2"></i>
                    {feedback.message}
                  </Alert>
                )}

                <Button variant="primary" size="lg" type="submit" disabled={isSubmitting} className="w-100 rounded-3 py-3 fw-bold shadow-sm mb-3">
                  {isSubmitting ? (
                    <span className="spinner-border spinner-border-sm me-2"></span>
                  ) : (
                    "Se connecter "
                  )}
                </Button>

                <p className="text-center text-muted mb-0 small">
                  Nouveau utilisateur ? <Link to="/register" className="fw-bold text-primary text-decoration-none">Créer un compte</Link>
                </p>
                 <div className="text-center text-muted mb-0 small">
                 <Link to="/forgot-password" className="text-primary small text-decoration-none fw-medium">Mot de passe oublié ?</Link>
                 </div>
              </Form>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
