import * as ReactDOM from "react-dom";

import UserInterface from "@/ui";

import { Metadata, MetaItem } from "@/searchAndSort/interfaces";

// load the sample images, construct an array of tiles:
const loadImage = (filename: string): Promise<string> =>
  new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = "anonymous";

    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(image, 0, 0, 128, 128);
      resolve(canvas.toDataURL());
    };
    image.src = filename;
  });

// get image promises:
const promises: Array<Promise<string>> = [];
for (let i = 0; i < 20; i += 1) {
  const filename = `samples/sample${i}.png`;
  promises.push(loadImage(filename));
}

fetch("metadata.json")
  .then((response) => response.json())
  .then((metadata: Metadata) => {
    Promise.all(promises).then(
      (images: Array<string>) => {
        // make tiles:
        const tiles = metadata.map((mitem: MetaItem, i) => ({
          id: String(i),
          imageName: `samples/sample${i}.png`,
          thumbnail: images[i],
          ...mitem,
        }));

        // render main component:
        ReactDOM.render(
          <UserInterface metadata={tiles} showAppBar />,
          document.getElementById("react-container")
        );
      },
      () => {
        console.log("Error while parsing JSON");
      }
    );
  })
  .catch(() => {
    console.log("Error while reading metadata.");
  });
