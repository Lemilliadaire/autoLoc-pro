// src/Components/AdminSidebar.tsx
import React from 'react';
import { Nav, Image } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
    Speedometer2,
    CarFrontFill,
    Building,
    CollectionFill,
    PeopleFill,
    CalendarCheck,
    PersonCircle
} from 'react-bootstrap-icons';
import './Sidebar.css';

const AdminSidebar: React.FC = () => {
    const { user } = useAuth();

    const getPhotoUrl = (photo: string | undefined) => {
        if (!photo) return null;
        if (photo.startsWith('http')) return photo;
        const cleanPath = photo.startsWith('/storage/') ? photo.substring(9) :
            photo.startsWith('storage/') ? photo.substring(8) : photo;
        return `http://127.0.0.1:8000/storage/${cleanPath}`;
    };

    return (
        <div className="sidebar-wrapper">
            <div className="sidebar-header p-3 mb-2">
                <h5 className="mb-0 text-primary fw-bold">Admin Panel</h5>
            </div>

            {user && (
                <div className="admin-profile-sidebar p-3 mb-3 border-bottom text-center">
                    <div className="position-relative d-inline-block mb-2">
                        {user.photo ? (
                            <Image
                                src={`${getPhotoUrl(user.photo)}?t=${new Date().getTime()}`}
                                roundedCircle
                                style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                className="border border-2 border-primary border-opacity-25"
                            />
                        ) : (
                            <PersonCircle size={60} className="text-secondary opacity-25" />
                        )}
                    </div>
                    <div className="fw-bold text-dark small">{user.name} {user.lastname}</div>
                    <span className="badge bg-danger bg-opacity-10 text-danger" style={{ fontSize: '0.7rem' }}>
                        Administrateur
                    </span>
                </div>
            )}

            <Nav className="flex-column">
                <Nav.Link as={NavLink} to="/admin" end className="sidebar-link">
                    <Speedometer2 className="me-2" />
                    Dashboard
                </Nav.Link>

                <Nav.Link as={NavLink} to="/admin/profile" className="sidebar-link">
                    <PersonCircle className="me-2" />
                    Mon Profil
                </Nav.Link>

                <h6 className="sidebar-heading">Gestion</h6>

                <Nav.Link as={NavLink} to="/admin/voitures" className="sidebar-link">
                    <CarFrontFill className="me-2" />
                    Voitures
                </Nav.Link>

                <Nav.Link as={NavLink} to="/admin/agences" className="sidebar-link">
                    <Building className="me-2" />
                    Agences
                </Nav.Link>

                <Nav.Link as={NavLink} to="/admin/categories" className="sidebar-link">
                    <CollectionFill className="me-2" />
                    Catégories
                </Nav.Link>

                <Nav.Link as={NavLink} to="/admin/clients" className="sidebar-link">
                    <PeopleFill className="me-2" />
                    Clients
                </Nav.Link>

                <Nav.Link as={NavLink} to="/admin/reservations" className="sidebar-link">
                    <CalendarCheck className="me-2" />
                    Réservations
                </Nav.Link>
            </Nav>
        </div>
    );
};

export default AdminSidebar;
