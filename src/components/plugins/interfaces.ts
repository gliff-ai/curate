import { Metadata } from "@/interfaces";

interface Plugin {
  name: string;
  tooltip: string;
  onClick: any;
}

interface PluginDataIn {
  collectionUid?: string;
  imageUid?: string;
  metadata?: Metadata;
}

interface PluginDataOut {
  status?: string;
  message?: string;
  domElement?: JSX.Element | null;
}

type PluginObject = { [name: string]: Plugin[] };

export type { Plugin, PluginObject, PluginDataIn, PluginDataOut };
