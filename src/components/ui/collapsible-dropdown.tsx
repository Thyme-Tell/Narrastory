
import React, { useState } from "react";
import { ChevronDown, ChevronUp, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export interface DropdownItem {
  id: string;
  label: string;
  isSelected: boolean;
}

interface CollapsibleDropdownProps {
  items: DropdownItem[];
  onItemSelect?: (item: DropdownItem) => void;
  className?: string;
  placeholder?: string;
}

export function CollapsibleDropdown({
  items,
  onItemSelect,
  className,
  placeholder = "Select an item",
}: CollapsibleDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DropdownItem | undefined>(
    items.find((item) => item.isSelected)
  );

  const handleItemClick = (item: DropdownItem) => {
    setSelectedItem(item);
    setIsOpen(false);
    if (onItemSelect) {
      onItemSelect(item);
    }
  };

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={cn("w-full border rounded-md border-input bg-background", className)}
    >
      <CollapsibleTrigger className="flex w-full items-center justify-between px-3 py-2 text-sm">
        <span className={cn(selectedItem ? "text-foreground" : "text-muted-foreground")}>
          {selectedItem ? selectedItem.label : placeholder}
        </span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent className="border-t border-input">
        <div className="max-h-[200px] overflow-auto">
          {items.map((item) => (
            <div
              key={item.id}
              className={cn(
                "flex items-center justify-between py-2 px-3 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground",
                item.id === selectedItem?.id && "bg-accent/50"
              )}
              onClick={() => handleItemClick(item)}
            >
              <span>{item.label}</span>
              {item.id === selectedItem?.id && <Check className="h-4 w-4" />}
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
