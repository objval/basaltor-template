import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatMoney } from "@/lib/money";
import {
  addLicenseKeys,
  deleteCategory,
  deleteProduct,
  deleteVariant,
  upsertCategory,
  upsertProduct,
  upsertVariant,
} from "@/modules/admin/admin.functions";

function splitLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function CatalogAdmin({
  categories,
  products,
}: {
  categories: Array<{ id: string; name: string; slug: string; description: string | null; sortOrder: number; isActive: boolean }>;
  products: Array<{
    id: string;
    categoryId: string | null;
    name: string;
    slug: string;
    shortDescription: string | null;
    description: string;
    features: Array<string>;
    gallery: Array<string>;
    heroImageUrl: string | null;
    badge: string | null;
    status: "draft" | "active" | "archived";
    isFeatured: boolean;
    category: { id: string; name: string } | null;
    variants: Array<{
      id: string;
      productId: string;
      slug: string;
      name: string;
      description: string | null;
      durationDays: number | null;
      priceMinor: number;
      compareAtPriceMinor: number | null;
      currency: string;
      stockMode: "finite" | "unlimited";
      isDefault: boolean;
      isActive: boolean;
      displayOrder: number;
      availableKeys: number;
    }>;
  }>;
}) {
  const router = useRouter();
  const saveCategoryFn = useServerFn(upsertCategory);
  const deleteCategoryFn = useServerFn(deleteCategory);
  const saveProductFn = useServerFn(upsertProduct);
  const deleteProductFn = useServerFn(deleteProduct);
  const saveVariantFn = useServerFn(upsertVariant);
  const deleteVariantFn = useServerFn(deleteVariant);
  const addKeysFn = useServerFn(addLicenseKeys);
  const [error, setError] = useState<string | null>(null);
  const [pendingKeyTarget, setPendingKeyTarget] = useState<string | null>(null);

  async function refresh() {
    await router.invalidate();
  }

  return (
    <div className="space-y-6">
      {error ? <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert> : null}

      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>Create or update storefront categories. Product rows can later reference these slugs cleanly.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <CategoryEditor
            title="New category"
            submitLabel="Create category"
            onSubmit={async (payload) => {
              setError(null);
              try {
                await saveCategoryFn({ data: payload });
                await refresh();
              } catch (caught) {
                setError(caught instanceof Error ? caught.message : "Failed to save category.");
              }
            }}
          />
          <div className="grid gap-4 md:grid-cols-2">
            {categories.map((category) => (
              <CategoryEditor
                key={category.id}
                title={category.name}
                initial={category}
                submitLabel="Save category"
                onDelete={async () => {
                  setError(null);
                  try {
                    await deleteCategoryFn({ data: { id: category.id } });
                    await refresh();
                  } catch (caught) {
                    setError(caught instanceof Error ? caught.message : "Failed to delete category.");
                  }
                }}
                onSubmit={async (payload) => {
                  setError(null);
                  try {
                    await saveCategoryFn({ data: { ...payload, id: category.id } });
                    await refresh();
                  } catch (caught) {
                    setError(caught instanceof Error ? caught.message : "Failed to save category.");
                  }
                }}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>Use reusable product and variant forms so clones can swap branding and content without touching checkout logic.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ProductEditor
            categoryOptions={categories}
            submitLabel="Create product"
            onSubmit={async (payload) => {
              setError(null);
              try {
                await saveProductFn({ data: payload });
                await refresh();
              } catch (caught) {
                setError(caught instanceof Error ? caught.message : "Failed to save product.");
              }
            }}
          />

          <div className="space-y-6">
            {products.map((product) => (
              <Card key={product.id}>
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <CardTitle className="text-base uppercase tracking-[0.14em]">{product.name}</CardTitle>
                      <CardDescription>{product.slug}</CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {product.category ? <Badge variant="outline">{product.category.name}</Badge> : null}
                      <Badge variant="outline">{product.status}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ProductEditor
                    categoryOptions={categories}
                    initial={product}
                    submitLabel="Save product"
                    onDelete={async () => {
                      setError(null);
                      try {
                        await deleteProductFn({ data: { id: product.id } });
                        await refresh();
                      } catch (caught) {
                        setError(caught instanceof Error ? caught.message : "Failed to delete product.");
                      }
                    }}
                    onSubmit={async (payload) => {
                      setError(null);
                      try {
                        await saveProductFn({ data: { ...payload, id: product.id } });
                        await refresh();
                      } catch (caught) {
                        setError(caught instanceof Error ? caught.message : "Failed to save product.");
                      }
                    }}
                  />

                  <div className="space-y-4 border-t border-border pt-6">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Variants</p>
                    </div>
                    <VariantEditor
                      productId={product.id}
                      submitLabel="Create variant"
                      onSubmit={async (payload) => {
                        setError(null);
                        try {
                          await saveVariantFn({ data: payload });
                          await refresh();
                        } catch (caught) {
                          setError(caught instanceof Error ? caught.message : "Failed to save variant.");
                        }
                      }}
                    />
                    <div className="grid gap-4 lg:grid-cols-2">
                      {product.variants.map((variant) => (
                        <Card key={variant.id}>
                          <CardHeader>
                            <div className="flex items-center justify-between gap-2">
                              <div>
                                <CardTitle className="text-sm uppercase tracking-[0.14em]">{variant.name}</CardTitle>
                                <CardDescription>{formatMoney(variant.priceMinor, variant.currency)} · {variant.availableKeys} keys</CardDescription>
                              </div>
                              <Badge variant="outline">{variant.stockMode}</Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <VariantEditor
                              productId={product.id}
                              initial={variant}
                              submitLabel="Save variant"
                              onDelete={async () => {
                                setError(null);
                                try {
                                  await deleteVariantFn({ data: { id: variant.id } });
                                  await refresh();
                                } catch (caught) {
                                  setError(caught instanceof Error ? caught.message : "Failed to delete variant.");
                                }
                              }}
                              onSubmit={async (payload) => {
                                setError(null);
                                try {
                                  await saveVariantFn({ data: { ...payload, id: variant.id } });
                                  await refresh();
                                } catch (caught) {
                                  setError(caught instanceof Error ? caught.message : "Failed to save variant.");
                                }
                              }}
                            />
                            <div className="space-y-2 border-t border-border pt-4">
                              <Label htmlFor={`keys-${variant.id}`}>Bulk-add keys</Label>
                              <BulkKeysEditor
                                id={`keys-${variant.id}`}
                                pending={pendingKeyTarget === variant.id}
                                onSubmit={async (keys) => {
                                  setError(null);
                                  setPendingKeyTarget(variant.id);
                                  try {
                                    await addKeysFn({ data: { variantId: variant.id, poolName: `${variant.name} Pool`, keys } });
                                    await refresh();
                                  } catch (caught) {
                                    setError(caught instanceof Error ? caught.message : "Failed to add license keys.");
                                  } finally {
                                    setPendingKeyTarget(null);
                                  }
                                }}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CategoryEditor({
  title,
  submitLabel,
  initial,
  onSubmit,
  onDelete,
}: {
  title: string;
  submitLabel: string;
  initial?: { id: string; name: string; slug: string; description: string | null; sortOrder: number; isActive: boolean };
  onSubmit: (payload: { name: string; slug: string; description: string; sortOrder: number; isActive: boolean }) => Promise<void>;
  onDelete?: () => Promise<void>;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [sortOrder, setSortOrder] = useState(String(initial?.sortOrder ?? 0));
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [pending, setPending] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm uppercase tracking-[0.14em]">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-3"
          onSubmit={async (event) => {
            event.preventDefault();
            setPending(true);
            try {
              await onSubmit({ name, slug, description, sortOrder: Number(sortOrder) || 0, isActive });
            } finally {
              setPending(false);
            }
          }}
        >
          <Field label="Name"><Input value={name} onChange={(event) => setName(event.target.value)} required /></Field>
          <Field label="Slug"><Input value={slug} onChange={(event) => setSlug(event.target.value)} required /></Field>
          <Field label="Description"><Textarea value={description} onChange={(event) => setDescription(event.target.value)} className="min-h-20" /></Field>
          <Field label="Sort order"><Input type="number" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} /></Field>
          <label className="flex items-center gap-2 text-xs uppercase tracking-[0.14em]"><input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} /> Active</label>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={pending}>{pending ? "Saving…" : submitLabel}</Button>
            {onDelete ? <Button type="button" variant="outline" disabled={pending} onClick={() => void onDelete()}>Delete</Button> : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function ProductEditor({
  categoryOptions,
  submitLabel,
  initial,
  onSubmit,
  onDelete,
}: {
  categoryOptions: Array<{ id: string; name: string }>;
  submitLabel: string;
  initial?: {
    id: string;
    categoryId: string | null;
    name: string;
    slug: string;
    shortDescription: string | null;
    description: string;
    features: Array<string>;
    gallery: Array<string>;
    heroImageUrl: string | null;
    badge: string | null;
    status: "draft" | "active" | "archived";
    isFeatured: boolean;
  };
  onSubmit: (payload: {
    categoryId: string | null;
    name: string;
    slug: string;
    shortDescription: string;
    description: string;
    features: Array<string>;
    gallery: Array<string>;
    heroImageUrl: string;
    badge: string;
    status: "draft" | "active" | "archived";
    isFeatured: boolean;
  }) => Promise<void>;
  onDelete?: () => Promise<void>;
}) {
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [shortDescription, setShortDescription] = useState(initial?.shortDescription ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [features, setFeatures] = useState((initial?.features ?? []).join("\n"));
  const [gallery, setGallery] = useState((initial?.gallery ?? []).join("\n"));
  const [heroImageUrl, setHeroImageUrl] = useState(initial?.heroImageUrl ?? "");
  const [badge, setBadge] = useState(initial?.badge ?? "");
  const [status, setStatus] = useState<"draft" | "active" | "archived">(initial?.status ?? "draft");
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured ?? false);
  const [pending, setPending] = useState(false);

  return (
    <form
      className="grid gap-3 md:grid-cols-2"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        try {
          await onSubmit({
            categoryId: categoryId || null,
            name,
            slug,
            shortDescription,
            description,
            features: splitLines(features),
            gallery: splitLines(gallery),
            heroImageUrl,
            badge,
            status,
            isFeatured,
          });
        } finally {
          setPending(false);
        }
      }}
    >
      <Field label="Category">
        <select className="h-8 border border-input bg-transparent px-2.5 text-xs" value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
          <option value="">Uncategorized</option>
          {categoryOptions.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
      </Field>
      <Field label="Status">
        <select className="h-8 border border-input bg-transparent px-2.5 text-xs" value={status} onChange={(event) => setStatus(event.target.value as "draft" | "active" | "archived") }>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
      </Field>
      <Field label="Name"><Input value={name} onChange={(event) => setName(event.target.value)} required /></Field>
      <Field label="Slug"><Input value={slug} onChange={(event) => setSlug(event.target.value)} required /></Field>
      <Field label="Badge"><Input value={badge} onChange={(event) => setBadge(event.target.value)} /></Field>
      <Field label="Hero image URL"><Input value={heroImageUrl} onChange={(event) => setHeroImageUrl(event.target.value)} placeholder="https://…" /></Field>
      <div className="md:col-span-2"><Field label="Short description"><Textarea value={shortDescription} onChange={(event) => setShortDescription(event.target.value)} className="min-h-20" /></Field></div>
      <div className="md:col-span-2"><Field label="Description"><Textarea value={description} onChange={(event) => setDescription(event.target.value)} className="min-h-24" required /></Field></div>
      <Field label="Features (one per line)"><Textarea value={features} onChange={(event) => setFeatures(event.target.value)} className="min-h-24" /></Field>
      <Field label="Gallery URLs (one per line)"><Textarea value={gallery} onChange={(event) => setGallery(event.target.value)} className="min-h-24" /></Field>
      <label className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] md:col-span-2"><input type="checkbox" checked={isFeatured} onChange={(event) => setIsFeatured(event.target.checked)} /> Featured product</label>
      <div className="flex flex-wrap gap-2 md:col-span-2">
        <Button type="submit" disabled={pending}>{pending ? "Saving…" : submitLabel}</Button>
        {onDelete ? <Button type="button" variant="outline" disabled={pending} onClick={() => void onDelete()}>Delete product</Button> : null}
      </div>
    </form>
  );
}

function VariantEditor({
  productId,
  submitLabel,
  initial,
  onSubmit,
  onDelete,
}: {
  productId: string;
  submitLabel: string;
  initial?: {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    durationDays: number | null;
    priceMinor: number;
    compareAtPriceMinor: number | null;
    currency: string;
    stockMode: "finite" | "unlimited";
    isDefault: boolean;
    isActive: boolean;
    displayOrder: number;
  };
  onSubmit: (payload: {
    productId: string;
    slug: string;
    name: string;
    description: string;
    durationDays: number | null;
    priceMinor: number;
    compareAtPriceMinor: number | null;
    currency: string;
    stockMode: "finite" | "unlimited";
    isDefault: boolean;
    isActive: boolean;
    displayOrder: number;
  }) => Promise<void>;
  onDelete?: () => Promise<void>;
}) {
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [durationDays, setDurationDays] = useState(initial?.durationDays ? String(initial.durationDays) : "");
  const [priceMinor, setPriceMinor] = useState(String(initial?.priceMinor ?? 0));
  const [compareAtPriceMinor, setCompareAtPriceMinor] = useState(initial?.compareAtPriceMinor ? String(initial.compareAtPriceMinor) : "");
  const [currency, setCurrency] = useState(initial?.currency ?? "USD");
  const [stockMode, setStockMode] = useState<"finite" | "unlimited">(initial?.stockMode ?? "finite");
  const [displayOrder, setDisplayOrder] = useState(String(initial?.displayOrder ?? 0));
  const [isDefault, setIsDefault] = useState(initial?.isDefault ?? false);
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [pending, setPending] = useState(false);

  return (
    <form
      className="grid gap-3"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        try {
          await onSubmit({
            productId,
            slug,
            name,
            description,
            durationDays: durationDays ? Number(durationDays) : null,
            priceMinor: Number(priceMinor) || 0,
            compareAtPriceMinor: compareAtPriceMinor ? Number(compareAtPriceMinor) : null,
            currency,
            stockMode,
            isDefault,
            isActive,
            displayOrder: Number(displayOrder) || 0,
          });
        } finally {
          setPending(false);
        }
      }}
    >
      <Field label="Variant name"><Input value={name} onChange={(event) => setName(event.target.value)} required /></Field>
      <Field label="Variant slug"><Input value={slug} onChange={(event) => setSlug(event.target.value)} required /></Field>
      <Field label="Price (minor units)"><Input type="number" value={priceMinor} onChange={(event) => setPriceMinor(event.target.value)} required /></Field>
      <Field label="Compare-at price"><Input type="number" value={compareAtPriceMinor} onChange={(event) => setCompareAtPriceMinor(event.target.value)} /></Field>
      <Field label="Duration days"><Input type="number" value={durationDays} onChange={(event) => setDurationDays(event.target.value)} /></Field>
      <Field label="Currency"><Input value={currency} onChange={(event) => setCurrency(event.target.value.toUpperCase())} maxLength={3} /></Field>
      <Field label="Stock mode">
        <select className="h-8 border border-input bg-transparent px-2.5 text-xs" value={stockMode} onChange={(event) => setStockMode(event.target.value as "finite" | "unlimited") }>
          <option value="finite">Finite</option>
          <option value="unlimited">Unlimited</option>
        </select>
      </Field>
      <Field label="Display order"><Input type="number" value={displayOrder} onChange={(event) => setDisplayOrder(event.target.value)} /></Field>
      <Field label="Description"><Textarea value={description} onChange={(event) => setDescription(event.target.value)} className="min-h-20" /></Field>
      <label className="flex items-center gap-2 text-xs uppercase tracking-[0.14em]"><input type="checkbox" checked={isDefault} onChange={(event) => setIsDefault(event.target.checked)} /> Default option</label>
      <label className="flex items-center gap-2 text-xs uppercase tracking-[0.14em]"><input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} /> Active option</label>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending}>{pending ? "Saving…" : submitLabel}</Button>
        {onDelete ? <Button type="button" variant="outline" disabled={pending} onClick={() => void onDelete()}>Delete variant</Button> : null}
      </div>
    </form>
  );
}

function BulkKeysEditor({ id, pending, onSubmit }: { id: string; pending: boolean; onSubmit: (keys: Array<string>) => Promise<void> }) {
  const [keysText, setKeysText] = useState("");
  return (
    <form
      className="space-y-3"
      onSubmit={async (event) => {
        event.preventDefault();
        const keys = splitLines(keysText);
        if (!keys.length) return;
        await onSubmit(keys);
        setKeysText("");
      }}
    >
      <Textarea id={id} value={keysText} onChange={(event) => setKeysText(event.target.value)} className="min-h-24 font-mono text-xs" placeholder="ONE-KEY-PER-LINE" />
      <Button type="submit" disabled={pending || !keysText.trim()}>{pending ? "Uploading…" : "Add keys"}</Button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
