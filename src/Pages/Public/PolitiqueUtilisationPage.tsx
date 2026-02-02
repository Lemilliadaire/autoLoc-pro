import React, { useEffect } from 'react';
import { Container, Card } from 'react-bootstrap';
import { FileText } from 'react-bootstrap-icons';

const PolitiqueUtilisationPage: React.FC = () => {

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="py-5 bg-light min-vh-100">
            <Container>
                {/* Header Section */}
                <div className="text-center mb-5">
                    <div className="d-inline-flex align-items-center justify-content-center bg-white p-3 rounded-circle shadow-sm mb-4 text-primary">
                        <FileText size={40} />
                    </div>
                    <h1 className="fw-bold mb-3">Politique d'Utilisation</h1>
                    <p className="text-muted lead mx-auto" style={{ maxWidth: '700px' }}>
                        Bienvenue sur AutoLoc Pro. Veuillez lire attentivement ces conditions avant d'utiliser nos services.
                    </p>
                </div>

                <div className="row g-4 justify-content-center">
                    <div className="col-lg-10">
                        <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                            <Card.Body className="p-4 p-md-5">
                                <section className="mb-5">
                                    <h2 className="h4 fw-bold mb-3 d-flex align-items-center gap-2">
                                        <span className="text-primary">1.</span> Introduction
                                    </h2>
                                    <p className="text-secondary">
                                        Les présentes Conditions Générales d'Utilisation (ci-après "CGU") régissent l'utilisation de la plateforme AutoLoc Pro. En accédant à notre site et en utilisant nos services, vous acceptez sans réserve les présentes conditions. Si vous n'acceptez pas ces termes, veuillez ne pas utiliser nos services.
                                    </p>
                                </section>

                                <section className="mb-5">
                                    <h2 className="h4 fw-bold mb-3 d-flex align-items-center gap-2">
                                        <span className="text-primary">2.</span> Accès au Service
                                    </h2>
                                    <p className="text-secondary mb-3">
                                        L'accès à AutoLoc Pro est réservé aux personnes majeures et capables juridiquement. L'utilisateur s'engage à fournir des informations exactes lors de son inscription et à les maintenir à jour.
                                    </p>
                                    <ul className="text-secondary">
                                        <li className="mb-2">Le service est accessible 24h/24 et 7j/7, sauf en cas de maintenance ou de force majeure.</li>
                                        <li className="mb-2">Nous nous réservons le droit de suspendre ou de limiter l'accès à tout moment sans préavis.</li>
                                    </ul>
                                </section>

                                <section className="mb-5">
                                    <h2 className="h4 fw-bold mb-3 d-flex align-items-center gap-2">
                                        <span className="text-primary">3.</span> Compte Utilisateur
                                    </h2>
                                    <p className="text-secondary">
                                        L'utilisateur est responsable de la confidentialité de ses identifiants de connexion. Toute action effectuée depuis son compte est réputée avoir été effectuée par lui. En cas d'utilisation frauduleuse, l'utilisateur doit nous en informer immédiatement.
                                    </p>
                                </section>

                                <section className="mb-5">
                                    <h2 className="h4 fw-bold mb-3 d-flex align-items-center gap-2">
                                        <span className="text-primary">4.</span> Responsabilités
                                    </h2>
                                    <p className="text-secondary mb-3">
                                        <strong>Responsabilité de l'utilisateur :</strong> L'utilisateur s'engage à utiliser le service conformément aux lois en vigueur et à ne pas porter atteinte aux droits de tiers ou à l'intégrité de la plateforme.
                                    </p>
                                    <p className="text-secondary">
                                        <strong>Responsabilité de AutoLoc Pro :</strong> Nous mettons tout en œuvre pour assurer la fiabilité des informations, mais nous ne pouvons garantir l'absence d'erreurs ou d'interruptions du service.
                                    </p>
                                </section>

                                <section className="mb-0">
                                    <h2 className="h4 fw-bold mb-3 d-flex align-items-center gap-2">
                                        <span className="text-primary">5.</span> Propriété Intellectuelle
                                    </h2>
                                    <p className="text-secondary">
                                        Tous les éléments présents sur le site (textes, images, logos, code) sont protégés par le droit de la propriété intellectuelle. Toute reproduction ou utilisation non autorisée est strictement interdite.
                                    </p>
                                </section>
                            </Card.Body>
                        </Card>

                        <p className="text-center text-muted small">
                            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
                        </p>
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default PolitiqueUtilisationPage;
