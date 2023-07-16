export type LyricWord = {
  time: number;
  text: string;
};

export type LyricLine = {
  time: number;
  words: LyricWord[];
  numWords: number;
};

export type LrcLyrics = {
  lines: LyricLine[];
  numLines: number;
};

const tag2seconds = (tag: any) => {
  const mm = Number.parseInt(tag[1], 10);
  const ss = Number.parseFloat(tag[2].replace(":", "."));
  return mm * 60 + ss;
};

export const parse = (lrcString: string): LrcLyrics => {
  const lines = lrcString.split(/\r\n|\n|\r/u);

  const timeTag = /\[\s*(\d{1,3}):(\d{1,2}(?:[:.]\d{1,3})?)\s*]/g;
  const wordTag = /<(\d{1,3}):(\d{1,2}(?:[:.]\d{1,3})?)>\s*([a-zA-Z\u4e00-\u9fa5]+(?:-[a-zA-Z\u4e00-\u9fa5]+)*)/g;

  const lyricsLines: LyricLine[] = [];

  for (const line of lines) {
    if (line[0] !== "[") {
      continue;
    }
    const words: LyricWord[] = [];
    timeTag.lastIndex = 0;
    const rTimeTag = timeTag.exec(line);
    if (rTimeTag !== null) {
      const text = line.slice(timeTag.lastIndex);
      let wordMatch;
      while ((wordMatch = wordTag.exec(text)) !== null) {
        words.push({
          time: tag2seconds(wordMatch),
          text: wordMatch[3],
        });
      }
      lyricsLines.push({
        time: tag2seconds(rTimeTag),
        words,
        numWords: words.length,
      });

      continue;
    }
  }

  return {
    lines: lyricsLines,
    numLines: lyricsLines.length
  };
}
