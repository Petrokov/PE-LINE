import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAllCategories } from "@/lib/queries";
import { updateProduct } from "@/lib/actions/products";
import { ProductForm } from "@/components/admin/product-form";
import type { Product } from "@/lib/types";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: product }, categories] = await Promise.all([
    supabase
      .from("products")
      .select(
        "id, name_hr, name_sl, name_en, slug, description_hr, description_sl, description_en, " +
          "images, specs, price_range, featured, categoryId:category_id"
      )
      .eq("id", id)
      .maybeSingle(),
    getAllCategories(),
  ]);

  if (!product) notFound();

  return (
    <div>
      <h1 className="text-xl font-bold text-ink mb-6">Uredi proizvod</h1>
      <ProductForm
        action={updateProduct.bind(null, id)}
        product={product as unknown as Product}
        categories={categories}
        submitLabel="Spremi promjene"
      />
    </div>
  );
}
