'use client';

import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, X } from "lucide-react";
import { useState } from "react";

export function ProfileCompletionBanner() {
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-pink-500/20 border-b border-amber-400/30 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="flex-shrink-0">
              <AlertCircle className="size-6 text-amber-400 animate-pulse" />
            </div>
            <div className="flex-1">
              <p className="text-white font-medium text-sm md:text-base">
                🎯 Hồ sơ của bạn chưa hoàn thiện!
              </p>
              <p className="text-amber-200/80 text-xs md:text-sm">
                Vui lòng cung cấp thêm thông tin để có trải nghiệm tốt nhất
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/profile/complete")}
              className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-400 hover:to-violet-400 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 hover:scale-105"
            >
              Hoàn thiện ngay
              <ArrowRight className="size-4" />
            </button>
            
            <button
              onClick={() => setDismissed(true)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Đóng"
            >
              <X className="size-5 text-white/70" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}