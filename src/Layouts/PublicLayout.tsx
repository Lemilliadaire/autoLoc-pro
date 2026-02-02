import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Container, Button } from 'react-bootstrap';
import { ArrowLeft } from 'react-bootstrap-icons';

const PublicLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Ne pas afficher sur la page d'accueil
    const isHome = location.pathname === '/';

    if (isHome) return <Outlet />;

    return (
        <>
            <Container className="mt-4 mb-2">
                <Button
                    variant="light"
                    className="d-flex align-items-center text-muted px-0 border-0 bg-transparent"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft className="me-2" /> Retour
                </Button>
            </Container>
            <Outlet />
        </>
    );
};

export default PublicLayout;
