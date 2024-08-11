import validator from "validator";
import { z } from "zod";

import {
  CredentialType,
  DynamicSecretsSchema,
  IdentityProjectAdditionalPrivilegeSchema,
  IntegrationAuthsSchema,
  ProjectRolesSchema,
  ProjectsSchema,
  SecretApprovalPoliciesSchema,
  UsersSchema
} from "@app/db/schemas";
import { UnpackedPermissionSchema } from "@app/ee/services/identity-project-additional-privilege/identity-project-additional-privilege-service";
import { ProjectPermissionActions, ProjectPermissionSub } from "@app/ee/services/permission/project-permission";
import { CardProvider } from "@app/lib/types";

// sometimes the return data must be santizied to avoid leaking important values
// always prefer pick over omit in zod
export const integrationAuthPubSchema = IntegrationAuthsSchema.pick({
  id: true,
  projectId: true,
  integration: true,
  teamId: true,
  url: true,
  namespace: true,
  accountId: true,
  metadata: true,
  createdAt: true,
  updatedAt: true
});

export const sapPubSchema = SecretApprovalPoliciesSchema.merge(
  z.object({
    environment: z.object({
      id: z.string(),
      name: z.string(),
      slug: z.string()
    }),
    projectId: z.string()
  })
);

export const sanitizedServiceTokenUserSchema = UsersSchema.pick({
  authMethods: true,
  id: true,
  createdAt: true,
  updatedAt: true,
  devices: true,
  email: true,
  firstName: true,
  lastName: true,
  mfaMethods: true
}).merge(
  z.object({
    __v: z.number().default(0),
    _id: z.string()
  })
);

export const secretRawSchema = z.object({
  id: z.string(),
  _id: z.string(),
  workspace: z.string(),
  environment: z.string(),
  version: z.number(),
  type: z.string(),
  secretKey: z.string(),
  secretValue: z.string().optional(),
  secretComment: z.string().optional(),
  secretReminderNote: z.string().nullable().optional(),
  secretReminderRepeatDays: z.number().nullable().optional(),
  skipMultilineEncoding: z.boolean().default(false).nullable().optional(),
  metadata: z.unknown().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const ProjectPermissionSchema = z.object({
  action: z
    .nativeEnum(ProjectPermissionActions)
    .describe("Describe what action an entity can take. Possible actions: create, edit, delete, and read"),
  subject: z
    .nativeEnum(ProjectPermissionSub)
    .describe("The entity this permission pertains to. Possible options: secrets, environments"),
  conditions: z
    .object({
      environment: z.string().describe("The environment slug this permission should allow.").optional(),
      secretPath: z
        .object({
          $glob: z
            .string()
            .min(1)
            .describe("The secret path this permission should allow. Can be a glob pattern such as /folder-name/*/** ")
        })
        .optional()
    })
    .describe("When specified, only matching conditions will be allowed to access given resource.")
    .optional()
});

export const ProjectSpecificPrivilegePermissionSchema = z.object({
  actions: z
    .nativeEnum(ProjectPermissionActions)
    .describe("Describe what action an entity can take. Possible actions: create, edit, delete, and read")
    .array()
    .min(1),
  subject: z
    .enum([ProjectPermissionSub.Secrets])
    .describe("The entity this permission pertains to. Possible options: secrets, environments"),
  conditions: z
    .object({
      environment: z.string().describe("The environment slug this permission should allow."),
      secretPath: z
        .object({
          $glob: z
            .string()
            .min(1)
            .describe("The secret path this permission should allow. Can be a glob pattern such as /folder-name/*/** ")
        })
        .optional()
    })
    .describe("When specified, only matching conditions will be allowed to access given resource.")
});

export const SanitizedIdentityPrivilegeSchema = IdentityProjectAdditionalPrivilegeSchema.extend({
  permissions: UnpackedPermissionSchema.array()
});

export const SanitizedRoleSchema = ProjectRolesSchema.extend({
  permissions: UnpackedPermissionSchema.array()
});

export const SanitizedDynamicSecretSchema = DynamicSecretsSchema.omit({
  inputIV: true,
  inputTag: true,
  inputCiphertext: true,
  keyEncoding: true,
  algorithm: true
});

export const SanitizedAuditLogStreamSchema = z.object({
  id: z.string(),
  url: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const SanitizedProjectSchema = ProjectsSchema.pick({
  id: true,
  name: true,
  slug: true,
  autoCapitalization: true,
  orgId: true,
  createdAt: true,
  updatedAt: true,
  version: true,
  upgradeStatus: true,
  pitVersionLimit: true,
  kmsCertificateKeyId: true,
  auditLogsRetentionDays: true
});

export const creditCardRawDataSchema = z
  .object({
    holderName: z.string().min(1).max(255).optional(),
    provider: z.nativeEnum(CardProvider).optional(),
    cardNumber: z.string().optional(),
    verificationNumber: z.string().optional(),
    // TODO: upgrade to zod 3.23 to get string date validation out of the box
    expireAt: z
      .string()
      .optional()
      .refine((expireAt) => {
        if (!expireAt) return true;

        // TODO: Check date is the first of the month
        return validator.isDate(expireAt, {
          format: "MM-DD-YYY"
        });
      }),
    postalCode: z
      .string()
      .refine((postalCode) => {
        // FIXME: add i18n locale
        return validator.isPostalCode(postalCode, "US");
      })
      .optional()
  })
  .refine(
    (data) => {
      if (!data.cardNumber) {
        return true;
      }

      return validator.isCreditCard(data.cardNumber, {
        provider: data.provider
      });
    },
    {
      message: "Must be a valid credit card number",
      path: ["cardNumber"]
    }
  );

export const loginRawSchema = z.object({
  username: z.string().min(1).optional(),
  password: z.string().min(1).optional()
});

export const secureNoteRawSchema = z.object({
  content: z.string().min(1).optional()
});

export const credentialsRawDataSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal(CredentialType.CREDIT_CARD), data: creditCardRawDataSchema }),
  z.object({ type: z.literal(CredentialType.SECURE_NOTE), data: secureNoteRawSchema }),
  z.object({ type: z.literal(CredentialType.WEB_LOGIN), data: loginRawSchema })
]);

export const credentialRawSchema = z.intersection(
  z.object({
    id: z.string(),
    name: z.string().optional(),
    orgId: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
    label: z.string().nullable()
  }),
  credentialsRawDataSchema
);
