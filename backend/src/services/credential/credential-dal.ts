import { TDbClient } from "@app/db";
import { TableName } from "@app/db/schemas";
import { ormify } from "@app/lib/knex";

export type TCredentialDALFactory = ReturnType<typeof credentialDALFactory>;

export const credentialDALFactory = (db: TDbClient) => {
  const credentialOrm = ormify(db, TableName.Credential);
  return credentialOrm;
};
