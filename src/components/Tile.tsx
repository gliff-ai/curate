import { ReactElement } from "react";
import { MetaItem } from "@/interfaces";

export function Tile(props: {
  mitem: MetaItem;
  width: number;
  height: number;
}): ReactElement {
  return (
    <img
      width={props.width}
      height={props.height}
      src={props.mitem.thumbnail as string}
      alt={props.mitem.imageName}
      data-private
    />
  );
}
