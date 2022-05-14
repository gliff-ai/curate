import { ReactElement, useState, useEffect } from "react";
import { IconButton, ButtonGroup } from "@gliff-ai/style";
import { datasetType, ThumbnailSizes } from "@/components/Tooltips";

interface Props {
  changeDatasetViewType: (name: string) => void;
}

export function DatasetView({ changeDatasetViewType }: Props): ReactElement {
  const [buttonClicked, setButtonClicked] = useState("View Dataset as Images");

  useEffect(() => {
    datasetType.forEach((type) => {
      if (type.name === buttonClicked) changeDatasetViewType(type.name);
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
      {datasetType.map(({ name, icon, id }: ThumbnailSizes) => (
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
