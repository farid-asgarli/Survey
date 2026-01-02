import { makeAutoObservable } from 'mobx';

/**
 * Repository class responsible for managing data entries of a specific mapping type.
 * Provides methods to manipulate and retrieve data in categorized collections.
 */
export default class Repository<TMap> {
  /**
   * Initializes a new instance of the Repository class.
   */
  constructor() {
    makeAutoObservable(this);
  }

  /**
   * @private
   * Represents the data entries stored as key-value pairs.
   */
  private _dataEntries: { [P in keyof TMap]?: Array<TMap[P]> } = {};

  /**
   * Sets the values for a specified category.
   * @param category - The category for the data entry.
   * @param value - The values to assign to the category.
   */
  set = <TKey extends keyof TMap = keyof TMap>(category: TKey, value: Array<TMap[TKey]>) => (this._dataEntries[category] = value);

  /**
   * Retrieves all values associated with a specified category.
   * @param category - The category for the data entry.
   * @returns An array of values or undefined if the category does not exist.
   */
  all = <TKey extends keyof TMap>(category: TKey): Array<TMap[TKey]> | undefined => this._dataEntries[category];

  /**
   * Retrieves a single value from a specified category, based on a predicate function.
   * @param category - The category for the data entry.
   * @param predicate - The function used to identify the required value.
   * @returns The identified value or undefined if not found.
   */
  single = <TKey extends keyof TMap = keyof TMap>(category: TKey, predicate: (item: TMap[TKey]) => boolean) => this._dataEntries[category]?.find(predicate);

  /**
   * Adds a single value to a specified category.
   * @param category - The category to which the value will be added.
   * @param value - The value to add to the category.
   */
  add = <TKey extends keyof TMap = keyof TMap>(category: TKey, value: TMap[TKey]) => {
    const categoricalData: Array<TMap[TKey]> | undefined = this._dataEntries[category];
    if (categoricalData) this._dataEntries[category] = [...categoricalData, value];
  };

  /**
   * Adds a range of values to a specified category.
   * @param category - The category to which the values will be added.
   * @param value - The array of values to add to the category.
   */
  addRange = <TKey extends keyof TMap = keyof TMap>(category: TKey, value: Array<TMap[TKey]>) => {
    const categoricalData: Array<TMap[TKey]> | undefined = this._dataEntries[category];
    if (categoricalData) this._dataEntries[category] = [...categoricalData, ...value];
  };

  /**
   * Removes values from a specified category based on a predicate function.
   * @param category - The category from which the values will be removed.
   * @param predicate - The function to determine the values to remove.
   */
  remove = <TKey extends keyof TMap = keyof TMap>(category: TKey, predicate: (item: TMap[TKey]) => boolean) => {
    if (this._dataEntries[category]) this._dataEntries[category] = this._dataEntries[category]?.filter((item) => !predicate(item));
  };

  /**
   * Removes a range of values from a specified category based on a predicate function.
   * @param category - The category from which the values will be removed.
   * @param predicate - The function to determine the values to remove.
   */
  removeRange = <TKey extends keyof TMap = keyof TMap>(category: TKey, predicate: (item: TMap[TKey]) => boolean) => {
    if (this._dataEntries[category]) this._dataEntries[category] = this._dataEntries[category]?.filter((item) => !predicate(item));
  };

  /**
   * Checks whether a specific category exists or whether an item within that category matches a given predicate.
   * @param category - The category to check.
   * @param predicate - Optional function to determine if any item in the category matches the condition.
   * @returns Boolean indicating if the category exists or if an item in the category matches the predicate.
   */
  exists = <TKey extends keyof TMap = keyof TMap>(category: TKey, predicate?: (item: TMap[TKey]) => boolean) => {
    if (!predicate) return !!this._dataEntries[category];
    else return !!this._dataEntries[category]?.find(predicate);
  };

  /**
   * Mutates a value in a specified category based on a predicate function and applies a given mutation.
   * @param category - The category containing the data.
   * @param predicate - The function to find the value.
   * @param mutation - The function to apply to the value.
   */
  mutate = <TKey extends keyof TMap = keyof TMap>(category: TKey, predicate: (item: TMap[TKey]) => boolean, mutation: (item: TMap[TKey]) => void) => {
    const categoricalData = this._dataEntries[category];
    if (categoricalData) {
      const existingItem = categoricalData.find(predicate);
      if (existingItem) mutation(existingItem);
      this.set(category, [...(categoricalData as Array<TMap[TKey]>)]);
    }
  };

  /**
   * Mutates a range of items in a specified category that match a given predicate.
   * @param category - The category containing the items.
   * @param predicate - Function used to determine which items should be mutated.
   * @param mutation - Function defining how each item that matches the predicate should be mutated.
   */
  mutateRange = <TKey extends keyof TMap = keyof TMap>(category: TKey, predicate: (item: TMap[TKey]) => boolean, mutation: (item: TMap[TKey]) => void) => {
    const categoricalData = this._dataEntries[category];
    if (categoricalData) for (let index = 0; index < categoricalData.length; index++) if (predicate(categoricalData[index])) mutation(categoricalData[index]);
  };

  dispose = <TKey extends keyof TMap = keyof TMap>(category: TKey) => (this._dataEntries[category] = undefined);
}
