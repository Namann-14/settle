"use client";

import { useState } from "react";
import { Check, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Skeleton } from "@settle/ui/components/skeleton";
import { cn } from "@settle/ui/lib/utils";

import { Eyebrow, Panel, PanelHeader } from "@/components/dashboard/panel";
import { FormError, controlClass } from "@/components/forms/field";
import {
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  CategoryIcon,
} from "@/components/spending/category-icon";
import { useCreateCategory, useDeleteCategory, useUpdateCategory } from "@/hooks/mutations";
import { useCategories } from "@/hooks/useCategories";
import type { Category } from "@/types";

export function CategoriesPage() {
  const { data: categories, isLoading } = useCategories();
  const system = categories?.filter((c) => c.is_system) ?? [];
  const mine = categories?.filter((c) => !c.is_system) ?? [];

  return (
    <>
      <div className="flex flex-col gap-2">
        <Eyebrow>{categories?.length ?? 0} categories · the AI picks from these</Eyebrow>
        <h1 className="font-display text-4xl leading-none tracking-tight md:text-5xl">
          Your <em className="italic">categories</em>
        </h1>
      </div>

      {isLoading ? (
        <Skeleton className="h-80 rounded-2xl" />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Panel>
            <PanelHeader title="Your own" description="Add categories that fit how you spend." />
            <CategoryEditor key="new" />
            {mine.length > 0 && (
              <ul className="flex flex-col divide-y divide-border/50">
                {mine.map((c) => (
                  <li key={c.id} className="py-2.5">
                    <CustomCategoryRow category={c} />
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel>
            <PanelHeader title="Built in" description="Available to everyone. These can't be changed." />
            <ul className="flex flex-wrap gap-2">
              {system.map((c, i) => (
                <li key={c.id} className="flex items-center gap-2 rounded-full border border-border/70 py-1 pr-3.5 pl-1 text-sm">
                  <CategoryIcon icon={c.icon} color={c.color} index={i} className="size-7 rounded-full" />
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

  if (editing) return <CategoryEditor category={category} onDone={() => setEditing(false)} />;

  return (
    <div className="flex items-center gap-3">
      <CategoryIcon icon={category.icon} color={category.color} />
      <span className="flex-1 truncate text-sm font-medium">{category.name}</span>
      <button
        type="button"
        aria-label={`Edit ${category.name}`}
        onClick={() => setEditing(true)}
        className="flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <Pencil className="size-4" />
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
        className="flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2 className="size-4" />
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

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 rounded-xl bg-muted/50 p-3">
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
          className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground disabled:opacity-50"
        >
          {category ? <Check className="size-4" /> : <Plus className="size-4" />}
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-1" role="radiogroup" aria-label="Icon">
        {Object.entries(CATEGORY_ICONS).map(([key, Icon]) => (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={icon === key}
            aria-label={key}
            onClick={() => setIcon(key)}
            className={cn(
              "flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-card hover:text-foreground",
              icon === key && "bg-card text-foreground ring-1 ring-border",
            )}
          >
            <Icon className="size-4" />
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2" role="radiogroup" aria-label="Color">
        {CATEGORY_COLORS.map((token) => (
          <button
            key={token}
            type="button"
            role="radio"
            aria-checked={color === token}
            aria-label={token}
            onClick={() => setColor(token)}
            className={cn(
              "size-6 rounded-full ring-offset-2 ring-offset-background transition-shadow",
              color === token && "ring-2 ring-foreground/60",
            )}
            style={{ backgroundColor: `var(--${token})` }}
          />
        ))}
        {onDone && (
          <button type="button" onClick={onDone} className="ml-auto text-xs text-muted-foreground hover:text-foreground">
            Cancel
          </button>
        )}
      </div>
      <FormError error={error} />
    </form>
  );
}
