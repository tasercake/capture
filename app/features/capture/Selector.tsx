import React, { useState, useEffect, useRef } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import {
  MediaPreview,
  deviceSourceTypes,
  DeviceSourcePreview,
} from './Previews';

export default function Selector() {
  const [sources, setSources] = useState<Record<string, MediaDeviceInfo[]>>({});
  const [activeSource, setActiveSource] = useState<MediaDeviceInfo | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const streamRef = useRef<MediaStream>();
  const userMedia = useRef<HTMLMediaElement>();

  const refreshSources = () => {
    return navigator.mediaDevices.enumerateDevices().then((devices) => {
      const splitDevices = devices.reduce(
        (acc: Record<string, MediaDeviceInfo[]>, cur) => ({
          ...acc,
          [cur.kind]: acc[cur.kind] ? acc[cur.kind].concat([cur]) : [cur],
        }),
        {}
      );
      setSources(splitDevices);
      return splitDevices;
    });
  };

  // Refresh deviceSources on load or when change in devices is detected
  useEffect(() => {
    refreshSources();
    navigator.mediaDevices.ondevicechange = refreshSources;
  }, []);

  // Fetch media stream and pass to media element
  useEffect(() => {
    if (activeSource) {
      const mediaConstraints: any = { audio: { deviceId: activeSource.deviceId }, video: false };
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

  return (
    <Container fluid>
      <Row>
        {
          Object.keys(sources)
          .filter((sourceType) => sourceType.startsWith("audio"))
          .map((sourceType) => (
            <Container fluid key={sourceType}>
              <Row>
                <h3>{`${deviceSourceTypes[sourceType]}s`}</h3>
              </Row>
              <Row className="my-3">
                {sources[sourceType].map((source) => (
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
                      onClick={() => setActiveSource(source)}
                    />
                  </Col>
                ))}
              </Row>
            </Container>
          ))}
        <Button onClick={refreshSources}>Refresh</Button>
      </Row>
      <Row>
        <MediaPreview stream={stream} playing />
      </Row>
    </Container>
  );
}
