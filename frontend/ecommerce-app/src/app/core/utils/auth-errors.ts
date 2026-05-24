const PATTERNS: { regex: RegExp; translate: (m: RegExpMatchArray) => string }[] = [
  { regex: /^Passwords must be at least (\d+) characters\.?$/i,
    translate: m => `La contraseña debe tener al menos ${m[1]} caracteres.` },
  { regex: /^Passwords must have at least one non alphanumeric character\.?$/i,
    translate: () => 'La contraseña debe tener al menos un carácter no alfanumérico.' },
  { regex: /^Passwords must have at least one digit \('0'-'9'\)\.?$/i,
    translate: () => "La contraseña debe tener al menos un dígito ('0'-'9')." },
  { regex: /^Passwords must have at least one lowercase \('a'-'z'\)\.?$/i,
    translate: () => "La contraseña debe tener al menos una letra minúscula ('a'-'z')." },
  { regex: /^Passwords must have at least one uppercase \('A'-'Z'\)\.?$/i,
    translate: () => "La contraseña debe tener al menos una letra mayúscula ('A'-'Z')." },
  { regex: /^Passwords must use at least (\d+) different characters\.?$/i,
    translate: m => `La contraseña debe usar al menos ${m[1]} caracteres diferentes.` },
  { regex: /^Email '(.+)' is already taken\.?$/i,
    translate: m => `El email '${m[1]}' ya está registrado.` },
  { regex: /^Username '(.+)' is already taken\.?$/i,
    translate: m => `El usuario '${m[1]}' ya está registrado.` },
  { regex: /^Invalid email\.?$/i, translate: () => 'Email inválido.' },
  { regex: /^Invalid credentials\.?$/i, translate: () => 'Credenciales inválidas.' },
  { regex: /^User not found\.?$/i, translate: () => 'Usuario no encontrado.' },
];

function translateOne(msg: string): string {
  const trimmed = msg.trim();
  for (const { regex, translate } of PATTERNS) {
    const m = trimmed.match(regex);
    if (m) return translate(m);
  }
  return trimmed;
}

export function translateAuthError(raw: string | undefined | null, fallback: string): string {
  if (!raw) return fallback;
  return raw.split(',').map(translateOne).filter(Boolean).join(' ');
}
