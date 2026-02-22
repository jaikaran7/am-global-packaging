"use client";

import * as React from "react";
import { SearchableSelect } from "@/components/ui/select";

export type SelectWithCustomOption = { value: string; label: string; disabled?: boolean };

interface SelectWithCustomProps {
  options: SelectWithCustomOption[];
  value: string;
  onChange: (value: string) => void;
  allowCustom?: boolean;
  customValue?: string;
  onCustomValueChange?: (value: string) => void;
  customLabel?: string;
  customPlaceholder?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  allowClear?: boolean;
  disabled?: boolean;
  className?: string;
  /** When true, show custom input inline when Custom is selected */
  inlineCustomInput?: boolean;
}

const CUSTOM_VALUE = "custom";

/**
 * A searchable select that supports a "➕ Custom" option.
 * When Custom is selected, shows an inline input for custom values.
 */
export function SelectWithCustom({
  options,
  value,
  onChange,
  allowCustom = false,
  customValue = "",
  onCustomValueChange,
  customLabel = "Custom value",
  customPlaceholder = "Enter custom value...",
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  allowClear = true,
  disabled,
  className,
  inlineCustomInput = true,
}: SelectWithCustomProps) {
  const allOptions = React.useMemo(
    () =>
      allowCustom
        ? [...options, { value: CUSTOM_VALUE, label: "➕ Custom" }]
        : options,
    [options, allowCustom]
  );

  const handleChange = React.useCallback(
    (next: string) => {
      onChange(next);
      if (next !== CUSTOM_VALUE && onCustomValueChange) {
        onCustomValueChange("");
      }
    },
    [onChange, onCustomValueChange]
  );

  const isCustomSelected = value === CUSTOM_VALUE;

  return (
    <div className={className ? `space-y-2 ${className}` : "space-y-2"}>
      <SearchableSelect
        options={allOptions}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        searchPlaceholder={searchPlaceholder}
        allowClear={allowClear}
        disabled={disabled}
      />
      {allowCustom &&
        inlineCustomInput &&
        isCustomSelected &&
        onCustomValueChange && (
          <div>
            <label className="block text-xs font-medium text-[#9aa6b0] mb-1">
              {customLabel}
            </label>
            <input
              type="text"
              value={customValue}
              onChange={(e) => onCustomValueChange(e.target.value)}
              placeholder={customPlaceholder}
              disabled={disabled}
              className="admin-btn-secondary w-full py-2 px-3 rounded-xl text-sm"
            />
          </div>
        )}
    </div>
  );
}
