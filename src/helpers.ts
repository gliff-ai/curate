import { Metadata, MetaItem } from "./interfaces";

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

function compare(
  a: string | Date | number = Number.MAX_VALUE,
  b: string | Date | number = Number.MAX_VALUE,
  ascendingOrder: boolean
): number {
  // compare two values of type string, Date or number.
  // defaults to Number.MAX_VALUE (useful for missing values)
  if (a < b) {
    return ascendingOrder ? -1 : 1;
  }
  if (a > b) {
    return ascendingOrder ? 1 : -1;
  }
  return 0;
}

function getKeyType(metadata: Metadata, key: string): string {
  if (key?.toLowerCase().includes("date")) return "date";
  for (const mitem of metadata) {
    const someType = typeof mitem[key];
    if (someType !== "undefined") {
      return someType;
    }
  }
  return "undefined";
}

function sortMetadata(
  metadata: Metadata,
  key: string,
  acendingOrder: boolean
): Metadata | null {
  const metaType = getKeyType(metadata, key);

  switch (metaType) {
    case "date":
      metadata.sort((a: MetaItem, b: MetaItem): number =>
        compare(
          new Date(a[key] as string),
          new Date(b[key] as string),
          acendingOrder
        )
      );
      return metadata;
    case "number":
      metadata.sort((a: MetaItem, b: MetaItem): number =>
        compare(a[key] as number, b[key] as number, acendingOrder)
      );
      return metadata;

    case "string":
      metadata.sort((a: MetaItem, b: MetaItem): number =>
        compare(
          (a[key] as string)?.toLowerCase(),
          (b[key] as string)?.toLowerCase(),
          acendingOrder
        )
      );
      return metadata;

    case "undefined":
      console.log(`No values set for metadata key "${key}".`);
      return null;

    default:
      console.log(`Cannot sort values with type "${metaType}".`);
      return null;
  }
}

export { kCombinations, shuffle, sortMetadata };
