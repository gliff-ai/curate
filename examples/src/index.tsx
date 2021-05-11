import * as React from "react";
import * as ReactDOM from "react-dom";

import UserInterface from "@/ui";

import { Metadata, MetaItem } from "@/searchAndSort/interfaces";

// load the sample images, construct an array of tiles:
const loadImage = (filename: string): Promise<ImageBitmap> =>
  new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = "anonymous";

    image.onload = () => {
      createImageBitmap(image).then((imageBitmap) => {
        resolve(imageBitmap);
      });
    };
    image.src = filename;
  });

// get image promises:
const promises: Array<Promise<ImageBitmap>> = [];
for (let i = 0; i < 20; i += 1) {
  const filename = `samples/sample${i}.png`;
  promises.push(loadImage(filename));
}

fetch("metadata.json")
  .then((response) => response.json())
  .then((metadata: Metadata) => {
    Promise.all(promises).then((images: Array<ImageBitmap>) => {
      // make tiles:
      const tiles = metadata.map((mitem: MetaItem, i) => ({
        id: String(i),
        name: `samples/sample${i}.png`,
        thumbnail: images[i],
        ...mitem,
      }));

      // render main component:
      ReactDOM.render(
        <UserInterface metadata={tiles} />,
        document.getElementById("react-container")
      );
    });
  })
  .catch(() => {
    console.log("Error while reading metadata.");
  });
