import { ValidatorFn, Validators } from '@angular/forms';

/** Miroir de InscriptionParkingRequest.TELEPHONE_REGEX côté back (numéros étrangers acceptés). */
export const TELEPHONE_REGEX = /^\+?[0-9][0-9 ().-]{4,18}[0-9]$/;

/** Téléphone obligatoire pour tout compte ayant un rôle Parking. */
export const telephoneValidators: ValidatorFn[] = [Validators.required, Validators.pattern(TELEPHONE_REGEX)];
