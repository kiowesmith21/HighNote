
import React from "react";
import { Button } from "@/components/ui/button";

export function TrackFilters({ activeFilter, onFilterChange }) {
  const filters = [
    { label: "All", value: "all" },
    { label: "Latest", value: "latest" },
    { label: "Popular", value: "popular" },
    { label: "Public", value: "public" },
    { label: "Private", value: "private" },
  ];

  return (
    <div className="flex space-x-2 mb-4">
      {filters.map((filter) => (
        <Button
          key={filter.value}
          variant={activeFilter === filter.value ? "default" : "outline"}
          onClick={() => onFilterChange(filter.value)}
          size="sm"
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
}
