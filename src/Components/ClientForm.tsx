// src/Components/ClientForm.tsx
import React, { useState, useEffect } from "react";
import { createClient, updateClient } from "../services/client";
import { useAuth } from "../hooks/useAuth";
import { Form, Button, Row, Col, Alert, InputGroup, Container } from "react-bootstrap";
import {
  CardText,
  Calendar,
  Telephone,
  GeoAlt,
  CheckCircleFill,
  PersonBadge,
  ArrowRightShort,
  XCircle
} from "react-bootstrap-icons";
import type { Client } from "../types/api";

const ClientForm: React.FC<{
  token: string;
  onClientAdded?: () => void;
  initialData?: Client;
  onCancel?: () => void;
}> = ({ token, onClientAdded, initialData, onCancel }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    numero_permis: "",
    adresse: "",
    telephone: "",
    date_naissance: ""
  });

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        numero_permis: initialData.numero_permis || "",
        adresse: initialData.adresse || "",
        telephone: initialData.telephone || "",
        date_naissance: initialData.date_naissance || ""
      });
    }
  }, [initialData]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (feedback) setFeedback(null);
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    if (!user) {
      setFeedback({ type: 'error', message: "Session expirée. Veuillez vous reconnecter." });
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = { ...formData, user_id: user.id };
      let response;

      // Simulate network delay for better UX feel (optional, but makes it feel less "instant/static")
      await new Promise(r => setTimeout(r, 600));

      if (initialData) {
        response = await updateClient(initialData.id, payload, token);
        setFeedback({ type: 'success', message: "Profil mis à jour avec succès !" });
      } else {
        response = await createClient(payload, token);
        setFeedback({ type: 'success', message: "Félicitations ! Votre inscription est finalisée." });
      }

      setTimeout(() => {
        onClientAdded?.();
      }, 1500);

    } catch (err) {
      setFeedback({ type: 'error', message: "Une erreur est survenue lors de la sauvegarde." });
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="client-form-container">
      <Form onSubmit={handleSubmit} className="position-relative">

        {/* Progress Indicator (Visual flair) */}
        {!initialData && (
          <div className="mb-4">
            <div className="d-flex justify-content-between text-muted small mb-1">
              <span>Complétion du profil</span>
              <span>100%</span>
            </div>
            <div className="progress" style={{ height: '4px' }}>
              <div className="progress-bar bg-success" role="progressbar" style={{ width: '100%' }}></div>
            </div>
          </div>
        )}

        <Row className="g-4">
          <Col md={12}>
            <div className="form-floating-custom">
              <label className="form-label text-muted small fw-bold mb-1">
                <PersonBadge className="me-2" />Numéro de Permis
              </label>
              <Form.Control
                size="lg"
                type="text"
                value={formData.numero_permis}
                onChange={e => handleChange('numero_permis', e.target.value)}
                onBlur={() => handleBlur('numero_permis')}
                className="bg-light border-0 fw-bold"
                placeholder="Ex: 123456789"
                required
              />
            </div>
          </Col>

          <Col md={6}>
            <div className="form-floating-custom">
              <label className="form-label text-muted small fw-bold mb-1">
                <Calendar className="me-2" />Date de Naissance
              </label>
              <Form.Control
                size="lg"
                type="date"
                value={formData.date_naissance}
                onChange={e => handleChange('date_naissance', e.target.value)}
                className="bg-light border-0"
                required
              />
            </div>
          </Col>

          <Col md={6}>
            <div className="form-floating-custom">
              <label className="form-label text-muted small fw-bold mb-1">
                <Telephone className="me-2" />Téléphone Mobile
              </label>
              <Form.Control
                size="lg"
                type="tel"
                value={formData.telephone}
                onChange={e => handleChange('telephone', e.target.value)}
                className="bg-light border-0"
                placeholder="+33 6 ..."
                required
              />
            </div>
          </Col>

          <Col md={12}>
            <div className="form-floating-custom">
              <label className="form-label text-muted small fw-bold mb-1">
                <GeoAlt className="me-2" />Adresse Postale
              </label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.adresse}
                onChange={e => handleChange('adresse', e.target.value)}
                className="bg-light border-0"
                placeholder="Votre adresse complète..."
                required
                style={{ resize: 'none' }}
              />
            </div>
          </Col>
        </Row>

        {/* Feedback Overlay */}
        {feedback && (
          <div className={`mt-4 p-3 rounded-3 d-flex align-items-center ${feedback.type === 'success' ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'}`}>
            {feedback.type === 'success' ? <CheckCircleFill className="me-3 fs-4" /> : <XCircle className="me-3 fs-4" />}
            <span className="fw-medium">{feedback.message}</span>
          </div>
        )}

        <div className="d-flex align-items-center justify-content-end gap-3 mt-5 pt-3 border-top">
          {onCancel && (
            <Button
              variant="link"
              className="text-decoration-none text-muted"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
          )}
          <Button
            type="submit"
            variant={initialData ? "primary" : "success"}
            size="lg"
            className="px-5 rounded-pill fw-bold shadow-sm d-flex align-items-center"
            disabled={isSubmitting || (feedback?.type === 'success')} // Disable if success to prevent double submit during timeout
          >
            {isSubmitting ? (
              'Enregistrement...'
            ) : (
              <>
                {initialData ? 'Sauvegarder' : 'Finaliser'}
                {!initialData && <ArrowRightShort className="ms-2 fs-4" />}
              </>
            )}
          </Button>
        </div>
      </Form>

      <style>{`
        .form-floating-custom .form-control:focus {
            background-color: #fff !important;
            box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
        }
        .form-floating-custom {
            transition: transform 0.2s;
        }
        .form-floating-custom:focus-within {
            transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
};

export default ClientForm;
