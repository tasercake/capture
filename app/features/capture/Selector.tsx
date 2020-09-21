import React from 'react';
import { Link } from 'react-router-dom';
import routes from '../../constants/routes.json';
import { desktopCapturer } from 'electron';

export default function Selector() {
  desktopCapturer.getSources({ types: ['window', 'screen'] }).then(async sources => {
    console.log(sources)
  })
  return (
    <div data-tid="container">
      <Link to={routes.HOME}><h3>Home</h3></Link>
    </div>
  )
}
