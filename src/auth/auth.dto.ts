import {
  IsString,
  IsNotEmpty,
  IsEmail,
  MinLength,
  MaxLength,
} from "class-validator";
import {validateRequest} from "../middlewares/validation";

// LOGIN
class UserLoginDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @MaxLength(25)
  @MinLength(6)
  @IsNotEmpty()
  password!: string;
}
const loginValidation = validateRequest(UserLoginDto);

// REGISTER
class UserRegisterDto {
  @MaxLength(30)
  @MinLength(3)
  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @MaxLength(25)
  @MinLength(6)
  @IsNotEmpty()
  password!: string;
}
const registerValidation = validateRequest(UserRegisterDto);

export {UserLoginDto, UserRegisterDto, loginValidation, registerValidation};
