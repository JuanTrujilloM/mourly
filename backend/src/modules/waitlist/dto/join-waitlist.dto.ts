import { IsEmail, IsMobilePhone, IsString, Length } from 'class-validator';

const NAME_MESSAGE = 'Ingresá tu nombre.';
const EMAIL_MESSAGE = 'Ingresá un correo institucional válido.';
const CELLPHONE_MESSAGE = 'Ingresá un celular colombiano válido.';

const NAME_MIN_LENGTH = 2;
const NAME_MAX_LENGTH = 80;

export class JoinWaitlistDto {
  @IsString({ message: NAME_MESSAGE })
  @Length(NAME_MIN_LENGTH, NAME_MAX_LENGTH, { message: NAME_MESSAGE })
  name!: string;

  @IsEmail({}, { message: EMAIL_MESSAGE })
  email!: string;

  @IsMobilePhone('es-CO', {}, { message: CELLPHONE_MESSAGE })
  cellphone!: string;
}
