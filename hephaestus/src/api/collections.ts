// Compatibility with servers that return null/omit an empty protobuf list.
export function normalizeList<T extends { items: unknown[] }>(data: T): T {
  return { ...data, items: Array.isArray(data.items) ? data.items : [] }
}
