import { type HTMLAttributes, useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, Building2, Check, Plus } from 'lucide-react';
import { useNamespaceStore, useActiveNamespace, useNamespaces } from '@/stores';
import type { Namespace } from '@/types';
import { SubscriptionTier, SubscriptionTierLabels } from '@/types/enums';

interface NamespaceSelectorProps extends HTMLAttributes<HTMLDivElement> {
  onCreateNew?: () => void;
}

export function NamespaceSelector({ className, onCreateNew, ...props }: NamespaceSelectorProps) {
  const [open, setOpen] = useState(false);
  const activeNamespace = useActiveNamespace();
  const namespaces = useNamespaces();
  const switchNamespace = useNamespaceStore((s) => s.switchNamespace);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) && triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleSelect = (namespace: Namespace) => {
    switchNamespace(namespace.id);
    setOpen(false);
  };

  const tierColors: Record<SubscriptionTier, string> = {
    [SubscriptionTier.Free]: 'bg-surface-container-high text-on-surface-variant',
    [SubscriptionTier.Pro]: 'bg-primary/10 text-primary',
    [SubscriptionTier.Enterprise]: 'bg-tertiary/10 text-tertiary',
  };

  return (
    <div className={cn('relative', className)} {...props}>
      <button
        ref={triggerRef}
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-2xl min-w-[200px]',
          'bg-surface-container-low border-2 border-outline-variant/50 hover:border-outline-variant hover:bg-surface-container transition-all',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface'
        )}
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-container">
          <Building2 className="h-5 w-5 text-on-primary-container" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-medium text-on-surface truncate max-w-[140px]">{activeNamespace?.name || 'Select Workspace'}</p>
          {activeNamespace && <p className="text-xs text-on-surface-variant">{activeNamespace.slug}</p>}
        </div>
        <ChevronDown className={cn('h-5 w-5 text-on-surface-variant transition-transform duration-200', open && 'rotate-180')} />
      </button>

      {open && (
        <div
          ref={menuRef}
          className={cn(
            'absolute top-full left-0 mt-2 w-72 py-2 rounded-2xl z-50',
            'bg-surface-container border-2 border-outline-variant',
            'animate-in fade-in zoom-in-95 duration-150'
          )}
        >
          <div className="px-3 py-2 text-xs font-medium text-on-surface-variant uppercase tracking-wider">Workspaces</div>

          <div className="max-h-64 overflow-y-auto">
            {namespaces.map((namespace) => (
              <button
                key={namespace.id}
                onClick={() => handleSelect(namespace)}
                className={cn(
                  'flex w-full items-center gap-3 px-3 py-2.5 transition-colors',
                  'hover:bg-on-surface/5',
                  namespace.id === activeNamespace?.id && 'bg-primary/5'
                )}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary-container">
                  <Building2 className="h-5 w-5 text-on-secondary-container" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium text-on-surface truncate">{namespace.name}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-on-surface-variant">{namespace.slug}</span>
                    <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-full', tierColors[namespace.subscriptionTier])}>
                      {SubscriptionTierLabels[namespace.subscriptionTier]}
                    </span>
                  </div>
                </div>
                {namespace.id === activeNamespace?.id && <Check className="h-5 w-5 text-primary shrink-0" />}
              </button>
            ))}
          </div>

          {onCreateNew && (
            <>
              <div className="my-1 h-px bg-outline-variant" />
              <button
                onClick={() => {
                  setOpen(false);
                  onCreateNew();
                }}
                className={cn('flex w-full items-center gap-3 px-3 py-2.5', 'text-primary hover:bg-primary/5 transition-colors')}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-dashed border-primary/50">
                  <Plus className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium">Create New Workspace</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
