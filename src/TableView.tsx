import { ReactElement } from "react";

import { DataGrid, Chip, Box, Typography, HtmlTooltip } from "@gliff-ai/style";

import type { GridRenderCellParams, GridColDef } from "@gliff-ai/style";
import type { Metadata, MetaItem } from "@/interfaces";

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
  selectedImagesUid: [Set<string>, (action: SelectedImagesAction) => void];
}

const defaultColumns = [
  {
    headerName: "Image Name",
    field: "imageName",
    width: 150,
    editable: false,
    sortable: false,
  },
  {
    headerName: "Annotation Progress",
    field: "annotationProgress",
    width: 250,
    editable: false,
    sortable: false,
  },
  {
    headerName: "Assignees",
    field: "assignees",
    width: 300,
    editable: false,
    sortable: false,
  },
  {
    headerName: "Labels",
    field: "labels",
    width: 250,
    editable: false,
    sortable: false,
    renderCell: (params: GridRenderCellParams<unknown, MetaItem>) => {
      const { imageLabels = [] } = params.row;
      const chipsLimit = 2;
      const chipsContent: string[] = imageLabels.slice(0, chipsLimit);
      const moreLabelsCount = imageLabels.length - chipsLimit;
      const showPlaceholder =
        moreLabelsCount > 0 ? (
          <HtmlTooltip title={imageLabels.join(", ")} placement="bottom">
            <Typography>+ {moreLabelsCount} more</Typography>
          </HtmlTooltip>
        ) : null;
      const chips = chipsContent.map((imageLabel: string) => (
        <Chip label={imageLabel} key={imageLabel} variant="outlined" />
      ));
      return [chips, showPlaceholder];
    },
  },

  {
    headerName: "Pixels",
    field: "dimensions",
    width: 150,
    editable: false,
    sortable: false,
  },
  {
    headerName: "Size",
    field: "size",
    width: 150,
    editable: false,
    sortable: false,
  },
];

const ignoreMetaColumns = [
  "imageName",
  "annotationProgress",
  "assignees",
  "labels",
  "pixels",
  "size",
  "id",
  "dimensions",
  "filterShow",
];

export function TableView({ metadata, ...props }: Props): ReactElement {
  const [selectedImagesUid, dispatch] = props.selectedImagesUid;

  const colsObj = metadata.reduce((acc, el) => {
    Object.keys(el).forEach((field) => {
      if (!ignoreMetaColumns.includes(field)) {
        acc[field] = {
          field,
          headerName: field, // TODO split on capital, make pretty
          width: 150,
          editable: false,
          hide: true,
          sortable: false,
        };
      }
    });

    return acc;
  }, {} as { [index: string]: GridColDef });

  const allCols = [...defaultColumns, ...Object.values(colsObj)];
  const shownMeta = metadata.filter((mitem) => mitem.filterShow);

  return (
    <Box sx={{ width: "100%", marginTop: "14px" }}>
      <DataGrid
        disableColumnFilter /* Sorting and filtering is handled externally */
        title="Dataset Details"
        columns={allCols}
        rows={shownMeta}
        sx={{ height: "82.7vh" }}
        hideFooterPagination
        pageSize={shownMeta.length}
        onSelectionModelChange={(newSelectionModel) => {
          // NewSelectionModel is indexes, we want to use our ids
          dispatch({
            type: "set",
            id: newSelectionModel.map(
              (rowIndex: number) => shownMeta?.[rowIndex]?.id
            ),
          });
        }}
        selectionModel={[...selectedImagesUid]}
      />
    </Box>
  );
}
