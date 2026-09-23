export function nicknameError(value: string): string | null {
  return /^[\p{L}\p{N} _-]{2,32}$/u.test(value.trim())
    ? null
    : "Use 2–32 letters, numbers, spaces, hyphens or underscores.";
}
export function emailError(value: string): string | null {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
    ? null
    : "Enter a valid email address.";
}
export function validateRegistration(
  email: string,
  nickname: string,
  accepted: boolean,
): string | null {
  return (
    emailError(email) ||
    nicknameError(nickname) ||
    (!accepted ? "Please agree to the terms and privacy notice." : null)
  );
}
