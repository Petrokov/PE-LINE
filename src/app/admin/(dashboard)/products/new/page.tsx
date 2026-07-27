import { getAllCategories } from "@/lib/queries";
import { createProduct } from "@/lib/actions/products";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage() {
  const categories = await getAllCategories();

  return (
    <div>
      <h1 className="text-xl font-bold text-ink mb-6">Novi proizvod</h1>
      <ProductForm action={createProduct} categories={categories} submitLabel="Spremi" />
    </div>
  );
}
