// Never dump Axios errors/configs: they contain credentials and response tokens.
export function diagnosticUrl(value?: string): string | undefined {
  if (!value) return value;
  return value.split(/[?#]/, 1)[0].replace(/\/\/[^/]*@/, "//[REDACTED]@");
}

export function diagnosticMessage(value: unknown): string {
  // Only known transport messages are safe; arbitrary server/native messages
  // can echo the submitted password or a token.
  return typeof value === "string" &&
    /^(Network Error|Request aborted|canceled|timeout of \d+ms exceeded|Request failed with status code \d{3})$/.test(value)
    ? value
    : "[REDACTED non-transport message]";
}

export function diagnosticResponseData(value: unknown): unknown {
  if (value == null) return value;
  // Keep only known envelope fields, with all values suppressed. Even a field
  // named `message` can contain echoed credentials; key-name redaction is unsafe.
  if (typeof value !== "object" || Array.isArray(value)) return "[REDACTED]";
  const result: Record<string, string> = {};
  for (const key of ["message", "error", "statusCode", "data", "access_token", "refresh_token"]) {
    if (Object.prototype.hasOwnProperty.call(value, key)) result[key] = "[REDACTED]";
  }
  return Object.keys(result).length ? result : "[REDACTED object]";
}

export function logLoginStage(stage: string) {
  if (__DEV__) console.info("[login diagnostic]", { at: new Date().toISOString(), stage });
}
