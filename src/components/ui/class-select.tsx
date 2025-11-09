'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap } from "lucide-react";

interface ClassSelectProps {
  readonly value?: string;
  readonly onValueChange?: (value: string) => void;
  readonly placeholder?: string;
  readonly className?: string;
}

const classOptions = [
  { value: "1", label: "Lớp 1" },
  { value: "2", label: "Lớp 2" },
  { value: "3", label: "Lớp 3" },
  { value: "4", label: "Lớp 4" },
  { value: "5", label: "Lớp 5" },
  { value: "6", label: "Lớp 6" },
  { value: "7", label: "Lớp 7" },
  { value: "8", label: "Lớp 8" },
  { value: "9", label: "Lớp 9" },
  { value: "10", label: "Lớp 10" },
  { value: "11", label: "Lớp 11" },
  { value: "12", label: "Lớp 12" },
];

export default function ClassSelect({ 
  value, 
  onValueChange, 
  placeholder = "Chọn lớp học",
  className = ""
}: ClassSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={`bg-black/40 border-purple-400/30 text-white rounded-xl backdrop-blur-sm focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 hover:border-purple-400/50 ${className}`}>
        <div className="flex items-center gap-2">
          <GraduationCap className="size-4 text-purple-400" />
          <SelectValue placeholder={placeholder} />
        </div>
      </SelectTrigger>
      <SelectContent className="bg-black/90 backdrop-blur-xl border-purple-400/30 rounded-xl">
        {classOptions.map((option) => (
          <SelectItem 
            key={option.value} 
            value={option.value}
            className="text-white hover:bg-purple-500/20 focus:bg-purple-500/20 transition-colors duration-200"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
