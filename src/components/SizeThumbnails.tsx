import { ReactElement, useState, useEffect } from "react";
import { IconButton, ButtonGroup } from "@gliff-ai/style";
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
    <ButtonGroup
      orientation="horizontal"
      variant="text"
      sx={{
        alignItems: "center",
        height: "48px",
        border: "none",
      }}
    >
      {thumbnailSizes.map(({ name, icon, id }: ThumbnailSizes) => (
        <IconButton
          id={id}
          key={name}
          sx={{ padding: "5px" }}
          icon={icon}
          tooltipPlacement="bottom"
          tooltip={{ name }}
          onClick={() => setButtonClicked(name)}
          fill={buttonClicked === name}
          size="small"
        />
      ))}
    </ButtonGroup>
  );
}
