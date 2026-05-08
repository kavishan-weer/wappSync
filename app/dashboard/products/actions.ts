"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireShop } from "@/lib/auth/dashboard";
import { createServiceClient } from "@/lib/supabase/server";
import {
  parseMoney,
  parseStock,
  parseTags,
  parseVariantValues,
} from "@/lib/products/parse";

function requiredText(formData: FormData, key: string, label: string) {
  const value = String(formData.get(key) ?? "").trim();

  if (!value) {
    throw new Error(`${label} is required.`);
  }

  return value;
}

function getProductPayload(formData: FormData) {
  const status = String(formData.get("status") ?? "active");

  if (status !== "active" && status !== "inactive") {
    throw new Error("Product status is invalid.");
  }

  return {
    name: requiredText(formData, "name", "Product name"),
    description: requiredText(formData, "description", "Description"),
    price: parseMoney(formData.get("price")),
    stock_count: parseStock(formData.get("stock_count")),
    category: String(formData.get("category") ?? "").trim() || null,
    tags: parseTags(formData.get("tags")),
    status,
  };
}

function getVariantRows(shopId: string, productId: string, formData: FormData) {
  const sizes = parseVariantValues(formData.get("sizes")).map((value) => ({
    shop_id: shopId,
    product_id: productId,
    name: "Size",
    value,
  }));
  const colors = parseVariantValues(formData.get("colors")).map((value) => ({
    shop_id: shopId,
    product_id: productId,
    name: "Color",
    value,
  }));

  return [...sizes, ...colors];
}

async function uploadProductImage(
  shopId: string,
  productId: string,
  formData: FormData,
) {
  const serviceClient = createServiceClient();
  const image = formData.get("image");

  if (!(image instanceof File) || image.size === 0) {
    return;
  }

  const safeName = image.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const storagePath = `${shopId}/${productId}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await serviceClient.storage
    .from("product-images")
    .upload(storagePath, image, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const {
    data: { publicUrl },
  } = serviceClient.storage.from("product-images").getPublicUrl(storagePath);

  const { data: existingImages } = await serviceClient
    .from("product_images")
    .select("id, storage_path")
    .eq("shop_id", shopId)
    .eq("product_id", productId)
    .order("sort_order", { ascending: true })
    .limit(1);

  const existingImage = existingImages?.[0];
  const imagePayload = {
    shop_id: shopId,
    product_id: productId,
    storage_path: storagePath,
    public_url: publicUrl,
    alt_text: String(formData.get("name") ?? "Product image"),
  };

  const { error: imageError } = existingImage
    ? await serviceClient
        .from("product_images")
        .update(imagePayload)
        .eq("id", existingImage.id)
    : await serviceClient.from("product_images").insert(imagePayload);

  if (imageError) {
    await serviceClient.storage.from("product-images").remove([storagePath]);
    throw new Error(imageError.message);
  }

  if (existingImage?.storage_path) {
    await serviceClient.storage
      .from("product-images")
      .remove([existingImage.storage_path]);
  }
}

export async function createProduct(formData: FormData) {
  const { supabase, shop } = await requireShop();
  const payload = getProductPayload(formData);

  const { data: product, error } = await supabase
    .from("products")
    .insert({
      ...payload,
      shop_id: shop.id,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const variants = getVariantRows(shop.id, product.id, formData);

  if (variants.length > 0) {
    const { error: variantError } = await supabase
      .from("product_variants")
      .insert(variants);

    if (variantError) {
      throw new Error(variantError.message);
    }
  }

  await uploadProductImage(shop.id, product.id, formData);

  revalidatePath("/dashboard/products");
  redirect("/dashboard/products");
}

export async function updateProduct(productId: string, formData: FormData) {
  const { supabase, shop } = await requireShop();
  const payload = getProductPayload(formData);

  const { error } = await supabase
    .from("products")
    .update(payload)
    .eq("id", productId)
    .eq("shop_id", shop.id);

  if (error) {
    throw new Error(error.message);
  }

  const { error: deleteVariantsError } = await supabase
    .from("product_variants")
    .delete()
    .eq("product_id", productId)
    .eq("shop_id", shop.id);

  if (deleteVariantsError) {
    throw new Error(deleteVariantsError.message);
  }

  const variants = getVariantRows(shop.id, productId, formData);

  if (variants.length > 0) {
    const { error: variantError } = await supabase
      .from("product_variants")
      .insert(variants);

    if (variantError) {
      throw new Error(variantError.message);
    }
  }

  await uploadProductImage(shop.id, productId, formData);

  revalidatePath("/dashboard/products");
  redirect("/dashboard/products");
}

export async function deleteProduct(formData: FormData) {
  const { supabase, shop } = await requireShop();
  const productId = requiredText(formData, "product_id", "Product");

  const { data: images, error: imagesError } = await supabase
    .from("product_images")
    .select("storage_path")
    .eq("shop_id", shop.id)
    .eq("product_id", productId);

  if (imagesError) {
    throw new Error(imagesError.message);
  }

  const storagePaths = (images ?? [])
    .map((image) => image.storage_path)
    .filter(Boolean);

  if (storagePaths.length > 0) {
    const serviceClient = createServiceClient();
    await serviceClient.storage.from("product-images").remove(storagePaths);
  }

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId)
    .eq("shop_id", shop.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/products");
}
