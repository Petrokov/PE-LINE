"use client";

interface DeleteButtonProps {
  action: () => Promise<void>;
  label?: string;
}

export function DeleteButton({ action, label = "Obriši" }: DeleteButtonProps) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm("Sigurno obrisati?")) e.preventDefault();
      }}
    >
      <button type="submit" className="text-sm text-red-600 hover:underline cursor-pointer">
        {label}
      </button>
    </form>
  );
}
