import {
  EMAIL_REGEX,
  isStrongPassword,
  isValidHttpUrl,
} from "../validation";

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
    "user @domain.com",
    "user@ domain.com",
    "user@domain",
    "user@.com",
  ];

  it.each(validEmails)("accepts valid email: %s", (email) => {
    expect(EMAIL_REGEX.test(email)).toBe(true);
  });

  it.each(invalidEmails)("rejects invalid email: '%s'", (email) => {
    expect(EMAIL_REGEX.test(email)).toBe(false);
  });

  it("accepts uppercase letters", () => {
    expect(EMAIL_REGEX.test("User@Domain.COM")).toBe(true);
  });
});

describe("isStrongPassword", () => {
  it("requires eight characters, an uppercase letter, and a number", () => {
    expect(isStrongPassword("Password1")).toBe(true);
    expect(isStrongPassword("password1")).toBe(false);
    expect(isStrongPassword("Password")).toBe(false);
    expect(isStrongPassword("Pass1")).toBe(false);
  });
});

describe("isValidHttpUrl", () => {
  it("accepts HTTP and HTTPS URLs", () => {
    expect(isValidHttpUrl("https://example.com/image.jpg")).toBe(true);
    expect(isValidHttpUrl(" HTTP://example.com ")).toBe(true);
  });

  it("rejects empty and non-HTTP values", () => {
    expect(isValidHttpUrl()).toBe(false);
    expect(isValidHttpUrl("file:///image.jpg")).toBe(false);
  });
});
