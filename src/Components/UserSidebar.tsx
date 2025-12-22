// src/Components/UserSidebar.tsx
import React from 'react';
import { Nav } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import {
    Speedometer2,
    JournalCheck,
    PencilSquare,
    CarFront,
    GeoAlt,
    CollectionFill
} from 'react-bootstrap-icons';
import './Sidebar.css';

const UserSidebar: React.FC = () => {
    return (
        <div className="sidebar-wrapper">
            <div className="sidebar-header p-3 mb-3">
                <h5 className="mb-0 text-primary fw-bold">Mon Espace</h5>
            </div>

            <Nav className="flex-column">
                <Nav.Link as={NavLink} to="/dashboard" end className="sidebar-link">
                    <Speedometer2 className="me-2" />
                    Dashboard
                </Nav.Link>

                <h6 className="sidebar-heading">Navigation</h6>

                <Nav.Link as={NavLink} to="/mes-reservations" className="sidebar-link">
                    <JournalCheck className="me-2" />
                    Mes Réservations
                </Nav.Link>

                <Nav.Link as={NavLink} to="/profil" className="sidebar-link">
                    <PencilSquare className="me-2" />
                    Mon Profil
                </Nav.Link>

                <h6 className="sidebar-heading">Explorer</h6>

                <Nav.Link as={NavLink} to="/voitures-public" className="sidebar-link">
                    <CarFront className="me-2" />
                    Voitures
                </Nav.Link>

                <Nav.Link as={NavLink} to="/agences-public" className="sidebar-link">
                    <GeoAlt className="me-2" />
                    Agences
                </Nav.Link>

                <Nav.Link as={NavLink} to="/categories-public" className="sidebar-link">
                    <CollectionFill className="me-2" />
                    Catégories
                </Nav.Link>
            </Nav>
        </div>
    );
};

export default UserSidebar;
