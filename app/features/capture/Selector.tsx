import React, { useState, useEffect, useRef } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import Card from 'react-bootstrap/Card';
import { desktopCapturer, DesktopCapturerSource } from 'electron';

const desktopSourceTypes: Record<string, string> = {
  screen: 'Screen',
  window: 'Window',
};
const deviceSourceTypes: Record<string, string> = {
  audioinput: 'Audio Input',
  audiooutput: 'Audio Output',
  videoinput: 'Video Input',
};

function DesktopSourcePreview({source, onClick}: {source: DesktopCapturerSource, onClick: Function}) {
  return (
    <Card
      onClick={() => onClick()}
      className="user-select-none"
      style={{ cursor: 'pointer' }}
    >
      <Card.Img src={source.thumbnail.toDataURL()} />
      <Card.Header>{source.name}</Card.Header>
    </Card>
  )
}

function DeviceSourcePreview({source, onClick}: {source: MediaDeviceInfo, onClick: Function}) {
  return (
    <Card
      onClick={() => onClick(source)}
      className="user-select-none"
      style={{ cursor: 'pointer' }}
    >
      <Card.Body>
        <Card.Title>{source.label}</Card.Title>
      </Card.Body>
    </Card>
  )
}

export default function Selector() {
  // TODO: SPLIT DESKTOP AND DEVICE SOURCES INTO SEPARATE COMPONENTS
  const [desktopSources, setDesktopSources] = useState<
    Record<string, DesktopCapturerSource[]>
  >({});
  const [deviceSources, setDeviceSources] = useState<
    Record<string, MediaDeviceInfo[]>
  >({});
  const [activeSource, setActiveSource] = useState<MediaDeviceInfo | DesktopCapturerSource>();
  const [activeTab, setActiveTab] = useState<string | null>('desktop');
  const [stream, setStream] = useState<MediaStream>();

  const userMedia = useRef();

  const onSourceSelected = (source: MediaDeviceInfo | DesktopCapturerSource) => {
    setActiveSource(source)
  }

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({video: true, audio: true})
      .then((stream) => {
        setStream(stream);
        // console.log(userMedia.current.srcObject)
        if (userMedia.current) {
          userMedia.current.srcObject = stream;
          userMedia.current.onloadedmetadata = (e) => userMedia.current.play()
        }
      })
  }, [activeSource])

  const refreshDesktopSources = () => {
    const compareFn = (a: DesktopCapturerSource, b: DesktopCapturerSource) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    };

    return desktopCapturer
      .getSources({
        types: ['screen', 'window'],
        thumbnailSize: { height: 256, width: 256 },
      })
      .then((sources) => {
        const splitSources = sources
          .sort(compareFn)
          .reduce((acc: Record<string, DesktopCapturerSource[]>, cur) => {
            const key = cur.id.split(':')[0];
            return { ...acc, [key]: acc[key] ? acc[key].concat([cur]) : [cur] };
          }, {});
        setDesktopSources(splitSources);
        return splitSources;
      });
  };

  const refreshDeviceSources = () => {
    return navigator.mediaDevices.enumerateDevices().then((devices) => {
      const splitDevices = devices.reduce(
        (acc: Record<string, MediaDeviceInfo[]>, cur) => ({
          ...acc,
          [cur.kind]: acc[cur.kind] ? acc[cur.kind].concat([cur]) : [cur],
        }),
        {}
      );
      setDeviceSources(splitDevices);
      return splitDevices;
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
    <>
      {activeSource && (activeSource.name ? activeSource.name : activeSource.label)}
      {
        // <video ref={userMedia} autoPlay playsInline/>
        <video ref={userMedia} playsInline/>
      }

      {/* DON'T TOUCH BELOW */}
      <Tabs
        defaultActiveKey="desktop"
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        transition={false}
      >
        <Tab eventKey="desktop" title="Desktop Sources">
          {Object.keys(desktopSources).map((sourceType) => (
            <Container fluid className="" key={sourceType}>
              <Row className="m-0">
                <h3>{`${desktopSourceTypes[sourceType]} sources`}</h3>
              </Row>
              <Row className="my-3">
                {desktopSources[sourceType].map((source) => (
                  <Col
                    xs={12}
                    sm={6}
                    md={4}
                    lg={3}
                    key={source.id}
                  >
                    <DesktopSourcePreview source={source} onClick={() => onSourceSelected(source)} />
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
                    <DeviceSourcePreview source={source} onClick={() => onSourceSelected(source)}/>
                  </Col>
                ))}
              </Row>
            </Container>
          ))}
          <Button onClick={refreshDeviceSources}>Refresh</Button>
        </Tab>
      </Tabs>
    </>
  );
}
