import React from "react";

export interface Tile {
  name: string;
  label: string;
  thumbnail: ImageBitmap
}

interface Props {
  tiles: Array<Tile>;
}

export class UserInterface extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  render = (): React.ReactNode => (
    <div>
      <h1>CURATE</h1>

    </div>
  )
};
