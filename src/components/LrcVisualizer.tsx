import { FC, RefObject, useEffect, useRef, MutableRefObject } from "react";
import styled from "styled-components";
import { LrcLyrics, LyricLine, LyricWord } from "../utils/lrcParser";

type LrcVisualizerProps = {
  lrc: LrcLyrics;
  audioRef: RefObject<HTMLAudioElement>;
  wordLevel?: boolean;
};

type LrcComponentProps = {
  altColor?: boolean;
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

const LrcLine = styled.div<LrcComponentProps>`
  &.active {
    color: white;
  }
  display: flex;
  flex-direction: row;
  height: fit-content;
  flex-wrap: wrap;
  justify-content: center;
  color: rgba(231, 234, 246, 0.46);
  font-family: "Noto Sans JP", Arial;
  font-size: 30px;
  line-height: 1.8;
  letter-spacing: 0.009em;
  -webkit-transition: color 200ms linear;
  -ms-transition: color 200ms linear;
  transition: color 200ms linear;
`;

const LrcWord = styled.div<LrcComponentProps>`
  &.active {
    color: #ff0a53e8;
  }
  margin-right: 6px;
  cursor: pointer;
  -webkit-transition: color 50ms linear;
  -ms-transition: color 50ms linear;
  transition: color 50ms linear;
`;

/**
 * Visualize word-level LRC lyrics
 */
const LrcVisualizer: FC<LrcVisualizerProps> = ({
  lrc,
  audioRef,
  wordLevel,
}) => {
  const lineRefs = useRef<HTMLDivElement[]>([]);
  const wordRefs = useRef<HTMLDivElement[]>([]);
  const highlightRefs = useRef<{
    line?: HTMLDivElement;
    word?: HTMLDivElement;
  }>({});
  // store start index of words for each line to speed up highlight word lookup
  const numWordsPresumRef = useRef<number[]>([]);

  useEffect(() => {
    const updateLines = () => {
      const currentTime = audioRef.current.currentTime;
      // highlight the line
      const lineIdx = searchTimeBefore(lrc.lines, currentTime);
      const line = lineRefs.current[lineIdx];
      if (!line) return;
      highlightDiv(line);
      if (!wordLevel) return;
      // highlight the word
      const wordIdx = searchTimeBefore(lrc.lines[lineIdx].words, currentTime);
      if (wordIdx === -1) return; // the first words is NOT started => shall NOT highlight
      const wordPresum = numWordsPresumRef.current[lineIdx];
      const word = wordRefs.current[wordPresum + wordIdx];
      highlightDiv(word, "word");
    };
    // compute word index presum for each line
    if (wordLevel) {
      numWordsPresumRef.current = [];
      const arr = numWordsPresumRef.current;
      arr.push(0); // arr[0] = 0
      for (let i = 1; i < lrc.lines.length; i++) {
        arr.push(arr[i - 1] + lrc.lines[i - 1].numWords);
      }
    }
    // add timeupdate event to highlight
    if (audioRef.current) {
      audioRef.current.addEventListener("timeupdate", updateLines);
    }
    return () => {
      audioRef.current?.removeEventListener("timeupdate", updateLines);
    };
  }, [audioRef, lrc, wordLevel]);

  /** Binary search to find the LAST element with start time <= time */
  const searchTimeBefore = (arr: LyricWord[] | LyricLine[], time: number) => {
    let left = 0,
      right = arr.length - 1;
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      if (arr[mid].time >= time) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    }
    return right;
  };

  const clearHighlight = (key) => {
    const el = highlightRefs[key];
    if (el) {
      el.className = el.className.slice(0, -7);
    }
  };

  const highlightDiv = (el: HTMLDivElement, key = "line") => {
    if (!el || highlightRefs[key] === el) return;
    clearHighlight(key);
    el.className += " active";
    highlightRefs[key] = el;
  };

  const pushToArr = (item: any, ref: MutableRefObject<any[]>, idx: number) => {
    if (idx === 0) {
      ref.current = [];
    }
    if (item && !ref.current.includes(item)) {
      ref.current.push(item);
    }
  };

  const setAudioTime = (time: number) => {
    audioRef.current.currentTime = time;
  };

  return (
    <LrcVisualizerContainer>
      {lrc.lines.map((line, lineIdx) => {
        return (
          <LrcLine
            key={`${line.time}_${lineIdx}`}
            ref={(el) => pushToArr(el, lineRefs, lineIdx)}
          >
            {line.words.map((word, wordIdx) => (
              <LrcWord
                onClick={() => setAudioTime(word.time)}
                key={`${word.text}_${word.time}_${wordIdx}`}
                ref={(el) => {
                  if (wordLevel) {
                    pushToArr(
                      el,
                      wordRefs,
                      numWordsPresumRef.current[lineIdx] + wordIdx
                    );
                  }
                }}
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

export default LrcVisualizer;
