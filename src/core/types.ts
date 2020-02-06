export type StateUpdater<TState> = (
  value: TState // | ((prevState: TState) => TState)
) => void;

type SuggestionsOptions = any;

type AutocompleteSource = any;

export interface Environment {
  [prop: string]: unknown;
  addEventListener: Window['addEventListener'];
  removeEventListener: Window['removeEventListener'];
  setTimeout: Window['setTimeout'];
  document: Window['document'];
  location: {
    assign: Location['assign'];
  };
  open: Window['open'];
}

export type GetInputProps = (props?: {
  [key: string]: unknown;
}) => {
  'aria-autocomplete': 'list';
  'aria-activedescendant': null;
  'aria-controls': null;
  'aria-labelledby': string;
  autoComplete: 'on' | 'off';
  value: string;
  id: string;
  onInput(event: any): void;
  onKeyDown(event: any): void;
  onBlur(event: any): void;
};

export type GetItemProps<TItem> = (props?: {
  [key: string]: unknown;
  item: TItem;
}) => {
  id: string;
  role: string;
  'aria-selected': boolean;
  onMouseMove(event: any): void;
  onMouseDown(event: any): void;
  onClick(event: any): void;
};

export type GetLabelProps = (props?: {
  [key: string]: unknown;
}) => {
  htmlFor: string;
  id: string;
};

export type GetMenuProps = (props?: {
  [key: string]: unknown;
}) => {
  role: string;
  'aria-labelledby': string;
  id: string;
};

export interface AutocompleteSetters<TItem> {
  setHighlightedIndex: StateUpdater<
    AutocompleteState<TItem>['highlightedIndex']
  >;
  setQuery: StateUpdater<AutocompleteState<TItem>['query']>;
  setSuggestions: StateUpdater<AutocompleteState<TItem>['suggestions']>;
  setIsOpen: StateUpdater<AutocompleteState<TItem>['isOpen']>;
  setStatus: StateUpdater<AutocompleteState<TItem>['status']>;
  setContext: StateUpdater<AutocompleteState<TItem>['context']>;
}

interface Suggestion<TItem> {
  items: TItem[];
  source: AutocompleteSource;
}

export interface AutocompleteAccessibilityGetters<TItem> {
  getInputProps: GetInputProps;
  getItemProps: GetItemProps<TItem>;
  getLabelProps: GetLabelProps;
  getMenuProps: GetMenuProps;
}

export interface AutocompleteState<TItem> {
  highlightedIndex: number;
  query: string;
  suggestions: Array<Suggestion<TItem>>;
  isOpen: boolean;
  status: 'idle' | 'loading' | 'stalled' | 'error';
  statusContext: {
    error?: Error;
  };
  context: { [key: string]: unknown };
}

export interface AutocompleteInstance<TItem>
  extends AutocompleteSetters<TItem>,
    AutocompleteAccessibilityGetters<TItem> {
  onKeyDown(event: KeyboardEvent): void;
}

export interface AutocompleteSourceOptions<TItem> {
  /**
   * Get the string value of the suggestion. The value is used to fill the search box.
   */
  getInputValue?({
    suggestion,
    state,
  }: {
    suggestion: Suggestion<TItem>;
    state: AutocompleteState<TItem>;
  }): string;
  /**
   * Get the URL of a suggestion. The value is used to create default navigation features for
   * `onClick` and `onKeyDown`.
   */
  getSuggestionUrl?({
    suggestion,
    state,
  }: {
    suggestion: Suggestion<TItem>;
    state: AutocompleteState<TItem>;
  }): string | undefined;
  /**
   * Function called when the input changes. You can use this function to filter/search the items based on the query.
   */
  getSuggestions(
    options: SuggestionsOptions
  ): Array<Suggestion<TItem>> | Promise<Array<Suggestion<TItem>>>;
  /**
   * Called when an item is selected.
   */
  onSelect?: (options: ItemEventHandlerOptions<TItem>) => void;
}

export interface EventHandlerOptions<TItem> extends AutocompleteSetters<TItem> {
  state: AutocompleteState<TItem>;
}

export interface ItemEventHandlerOptions<TItem>
  extends EventHandlerOptions<TItem> {
  suggestion: Suggestion<TItem>;
  suggestionValue: ReturnType<AutocompleteSource['getInputValue']>;
  suggestionUrl: ReturnType<AutocompleteSource['getSuggestionUrl']>;
  source: AutocompleteSource;
}

export interface AutocompleteOptions<TItem> {
  /**
   * The Autocomplete ID to create accessible attributes.
   *
   * @default "autocomplete-0"
   */
  id?: string;
  /**
   * Function called when the internal state changes.
   */
  onStateChange<TItem>(props: { state: AutocompleteState<TItem> }): void;
  /**
   * The function called when an item is selected.
   */
  // onSelect(): void;
  /**
   * The container for the autocomplete dropdown.
   *
   * @default environment.document.body
   */
  dropdownContainer?: HTMLElement;
  /**
   * The dropdown position related to the container.
   * Possible values are `"left"` and `"right"`.
   *
   * @default "left"
   */
  dropdownAlignment?: 'left' | 'right';
  /**
   * Whether to show the highlighted suggestion as completion in the input.
   *
   * @default false
   */
  showCompletion?: boolean;
  /**
   * The minimum number of characters long the autocomplete opens.
   *
   * @default 1
   */
  minLength?: number;
  /**
   * The number of milliseconds that must elapse before the autocomplete
   * experience is stalled.
   *
   * @default 300
   */
  stallThreshold?: number;
  /**
   * The initial state to apply when the page is loaded.
   */
  initialState?: Partial<AutocompleteState<TItem>>;
  /**
   * The sources to get the suggestions from.
   */
  getSources(
    options: SuggestionsOptions
  ): AutocompleteSource[] | Promise<AutocompleteSource[]>;
  /**
   * The environment from where your JavaScript is running.
   * Useful if you're using Autocomplete.js in a different context than
   * `window`.
   *
   * @default window
   */
  environment?: Environment;
  /**
   * Navigator's API to redirect the user when a link should be open.
   */
  navigator?: {
    /**
     * Called when a URL should be open in the current page.
     */
    navigate: ({
      suggestionUrl: string,
      suggestion: Suggestion,
      state: AutocompleteState,
    }) => void;
    /**
     * Called when a URL should be open in a new tab.
     */
    navigateNewTab: ({
      suggestionUrl: string,
      suggestion: Suggestion,
      state: AutocompleteState,
    }) => void;
    /**
     * Called when a URL should be open in a new window.
     */
    navigateNewWindow: ({
      suggestionUrl: string,
      suggestion: Suggestion,
      state: AutocompleteState,
    }) => void;
  };
  /**
   * Called when the input is focused.
   */
  onFocus?: (options: EventHandlerOptions<TItem>) => void;
  /**
   * Called when a `click` event is fired on an item.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/click_event
   */
  onClick?: (
    event: MouseEvent,
    options: ItemEventHandlerOptions<TItem>
  ) => void;
  /**
   * Called when a `keydown` event is fired.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/keydown_event
   */
  onKeyDown?: (
    event: KeyboardEvent,
    options: EventHandlerOptions<TItem> &
      Partial<ItemEventHandlerOptions<TItem>>
  ) => void;
  /**
   * Called when an error is thrown while getting the suggestions.
   */
  onError?: (options: EventHandlerOptions<TItem>) => void;
  /**
   * Called when the input changes.
   */
  onInput?: (
    options: EventHandlerOptions<TItem> & {
      query: string;
    }
  ) => void | Promise<void | { state: AutocompleteState<TItem> }>;
  /**
   * Called to check whether the dropdown should open based on the Autocomplete state.
   */
  shouldDropdownOpen?(options: { state: AutocompleteState<TItem> }): boolean;
}