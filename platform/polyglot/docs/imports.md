Node.js (fastify_server)

From within fastify_server/:
// Using # imports (self-referencing):
import logger from "#app/logger";
import logger from "#fastify_server/logger";

import { printRoutes } from "#app/print_routes";
import { printRoutes } from "#fastify_server/print_routes";

From anywhere in the monorepo:
// Using workspace packages:
import { logger } from "@internal/app";
import { logger } from "@internal/fastify-server";
import { logger } from "@internal/fastify_server";
