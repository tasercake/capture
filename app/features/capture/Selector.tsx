import React, { Fragment, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ReactJson from 'react-json-view';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Button from 'react-bootstrap/Button';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import CardGroup from 'react-bootstrap/CardGroup';
import CardColumns from 'react-bootstrap/CardColumns';
import CardDeck from 'react-bootstrap/CardDeck';
import Card from 'react-bootstrap/Card';
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
  // TODO: SPLIT DESKTOP AND DEVICE SOURCES INTO SEPARATE COMPONENTS
  const [desktopSources, setDesktopSources] = useState<
    Record<string, DesktopCapturerSource[]>
  >({});
  const [deviceSources, setDeviceSources] = useState<
    Record<string, MediaDeviceInfo[]>
  >({});
  const [activeTab, setActiveTab] = useState<string | null>('desktop');

  const refreshDesktopSources = () => {
    const compareFn = (a: DesktopCapturerSource, b: DesktopCapturerSource) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    };

    desktopCapturer
      .getSources({
        types: ['screen', 'window'],
        thumbnailSize: { height: 256, width: 256 },
      })
      .then((sources) => {
        sources = sources.sort(compareFn);
        const splitSources = sources.reduce(
          (acc: Record<string, DesktopCapturerSource[]>, cur) => {
            const key = cur.id.split(':')[0];
            return { ...acc, [key]: acc[key] ? acc[key].concat([cur]) : [cur] };
          },
          {}
        );
        setDesktopSources(splitSources);
      });
  };

  const refreshDeviceSources = () => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const splitDevices = devices.reduce(
        (acc: Record<string, MediaDeviceInfo[]>, cur) => ({
          ...acc,
          [cur.kind]: acc[cur.kind] ? acc[cur.kind].concat([cur]) : [cur],
        }),
        {}
      );
      setDeviceSources(splitDevices);
    });
  };

  useEffect(() => {
    if (activeTab === 'desktop') {
      refreshDesktopSources();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'device') {
      refreshDeviceSources();
    }
  }, [activeTab]);

  return (
    <div>
      <Tabs
        defaultActiveKey="desktop"
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        transition={false}
      >
        <Tab eventKey="desktop" title="Desktop Sources">
          {Object.keys(desktopSources).map((sourceType) => (
            <Container fluid key={sourceType}>
              <Row>
                <h3>{`${desktopSourceTypes[sourceType]} sources`}</h3>
              </Row>
              <Row className="my-3">
                {desktopSources[sourceType].map((source) => (
                  <Col
                    xs={12}
                    sm={6}
                    md={4}
                    lg={3}
                    className="my-3"
                    key={source.id}
                  >
                    <Card
                      className="user-select-none"
                      style={{ cursor: 'pointer' }}
                    >
                      <Card.Img src={source.thumbnail.toDataURL()} />
                      <Card.Header>{source.name}</Card.Header>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Container>
          ))}
          <Button onClick={refreshDesktopSources}>Refresh</Button>
        </Tab>
        <Tab eventKey="device" title="Device Sources">
          {Object.keys(deviceSources).map((sourceType) => (
            <Container fluid key={sourceType}>
              <Row>
                <h3>{`${deviceSourceTypes[sourceType]}s`}</h3>
              </Row>
              <Row className="my-3">
                {deviceSources[sourceType].map((source) => (
                  <Col
                    xs={12}
                    sm={6}
                    md={4}
                    lg={3}
                    className="my-3"
                    key={source.deviceId}
                  >
                    <Card
                      className="user-select-none"
                      style={{ cursor: 'pointer' }}
                    >
                      <Card.Body>
                        <Card.Title>{source.label}</Card.Title>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Container>
          ))}
          <Button onClick={refreshDeviceSources}>Refresh</Button>
        </Tab>
      </Tabs>
    </div>
  );
}
