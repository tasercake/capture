import React, { Fragment, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import routes from '../constants/routes.json';

export default function Navigation() {
  return (
    <Navbar variant="dark" bg="info" expand="lg" sticky="top">
      <Navbar.Brand>CapCast</Navbar.Brand>
      <Navbar.Toggle aria-controls="navbar-nav" />
      <Navbar.Collapse id="navbar-nav">
        <Nav>
          <Nav.Link as={Link} to={routes.HOME}>Home</Nav.Link>
          <Nav.Link as={Link} to={routes.COUNTER}>Counter</Nav.Link>
          <Nav.Link as={Link} to={routes.CAPTURE}>Capture</Nav.Link>
          <Nav.Link as={Link} to="/broken-link">Broken</Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  )
}
