import { IsMobilePhone } from 'class-validator';

const INVALID_CELLPHONE_MESSAGE = 'Ingresá un celular colombiano válido.';

export class UpdateCellphoneDto {
  @IsMobilePhone('es-CO', {}, { message: INVALID_CELLPHONE_MESSAGE })
  cellphone!: string;
}
