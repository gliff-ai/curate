function kCombinations(set: unknown[], k: number): unknown[][] {
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
const makeThumbnail = (image: Array<Array<ImageBitmap>>): string => {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const imageWidth = image[0][0].width;
  const imageHeight = image[0][0].height;
  const ratio = Math.min(
    canvas.width / imageWidth,
    canvas.height / imageHeight
  );
  const ctx = canvas.getContext("2d");
  ctx.globalCompositeOperation = "lighter";
  image[0].forEach((channel) => {
    ctx.drawImage(
      channel,
      0,
      0,
      imageWidth,
      imageHeight,
      (canvas.width - imageWidth * ratio) / 2,
      (canvas.height - imageHeight * ratio) / 2,
      imageWidth * ratio,
      imageHeight * ratio
    );
  });
  return canvas.toDataURL();
};

const getMonthAndYear = (date: string): string =>
  date !== undefined
    ? new Date(date).toLocaleDateString("en-GB", {
        month: "short",
        year: "numeric",
      })
    : "";

export { kCombinations, shuffle, makeThumbnail, getMonthAndYear };
