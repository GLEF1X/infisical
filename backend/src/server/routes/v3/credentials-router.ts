import { z } from "zod";

import { BadRequestError } from "@app/lib/errors";
import { readLimit, writeLimit } from "@app/server/config/rateLimiter";
import { verifyAuth } from "@app/server/plugins/auth/verify-auth";
import { AuthMode } from "@app/services/auth/auth-type";

import { credentialRawSchema, credentialsRawDataSchema } from "../sanitizedSchemas";

export const registerCredentialsRouter = async (server: FastifyZodProvider) => {
  server.route({
    method: "POST",
    url: "/raw",
    config: {
      rateLimit: writeLimit
    },
    schema: {
      description: "Create credential",
      security: [
        {
          bearerAuth: []
        }
      ],
      body: z.intersection(
        credentialsRawDataSchema,
        z.object({
          label: z.string().optional()
        })
      ),
      response: {
        200: credentialRawSchema
      }
    },
    onRequest: verifyAuth([AuthMode.JWT]),
    handler: async (req) => {
      // This is for satisfying typescript
      if (req.auth.authMode !== AuthMode.JWT) throw new BadRequestError({});

      const credential = await server.services.credentials.createCredential({
        orgId: req.auth.orgId,
        userId: req.auth.user.id,
        ...req.body
      });

      // TODO: add telemetry
      // await server.services.auditLog.createAuditLog({
      //   projectId: req.body.workspaceId,
      //   ...req.auditLogInfo,
      //   event: {
      //     type: EventType.CREATE_SECRET,
      //     metadata: {
      //       environment: req.body.environment,
      //       secretPath: req.body.secretPath,
      //       secretId: secret.id,
      //       secretKey: req.params.secretName,
      //       secretVersion: secret.version
      //     }
      //   }
      // });

      return credential;
    }
  });

  server.route({
    method: "PATCH",
    url: "/raw/:credentialId",
    config: {
      rateLimit: writeLimit
    },
    schema: {
      description: "Update credential",
      security: [
        {
          bearerAuth: []
        }
      ],
      params: z.object({
        credentialId: z.string().trim().uuid().describe("TODO")
      }),
      body: z.intersection(credentialsRawDataSchema, z.object({ label: z.string().optional() })),
      response: {
        200: credentialRawSchema
      }
    },
    onRequest: verifyAuth([AuthMode.JWT]),
    handler: async (req) => {
      // This is for satisfying typescript
      if (req.auth.authMode !== AuthMode.JWT) throw new BadRequestError({});

      const credential = await server.services.credentials.updateCredential({
        credentialId: req.params.credentialId,
        ...req.body
      });
      // TODO: add telemetry

      return credential;
    }
  });

  server.route({
    method: "GET",
    url: "/raw",
    config: {
      rateLimit: readLimit
    },
    schema: {
      description: "Get credentials",
      security: [
        {
          bearerAuth: []
        }
      ],
      response: {
        200: z.array(credentialRawSchema)
      }
    },
    onRequest: verifyAuth([AuthMode.JWT]),
    handler: async (req) => {
      // This is for satisfying typescript
      if (req.auth.authMode !== AuthMode.JWT) throw new BadRequestError({});

      const credentials = await server.services.credentials.getCredentials({
        orgId: req.auth.orgId,
        userId: req.auth.user.id
      });
      // TODO: add telemetry

      return credentials;
    }
  });

  server.route({
    method: "DELETE",
    url: "/raw/:credentialId",
    config: {
      rateLimit: writeLimit
    },
    schema: {
      description: "Delete credential",
      security: [
        {
          bearerAuth: []
        }
      ],
      params: z.object({
        credentialId: z.string().trim().uuid().describe("TODO")
      }),
      response: {
        200: z.object({ success: z.literal(true) })
      }
    },
    onRequest: verifyAuth([AuthMode.JWT]),
    handler: async (req) => {
      // This is for satisfying typescript
      if (req.auth.authMode !== AuthMode.JWT) throw new BadRequestError({});

      await server.services.credentials.deleteCredential({
        credentialId: req.params.credentialId
      });
      // TODO: add telemetry

      return { success: true } as const;
    }
  });
};
