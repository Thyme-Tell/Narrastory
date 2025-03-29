
import React, { useState } from "react";
import { CollapsibleDropdown, DropdownItem } from "@/components/ui/collapsible-dropdown";

const CollapsibleDropdownDemo = () => {
  const [items, setItems] = useState<DropdownItem[]>([
    { id: "1", label: "Option 1", isSelected: true },
    { id: "2", label: "Option 2", isSelected: false },
    { id: "3", label: "Option 3", isSelected: false },
    { id: "4", label: "Option 4", isSelected: false },
    { id: "5", label: "Option 5", isSelected: false },
  ]);

  const handleItemSelect = (selectedItem: DropdownItem) => {
    setItems(
      items.map((item) => ({
        ...item,
        isSelected: item.id === selectedItem.id,
      }))
    );
  };

  return (
    <div className="w-full max-w-xs mx-auto p-4">
      <h2 className="text-lg font-medium mb-4">Collapsible Dropdown Example</h2>
      <CollapsibleDropdown
        items={items}
        onItemSelect={handleItemSelect}
        placeholder="Select an option"
      />
    </div>
  );
};

export default CollapsibleDropdownDemo;
