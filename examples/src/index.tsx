import * as React from "react";
import * as ReactDOM from "react-dom";

import { UserInterface } from "@/index";


// load the cells images, construct an array of tiles:
const loadImage = (filename: string): Promise<ImageBitmap> =>
  new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = "anonymous";

    image.onload = () => {
      createImageBitmap(image)
        .then((imageBitmap) => {
          console.log("Hello, World!")
          console.log(resolve);
          resolve(imageBitmap)
        })
        .catch((e) => {
          console.log(e);
        });
    };
    image.src = filename;
  });

// get image promises:
const promises: Array<Promise<ImageBitmap>> = [];
for (let i = 0; i < 20; i++) {
  const filename = "cells/cell" + i + ".png";
  promises.push(loadImage(filename).then((imageBitmap) => imageBitmap));
} 

// unwrap promises and pass to curate:
Promise.all(promises).then((images: ImageBitmap[]) => {  
  // make tiles:
  const tiles = images.map((image: ImageBitmap, i) => (
    {name: "cell" + i + ".png", label: i % 2 ? "cancer" : "notcancer", thumbnail: image}
  ))
  // render main component:
  ReactDOM.render(
    <UserInterface tiles={tiles}/>,
    document.getElementById("react-container")
  )},
  (e) => {console.log(e)}
).catch((e) => {console.log(e)});
