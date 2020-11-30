import React, { useEffect, useRef } from 'react';
import Spinner from 'react-bootstrap/Spinner';
import Card from 'react-bootstrap/Card';

export const deviceSourceTypes: Record<string, string> = {
  audioinput: 'Audio Input',
  audiooutput: 'Audio Output',
  videoinput: 'Video Input',
};

export function DeviceSourcePreview({
                               source,
                               onClick,
                             }: {
  source: MediaDeviceInfo;
  onClick: Function;
}) {
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
  );
}

export function MediaPreview({
                                       stream,
                                       playing = false,
                                     }: {
  stream: MediaStream | null;
  playing?: boolean;
}) {
  const mediaElement = useRef<HTMLMediaElement>(null);
  useEffect(() => {
    if (mediaElement.current) {
      mediaElement.current.srcObject = stream;
    }
  }, [stream]);

  return stream ? (
    <audio ref={mediaElement} playsInline autoPlay={playing} controls/>
  ) : (
    <Spinner animation="border" />
  );
}
