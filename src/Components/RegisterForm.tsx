// src/components/RegisterForm.tsx
import React, { useState } from "react";
import { register } from "../services/auth";
import { Link, useNavigate } from "react-router-dom";
import { Card, Form, Button, Alert, Row, Col } from "react-bootstrap";
import { PersonPlus, Eye, EyeSlash } from "react-bootstrap-icons";
import { isAxiosError } from "axios";

const RegisterForm: React.FC = () => {
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password_confirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!acceptTerms) {
      setFeedback({ type: "error", message: "Vous devez accepter la politique d'utilisation pour vous inscrire." });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);
    try {
      await register(name, lastname, "", email, password, password_confirm);
      setFeedback({ type: "success", message: "Inscription réussie ! Redirection..." });
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      let errorMessage = "Erreur lors de l'inscription.";
      if (isAxiosError(error) && error.response?.status === 422) {
        const validationErrors = error.response.data.errors;
        if (validationErrors) {
          const firstErrorKey = Object.keys(validationErrors)[0];
          errorMessage = validationErrors[firstErrorKey][0];
        }
      }
      setFeedback({ type: "error", message: errorMessage });
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
              <PersonPlus size={24} />
            </div>
            <span className="fs-3 fw-bold tracking-tight">AutoLoc Pro</span>
          </Link>
          <h1 className="display-4 fw-bold mb-3">Rejoignez-nous</h1>
          <p className="fs-5 text-white-50">Créez votre compte en quelques secondes et accédez à une flotte d'exception.</p>
        </div>

        <div className="mt-auto">
          <div className="p-4 bg-white bg-opacity-10 rounded-4 backdrop-blur">
            <p className="mb-0 italic">"Une expérience de location moderne pensée pour votre confort et votre sécurité."</p>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="auth-form-section">
        <div style={{ maxWidth: '600px', width: '100%' }}>
          <div className="mb-4 text-center d-lg-none">
            <h2 className="fw-bold text-primary">AutoLoc Pro</h2>
          </div>

          <Card className="glass-card border-0 rounded-4 overflow-hidden">
            <Card.Body className="p-4 p-md-5">
              <div className="mb-4">
                <h2 className="text-center fw-bold h3 mb-2">Inscrivez-vous</h2>
                <p className="text-muted">Remplissez les informations ci-dessous pour commencer.</p>
              </div>

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="auth-input-group" controlId="name">
                      <Form.Label>Nom</Form.Label>
                      <div className="position-relative">
                        <Form.Control
                          type="text"
                          placeholder="Veillez entrer votre nom"
                          required
                          autoFocus
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="auth-control shadow-none"
                        />

                      </div>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="auth-input-group" controlId="lastname">
                      <Form.Label>Prénom</Form.Label>
                      <div className="position-relative">
                        <Form.Control
                          type="text"
                          placeholder="Veillez entrer votre prénom"
                          required
                          value={lastname}
                          onChange={(e) => setLastname(e.target.value)}
                          className="auth-control shadow-none"
                        />

                      </div>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <Form.Group className="auth-input-group" controlId="email">
                      <Form.Label>Email</Form.Label>
                      <div className="position-relative">
                        <Form.Control
                          type="email"
                          placeholder="veillez entrer un email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="auth-control shadow-none"
                        />

                      </div>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="auth-input-group" controlId="password">
                      <Form.Label>Mot de passe</Form.Label>
                      <div className="position-relative">
                        <Form.Control
                          type={showPassword ? "text" : "password"}
                          placeholder="veillez entrer un mot de passe"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="auth-control shadow-none pe-5"
                        />
                        <Button
                          variant="link"
                          className="position-absolute end-0 top-50 translate-middle-y text-muted border-0 bg-transparent"
                          style={{ zIndex: 10 }}
                          onClick={() => setShowPassword(!showPassword)}
                          type="button"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                        </Button>
                      </div>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="auth-input-group" controlId="password_confirm">
                      <Form.Label>Confirmation</Form.Label>
                      <div className="position-relative">
                        <Form.Control
                          type={showPasswordConfirm ? "text" : "password"}
                          placeholder="veillez confirmer votre mot de passe"
                          required
                          value={password_confirm}
                          onChange={(e) => setPasswordConfirm(e.target.value)}
                          className="auth-control shadow-none pe-5"
                        />
                        <Button
                          variant="link"
                          className="position-absolute end-0 top-50 translate-middle-y text-muted border-0 bg-transparent"
                          style={{ zIndex: 10 }}
                          onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                          type="button"
                          tabIndex={-1}
                        >
                          {showPasswordConfirm ? <EyeSlash size={18} /> : <Eye size={18} />}
                        </Button>
                      </div>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-4" controlId="terms">
                  <Form.Check
                    type="checkbox"
                    label={
                      <span>
                        J'accepte la <Link to="/politique-utilisation" className="text-primary text-decoration-none">politique d'utilisation</Link>
                      </span>
                    }
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    required
                    className="text-muted"
                  />
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
                    "Créer mon compte"
                  )}
                </Button>

                <p className="text-center text-muted mb-0 small">
                  Déjà inscrit ? <Link to="/login" className="fw-bold text-primary text-decoration-none">Se connecter</Link>
                </p>
              </Form>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
