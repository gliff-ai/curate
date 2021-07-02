export const svgSrc = (src: string): string =>
  // eslint-disable-next-line import/no-dynamic-require
  require(`@/assets/${src}.svg`) as string;
