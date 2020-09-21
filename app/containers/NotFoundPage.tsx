import React from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';

export default function NotFoundPage() {
  return (
    <div>
      <h1>404 - Not Found</h1>
      <Link to={routes.HOME}><h2>Go Home</h2></Link>
    </div>
  );
}
