import { FC, useCallback, useRef, useState } from "react";
import styled from "styled-components";
import { useDropzone } from "react-dropzone";
import { LrcLyrics, parse } from "../utils/lrcParser";
import LrcVisualizer from "./LrcVisualizer";

const Tips = styled.div`
  font-size: 1rem;
  line-height: 1.5;
`;

const LrcPlayerContainer = styled.div`
  height: 100%;
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const LrcPlayer: FC = () => {
  const [lrc, setLrc] = useState<LrcLyrics>();
  const [audioUrl, setAudioUrl] = useState<string>();
  const audioRef = useRef<HTMLAudioElement>(null);
  const onDrop = useCallback((files: File[]) => {
    files.forEach((item) => {
      if (item.type.startsWith("audio/")) {
        const urlObj = URL.createObjectURL(item);
        setAudioUrl(urlObj);
      } else if (item.name.endsWith(".lrc")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const raw = (event.target as any).result;
          setLrc(parse(raw));
        };
        reader.readAsText(item);
      }
    });
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: Boolean(lrc && audioUrl),
    noKeyboard: Boolean(lrc && audioUrl)
  });
  return (
    <LrcPlayerContainer {...getRootProps()}>
      <input {...getInputProps()} />
      {Boolean(lrc && audioUrl) ? (
        <LrcVisualizer lrc={lrc} audioRef={audioRef} wordLevel />
      ) : (
        <Tips>
          <p>Tips:</p>
          <ol>
            <li>Drag n drop your lyrics (.lrc)</li>
            <li>Drag n drop your audio</li>
            <li>Play :)</li>
          </ol>
        </Tips>
      )}
      {Boolean(audioUrl) && (
        <audio
          ref={audioRef}
          controls
          src={audioUrl}
          autoPlay={Boolean(audioUrl && lrc)}
        />
      )}
    </LrcPlayerContainer>
  );
};

export default LrcPlayer;
