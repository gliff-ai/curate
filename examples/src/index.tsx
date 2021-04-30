import * as React from "react";
import * as ReactDOM from "react-dom";

import { Metadata } from "@/index";
import UserInterface from "@/index";

// load the sample images, construct an array of tiles:
const loadImage = (filename: string): Promise<string> =>
  new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = "anonymous";

    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);
      let b64 = canvas.toDataURL("image/png");
      b64 = b64.replace("data:image/png;base64,", "");

      resolve(b64);
    };
    image.src = filename;
  });

// get image promises:
const promises: Array<Promise<string>> = [];
for (let i = 0; i < 20; i += 1) {
  const filename = `samples/sample${i}.png`;
  promises.push(loadImage(filename));
}

// construct dummy metadata:
const metadata1: Metadata = {
  size: "1k",
  created: "28/04/2021",
  numberOfDimensions: 2,
  dimensions: "128x128",
  numberOfChannels: 3,
  imageLabels: ["cancer"],
  fileMetaVersion: "0.0.1",
};

const metadata2: Metadata = {
  size: "1k",
  created: "29/04/2021",
  numberOfDimensions: 2,
  dimensions: "128x128",
  numberOfChannels: 3,
  imageLabels: ["notcancer"],
  fileMetaVersion: "0.0.1",
};

// unwrap promises and pass to curate:
Promise.all(promises)
  .then(
    (images: string[]) => {
      // make tiles:
      const tiles = images.map((image: string, i) => ({
        id: String(i),
        name: `samples/sample${i}.png`,
        metadata: i % 2 === 0 ? metadata1 : metadata2,
        thumbnail: image,
      }));
      // render main component:
      ReactDOM.render(
        <UserInterface tiles={tiles} />,
        document.getElementById("react-container")
      );
    },
    (e) => {
      console.log(e);
    }
  )
  .catch((e) => {
    console.log(e);
  });
