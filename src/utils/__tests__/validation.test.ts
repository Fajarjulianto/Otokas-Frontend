import { EMAIL_REGEX } from "../validation";

describe("EMAIL_REGEX", () => {
  const validEmails = [
    "user@example.com",
    "user.name@domain.co.id",
    "user+tag@domain.com",
    "a@b.co",
    "test123@mail.server.org",
  ];

  const invalidEmails = [
    "",
    "plaintext",
    "@domain.com",
    "user@",
    "user @domain.com",        // space in local part
    "user@ domain.com",        // space in domain
    "user@domain",             // missing TLD dot
    "user@.com",               // missing domain name
  ];

  it.each(validEmails)("accepts valid email: %s", (email) => {
    expect(EMAIL_REGEX.test(email)).toBe(true);
  });

  it.each(invalidEmails)("rejects invalid email: '%s'", (email) => {
    expect(EMAIL_REGEX.test(email)).toBe(false);
  });

  it("is case-insensitive by character class (not flag)", () => {
    // The regex itself doesn't have the /i flag, but accepts uppercase letters
    expect(EMAIL_REGEX.test("User@Domain.COM")).toBe(true);
  });
});
