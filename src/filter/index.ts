import type { Filter, FilterData, FilterDataItem } from "./interfaces";

export class Filters {
  activeFilters: Filter[];

  isGrouped: boolean;

  sortedBy: string | null;

  constructor() {
    this.activeFilters = [];
    this.isGrouped = false;
    this.sortedBy = null;
  }

  private compare = (
    a: string | Date | number,
    b: string | Date | number,
    ascending: boolean
  ): number => {
    // Compare two values. Undefined values are always at the end.
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
  };

  getDataKeys = (item: FilterDataItem): string[] =>
    Object.keys(item).filter((k) => k !== "selected");

  hasAnyFilters = (): boolean => this.activeFilters.length > 0;

  private hasFilter = (filter: Filter): boolean =>
    this.activeFilters.some(
      (filt) => filt.key === filter.key && filt.value === filter.value
    );

  resetFilters = (data: FilterData): FilterData => {
    this.activeFilters = [];
    return this.selectAll(data);
  };

  selectAll = (data: FilterData): FilterData =>
    data.map((i) => ({ ...i, filterShow: true }));

  isSelectAll = (filter: Filter): boolean => {
    const { value, key } = filter;
    return value === "All values" || key === "" || value === "";
  };

  toggleFilter = (filter: Filter): void => {
    if (this.hasFilter(filter)) {
      this.activeFilters.splice(this.activeFilters.indexOf(filter), 1);
    } else {
      this.activeFilters.push(filter);
    }
  };

  addFilter = (filter: Filter): void => {
    if (!this.hasFilter(filter)) {
      this.activeFilters.push(filter);
    }
  };

  applyFilter = (data: FilterData, filter: Filter): FilterData => {
    if (this.isSelectAll(filter)) {
      return this.resetFilters(data);
    }
    this.addFilter(filter);
    return this.filterData(data);
  };

  private getKeyType = (data: FilterData, key: string): string => {
    if (key?.toLowerCase().includes("date")) return "date";
    for (const mitem of data) {
      const someType = typeof mitem[key];
      if (someType !== "undefined") {
        return someType;
      }
    }
    return "undefined";
  };

  sortData = (
    data: FilterData,
    key: string,
    ascending = true
  ): FilterData | null => {
    const dataCopy = [...data];
    const dataType = this.getKeyType(data, key);

    function toDate(value: string): Date {
      return value !== undefined ? new Date(value) : undefined;
    }

    this.sortedBy = key;

    switch (dataType) {
      case "number":
        dataCopy.sort((a: FilterDataItem, b: FilterDataItem): number =>
          this.compare(a[key] as number, b[key] as number, ascending)
        );
        return dataCopy;
      case "date":
        dataCopy.sort((a, b): number =>
          this.compare(
            toDate(a[key] as string),
            toDate(b[key] as string),
            ascending
          )
        );
        return dataCopy;

      case "string":
        dataCopy.sort((a: FilterDataItem, b: FilterDataItem): number =>
          this.compare(a[key] as number, b[key] as number, ascending)
        );
        return dataCopy;

      default:
        console.warn(`Cannot sort values with type "${dataType}".`);
        this.sortedBy = null;
        return null;
    }
  };

  filterData = (data: FilterData): FilterData => {
    if (this.activeFilters.length > 0) {
      data.forEach((item) => {
        this.activeFilters.forEach((filter, fi) => {
          const value = item[filter.key];

          // current filter selection
          const currentSel = Number(
            Array.isArray(value)
              ? value.some((v) => v.includes(filter.value))
              : String(value).includes(filter.value)
          );

          // selection for all filters up to current
          const prevSel = fi === 0 ? 1 : Number(item.filterShow);

          // update 'filterShow' field
          item.filterShow = Boolean(prevSel * currentSel);
        });
      });
      return data;
    }
    // select all items
    return this.selectAll(data);
  };

  private getMonthAndYear = (date: string): string =>
    date !== undefined
      ? new Date(date).toLocaleDateString("en-GB", {
          month: "short",
          year: "numeric",
        })
      : "";

  toggleIsGrouped = (): void => {
    this.isGrouped = !this.isGrouped;
  };

  resetSort = (): void => {
    this.sortedBy = null;
  };

  groupByValue = (data: FilterData): FilterData => {
    // Assign the newGroup field to all items, based on the same key used for sort
    if (!this.sortedBy || !this.isGrouped) return data;

    const areValuesEqual = this.sortedBy?.toLowerCase().includes("date")
      ? (value: unknown, previousValue: unknown) =>
          this.getMonthAndYear(value as string) !==
          this.getMonthAndYear(previousValue as string)
      : (value: unknown, previousValue: unknown) => value !== previousValue;

    let prevValue: unknown = null;
    data.forEach((item) => {
      if (!item.filterShow) return;
      // Number.MAX_VALUE added to handle missing values
      const value = (item[this.sortedBy] as string) || Number.MAX_VALUE;
      if (!prevValue || areValuesEqual(value, prevValue)) {
        item.newGroup = true;
      } else {
        item.newGroup = false;
      }
      prevValue = value;
    });
    return data;
  };
}
export type { Filter, FilterData, FilterDataItem };
