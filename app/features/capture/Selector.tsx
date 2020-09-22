import React, { Fragment, useState, useEffect, useRef} from 'react';
import { Link } from 'react-router-dom';
import routes from '../../constants/routes.json';
import { desktopCapturer } from 'electron';

export default function Selector() {
  const [videoSources, setVideoSources] = useState([])

  useEffect(() => {
    const refreshVideoSources = () => {
      desktopCapturer.getSources({ types: ['window', 'screen'] }).then(
        async sources => {
          // await new Promise(r => setTimeout(r, 5000))
          sources = sources.sort((a, b) => {
            let nameA = a.name.toLowerCase()
            let nameB = b.name.toLowerCase()
            if (nameA < nameB) return -1
            if (nameA > nameB) return 1
            return 0
          })
          setVideoSources(sources)
        }
      )
    }
    refreshVideoSources()
    const id = setInterval(refreshVideoSources, 1000)
    return () => {
      clearInterval(id)
    }
  }, [])

  return (
    <div>
      <Link to={routes.HOME}><h3>Home</h3></Link>
      <ul>
        {
          videoSources.map(source => {
            return (
              <Fragment key={source.name}>
                <li>{source.name}</li>
                <img src={source.thumbnail.toDataURL()}/>
              </Fragment>
            )
          })
        }
      </ul>
    </div>
  )
}
