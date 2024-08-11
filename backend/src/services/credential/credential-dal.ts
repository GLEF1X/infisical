import { Knex } from "knex";

import { TDbClient } from "@app/db";
import { TableName } from "@app/db/schemas";
import { DatabaseError } from "@app/lib/errors";
import { ormify, selectAllTableCols } from "@app/lib/knex";

export type TCredentialDALFactory = ReturnType<typeof credentialDALFactory>;

export const credentialDALFactory = (db: TDbClient) => {
  const credentialOrm = ormify(db, TableName.Credential);

  const getAllSecretsInReverseChronologicalOrder = (orgId: string, userId: string, tx?: Knex) => {
    try {
      return (tx || db)(TableName.Credential)
        .select(selectAllTableCols(TableName.Credential))
        .where({
          orgId,
          userId
        })
        .orderBy("createdAt", "desc");
    } catch (error) {
      throw new DatabaseError({ error, name: "getAllSecretsInReverseChronologicalOrder" });
    }
  };

  return {
    ...credentialOrm,
    getAllSecretsInReverseChronologicalOrder
  };
};
