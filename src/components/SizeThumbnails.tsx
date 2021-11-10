import { ReactElement, useState, useEffect } from "react";
import { IconButton } from "@gliff-ai/style";
import { ButtonGroup } from "@material-ui/core";

import { thumbnailSizes, ThumbnailSizes } from "@/components/Tooltips";

interface Props {
  resizeThumbnails: (size: number) => void;
}

export function SizeThumbnails({ resizeThumbnails }: Props): ReactElement {
  const [buttonClicked, setButtonClicked] = useState("Small Thumbnails");

  useEffect(() => {
    thumbnailSizes.forEach((thumb) => {
      if (thumb.name === buttonClicked) resizeThumbnails(thumb.size);
    });
  }, [buttonClicked]);

  return (
    <div>
      <ButtonGroup orientation="horizontal">
        {thumbnailSizes.map((thumbnailSize: ThumbnailSizes) => (
          <IconButton
            key={thumbnailSize.name}
            icon={thumbnailSize.icon}
            tooltipPlacement="bottom"
            tooltip={{ name: thumbnailSize.name }}
            onClick={() => setButtonClicked(thumbnailSize.name)}
            fill={buttonClicked === thumbnailSize.name}
            id={thumbnailSize.id}
          />
        ))}
      </ButtonGroup>
    </div>
  );
}
