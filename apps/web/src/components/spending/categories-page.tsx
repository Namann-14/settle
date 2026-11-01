"use client";

import { useState } from "react";
import { Check, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@settle/ui/lib/utils";

import { PageHeader, Panel, PanelHeader, buttonClass, rowClass } from "@/components/dashboard/panel";
import { FormError, controlClass } from "@/components/forms/field";
import { CATEGORY_COLORS, CATEGORY_ICONS, CategoryIcon } from "@/components/spending/category-icon";
import { EmptyLine, LoadError, PanelSkeleton } from "@/components/spending/states";
import { useCreateCategory, useDeleteCategory, useUpdateCategory } from "@/hooks/mutations";
import { useCategories } from "@/hooks/useCategories";
import type { Category } from "@/types";

export function CategoriesPage() {
  const { data: categories, isLoading, isError, refetch } = useCategories();
  const system = categories?.filter((c) => c.is_system) ?? [];
  const mine = categories?.filter((c) => !c.is_system) ?? [];

  return (
    <>
      <PageHeader
        title="Categories"
        description={
          categories
            ? `${categories.length} categories. Settle AI picks from these when it drafts an expense.`
            : "Settle AI picks from these when it drafts an expense."
        }
      />

      {isLoading ? (
        <div aria-busy aria-label="Loading categories" className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <PanelSkeleton rows={3} />
          <PanelSkeleton rows={3} />
        </div>
      ) : isError || !categories ? (
        <Panel>
          <LoadError what="your categories" onRetry={() => refetch()} />
        </Panel>
      ) : (
        <div className="grid animate-fade-in grid-cols-1 items-start gap-4 lg:grid-cols-2">
          <Panel>
            <PanelHeader title="Your own" description="Add categories that fit how you spend." />
            <CategoryEditor key="new" />
            {mine.length === 0 ? (
              <EmptyLine>None yet. Add one above for anything the built-in ones miss.</EmptyLine>
            ) : (
              <ul className="flex flex-col">
                {mine.map((c) => (
                  <li key={c.id} className="border-b border-border/50 last:border-b-0">
                    <CustomCategoryRow category={c} />
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel>
            <PanelHeader title="Built in" description="Available to everyone. These can’t be changed." />
            <ul className="flex flex-wrap gap-2">
              {system.map((c, i) => (
                <li
                  key={c.id}
                  className="flex items-center gap-2 rounded-full border border-border py-1 pr-3.5 pl-1 text-sm"
                >
                  <CategoryIcon icon={c.icon} color={c.color} index={i} className="size-7" />
                  {c.name}
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      )}
    </>
  );
}

function CustomCategoryRow({ category }: { category: Category }) {
  const [editing, setEditing] = useState(false);
  const deleteCategory = useDeleteCategory();

  if (editing)
    return (
      <div className="py-3">
        <CategoryEditor category={category} onDone={() => setEditing(false)} />
      </div>
    );

  const iconButton = "w-11 px-0 sm:w-8";

  return (
    <div className={cn(rowClass, "justify-start gap-3 py-2")}>
      <CategoryIcon icon={category.icon} color={category.color} />
      <span className="flex-1 truncate font-medium">{category.name}</span>
      <button
        type="button"
        aria-label={`Edit ${category.name}`}
        onClick={() => setEditing(true)}
        className={buttonClass({ variant: "ghost", size: "sm", className: iconButton })}
      >
        <Pencil />
      </button>
      <button
        type="button"
        aria-label={`Delete ${category.name}`}
        disabled={deleteCategory.isPending}
        onClick={async () => {
          if (!window.confirm(`Delete “${category.name}”? Its expenses become uncategorized and its budget is removed.`))
            return;
          try {
            await deleteCategory.mutateAsync(category.id);
            toast.success("Category deleted");
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Couldn't delete");
          }
        }}
        className={buttonClass({
          variant: "ghost",
          size: "sm",
          className: cn(iconButton, "hover:bg-destructive/10 hover:text-destructive"),
        })}
      >
        <Trash2 />
      </button>
    </div>
  );
}

/** Create form when `category` is omitted, inline edit form otherwise. */
function CategoryEditor({ category, onDone }: { category?: Category; onDone?: () => void }) {
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const [name, setName] = useState(category?.name ?? "");
  const [icon, setIcon] = useState(category?.icon ?? "tag");
  const [color, setColor] = useState(category?.color ?? "chart-1");
  const [error, setError] = useState<unknown>(null);
  const busy = createCategory.isPending || updateCategory.isPending;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    const data = { name: name.trim(), icon, color };
    try {
      if (category) {
        await updateCategory.mutateAsync({ id: category.id, data });
        toast.success("Category updated");
      } else {
        await createCategory.mutateAsync(data);
        toast.success(`Added “${data.name}”`);
        setName("");
      }
      onDone?.();
    } catch (err) {
      setError(err);
    }
  };

  const pick =
    "flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors duration-150 outline-none hover:bg-card hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 sm:size-8";

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 rounded-xl border border-border bg-muted/40 p-3">
      <div className="flex gap-2">
        <CategoryIcon icon={icon} color={color} className="size-10" />
        <input
          required
          maxLength={100}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category, e.g. Pets"
          aria-label="Category name"
          className={controlClass}
        />
        <button
          type="submit"
          disabled={busy || !name.trim()}
          aria-label={category ? "Save category" : "Add category"}
          className={buttonClass({ className: "h-10 w-10 px-0 sm:h-10" })}
        >
          {category ? <Check /> : <Plus />}
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-0.5" role="radiogroup" aria-label="Icon">
        {Object.entries(CATEGORY_ICONS).map(([key, Icon]) => (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={icon === key}
            aria-label={key}
            onClick={() => setIcon(key)}
            className={cn(pick, icon === key && "bg-card text-foreground ring-1 ring-border")}
          >
            <Icon className="size-4" />
          </button>
        ))}
      </div>
      <div className="flex items-center gap-0.5" role="radiogroup" aria-label="Color">
        {CATEGORY_COLORS.map((token) => (
          <button
            key={token}
            type="button"
            role="radio"
            aria-checked={color === token}
            aria-label={token}
            onClick={() => setColor(token)}
            className={cn(pick, color === token && "bg-card ring-1 ring-border")}
          >
            <span className="size-5 rounded-full" style={{ backgroundColor: `var(--${token})` }} />
          </button>
        ))}
        {onDone && (
          <button
            type="button"
            onClick={onDone}
            className={buttonClass({ variant: "ghost", size: "sm", className: "ml-auto" })}
          >
            Cancel
          </button>
        )}
      </div>
      <FormError error={error} />
    </form>
  );
}
