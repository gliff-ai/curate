import type { Filter, Data, Item } from "./interfaces";

export class Filters {
  activeFilters: Filter[];

  isGrouped: boolean;

  constructor() {
    this.activeFilters = [];
    this.isGrouped = false;
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

  private hasFilter = (filter: Filter): boolean =>
    this.activeFilters.some(
      (filt) => filt.key === filter.key && filt.value === filter.value
    );

  resetFilters = (data: Data): Data => {
    this.activeFilters = [];
    return this.selectAll(data);
  };

  selectAll = (data: Data): Data =>
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

  applyFilter = (data: Data, filter: Filter): Data => {
    if (this.isSelectAll(filter)) {
      return this.resetFilters(data);
    }
    this.addFilter(filter);
    return this.filterData(data);
  };

  private getKeyType = (data: Data, key: string): string => {
    if (key?.toLowerCase().includes("date")) return "date";
    for (const mitem of data) {
      const someType = typeof mitem[key];
      if (someType !== "undefined") {
        return someType;
      }
    }
    return "undefined";
  };

  sortData = (data: Data, key: string, ascending = true): Data | null => {
    const dataCopy = [...data];
    const dataType = this.getKeyType(data, key);

    function toDate(value: string): Date {
      return value !== undefined ? new Date(value) : undefined;
    }

    switch (dataType) {
      case "number":
        dataCopy.sort((a: Item, b: Item): number =>
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
        dataCopy.sort((a: Item, b: Item): number =>
          this.compare(a[key] as number, b[key] as number, ascending)
        );
        return dataCopy;

      case "undefined":
        console.warn(`No values set for data key "${key}".`);
        return null;

      default:
        console.warn(`Cannot sort values with type "${dataType}".`);
        return null;
    }
  };

  filterData = (data: Data): Data => {
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
}
export type { Filter };
