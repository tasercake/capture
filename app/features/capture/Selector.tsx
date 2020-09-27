import React, { useState, useEffect, useRef } from 'react';
import { desktopCapturer, DesktopCapturerSource } from 'electron';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import { MediaPreview, deviceSourceTypes, desktopSourceTypes, DeviceSourcePreview, DesktopSourcePreview} from './Previews';

export default function Selector() {
  const [desktopSources, setDesktopSources] = useState<
    Record<string, DesktopCapturerSource[]>
  >({});
  const [deviceSources, setDeviceSources] = useState<
    Record<string, MediaDeviceInfo[]>
  >({});
  const [activeSource, setActiveSource] = useState<
    MediaDeviceInfo | DesktopCapturerSource | null
  >(null);
  const [activeTab, setActiveTab] = useState<string | null>('desktop');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const streamRef = useRef<MediaStream>();
  const userMedia = useRef<HTMLMediaElement>();

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
  const sourceRefreshers: Record<string, Function> = {
    desktop: refreshDesktopSources,
    device: refreshDeviceSources,
  };

  const onSourceSelected = (
    source: MediaDeviceInfo | DesktopCapturerSource
  ) => {
    setActiveSource(source);
  };

  // Fetch media stream and pass to media element
  useEffect(() => {
    if (activeSource) {
      const mediaConstraints: any = { audio: false, video: false };
      if (activeSource instanceof MediaDeviceInfo) {
        if (activeSource.kind === 'videoinput') {
          mediaConstraints.video = { deviceId: activeSource.deviceId }
        }
        if (activeSource.kind.startsWith('audio')) {
          mediaConstraints.audio = { deviceId: activeSource.deviceId}
        }
      } else {
        mediaConstraints.audio = false;
        mediaConstraints.video = {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: activeSource.id,
            maxWidth: 1280,
            minFrameRate: 60,
          },
        }
      }
      navigator.mediaDevices
        .getUserMedia(mediaConstraints)
        .then((s) => {
          setStream(s);
          if (userMedia.current) {
            userMedia.current.srcObject = s;
          }
        });
    }
    return () => {
      streamRef.current?.getTracks().forEach((track) => {
        track.stop();
      });
    };
  }, [activeSource]);

  // Maintain stream ref
  useEffect(() => {
    if (stream) {
      streamRef.current = stream;
    }
  }, [stream]);

  // Refresh media sources on tab change
  useEffect(() => {
    if (activeTab) {
      const refreshSource = sourceRefreshers[activeTab];
      if (refreshSource) {
        refreshSource();
      } else {
        console.error(
          `No source refresher function found for tab ${activeTab}`
        );
      }
    }
  }, [activeTab]);

  return (
    <Container fluid>
      <Row>
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
                    <Col xs={12} sm={6} md={4} lg={3} key={source.id}>
                      <DesktopSourcePreview
                        source={source}
                        onClick={() => onSourceSelected(source)}
                      />
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
                      <DeviceSourcePreview
                        source={source}
                        onClick={() => onSourceSelected(source)}
                      />
                    </Col>
                  ))}
                </Row>
              </Container>
            ))}
            <Button onClick={refreshDeviceSources}>Refresh</Button>
          </Tab>
        </Tabs>
      </Row>
      <Row>
        <MediaPreview stream={stream} playing />
      </Row>
    </Container>
  );
}
