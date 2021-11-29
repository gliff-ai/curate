export type Metadata = MetaItem[];

export type MetaItem = {
  [index: string]: string | string[] | boolean | number;
};

export type Filter = {
  key: string;
  value: string;
};

export enum UserAccess {
  Owner = "owner",
  Member = "member",
  Collaborator = "collaborator",
}
