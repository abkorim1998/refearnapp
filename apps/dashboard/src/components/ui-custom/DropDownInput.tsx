"use client"

import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

type DropdownInputProps = {
  label: string
  value: string
  options: { label: string; value: string; image?: string | null }[]
  onChange?: (val: string) => void
  disabled?: boolean
  placeholder?: string
  width?: string
  selectOpen?: boolean
  setSelectOpen?: (open: boolean) => void
  includeFooter?: boolean
  onFooterClick?: () => void
}

export const DropdownInput = ({
  label,
  value,
  options,
  onChange,
  disabled,
  placeholder = "Select an option",
  width,
  selectOpen,
  setSelectOpen,
  includeFooter = false,
  onFooterClick,
}: DropdownInputProps) => (
  <div className="space-y-1 w-full">
    <Label className="text-xs font-medium">{label}</Label>
    <Select
      value={value}
      onValueChange={onChange}
      disabled={disabled}
      open={selectOpen}
      onOpenChange={setSelectOpen}
    >
      <SelectTrigger
        affiliate={false}
        className={cn("w-full", width)}
        disabled={disabled}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent affiliate={false}>
        {options.map((opt) => (
          <SelectItem affiliate={false} key={opt.value} value={opt.value}>
            <div className="flex items-center space-x-2">
              {opt.image ? (
                <img src={opt.image} alt={opt.label} className="w-5 h-5 rounded object-cover" />
              ) : (
                <div className="w-5 h-5 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                  {opt.label.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="truncate">{opt.label}</span>
            </div>
          </SelectItem>
        ))}
        {includeFooter && (
          <div className="sticky bottom-0 mt-1 border-t border-border bg-background p-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-sm font-medium"
              onClick={() => {
                onFooterClick?.()
              }}
            >
              <Plus className="w-4 h-4 mr-2" /> Add Org
            </Button>
          </div>
        )}
      </SelectContent>
    </Select>
  </div>
)
