import { useState } from 'react';
import { MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Skeleton } from '@/components/ui';
import { cn } from '@/lib/utils';

export interface TextResponsesListProps {
  questionText: string;
  responses?: string[];
  totalAnswers: number;
  isLoading?: boolean;
  className?: string;
  initialDisplayCount?: number;
}

export function TextResponsesList({ questionText, responses, totalAnswers, isLoading, className, initialDisplayCount = 5 }: TextResponsesListProps) {
  const [showAll, setShowAll] = useState(false);

  if (isLoading) {
    return (
      <Card variant="outlined" className={className}>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!responses?.length) {
    return (
      <Card variant="outlined" className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium line-clamp-2">{questionText}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-on-surface-variant">
            <MessageSquare className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">No text responses yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayedResponses = showAll ? responses : responses.slice(0, initialDisplayCount);
  const hasMore = responses.length > initialDisplayCount;

  return (
    <Card variant="outlined" className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base font-medium line-clamp-2">{questionText}</CardTitle>
            <p className="text-xs text-on-surface-variant mt-1">
              {totalAnswers} response{totalAnswers !== 1 ? 's' : ''} • Showing sample
            </p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-tertiary-container/60 shrink-0">
            <MessageSquare className="h-4 w-4 text-on-tertiary-container" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {displayedResponses.map((response, index) => (
            <div
              key={index}
              className={cn(
                'p-3 rounded-xl bg-surface-container',
                'border border-outline-variant/30',
                'transition-colors hover:bg-surface-container-high'
              )}
            >
              <p className="text-sm text-on-surface whitespace-pre-wrap overflow-wrap-break-word">{response}</p>
            </div>
          ))}
        </div>

        {hasMore && (
          <Button variant="text" size="sm" onClick={() => setShowAll(!showAll)} className="mt-3 w-full">
            {showAll ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Show {responses.length - initialDisplayCount} more
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
