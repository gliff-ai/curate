import { ReactElement, useState, useEffect } from "react";
import { IconButton, theme } from "@gliff-ai/style";
import { ButtonGroup, makeStyles } from "@material-ui/core";
import { thumbnailSizes, ThumbnailSizes } from "@/components/Tooltips";

const useStyle = makeStyles({
  card: {
    backgroundColor: theme.palette.primary.light,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "48px",
    width: "auto",
    border: "none",
  },
  button: { padding: "5px" },
});

interface Props {
  resizeThumbnails: (size: number) => void;
}

export function SizeThumbnails({ resizeThumbnails }: Props): ReactElement {
  const [buttonClicked, setButtonClicked] = useState("Small Thumbnails");
  const classes = useStyle();

  useEffect(() => {
    thumbnailSizes.forEach((thumb) => {
      if (thumb.name === buttonClicked) resizeThumbnails(thumb.size);
    });
  }, [buttonClicked]);

  return (
    <ButtonGroup orientation="horizontal" className={classes.card}>
      {thumbnailSizes.map(({ name, icon, id }: ThumbnailSizes) => (
        <IconButton
          id={id}
          key={name}
          className={classes.button}
          icon={icon}
          tooltipPlacement="bottom"
          tooltip={{ name }}
          onClick={() => setButtonClicked(name)}
          fill={buttonClicked === name}
        />
      ))}
    </ButtonGroup>
  );
}
