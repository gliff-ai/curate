import { MetaItem } from "@/interfaces";
import { Filter, FilterData, Filters } from "./filter";

type TestMetaData = Partial<MetaItem>[];
const filters = new Filters();
const metadata: Partial<MetaItem>[] = [
  {
    string: "through",
    date: "01-26-1920",
    number: 12,
    arrayOfString: ["perhaps"],
  },
  { string: "soil", date: "02-15-2001" },
  { date: "02-26-2001", number: 4.3, arrayOfString: ["pertain"] },
  { string: "science", date: "08-12-2030", number: 0.5 },
  { string: "perhaps", number: -1 },
  { number: 12 },
];

function cloneMetadata() {
  return metadata.map((mitem) => ({ ...mitem, filterShow: true } as MetaItem));
}

describe("sort metadata with missing values", () => {
  // data type | expected result: metadata values in ascending order
  const testSample: [string, any[]][] = [
    ["number", [-1, 0.5, 4.3, 12, 12]],
    ["string", ["perhaps", "science", "soil", "through"]],
    ["date", ["01-26-1920", "02-15-2001", "02-26-2001", "08-12-2030"]],
  ];

  test.each(testSample)(
    `sort values of type %s`,
    (key: string, output: any[]) => {
      const metadataAsc = filters.sortData(cloneMetadata() as FilterData, key);
      const metadataDes = filters.sortData(
        cloneMetadata() as FilterData,
        key,
        false
      );
      const arrayUndefined = Array.from(
        metadata.filter((mitem) => !Object.keys(mitem).includes(key))
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

const testFilter = (activeFilters: Filter[], outcome: TestMetaData): void => {
  filters.activeFilters = activeFilters;
  const newMetadata = filters.filterData(cloneMetadata() as FilterData);
  expect(
    newMetadata
      .filter(({ filterShow }) => filterShow)
      .map(({ filterShow, ...rest }) => rest)
  ).toEqual(outcome);
};

describe("filter metadata", () => {
  test.each([
    {
      filter: { key: "string", value: "science" },
      outcome: [{ string: "science", date: "08-12-2030", number: 0.5 }],
    },
    {
      filter: { key: "number", value: "12" },
      outcome: [
        {
          string: "through",
          date: "01-26-1920",
          number: 12,
          arrayOfString: ["perhaps"],
        },
        { number: 12 },
      ],
    },
    {
      filter: { key: "date", value: "08-12-2030" },
      outcome: [{ string: "science", date: "08-12-2030", number: 0.5 }],
    },
    {
      filter: { key: "arrayOfString", value: "per" },
      outcome: [
        {
          string: "through",
          date: "01-26-1920",
          number: 12,
          arrayOfString: ["perhaps"],
        },
        { date: "02-26-2001", number: 4.3, arrayOfString: ["pertain"] },
      ],
    },
  ])("filter by $filter", ({ filter, outcome }) =>
    testFilter([filter], outcome)
  );

  test.each([
    {
      filter1: { key: "string", value: "soil" },
      filter2: { key: "number", value: "-1" },
      outcome: [],
    },
  ])("filter by $filter1 AND $filter2", ({ filter1, filter2, outcome }) =>
    testFilter([filter1, filter2], outcome)
  );
});
