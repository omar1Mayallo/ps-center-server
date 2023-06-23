import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsMongoId,
} from "class-validator";
import {validateReqBody} from "../middlewares/validation";

// CREATE_ORDER
class CreateOrderBodyDto {
  @IsMongoId()
  @IsNotEmpty()
  snackId!: string;

  @IsNumber()
  @IsNotEmpty()
  quantity!: number;

  @IsMongoId()
  @IsOptional()
  deviceId?: string;
}
const createOrderValidation = validateReqBody(CreateOrderBodyDto);

// UPDATE_DEVICE
class AddSnackToOrderBodyDto {
  @IsMongoId()
  @IsNotEmpty()
  snackId!: string;

  @IsNumber()
  @IsOptional()
  quantity?: number;
}
const addSnackToOrderValidation = validateReqBody(AddSnackToOrderBodyDto);

export {
  CreateOrderBodyDto,
  createOrderValidation,
  AddSnackToOrderBodyDto,
  addSnackToOrderValidation,
};
