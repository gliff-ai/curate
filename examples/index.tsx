import * as ReactDOM from "react-dom";

import UserInterface from "../src/ui";
import { UserAccess } from "../src/interfaces";
import type { Metadata, MetaItem } from "../src/interfaces";

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

const profiles = [
  { name: "Mike Jones", email: "mike@gliff.app", access: UserAccess.Owner },
  { name: "John Smith", email: "john@gliff.app", access: UserAccess.Member },
  {
    name: "Sarah Williams",
    email: "sarah@gliff.app",
    access: UserAccess.Collaborator,
  },
  {
    name: "Elisabeth Johnson",
    email: "elisabeth@gliff.app",
    access: UserAccess.Member,
  },
  {
    name: "David Brown",
    email: "david@gliff.app",
    access: UserAccess.Collaborator,
  },
];

const plugins = {
  "Example plug-in": [
    {
      type: "Javascript",
      name: "Example plug-in",
      tooltip: "Short description",
      onClick: (data = {}) => {
        alert("Some plug-in action.");
        return Promise.resolve({});
      },
    },
  ],
};

// get image promises:
const promises: Array<Promise<string>> = [];
for (let i = 0; i < 20; i += 1) {
  const filename = `sample${i}.png`;
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
          imageName: `sample${i}.png`,
          thumbnail: images[i],
          ...mitem,
        }));

        // render main component:
        ReactDOM.render(
          <UserInterface
            metadata={tiles}
            showAppBar
            profiles={profiles}
            userAccess={UserAccess.Owner}
            plugins={plugins}
          />,
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
