import { SpotlightAction, SpotlightProvider } from '@mantine/spotlight';
import { Icon } from '@src/components/icons';
import { router } from '@src/configs/routing/RoutingProvider';
import { EmptyStr } from '@src/static/string';
import { useStore } from '@src/store';
import { normalizeVowels } from '@src/utils/localeMatch';

export function spotlightFilter(query: string, actions: SpotlightAction[]): SpotlightAction[] {
  const normalizedQuery = normalizeVowels(query).toLowerCase();

  return actions.filter((action: SpotlightAction) => {
    const normalizedTitle = normalizeVowels(action.title).toLowerCase();
    const normalizedDescription = action.description ? normalizeVowels(action.description).toLowerCase() : EmptyStr;
    return normalizedTitle.includes(normalizedQuery) || normalizedDescription.includes(normalizedQuery);
  });
}

export function CommandCenter() {
  const { navItems } = useStore().routing;

  return (
    <SpotlightProvider
      actions={navItems.map((it) => ({
        title: it.title,
        onTrigger: () => router.navigate(it.path),
        description: `'${it.title}' səhifəsinə get`,
      }))}
      searchIcon={<Icon name="Search" />}
      searchPlaceholder="Axtar..."
      shortcut="mod + k"
      nothingFoundMessage="Uyğun seçim tapılmadı"
      highlightQuery
      filter={spotlightFilter}
    />
  );
}
