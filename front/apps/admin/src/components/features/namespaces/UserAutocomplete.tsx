import { useState, useRef, useEffect, type KeyboardEvent, forwardRef, useImperativeHandle } from 'react';
import { createPortal } from 'react-dom';
import { Search, User, Mail, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, Skeleton } from '@/components/ui';
import { getAvatarUrl } from '@/components/features/profile/AvatarSelector';
import { useUserSearch, useDebounce } from '@/hooks';
import type { UserSearchResult } from '@/types';
import { useTranslation } from 'react-i18next';

export interface UserAutocompleteProps {
  /** The namespace ID to exclude existing members from */
  namespaceId: string;
  /** Callback when a user is selected */
  onSelect: (user: UserSearchResult) => void;
  /** Callback when the input value changes (for email fallback) */
  onInputChange?: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Error message */
  error?: string;
  /** Helper text */
  helperText?: string;
  /** Label for the input */
  label?: string;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Current input value (controlled) */
  value?: string;
  /** Selected user (to show in the input) */
  selectedUser?: UserSearchResult | null;
  /** Callback when selection is cleared */
  onClear?: () => void;
}

export interface UserAutocompleteRef {
  focus: () => void;
  clear: () => void;
}

/**
 * User autocomplete component for searching and selecting users.
 * Used when inviting members to workspaces.
 *
 * Features:
 * - Searches by name or email
 * - Shows avatars, names, and emails in results
 * - Excludes users already in the namespace
 * - Falls back to raw email for non-existing users
 */
export const UserAutocomplete = forwardRef<UserAutocompleteRef, UserAutocompleteProps>(
  ({ namespaceId, onSelect, onInputChange, placeholder, error, helperText, label, disabled = false, className, selectedUser, onClear }, ref) => {
    const { t } = useTranslation();
    const [inputValue, setInputValue] = useState('');
    const [open, setOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const [position, setPosition] = useState<{ top: number; left: number; width: number } | null>(null);

    const inputRef = useRef<HTMLInputElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // Debounce the search query
    const debouncedQuery = useDebounce(inputValue, 300);

    // Search for users
    const { data: users = [], isLoading, isFetching } = useUserSearch(debouncedQuery, namespaceId, open && !selectedUser);

    const hasError = !!error;
    const showDropdown = open && !selectedUser && inputValue.length >= 2;

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      clear: () => {
        setInputValue('');
        onClear?.();
      },
    }));

    // Update position when opening
    useEffect(() => {
      if (showDropdown && inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect();
        setPosition({
          top: rect.bottom + 6,
          left: rect.left,
          width: rect.width,
        });
      } else {
        setPosition(null);
      }
    }, [showDropdown]);

    // Update position on scroll/resize while open
    useEffect(() => {
      if (!showDropdown || !inputRef.current) return;

      const updatePosition = () => {
        if (inputRef.current) {
          const rect = inputRef.current.getBoundingClientRect();
          setPosition({
            top: rect.bottom + 6,
            left: rect.left,
            width: rect.width,
          });
        }
      };

      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);

      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }, [showDropdown]);

    // Close on click outside
    useEffect(() => {
      if (!showDropdown) return;

      const handleClickOutside = (e: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(e.target as Node) && inputRef.current && !inputRef.current.contains(e.target as Node)) {
          setOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showDropdown]);

    // Reset highlighted index when users change
    useEffect(() => {
      setHighlightedIndex(0);
    }, [users]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);
      setOpen(true);
      onInputChange?.(value);
    };

    const handleSelect = (user: UserSearchResult) => {
      onSelect(user);
      setInputValue('');
      setOpen(false);
    };

    const handleClear = () => {
      setInputValue('');
      onClear?.();
      inputRef.current?.focus();
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (!showDropdown || users.length === 0) {
        if (e.key === 'Escape') {
          setOpen(false);
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex((prev) => (prev < users.length - 1 ? prev + 1 : prev));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case 'Enter':
          e.preventDefault();
          if (users[highlightedIndex]) {
            handleSelect(users[highlightedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setOpen(false);
          break;
      }
    };

    const handleFocus = () => {
      if (!selectedUser && inputValue.length >= 2) {
        setOpen(true);
      }
    };

    return (
      <div className={cn('w-full', className)}>
        {label && <label className={cn('block text-sm font-semibold mb-2', hasError ? 'text-error' : 'text-on-surface')}>{label}</label>}

        <div className="relative">
          {/* Input with selected user or search */}
          {selectedUser ? (
            // Selected user display
            <div
              className={cn(
                'flex items-center gap-3 px-4 h-11 rounded-2xl',
                'bg-primary-container/20 border-2 border-primary/30',
                'text-sm transition-all duration-200'
              )}
            >
              <Avatar
                src={selectedUser.avatarId ? getAvatarUrl(selectedUser.avatarId) : undefined}
                alt={selectedUser.fullName}
                fallback={selectedUser.fullName.charAt(0)}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-on-surface truncate">{selectedUser.fullName}</p>
                <p className="text-xs text-on-surface-variant truncate">{selectedUser.email}</p>
              </div>
              {!disabled && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1 rounded-full hover:bg-on-surface/10 transition-colors"
                  aria-label={t('common.clear')}
                >
                  <X className="w-4 h-4 text-on-surface-variant" />
                </button>
              )}
            </div>
          ) : (
            // Search input
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/50" />
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={handleFocus}
                placeholder={placeholder || t('workspaces.team.searchUsers')}
                disabled={disabled}
                autoComplete="off"
                className={cn(
                  'w-full h-11 pl-12 pr-4 rounded-2xl',
                  'bg-surface-container-lowest border-2 border-outline-variant/40',
                  'text-sm text-on-surface placeholder:text-on-surface-variant/50',
                  'transition-all duration-200',
                  'focus:outline-none focus:border-primary',
                  'hover:border-outline-variant/70',
                  open && 'border-primary',
                  disabled && 'opacity-50 cursor-not-allowed',
                  hasError && 'border-error focus:border-error'
                )}
              />
              {(isLoading || isFetching) && inputValue.length >= 2 && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              )}
            </div>
          )}
        </div>

        {(helperText || error) && <p className={cn('mt-2 text-sm', hasError ? 'text-error' : 'text-on-surface-variant/70')}>{error || helperText}</p>}

        {/* Dropdown menu */}
        {showDropdown &&
          position &&
          createPortal(
            <div
              ref={menuRef}
              role="listbox"
              className={cn(
                'fixed z-50 py-1.5 rounded-2xl max-h-72 overflow-auto',
                'bg-surface-container-lowest border border-outline-variant/30',
                'animate-in fade-in zoom-in-98 duration-150'
              )}
              style={{
                top: position.top,
                left: position.left,
                width: position.width,
              }}
            >
              {isLoading ? (
                // Loading skeletons
                <div className="space-y-1 p-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2">
                      <Skeleton className="w-8 h-8 rounded-full" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : users.length === 0 ? (
                // No results
                <div className="px-4 py-6 text-center">
                  <User className="w-8 h-8 mx-auto mb-2 text-on-surface-variant/30" />
                  <p className="text-sm text-on-surface-variant">{t('workspaces.team.noUsersFound')}</p>
                  <p className="text-xs text-on-surface-variant/60 mt-1">{t('workspaces.team.typeEmailToInvite')}</p>
                </div>
              ) : (
                // User results
                users.map((user, index) => (
                  <button
                    key={user.id}
                    type="button"
                    role="option"
                    aria-selected={highlightedIndex === index}
                    onClick={() => handleSelect(user)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 text-left',
                      'transition-colors duration-100',
                      highlightedIndex === index ? 'bg-primary-container/30' : 'hover:bg-on-surface/5'
                    )}
                  >
                    <Avatar
                      src={user.avatarId ? getAvatarUrl(user.avatarId) : undefined}
                      alt={user.fullName}
                      fallback={user.fullName.charAt(0)}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-on-surface truncate">{user.fullName}</p>
                      <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                        <Mail className="w-3 h-3" />
                        <span className="truncate">{user.email}</span>
                      </div>
                    </div>
                    {highlightedIndex === index && <Check className="w-4 h-4 text-primary shrink-0" />}
                  </button>
                ))
              )}
            </div>,
            document.body
          )}
      </div>
    );
  }
);

UserAutocomplete.displayName = 'UserAutocomplete';
