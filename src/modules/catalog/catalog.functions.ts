import { z } from "zod";
import { createServerFn } from "@tanstack/react-start";

import { getAdminCatalogData, getProductDetailBySlug, getStorefrontData } from "@/modules/catalog/catalog.server";

export const getStorefront = createServerFn({ method: "GET" }).handler(async () => {
  return getStorefrontData();
});

export const getProductBySlug = createServerFn({ method: "GET" })
  .inputValidator(z.object({ slug: z.string().min(1) }))
  .handler(async ({ data }) => {
    return getProductDetailBySlug(data.slug);
  });

export const getAdminCatalog = createServerFn({ method: "GET" }).handler(async () => {
  return getAdminCatalogData();
});
