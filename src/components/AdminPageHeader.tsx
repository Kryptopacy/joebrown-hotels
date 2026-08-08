import React from 'react';
import { LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface AdminPageHeaderProps {
  title: string;
  icon?: LucideIcon;
  subtitle?: string;
  breadcrumbs?: { label: string; href?: string }[];
  action?: React.ReactNode;
}

export default function AdminPageHeader({ title, icon: Icon, subtitle, breadcrumbs, action }: AdminPageHeaderProps) {
  return (
    <div className="w-full bg-[#0D0501] border-b border-white/10 shadow-sm relative overflow-hidden -mt-4 md:-mt-10 mb-8 -mx-6 md:-mx-10 px-6 md:px-10 py-6 md:py-8">
      {/* Subtle top-edge accent glow */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#D4A373]/30 to-transparent"></div>
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10 max-w-7xl mx-auto w-full">
        <div className="flex flex-col gap-2">
          {/* Breadcrumbs */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <div className="flex items-center gap-2 text-xs font-semibold text-white/50 mb-1 tracking-wider uppercase">
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  {crumb.href ? (
                    <Link href={crumb.href} className="hover:text-[#D4A373] transition-colors">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-[#D4A373]">{crumb.label}</span>
                  )}
                  {idx < breadcrumbs.length - 1 && <span className="text-white/20">/</span>}
                </React.Fragment>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3">
            {Icon && (
              <div className="p-2 rounded-xl bg-[#1A0A02] border border-white/5 shadow-inner">
                <Icon size={24} className="text-[#D4A373]" />
              </div>
            )}
            <h1 className="text-2xl md:text-3xl font-serif text-white font-bold tracking-wide">
              {title}
            </h1>
          </div>
          
          {subtitle && (
            <p className="text-sm text-brown-400/80 font-medium mt-1">
              {subtitle}
            </p>
          )}
        </div>

        {/* Action Slot */}
        {action && (
          <div className="flex items-center gap-3 shrink-0">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}
