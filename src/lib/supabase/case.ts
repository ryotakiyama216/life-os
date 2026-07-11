function camelToSnake(key: string): string {
  return key.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
}

function snakeToCamel(key: string): string {
  return key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
}

/** アプリ側(camelCase)のpatch/insert入力をDB行(snake_case)に変換する。undefinedはnullとして送る（=クリア）。 */
export function toDbRow(input: Record<string, unknown>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    row[camelToSnake(key)] = value === undefined ? null : value;
  }
  return row;
}

/** DB行(snake_case)をアプリ側の型(camelCase)に変換する。nullはundefinedにする（optionalフィールド前提）。 */
export function fromDbRow<T>(row: Record<string, unknown>): T {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    result[snakeToCamel(key)] = value === null ? undefined : value;
  }
  return result as T;
}
