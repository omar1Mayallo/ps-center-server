import {IsNotEmpty, IsNumber, IsOptional, IsString} from "class-validator";
import {validateReqBody} from "../../middlewares/validation";

// CREATE_SNACK
class CreateSnackBodyDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsNumber()
  @IsNotEmpty()
  buyingPrice!: number;

  @IsNumber()
  @IsNotEmpty()
  sellingPrice!: number;

  @IsNumber()
  @IsNotEmpty()
  quantityInStock!: number;
}
const createSnackValidation = validateReqBody(CreateSnackBodyDto);

// UPDATE_SNACK
class UpdateSnackBodyDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsOptional()
  buyingPrice?: number;

  @IsNumber()
  @IsOptional()
  sellingPrice?: number;

  @IsNumber()
  @IsOptional()
  quantityInStock?: number;
}
const updateSnackValidation = validateReqBody(UpdateSnackBodyDto);

export {
  CreateSnackBodyDto,
  createSnackValidation,
  UpdateSnackBodyDto,
  updateSnackValidation,
};
