import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import {validateReqBody} from "../../middlewares/validation";

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
const loginValidation = validateReqBody(UserLoginDto);

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
const registerValidation = validateReqBody(UserRegisterDto);

export {UserLoginDto, UserRegisterDto, loginValidation, registerValidation};
