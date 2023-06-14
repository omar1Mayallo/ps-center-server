interface UserLoginDto {
  email: string;
  password: string;
}

interface UserRegisterDto {
  username: string;
  email: string;
  password: string;
}

export {UserLoginDto, UserRegisterDto};
