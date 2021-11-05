import { Metadata } from "./interfaces";
import { sortMetadata } from "./helpers";

const metadata: Metadata = [
  { string: "through", date: "01-26-1920", number: 12 },
  { string: "soil", date: "02-15-2001" },
  { date: "02-26-2001", number: 4.3 },
  { string: "science", date: "08-12-2030", number: 0.5 },
  { string: "perhaps", number: -1 },
];

// data type | expected result: metadata values in ascending order
const testValues: [string, any[]][] = [
  ["number", [-1, 0.5, 4.3, 12]],
  ["string", ["perhaps", "science", "soil", "through"]],
  ["date", ["01-26-1920", "02-15-2001", "02-26-2001", "08-12-2030"]],
];

function cloneMetadata() {
  return metadata.map((mitem) => ({ ...mitem }));
}

describe("sort metadata with missing values", () => {
  test.each(testValues)(
    `sort values of type %s`,
    (key: string, output: any[]) => {
      const metadataAsc = sortMetadata(cloneMetadata(), key);
      const metadataDes = sortMetadata(cloneMetadata(), key, false);
      const arrayUndefined = Array.of(
        metadata.filter((mitem) => key in Object.keys(mitem)).length
      ).fill(undefined);

      expect(metadataAsc.map((mitem) => mitem[key])).toEqual(
        output.concat(arrayUndefined)
      );
      output.reverse();
      expect(metadataDes.map((mitem) => mitem[key]).slice()).toEqual(
        output.concat(arrayUndefined)
      );
    }
  );
});
