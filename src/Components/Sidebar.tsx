// src/Components/Admin/Sidebar.tsx
import React from 'react';
import { Nav } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { Speedometer2, CarFrontFill, Building, CollectionFill, PeopleFill } from 'react-bootstrap-icons';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  return (
    <div className="sidebar-wrapper">
      <Nav className="flex-column">
        <Nav.Link as={NavLink} to="/admin" end className="sidebar-link">
          <Speedometer2 className="me-2" />
          Dashboard
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
      </Nav>
    </div>
  );
};

export default Sidebar;