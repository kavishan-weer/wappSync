export function parseTags(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function parseVariantValues(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseMoney(value: FormDataEntryValue | null) {
  const parsed = Number(String(value ?? ""));

  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error("Price must be zero or greater.");
  }

  return parsed;
}

export function parseStock(value: FormDataEntryValue | null) {
  const parsed = Number.parseInt(String(value ?? ""), 10);

  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error("Stock count must be zero or greater.");
  }

  return parsed;
}
