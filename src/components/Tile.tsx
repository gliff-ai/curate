import React, { Component } from "react";
import { MetaItem } from "@/searchAndSort/interfaces";

export default function Tile(props: { mitem: MetaItem }) {
  return (
    <canvas
      width={128}
      height={128}
      ref={(canvas) => {
        if (canvas) {
          // Keep this as it is initially null
          console.log(canvas);

          const canvasContext = canvas.getContext("2d");

          canvasContext.drawImage(props.mitem.thumbnail as ImageBitmap, 0, 0);
        }
      }}
    />
  );
}
