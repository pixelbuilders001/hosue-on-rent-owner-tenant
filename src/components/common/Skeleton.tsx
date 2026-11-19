import React from 'react';
import { TabType } from '../layout/Sidebar';

// Base pulse shimmer element
export interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-slate-200/80 rounded-xl ${className}`}
      aria-hidden="true"
    />
  );
};

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className = ''
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-3.5 ${
            i === lines - 1 ? 'w-3/5' : i === 0 ? 'w-full' : 'w-4/5'
          }`}
        />
      ))}
    </div>
  );
};

export const SkeletonCard: React.FC<{ className?: string; children?: React.ReactNode }> = ({
  className = '',
  children
}) => {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3 ${className}`}>
      {children || (
        <>
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-8 w-8 rounded-xl" />
          </div>
          <Skeleton className="h-7 w-1/2" />
          <Skeleton className="h-3 w-3/4" />
        </>
      )}
    </div>
  );
};

// 1. Overview / Dashboard Tab Skeleton
export const OverviewSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Property Header Skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-52 sm:w-64" />
          <Skeleton className="h-3.5 w-60 sm:w-80" />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Skeleton className="h-9 w-28 rounded-xl" />
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
      </div>

      {/* 4 KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="h-8 w-8 rounded-xl" />
            </div>
            <Skeleton className="h-8 w-24 sm:w-32" />
            <Skeleton className="h-3 w-28" />
          </div>
        ))}
      </div>

      {/* Occupancy Progress Bar Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-3.5 w-full rounded-full" />
        <div className="flex justify-between items-center pt-1">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>

      {/* 2-Column Split: Room Status + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Left Column */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-3 rounded-xl border border-slate-200/60 bg-slate-50/60 space-y-2">
                <Skeleton className="h-4 w-14" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-2.5 w-12 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/40">
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <div className="space-y-1.5 text-right">
                  <Skeleton className="h-4 w-16 ml-auto" />
                  <Skeleton className="h-3 w-12 ml-auto rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. Rooms & Beds Tab Skeleton
export const RoomsSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-3.5 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28 rounded-xl" />
          <Skeleton className="h-9 w-32 rounded-xl" />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-xl shrink-0" />
        ))}
      </div>

      {/* Room Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
            {/* Bed Slots */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Skeleton className="h-10 rounded-xl" />
              <Skeleton className="h-10 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 3. Tenants Khata Tab Skeleton
export const TenantsSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-44" />
          <Skeleton className="h-3.5 w-64" />
        </div>
        <Skeleton className="h-9 w-36 rounded-xl" />
      </div>

      {/* Search & Filter Bar */}
      <div className="flex gap-3">
        <Skeleton className="h-10 flex-1 rounded-xl" />
        <Skeleton className="h-10 w-28 rounded-xl" />
      </div>

      {/* Tenants Table Skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
        <div className="p-4 bg-slate-50/70 border-b border-slate-200/80 flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="divide-y divide-slate-100">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-20 rounded-xl" />
                <Skeleton className="h-8 w-20 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 4. Rent Billing & Khata Tab Skeleton
export const BillingSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-3.5 w-72" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-32 rounded-xl" />
          <Skeleton className="h-9 w-36 rounded-xl" />
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-2">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>

      {/* Billing Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
        <div className="p-4 bg-slate-50/70 border-b border-slate-200/80 flex justify-between">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="divide-y divide-slate-100">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4 flex items-center justify-between gap-4">
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-24 rounded-xl" />
                <Skeleton className="h-8 w-8 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 5. Maintenance Expenses Tab Skeleton
export const ExpensesSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-52" />
          <Skeleton className="h-3.5 w-72" />
        </div>
        <Skeleton className="h-9 w-36 rounded-xl" />
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-2">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
        <div className="p-4 bg-slate-50/70 border-b border-slate-200/80 flex justify-between">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="divide-y divide-slate-100">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4 flex items-center justify-between gap-4">
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-20 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 6. WhatsApp Broadcast Desk Skeleton
export const BroadcastSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-60" />
          <Skeleton className="h-3.5 w-80" />
        </div>
        <Skeleton className="h-9 w-32 rounded-xl" />
      </div>

      {/* Template Pills */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
        <Skeleton className="h-4 w-36" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Split: Tenant checklist + WhatsApp phone preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
          <Skeleton className="h-4 w-40" />
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-3 border border-slate-100 rounded-xl flex items-center justify-between">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-8 w-28 rounded-xl" />
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      </div>
    </div>
  );
};

// 7. Complaints Tab Skeleton
export const ComplaintsSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-52" />
          <Skeleton className="h-3.5 w-72" />
        </div>
        <Skeleton className="h-9 w-36 rounded-xl" />
      </div>

      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-xl" />
        ))}
      </div>

      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-3.5 w-3/4" />
            <div className="flex items-center justify-between pt-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-24 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 8. Leads Tab Skeleton
export const LeadsSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-3.5 w-64" />
        </div>
        <Skeleton className="h-9 w-32 rounded-xl" />
      </div>

      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-28 rounded-xl" />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-3.5 w-40" />
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-8 flex-1 rounded-xl" />
              <Skeleton className="h-8 flex-1 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 9. Settings Tab Skeleton
export const SettingsSkeleton: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-3.5 w-72" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-5">
        <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
          <Skeleton className="w-16 h-16 rounded-full shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3.5 w-56" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Skeleton className="h-10 rounded-xl" />
          <Skeleton className="h-10 rounded-xl" />
          <Skeleton className="h-10 rounded-xl" />
          <Skeleton className="h-10 rounded-xl" />
        </div>

        <div className="pt-3 flex justify-end">
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

// Tab Router Skeleton Dispatcher
export const TabSkeleton: React.FC<{ tab: TabType }> = ({ tab }) => {
  switch (tab) {
    case 'dashboard':
      return <OverviewSkeleton />;
    case 'rooms':
      return <RoomsSkeleton />;
    case 'tenants':
      return <TenantsSkeleton />;
    case 'billing':
      return <BillingSkeleton />;
    case 'expenses':
      return <ExpensesSkeleton />;
    case 'broadcast':
      return <BroadcastSkeleton />;
    case 'complaints':
      return <ComplaintsSkeleton />;
    case 'leads':
      return <LeadsSkeleton />;
    case 'settings':
      return <SettingsSkeleton />;
    default:
      return <OverviewSkeleton />;
  }
};
