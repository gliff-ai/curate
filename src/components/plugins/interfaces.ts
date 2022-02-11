import { Metadata } from "@/interfaces";

interface Plugin {
  name: string;
  tooltip: string;
  onClick: (data: DataIn) => Promise<DataOut>;
}

interface DataIn {
  collectionUid?: string;
  imageUid?: string;
  metadata?: Metadata;
}

interface DataOut {
  status?: string;
  message?: string;
  domElement?: JSX.Element | null;
}

type PluginObject = { [name: string]: Plugin[] };

export type { Plugin, PluginObject };
