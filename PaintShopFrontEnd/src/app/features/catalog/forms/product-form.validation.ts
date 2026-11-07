import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

export function requiredTrimmed(maxLength: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = (control.value as string).trim();
    if (!value) return { required: true };
    return value.length > maxLength ? { maxlength: { requiredLength: maxLength } } : null;
  };
}

export function optionalInteger(minimum: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as number | null;
    if (value === null) return null;
    return Number.isInteger(value) && value >= minimum && value <= 2147483647
      ? null : { integerRange: { minimum } };
  };
}

export const priceValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = (control.value as string).trim();
  if (!value) return null;
  if (!/^\d+(?:[.,]\d{1,2})?$/.test(value)) return { price: true };
  return Number(value.replace(',', '.')) <= 999999999.99 ? null : { price: true };
};

export function fieldError(form: FormGroup, name: string, serverErrors: Record<string, string[]>): string | null {
  const messages = serverErrors[name];
  if (messages?.length) return messages.join(' ');
  const control = form.get(name);
  if (!control?.touched || !control.errors) return null;
  if (control.hasError('required')) return 'Обязательное поле.';
  if (control.hasError('maxlength')) return `Максимальная длина: ${control.getError('maxlength').requiredLength} символов.`;
  if (control.hasError('price')) return 'Укажите цену от 0 до 999999999,99, не более двух знаков после запятой.';
  if (control.hasError('integerRange')) return `Укажите целое число от ${control.getError('integerRange').minimum} до 2147483647.`;
  return null;
}

export function validationErrors(error: HttpErrorResponse, form: FormGroup): { fields: Record<string, string[]>; other: string[] } {
  const fields: Record<string, string[]> = {};
  const other: string[] = [];
  const errors: unknown = error.error?.errors;
  if (errors && typeof errors === 'object') {
    for (const [key, value] of Object.entries(errors)) {
      if (!Array.isArray(value)) continue;
      const messages = value.filter((item): item is string => typeof item === 'string');
      const normalizedKey = key.replace(/^\$\./, '').replace(/\[\d+\]$/, '');
      const field = Object.keys(form.controls).find((name) => name.toLowerCase() === normalizedKey.toLowerCase());
      if (field) fields[field] = [...(fields[field] ?? []), ...messages];
      else other.push(...messages);
    }
  }
  return { fields, other };
}
