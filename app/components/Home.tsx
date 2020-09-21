import React from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
import styles from './Home.css';

export default function Home(): JSX.Element {
  return (
    <div className={styles.container} data-tid="container">
      <Link to={routes.HOME}><h3>Home</h3></Link>
      <Link to={routes.COUNTER}><h3>Counter</h3></Link>
      <Link to={routes.CAPTURE}><h3>Select Sharing Source</h3></Link>
      <Link to="/broken-link"><h3>Test Broken Link</h3></Link>
    </div>
  );
}
