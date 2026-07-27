import type { Product } from "@/lib/types";

type Spec = Product["specs"][number];

interface ProductSpecsProps {
  specs: Spec[];
  title?: string;
}

export function ProductSpecs({ specs, title = "Tehničke specifikacije" }: ProductSpecsProps) {
  if (!specs || specs.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-semibold text-muted uppercase tracking-widest mb-4">{title}</h3>
      <div className="border border-line rounded-[10px] overflow-hidden">
        {specs.map((spec, index) => (
          <div
            key={spec.key}
            className={`flex items-center px-4 py-3 ${
              index % 2 === 0 ? "bg-bg" : "bg-white"
            } ${index < specs.length - 1 ? "border-b border-line" : ""}`}
          >
            <span className="text-sm text-muted w-1/2 font-medium">{spec.key}</span>
            <span className="text-sm text-ink font-spec font-medium w-1/2">{spec.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
