import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
} from "class-validator";
import {validateReqBody, validateReqParams} from "../middlewares/validation";

// DEVICE_ID
class DeviceIdParamsDto {
  @IsMongoId({message: "Invalid id format"})
  id!: string;
}
const deviceIdValidation = validateReqParams(DeviceIdParamsDto);

// CREATE_DEVICE
class CreateDeviceBodyDto {
  @MaxLength(30)
  @MinLength(3)
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  type!: string;

  @IsNumber()
  @IsNotEmpty()
  multiPricePerHour!: number;

  @IsNumber()
  @IsNotEmpty()
  duoPricePerHour!: number;
}
const createDeviceValidation = validateReqBody(CreateDeviceBodyDto);

// UPDATE_DEVICE
class UpdateDeviceBodyDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsNumber()
  @IsOptional()
  multiPricePerHour?: number;

  @IsNumber()
  @IsOptional()
  duoPricePerHour?: number;
}
const updateDeviceValidation = validateReqBody(UpdateDeviceBodyDto);

export {
  DeviceIdParamsDto,
  UpdateDeviceBodyDto,
  CreateDeviceBodyDto,
  createDeviceValidation,
  deviceIdValidation,
  updateDeviceValidation,
};
