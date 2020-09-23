import React, { Fragment, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ReactJson from 'react-json-view';
import Button from 'react-bootstrap/Button';
import { desktopCapturer, DesktopCapturerSource } from 'electron';
import routes from '../../constants/routes.json';

// function AudioDevice() {
//   return (
//
//   )
// }

const desktopSourceTypes: Record<string, string> = {
  screen: 'Screen',
  window: 'Window',
};
const deviceSourceTypes: Record<string, string> = {
  audioinput: 'Audio Input',
  audiooutput: 'Audio Output',
  videoinput: 'Video Input',
};

export default function Selector() {
  const [desktopSources, setDesktopSources] = useState<DesktopCapturerSource[]>(
    []
  );
  const [deviceSources, setDeviceSources] = useState<MediaDeviceInfo[]>([]);
  const [showDesktopSources, setShowDesktopSources] = useState(false);
  const [showDeviceSources, setShowDeviceSources] = useState(true);
  const [activeAudio, setActiveAudio] = useState('');

  useEffect(() => {
    const refreshVideoSources = () => {
      desktopCapturer
        .getSources({
          types: ['window', 'screen'],
          thumbnailSize: { height: 512, width: 512 },
        })
        .then(async (sources) => {
          sources = sources.sort((a, b) => {
            const nameA = a.name.toLowerCase();
            const nameB = b.name.toLowerCase();
            if (nameA < nameB) return -1;
            if (nameA > nameB) return 1;
            return 0;
          });
          setDesktopSources(sources);
        });
    };
    refreshVideoSources();
    const id = setInterval(refreshVideoSources, 1000);
    return () => {
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      console.log(devices);
      setDeviceSources(devices);
    });
  }, []);

  return (
    <div>
      <Link to={routes.HOME}>
        <h2>Home</h2>
      </Link>

      <Button onClick={() => setShowDesktopSources(!showDesktopSources)}>
        Toggle Video Sources
      </Button>
      <Button onClick={() => setShowDeviceSources(!showDeviceSources)}>
        Toggle Audio Sources
      </Button>
      {showDesktopSources && (
        <ul style={{ overflowY: 'scroll', height: '100%' }}>
          {desktopSources.map((source) => {
            return (
              <Fragment key={source.name}>
                <li>{source.name}</li>
                <img src={source.thumbnail.toDataURL()} />
              </Fragment>
            );
          })}
        </ul>
      )}
      {showDeviceSources && (
        <ul>
          {deviceSources.map((source) => {
            return (
              <Fragment key={source.deviceId + source.groupId}>
                <ReactJson
                  src={JSON.parse(JSON.stringify(source))}
                  theme="monokai"
                  name={source.label}
                  displayDataTypes={false}
                />
              </Fragment>
            );
          })}
        </ul>
      )}
    </div>
  );
}
