import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsEnum,
  MinLength,
  MaxLength,
} from "class-validator";
import {validateReqBody} from "../../middlewares/validation";
import {SessionTypes} from "../game-sessions/gameSessions.model";

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

// UPDATE_DEVICE_SESSION_TYPE
class UpdateDeviceSessionTypeBodyDto {
  @IsEnum(SessionTypes)
  @IsNotEmpty()
  sessionType!: string;
}
const updateDeviceSessionTypeValidation = validateReqBody(
  UpdateDeviceSessionTypeBodyDto
);

export {
  updateDeviceValidation,
  UpdateDeviceBodyDto,
  UpdateDeviceSessionTypeBodyDto,
  updateDeviceSessionTypeValidation,
  CreateDeviceBodyDto,
  createDeviceValidation,
};
