enum UserAccess {
  Owner = "owner",
  Member = "member",
  Collaborator = "collaborator",
}

type Profile = {
  name: string;
  email: string;
  access: UserAccess;
};

type Metadata = MetaItem[];

type MetaItem = {
  [index: string]: string | string[] | boolean | number;
} & {
  id?: string;
  imageName?: string;
  imageLabels?: string[];
};

type Filter = {
  key: string;
  value: string;
};

export { UserAccess };
export type { Profile, Metadata, MetaItem, Filter };
