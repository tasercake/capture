import React, { CSSProperties, useEffect, useRef } from 'react';
import Spinner from 'react-bootstrap/Spinner';
import { DesktopCapturerSource } from "electron";
import Card from 'react-bootstrap/Card';

export const desktopSourceTypes: Record<string, string> = {
  screen: 'Screen',
  window: 'Window',
};
export const deviceSourceTypes: Record<string, string> = {
  audioinput: 'Audio Input',
  audiooutput: 'Audio Output',
  videoinput: 'Video Input',
};

export function DesktopSourcePreview({
                                source,
                                onClick,
                              }: {
  source: DesktopCapturerSource;
  onClick: Function;
}) {
  return (
    <Card
      onClick={() => onClick()}
      className="user-select-none"
      style={{ cursor: 'pointer' }}
    >
      <Card.Img src={source.thumbnail.toDataURL()} />
      <Card.Header>{source.name}</Card.Header>
    </Card>
  );
}

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

  const videoStyle: CSSProperties = {
    minWidth: '100%',
    maxWidth: '100%',
    maxHeight: '100%',
  };

  return stream ? (
    stream.getVideoTracks().length > 0 ? (
      <video
        ref={mediaElement}
        style={videoStyle}
        playsInline
        autoPlay={playing}
      />
    ) : (
      <audio ref={mediaElement} playsInline autoPlay={playing} controls/>
    )
  ) : (
    <Spinner animation="border" />
  );
}
