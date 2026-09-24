import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

/** Règle de robustesse commune LOC-12 / LOC-13 (miroir de PasswordPolicyService côté back). */
export const PASSWORD_MIN_LENGTH = 8;
/** Limite technique BCrypt côté back, pas une règle de robustesse. */
export const PASSWORD_MAX_LENGTH = 72;

export const PASSWORD_MESSAGES = {
  minLength: `Le nouveau mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères.`,
  maxLength: `Le nouveau mot de passe ne peut pas dépasser ${PASSWORD_MAX_LENGTH} caractères.`,
  sameAsCurrent: 'Le nouveau mot de passe doit être différent du mot de passe actuel.',
  mismatch: 'Les deux saisies du nouveau mot de passe ne correspondent pas.',
  rule: `Le nouveau mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères et être différent du mot de passe actuel.`,
} as const;

export const newPasswordValidators: ValidatorFn[] = [
  Validators.required,
  Validators.minLength(PASSWORD_MIN_LENGTH),
  Validators.maxLength(PASSWORD_MAX_LENGTH),
];

export function passwordsMatchValidator(newKey: string, confirmKey: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const confirm = group.get(confirmKey)?.value;
    if (!confirm) return null;
    return group.get(newKey)?.value === confirm ? null : { passwordMismatch: true };
  };
}

export function differentFromCurrentValidator(currentKey: string, newKey: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const current = group.get(currentKey)?.value;
    const next = group.get(newKey)?.value;
    return current && next && current === next ? { sameAsCurrent: true } : null;
  };
}
