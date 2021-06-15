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
          if (props.mitem.thumbnail !== undefined) {
            const canvasContext = canvas.getContext("2d");
            canvasContext.clearRect(0, 0, canvas.width, canvas.height);
            const image = props.mitem.thumbnail as ImageBitmap;

            // Draw image fitting it to the canvas
            const imageWidth = image.width;
            const imageHeight = image.height;
            const ratio = Math.min(
              canvas.width / imageWidth,
              canvas.height / imageHeight
            );
            canvasContext.drawImage(
              image,
              0,
              0,
              imageWidth,
              imageHeight,
              (canvas.width - imageWidth * ratio) / 2,
              (canvas.height - imageHeight * ratio) / 2,
              imageWidth * ratio,
              imageHeight * ratio
            );
          }
        }
      }}
    />
  );
}
