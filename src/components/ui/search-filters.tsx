import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { CARD_TYPES, COLORS, MANA_COSTS } from "@/lib/constants";
import { useLanguage } from "@/contexts/LanguageContext";

// BASIC_LANDS will be created dynamically with translations

interface SearchFiltersProps {
  selectedType: string;
  selectedColor: string;
  selectedManaCost: string;
  selectedBasicLand: string;
  onTypeChange: (type: string) => void;
  onColorChange: (color: string) => void;
  onManaCostChange: (cost: string) => void;
  onBasicLandChange: (basicLand: string) => void;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  selectedType,
  selectedColor,
  selectedManaCost,
  selectedBasicLand,
  onTypeChange,
  onColorChange,
  onManaCostChange,
  onBasicLandChange,
}) => {
  const { t } = useLanguage();
  
  const BASIC_LANDS = [
    { value: "", label: t('deckBuilder.basicLands') },
    { value: "Mountain", label: "Mountain" },
    { value: "Forest", label: "Forest" },
    { value: "Island", label: "Island" },
    { value: "Plains", label: "Plains" },
    { value: "Swamp", label: "Swamp" },
  ];

  const getSelectedLabel = (value: string, options: Array<{ value: string; label: string }>) => {
    const option = options.find(opt => opt.value === value);
    return option ? option.label : options[0].label;
  };

  return (
    <div className="flex flex-row md:flex-row gap-2">
      {/* Type Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="p-2 bg-teal-900 rounded text-white w-full md:w-auto">
            {getSelectedLabel(selectedType, CARD_TYPES)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-gray-900 text-white rounded shadow-md">
          {CARD_TYPES.map((type) => (
            <DropdownMenuItem
              key={type.value}
              onClick={() => onTypeChange(type.value)}
            >
              {type.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Color Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="p-2 bg-teal-900 rounded text-white w-full md:w-auto">
            {getSelectedLabel(selectedColor, COLORS)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-gray-900 text-white rounded shadow-md">
          {COLORS.map((color) => (
            <DropdownMenuItem
              key={color.value}
              onClick={() => onColorChange(color.value)}
            >
              {color.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Mana Cost Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="p-2 bg-teal-900 rounded text-white w-full md:w-auto">
            {getSelectedLabel(selectedManaCost, MANA_COSTS)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-gray-900 text-white rounded shadow-md">
          {MANA_COSTS.map((cost) => (
            <DropdownMenuItem
              key={cost.value}
              onClick={() => onManaCostChange(cost.value)}
            >
              {cost.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Basic Lands Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="p-2 bg-teal-900 rounded text-white w-full md:w-auto">
            {getSelectedLabel(selectedBasicLand, BASIC_LANDS)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-gray-900 text-white rounded shadow-md">
          {BASIC_LANDS.map((land) => (
            <DropdownMenuItem
              key={land.value}
              onClick={() => onBasicLandChange(land.value)}
            >
              {land.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}; 