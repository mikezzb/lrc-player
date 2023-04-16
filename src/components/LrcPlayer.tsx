import { FC, RefObject, useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { useDropzone } from "react-dropzone";
import { LrcLyrics, parse } from "../lrcParser";

const Tips = styled.div`
  font-size: 1rem;
  line-height: 1.5;
`;

type LrcData = {
  audioUrl?: string;
  lrc?: LrcLyrics;
};

const LrcVisualizerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 80%;
  max-height: 500px;
  overflow-y: scroll;
  background-color: var(--surface);
  margin: 30px;
  padding: 20px;
  border-radius: 4px;
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
  ::-webkit-scrollbar {
    display: none;
  }
`;

type LrcVisualizerProps = {
  lrc: LrcLyrics;
  audioRef: RefObject<HTMLAudioElement>;
};

type LrcComponentProps = {
  altColor?: boolean;
};

const LrcLine = styled.div<LrcComponentProps>`
  display: flex;
  flex-direction: row;
  height: fit-content;
  align-items: start;
  color: ${(props) =>
    (props as any).altColor ? "white" : "rgba(231, 234, 246, 0.76)"};
  font-family: "Noto Sans JP", Arial;
  font-size: 30px;
  line-height: 1.8;
  letter-spacing: 0.009em;
`;

const LrcWord = styled.div<LrcComponentProps>`
  color: ${(props) => ((props as any).altColor ? "#ff0a85e8" : "")};
  margin-right: 6px;
  cursor: pointer;
`;

const withinRange = (words, currIdx, currentTime, nextWords) => {
  const nextWordTime =
    typeof words[currIdx + 1] === "undefined"
      ? nextWords
        ? nextWords[0].time
        : null
      : words[currIdx + 1].time;
  return (
    currentTime >= (words[currIdx].time || 0) &&
    (nextWordTime === null || currentTime < nextWordTime)
  );
};

const LrcVisualizer: FC<LrcVisualizerProps> = ({ lrc, audioRef }) => {
  const timeRef = useRef(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.ontimeupdate = () => {
        timeRef.current = audioRef.current?.currentTime || 0;
        setCurrentTime(audioRef.current?.currentTime || 0);
      };
    }
  }, [audioRef]);

  return (
    <LrcVisualizerContainer>
      {lrc.lines.map((line, lineIdx) => {
        const isLastLine = lineIdx === lrc.numLines - 1;
        return (
          <LrcLine
            key={`${line.time}_${lineIdx}`}
            altColor={withinRange(
              lrc.lines,
              lineIdx,
              currentTime,
              isLastLine ? null : lrc.lines[lineIdx + 1].words
            )}
          >
            {line.words.map((word, wordIdx) => (
              <LrcWord
                onClick={() => {
                  audioRef.current.currentTime = word.time;
                }}
                key={`${word.text}_${word.time}_${wordIdx}`}
                altColor={withinRange(
                  line.words,
                  wordIdx,
                  currentTime,
                  isLastLine ? null : lrc.lines[lineIdx + 1].words
                )}
              >
                {word.text}
              </LrcWord>
            ))}
          </LrcLine>
        );
      })}
    </LrcVisualizerContainer>
  );
};

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
  const { current: lrcData } = useRef<LrcData>({
    audioUrl: undefined,
    lrc: undefined,
  });
  const audioRef = useRef<HTMLAudioElement>(null);
  const [ready, setReady] = useState(false);
  const onDrop = useCallback((files: File[]) => {
    files.forEach((item) => {
      if (item.type.startsWith("audio/")) {
        const urlObj = URL.createObjectURL(item);
        lrcData.audioUrl = urlObj;
      } else if (item.name.endsWith(".lrc")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const raw = (event.target as any).result;
          lrcData.lrc = parse(raw);
          console.log(lrcData.lrc)
          if (lrcData.lrc && lrcData.audioUrl) {
            setReady(true);
          }
        };
        reader.readAsText(item);
      }
    });
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
  });
  return (
    <LrcPlayerContainer {...getRootProps()}>
      <input {...getInputProps()} />
      {ready ? (
        <LrcVisualizer lrc={lrcData.lrc as any} audioRef={audioRef} />
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
      {Boolean(lrcData.audioUrl) && (
        <audio ref={audioRef} controls src={lrcData.audioUrl} />
      )}
    </LrcPlayerContainer>
  );
};

export default LrcPlayer;
