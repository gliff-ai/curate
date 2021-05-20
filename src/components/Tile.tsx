import React, { ReactElement } from "react";
import { MetaItem } from "@/searchAndSort/interfaces";

export default function Tile(props: { mitem: MetaItem }): ReactElement {
  return (
    <canvas
      width={128}
      height={128}
      ref={(canvas) => {
        if (canvas) {
          // Keep this as it is initially null
          const canvasContext = canvas.getContext("2d");
          if (props.mitem.thumbnail !== undefined) {
            canvasContext.drawImage(props.mitem.thumbnail as ImageBitmap, 0, 0);
          }
        }
      }}
    />
  );
}
