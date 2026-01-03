import type { Namespace } from '@/types';

export interface NamespaceCardProps {
  namespace: Namespace;
  isActive: boolean;
  isOwner: boolean;
  onSelect: () => void;
  onSettings: () => void;
  onDelete: () => void;
}

export interface NamespacesEmptyStateProps {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onCreateItem: () => void;
}
