export interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  leftLineNum?: number;
  rightLineNum?: number;
  content: string;
}

export interface DiffSummary {
  diff: DiffLine[];
  additions: number;
  deletions: number;
  unchanged: number;
}

export function computeDiff(
  leftText: string,
  rightText: string,
  ignoreWhitespace: boolean = false
): DiffSummary {
  const leftLines = leftText.split('\n');
  const rightLines = rightText.split('\n');
  const diff: DiffLine[] = [];

  let i = 0;
  let j = 0;
  let leftNum = 1;
  let rightNum = 1;

  while (i < leftLines.length || j < rightLines.length) {
    const lStr = i < leftLines.length ? leftLines[i] : null;
    const rStr = j < rightLines.length ? rightLines[j] : null;

    const lNorm = lStr !== null ? (ignoreWhitespace ? lStr.trim() : lStr) : null;
    const rNorm = rStr !== null ? (ignoreWhitespace ? rStr.trim() : rStr) : null;

    if (lNorm === rNorm && lNorm !== null) {
      diff.push({
        type: 'unchanged',
        leftLineNum: leftNum++,
        rightLineNum: rightNum++,
        content: lStr!,
      });
      i++;
      j++;
    } else {
      const nextLInR =
        rNorm !== null
          ? leftLines.slice(i).findIndex((line) => (ignoreWhitespace ? line.trim() : line) === rNorm)
          : -1;
      const nextRInL =
        lNorm !== null
          ? rightLines.slice(j).findIndex((line) => (ignoreWhitespace ? line.trim() : line) === lNorm)
          : -1;

      if (nextLInR !== -1 && (nextRInL === -1 || nextLInR <= nextRInL)) {
        diff.push({
          type: 'removed',
          leftLineNum: leftNum++,
          content: lStr!,
        });
        i++;
      } else if (nextRInL !== -1) {
        diff.push({
          type: 'added',
          rightLineNum: rightNum++,
          content: rStr!,
        });
        j++;
      } else {
        if (lStr !== null) {
          diff.push({
            type: 'removed',
            leftLineNum: leftNum++,
            content: lStr,
          });
          i++;
        }
        if (rStr !== null) {
          diff.push({
            type: 'added',
            rightLineNum: rightNum++,
            content: rStr,
          });
          j++;
        }
      }
    }
  }

  const additions = diff.filter((l) => l.type === 'added').length;
  const deletions = diff.filter((l) => l.type === 'removed').length;
  const unchanged = diff.filter((l) => l.type === 'unchanged').length;

  return {
    diff,
    additions,
    deletions,
    unchanged,
  };
}

export function computeLineDiff(
  leftText: string,
  rightText: string,
  ignoreWhitespace: boolean = false
): DiffLine[] {
  return computeDiff(leftText, rightText, ignoreWhitespace).diff;
}
