enum UserAccess {
  Owner = 0,
  Member = 1,
  Collaborator = 2,
}

type Profile = {
  name: string;
  email: string;
  access: UserAccess;
};

type Metadata = MetaItem[];

type MetaItem = {
  [index: string]: string | string[] | boolean | number;
};

type Filter = {
  key: string;
  value: string;
};

export { UserAccess };
export type { Profile, Metadata, MetaItem, Filter };
