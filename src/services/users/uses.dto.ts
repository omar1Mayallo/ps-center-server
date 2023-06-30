import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import {validateReqBody} from "../../middlewares/validation";
import {UserRoles} from "./user.model";

// CREATE_USER
class CreateUserBodyDto {
  @MaxLength(30)
  @MinLength(3)
  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: number;

  @MaxLength(25)
  @MinLength(6)
  @IsString()
  @IsNotEmpty()
  password!: number;

  @IsEnum(UserRoles)
  @IsString()
  @IsNotEmpty()
  role!: string;
}
const createUserValidation = validateReqBody(CreateUserBodyDto);

// UPDATE_USER_ROLE
class UpdateUserRoleBodyDto {
  @IsEnum(UserRoles)
  @IsString()
  @IsNotEmpty()
  role!: string;
}
const updateUserRoleValidation = validateReqBody(UpdateUserRoleBodyDto);

export {
  CreateUserBodyDto,
  UpdateUserRoleBodyDto,
  createUserValidation,
  updateUserRoleValidation,
};
