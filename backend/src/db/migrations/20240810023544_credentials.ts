import { Knex } from "knex";

import { TableName } from "../schemas";

export async function up(knex: Knex): Promise<void> {
  const doesCredentialsTableExist = await knex.schema.hasTable(TableName.Credential);
  if (!doesCredentialsTableExist) {
    await knex.schema.createTable(TableName.Credential, (t) => {
      t.uuid("id", { primaryKey: true }).defaultTo(knex.fn.uuid());
      // TODO: potentially add a CHECK constraint here, but this will require adding a migration
      // for each new credential type
      t.string("type").notNullable();
      t.binary("encryptedLabel").nullable();
      t.binary("encryptedData").notNullable();
      t.uuid("userId").notNullable();
      // TODO: maybe reference credential key instead of these two
      t.foreign("userId").references("id").inTable(TableName.Users).onDelete("CASCADE");
      t.uuid("orgId").notNullable();
      t.foreign("orgId").references("id").inTable(TableName.Organization).onDelete("CASCADE");
      t.timestamps(true, true, true);
      t.index(["userId", "orgId"]);
    });
  }

  const doesCredentialKeysTableExist = await knex.schema.hasTable(TableName.CredentialKeys);
  if (!doesCredentialKeysTableExist) {
    await knex.schema.createTable(TableName.CredentialKeys, (t) => {
      t.uuid("id", { primaryKey: true }).defaultTo(knex.fn.uuid());
      t.binary("kmsSecretManagerEncryptedDataKey").notNullable();
      t.uuid("kmsSecretManagerKeyId").notNullable();
      t.foreign("kmsSecretManagerKeyId").references("id").inTable(TableName.KmsKey);
      t.uuid("userId").notNullable();
      t.foreign("userId").references("id").inTable(TableName.Users).onDelete("CASCADE");
      t.uuid("orgId").notNullable();
      t.foreign("orgId").references("id").inTable(TableName.Organization).onDelete("CASCADE");
      t.timestamps(true, true, true);
      t.index(["userId", "orgId"]);
      t.unique(["orgId", "userId"]);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists(TableName.Credential);
  await knex.schema.dropTableIfExists(TableName.CredentialKeys);
}
