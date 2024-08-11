import { TDbClient } from "@app/db";
import { TableName } from "@app/db/schemas";
import { ormify } from "@app/lib/knex";

export type TCredentialKeysDALFactory = ReturnType<typeof credentialKeysDALFactory>;

export const credentialKeysDALFactory = (db: TDbClient) => {
  const credentialOrm = ormify(db, TableName.CredentialKeys);
  return credentialOrm;
};
