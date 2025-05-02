export function sortBySelection<T>(
  items: T[],
  selectedItems: T[],
  getKey: (item: T) => string | number,
): T[] {
  return [...items].sort((a, b) => {
    const aSelected: any = selectedItems.some(
      (item) => getKey(item) === getKey(a),
    );
    const bSelected: any = selectedItems.some(
      (item) => getKey(item) === getKey(b),
    );
    return bSelected - aSelected; // true = 1, false = 0 -> los seleccionados van primero
  });
}
