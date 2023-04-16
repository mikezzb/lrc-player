export interface ILyric {
  time?: number;
  text: string;
}

export interface ILyricLine {
  time: number;
  words: ILyric[];
  length: number;
}

export type LrcLyrics = Readonly<{
  info: Map<string, string>;
  lines: ILyricLine[];
  words: ILyric[];
  numLines: number;
}>;

export type TrimOptios = Partial<{
  trimStart: boolean;
  trimEnd: boolean;
}>;

const tag2seconds = (tag: any) => {
  const mm = Number.parseInt(tag[1], 10);
  const ss = Number.parseFloat(tag[2].replace(":", "."));
  return mm * 60 + ss;
};

export function parse(lrcString: string, option: TrimOptios = {}): LrcLyrics {
  const { trimStart = false, trimEnd = false } = option;

  const lines = lrcString.split(/\r\n|\n|\r/u);

  const timeTag = /\[\s*(\d{1,3}):(\d{1,2}(?:[:.]\d{1,3})?)\s*]/g;
  const wordTag = /<(\d{1,3}):(\d{1,2}(?:[:.]\d{1,3})?)>\s*(\w+)/g;
  const infoTag = /\[\s*(\w{1,6})\s*:(.*?)]/;

  const info = new Map<string, string>();
  const lyric: ILyric[] = [];
  const lyricsLines: ILyricLine[] = [];

  for (const line of lines) {
    // eslint-disable-next-line @typescript-eslint/prefer-string-starts-ends-with
    if (line[0] !== "[") {
      lyric.push({
        text: line,
      });
      continue;
    }
    const words: ILyric[] = [];

    // now, line starts with "["
    timeTag.lastIndex = 0;
    const rTimeTag = timeTag.exec(line);
    if (rTimeTag !== null) {
      const text = line.slice(timeTag.lastIndex);
      let wordMatch;
      while ((wordMatch = wordTag.exec(text)) !== null) {
        words.push({
          time: tag2seconds(wordMatch),
          text: wordMatch[3]
        })
      }
      lyricsLines.push({
        time: tag2seconds(rTimeTag),
        words,
        length: words.length,
      })

      continue;
    }

    const rInfoTag = infoTag.exec(line);
    if (rInfoTag !== null) {
      const value = rInfoTag[2].trim();

      if (value === "") {
        continue;
      }

      info.set(rInfoTag[1], value);

      continue;
    }

    // if we reach here, it means this line starts with "[",
    // but not match time tag or info tag.

    lyric.push({
      text: line,
    });
  }

  if (trimStart && trimEnd) {
    lyric.forEach((line) => {
      line.text = line.text.trim();
    });
  } else if (trimStart) {
    lyric.forEach((line) => {
      line.text = line.text.trimStart();
    });
  } else if (trimEnd) {
    lyric.forEach((line) => {
      line.text = line.text.trimEnd();
    });
  }

  return { info, lines: lyricsLines, numLines: lyricsLines.length, words: lyricsLines.map(line => line.words).flat() };
}
