"use client";

import { useMemo, useState } from "react";

type TagPickerProps = {
  name: string;
  options: Array<{
    id: string;
    name: string;
    description?: string;
  }>;
  defaultValue?: string[];
  placeholder?: string;
  emptyText?: string;
  prefix?: string;
};

export function TagPicker({
  name,
  options,
  defaultValue = [],
  placeholder = "选择标签",
  emptyText = "选择后的标签会出现在这里，可以点 × 删除。",
  prefix = "#",
}: TagPickerProps) {
  const [selected, setSelected] = useState<string[]>(defaultValue);
  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const available = options.filter((option) => !selectedSet.has(option.name));
  const optionMap = useMemo(
    () => new Map(options.map((option) => [option.name, option])),
    [options],
  );

  function addTag(value: string) {
    if (!value || selectedSet.has(value)) {
      return;
    }

    setSelected((current) => [...current, value]);
  }

  function removeTag(value: string) {
    setSelected((current) => current.filter((item) => item !== value));
  }

  return (
    <div className="rounded-md border border-white/10 bg-black/24 p-3">
      <select
        value=""
        onChange={(event) => addTag(event.target.value)}
        className="w-full rounded-md border border-white/10 bg-[#090d18] px-3 py-2.5 text-sm text-slate-200 outline-none transition focus:border-cyan-300/50"
      >
        <option value="">
          {available.length > 0 ? placeholder : "没有更多可选项"}
        </option>
        {available.map((option) => (
          <option key={option.id} value={option.name}>
            {option.name}
          </option>
        ))}
      </select>

      <div className="mt-3 min-h-10 rounded-md border border-white/8 bg-white/[0.025] p-2">
        {selected.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selected.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-2 rounded-md border border-cyan-300/20 bg-cyan-300/10 px-2.5 py-1.5 text-xs text-cyan-50"
              >
                <input type="hidden" name={name} value={tag} />
                <span>
                  {prefix}
                  {tag}
                  {optionMap.get(tag)?.description ? (
                    <span className="ml-1 text-cyan-100/55">
                      {optionMap.get(tag)?.description}
                    </span>
                  ) : null}
                </span>
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="rounded-sm px-1 text-cyan-100/70 transition hover:bg-white/10 hover:text-white"
                  aria-label={`删除标签 ${tag}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="px-1 py-2 text-xs text-slate-500">
            {emptyText}
          </p>
        )}
      </div>
    </div>
  );
}
