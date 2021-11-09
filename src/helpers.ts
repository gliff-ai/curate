import { Metadata, MetaItem, Filter } from "@/interfaces";

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
  a: string | Date | number,
  b: string | Date | number,
  ascending: boolean
): number {
  // compare two values.
  // undefined values always at the end of the array.
  if (a === undefined) {
    return 1;
  }
  if (b === undefined) {
    return -1;
  }
  if (a < b) {
    return ascending ? -1 : 1;
  }
  if (a > b) {
    return ascending ? 1 : -1;
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
  acending = true
): Metadata | null {
  const metaType = getKeyType(metadata, key);

  function toDate(value: string): Date {
    return value !== undefined ? new Date(value) : undefined;
  }

  switch (metaType) {
    case "number":
      metadata.sort((a: MetaItem, b: MetaItem): number =>
        compare(a[key] as number, b[key] as number, acending)
      );
      return metadata;
    case "date":
      metadata.sort((a, b): number =>
        compare(toDate(a[key] as string), toDate(b[key] as string), acending)
      );
      return metadata;

    case "string":
      metadata.sort((a: MetaItem, b: MetaItem): number =>
        compare(a[key] as number, b[key] as number, acending)
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

function filterMetadata(metadata: Metadata, activeFilters: Filter[]): Metadata {
  if (activeFilters.length > 0) {
    metadata.forEach((mitem: MetaItem) => {
      activeFilters.forEach((filter, fi) => {
        const value = mitem[filter.key];

        // current filter selection
        const currentSel = Number(
          Array.isArray(value)
            ? value.some((v) => v.includes(filter.value))
            : String(value).includes(filter.value)
        );

        // selection for all filters up to current
        const prevSel = fi === 0 ? 1 : Number(mitem.selected);

        // update 'selected' field
        mitem.selected = Boolean(prevSel * currentSel);
      });
    });
  } else {
    // all items selected
    metadata.forEach((mitem: MetaItem) => {
      mitem.selected = true;
    });
  }
  return metadata;
}

export { kCombinations, shuffle, sortMetadata, filterMetadata };
