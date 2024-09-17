import { Metadata } from "@/interfaces";

interface PluginElement {
  type?: string;
  name: string;
  tooltip: string;
  onClick: (data: PluginInput) => Promise<PluginOutput>;
}

type PluginInput = Partial<{
  collectionUid: string;
  imageUids: string[];
  metadata: Metadata;
}>;

type PluginOutput = Partial<{
  status: string;
  message: string;
  domElement: JSX.Element | null;
  data: { metadata: Metadata };
}>;

type PluginObject = { [name: string]: PluginElement[] };

export type { PluginElement, PluginObject };
