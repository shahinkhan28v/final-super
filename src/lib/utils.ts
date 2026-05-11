import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function openExternalLink(url: string) {
  if (!url) return;
  
  // Create a hidden link element
  const link = document.createElement('a');
  link.href = url;
  
  // Set target and security attributes
  link.setAttribute('target', '_blank');
  link.setAttribute('rel', 'noopener noreferrer');
  
  // For Android WebViews, sometimes specifically requesting Chrome via intent
  // is possible, but general _blank is usually better if handled by the native app.
  
  // Append to body, click, and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
