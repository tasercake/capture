import React from 'react';
import { HashRouter as Router, Switch, Route } from 'react-router-dom';
import { Container, Row } from 'react-bootstrap';
import Navigation from './Navigation';
import routes from '../constants/routes.json';
import HomePage from './HomePage';
import CapturePage from './CapturePage';
import NotFoundPage from './NotFoundPage';

// Lazily load routes and code split with webpack
const LazyCounterPage = React.lazy(
  () => import(/* webpackChunkName: "CounterPage" */ './CounterPage')
);
const CounterPage = (props: Record<string, any>) => (
  <React.Suspense fallback={<h1>Loading...</h1>}>
    <LazyCounterPage {...props} />
  </React.Suspense>
);

export default function App() {
  return (
    <Container fluid>
      <Row>
        <Navigation />
      </Row>
      <Row>
        <Router>
          <Switch>
            <Route path={routes.COUNTER} component={CounterPage} />
            <Route path={routes.CAPTURE} component={CapturePage} />
            <Route exact path={routes.HOME} component={HomePage} />
            <Route component={NotFoundPage} />
          </Switch>
        </Router>
      </Row>
    </Container>
  );
}
