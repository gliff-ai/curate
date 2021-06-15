import React, { ReactElement } from "react";
import { MetaItem } from "@/searchAndSort/interfaces";

export default function Tile(props: { mitem: MetaItem }): ReactElement {
  return (
    <img
      width={128}
      height={128}
      src={props.mitem.thumbnail as string}
      alt={props.mitem.imageName as string}
    />
  );
}
