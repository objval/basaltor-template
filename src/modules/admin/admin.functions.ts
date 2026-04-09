import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  addLicenseKeysToVariant,
  getAdminPageData,
  removeCategory,
  removeProduct,
  removeVariant,
  saveCategory,
  saveProduct,
  saveVariant,
} from "@/modules/admin/admin.server";
import {
  bulkLicenseKeysInputSchema,
  categoryInputSchema,
  productInputSchema,
  variantInputSchema,
} from "@/modules/catalog/catalog.schemas";

export const getAdminData = createServerFn({ method: "GET" }).handler(async () => {
  return getAdminPageData();
});

export const upsertCategory = createServerFn({ method: "POST" })
  .inputValidator(categoryInputSchema)
  .handler(async ({ data }) => {
    await saveCategory(data);
    return { success: true };
  });

export const deleteCategory = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    await removeCategory(data.id);
    return { success: true };
  });

export const upsertProduct = createServerFn({ method: "POST" })
  .inputValidator(productInputSchema)
  .handler(async ({ data }) => {
    await saveProduct(data);
    return { success: true };
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    await removeProduct(data.id);
    return { success: true };
  });

export const upsertVariant = createServerFn({ method: "POST" })
  .inputValidator(variantInputSchema)
  .handler(async ({ data }) => {
    await saveVariant(data);
    return { success: true };
  });

export const deleteVariant = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    await removeVariant(data.id);
    return { success: true };
  });

export const addLicenseKeys = createServerFn({ method: "POST" })
  .inputValidator(bulkLicenseKeysInputSchema)
  .handler(async ({ data }) => {
    return addLicenseKeysToVariant(data);
  });
