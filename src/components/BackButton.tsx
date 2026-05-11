import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { cn } from '../lib/utils';

interface BackButtonProps {
  className?: string;
  label?: string;
}

export default function BackButton({ className, label = 'Back' }: BackButtonProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className={cn(
        "flex items-center gap-1 text-slate-600 hover:text-indigo-600 transition-colors font-medium cursor-pointer",
        className
      )}
      id="back-button"
    >
      <ChevronLeft size={20} />
      <span>{label}</span>
    </button>
  );
}
