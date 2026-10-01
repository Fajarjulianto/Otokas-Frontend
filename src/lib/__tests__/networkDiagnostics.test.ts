import { diagnosticMessage, diagnosticResponseData, diagnosticUrl } from "../networkDiagnostics";

describe("network diagnostic credential redaction", () => {
  it("does not expose credentials echoed under unexpected response fields", () => {
    const output = JSON.stringify(diagnosticResponseData({
      message: "password: secret-password",
      data: { arbitrary: "secret-token" },
      access_token: "secret-access-token",
      unexpected: "secret-refresh-token",
    }));
    expect(output).not.toContain("secret-");
    expect(output).toContain("REDACTED");
    expect(diagnosticResponseData("secret-password")).toBe("[REDACTED]");
  });

  it("preserves transport errors while suppressing arbitrary error text", () => {
    expect(diagnosticMessage("Network Error")).toBe("Network Error");
    expect(diagnosticMessage("timeout of 15000ms exceeded")).toBe("timeout of 15000ms exceeded");
    expect(diagnosticMessage("secret-password")).not.toContain("secret-password");
  });

  it("strips query, fragment and URL credentials", () => {
    expect(diagnosticUrl("https://user:secret@api.example.com/auth/login?token=secret#secret"))
      .toBe("https://[REDACTED]@api.example.com/auth/login");
  });
});
