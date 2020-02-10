import {
  AutocompleteStore,
  AutocompleteSetters,
  RequiredAutocompleteOptions,
  AutocompleteState,
} from './types';

let lastStalledId: number | null = null;

interface OnInputOptions<TItem> extends AutocompleteSetters<TItem> {
  query: string;
  store: AutocompleteStore<TItem>;
  props: RequiredAutocompleteOptions<TItem>;
  /**
   * The next partial state to apply after the function is called.
   *
   * This is useful when we call `onInput` in a different scenario than an
   * actual input. For example, we use `onInput` when we click on an item,
   * but we want to close the dropdown in that case.
   */
  nextState?: Partial<AutocompleteState<TItem>>;
}

export function onInput<TItem>({
  query,
  store,
  props,
  setHighlightedIndex,
  setQuery,
  setSuggestions,
  setIsOpen,
  setStatus,
  setContext,
  nextState = {},
}: OnInputOptions<TItem>): void {
  if (lastStalledId) {
    clearTimeout(lastStalledId);
  }

  setHighlightedIndex(0);
  setQuery(query);

  if (query.length < props.minLength) {
    setStatus('idle');
    setSuggestions(
      store.getState().suggestions.map(suggestion => ({
        ...suggestion,
        items: [],
      }))
    );
    setIsOpen(
      nextState.isOpen ?? props.shouldDropdownOpen({ state: store.getState() })
    );

    return;
  }

  setStatus('loading');

  lastStalledId = props.environment.setTimeout(() => {
    setStatus('stalled');
  }, props.stallThreshold);

  props
    .getSources({
      query,
      state: store.getState(),
      setHighlightedIndex,
      setQuery,
      setSuggestions,
      setIsOpen,
      setStatus,
      setContext,
    })
    .then(sources => {
      setStatus('loading');

      // @TODO: convert `Promise.all` to fetching strategy.
      return Promise.all(
        sources.map(source => {
          return Promise.resolve(
            source.getSuggestions({
              query,
              state: store.getState(),
              setHighlightedIndex,
              setQuery,
              setSuggestions,
              setIsOpen,
              setStatus,
              setContext,
            })
          ).then(items => {
            return {
              source,
              items,
            };
          });
        })
      )
        .then(suggestions => {
          setStatus('idle');
          setSuggestions(suggestions);
          setIsOpen(
            nextState.isOpen ??
              (query.length >= props.minLength &&
                props.shouldDropdownOpen({ state: store.getState() }))
          );
        })
        .catch(error => {
          setStatus('error');

          throw error;
        })
        .finally(() => {
          if (lastStalledId) {
            clearTimeout(lastStalledId);
          }
        });
    });
}