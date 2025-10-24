'use client';

import { useState, useRef } from 'react';
import { Input } from "@/components/ui/input";

interface OTPInputProps {
  readonly length?: number;
  readonly onComplete: (otp: string) => void;
  readonly onChange?: (otp: string) => void;
  readonly className?: string;
}

export default function OTPInput({ 
  length = 6, 
  onComplete, 
  onChange,
  className = "" 
}: OTPInputProps) {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [inputIds] = useState(() => Array.from({ length }, (_, i) => `otp-${i}-${Date.now()}`));

  const handleChange = (element: HTMLInputElement, index: number) => {
    const value = element.value.replaceAll(/\D/g, '');
    
    if (value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      const otpString = newOtp.join('');
      onChange?.(otpString);
      
      if (otpString.length === length) {
        onComplete(otpString);
      }
      
      // Focus next input
      if (value && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replaceAll(/\D/g, '');
    
    if (pastedData.length <= length) {
      const newOtp = [...otp];
      for (let i = 0; i < pastedData.length && i < length; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);
      
      const otpString = newOtp.join('');
      onChange?.(otpString);
      
      if (otpString.length === length) {
        onComplete(otpString);
      }
      
      // Focus last filled input
      const lastFilledIndex = Math.min(pastedData.length - 1, length - 1);
      inputRefs.current[lastFilledIndex]?.focus();
    }
  };

  return (
    <div className={`flex gap-3 justify-center ${className}`}>
      {otp.map((digit, index) => (
        <Input
          key={inputIds[index]}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(e.target, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          className="w-12 h-12 text-center text-2xl font-mono font-bold bg-black/40 border-purple-400/30 text-white rounded-xl backdrop-blur-sm focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 hover:border-purple-400/50"
        />
      ))}
    </div>
  );
}
