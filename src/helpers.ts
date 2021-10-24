const imgSrc = (src: string, type = "svg"): string =>
  new URL(`/src/assets/${src}.${type}`, import.meta.url).href;

function kCombinations(set: any[], k: number): any[][] {
  if (k > set.length || k <= 0) {
    return [];
  }
  if (k === set.length) {
    return [set];
  }
  const combs = [];
  if (k === 1) {
    for (let i = 0; i < set.length; i += 1) {
      combs.push([set[i]]);
    }
    return combs;
  }
  for (let i = 0; i < set.length - k + 1; i += 1) {
    const head = set.slice(i, i + 1);
    const tailcombs = kCombinations(set.slice(i + 1), k - 1);
    for (let j = 0; j < tailcombs.length; j += 1) {
      combs.push(head.concat(tailcombs[j]));
    }
  }
  return combs;
}

function shuffle(array: unknown[]): void {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

export { imgSrc, kCombinations, shuffle };
