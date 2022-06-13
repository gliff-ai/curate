import { KeyboardEvent, MouseEvent, Fragment, ReactElement } from "react";
import { theme, Grid, Button, Box } from "@gliff-ai/style";

import { Metadata, MetaItem } from "@/interfaces";
import { Tile } from "@/components";
import { GroupBySeparator } from "@/sort";

type SelectedImagesAction =
  | {
      type: "add" | "delete" | "toggle";
      id: string;
    }
  | {
      type: "set";
      id: string[];
    };

interface Props {
  metadata: Metadata;
  isGrouped: boolean;
  sortedBy: string;
  thumbnailSize: number;
  selectMultipleImagesMode: boolean;
  onDoubleClick: (id: string) => void;
  labelsPopover: (mitem: MetaItem, i: number) => JSX.Element;
  selectedImagesUid: [Set<string>, (action: SelectedImagesAction) => void];
}

export function TileView({
  metadata,
  isGrouped,
  sortedBy,
  selectMultipleImagesMode,
  labelsPopover,
  thumbnailSize,
  onDoubleClick,
  ...props
}: Props): ReactElement {
  const [selectedImagesUid, dispatch] = props.selectedImagesUid; // same as useReduce, but state is in parent
  const getLastSelection = () => [...selectedImagesUid.values()].pop();

  const getIndexFromUid = (uid: string): number | null => {
    for (let i = 0; i < metadata.length; i += 1) {
      if (metadata[i].id === uid) return i;
    }
    return null;
  };

  const getItemUidNextToLastSelected = (forward = true): number | null => {
    const inc = forward ? 1 : -1;
    let index: number;
    for (let i = 0; i < metadata.length; i += 1) {
      index = i + inc;
      if (
        metadata[i].id === getLastSelection() &&
        index < metadata.length &&
        index >= 0
      ) {
        return index;
      }
    }
    return null;
  };

  return (
    <>
      {metadata.map((mitem: MetaItem, itemIndex) => (
        <Fragment key={mitem.id}>
          {isGrouped && <GroupBySeparator mitem={mitem} sortedBy={sortedBy} />}
          <Grid
            item
            style={{
              backgroundColor:
                selectedImagesUid.has(mitem.id) && theme.palette.primary.main,
            }}
          >
            <Box
              sx={{
                position: "relative" as const,
                "& > button": {
                  margin: "5px",
                },
              }}
            >
              <Button
                id="images"
                onClick={(e: MouseEvent) => {
                  const { id } = mitem;
                  if (e.metaKey || e.ctrlKey || selectMultipleImagesMode) {
                    // Add image to selection if not included, otherwise remove it
                    dispatch({ type: "toggle", id });
                  } else if (e.shiftKey && selectedImagesUid.size > 0) {
                    // Selected all images between a pair of clicked images.
                    const currIdx = getIndexFromUid(id);
                    const prevIdx = getIndexFromUid(getLastSelection());
                    dispatch({ type: "add", id: metadata[prevIdx].id });
                    const startIdx = prevIdx < currIdx ? prevIdx : currIdx;
                    const endIdx = prevIdx < currIdx ? currIdx : prevIdx;

                    for (let i = startIdx; i <= endIdx; i += 1) {
                      dispatch({ type: "add", id: metadata[i].id });
                    }
                  } else {
                    // Select single item
                    dispatch({ type: "set", id: [id] });
                  }
                }}
                onDoubleClick={() => {
                  onDoubleClick(mitem.id);
                }}
                onKeyDown={(e: KeyboardEvent) => {
                  if (e.key === "Escape") {
                    // Deselect all
                    dispatch({ type: "set", id: [] });
                    return;
                  }

                  if (
                    e.shiftKey &&
                    (e.key === "ArrowLeft" || e.key === "ArrowRight")
                  ) {
                    // Select consecutive images to the left or to the right of the clicked image.
                    const index = getItemUidNextToLastSelected(
                      e.key === "ArrowRight"
                    );

                    if (index !== null) {
                      const { id } = metadata[index];
                      if (selectedImagesUid.has(id)) {
                        dispatch({ type: "delete", id: getLastSelection() });
                      } else {
                        dispatch({ type: "add", id });
                      }
                    }
                  }
                }}
              >
                <Tile
                  mitem={mitem}
                  width={thumbnailSize}
                  height={thumbnailSize}
                />
              </Button>
              {labelsPopover(mitem, itemIndex)}
            </Box>
          </Grid>
        </Fragment>
      ))}
    </>
  );
}
