import mongoose, {Document, Schema, Types} from "mongoose";
import bcrypt from "bcrypt";

enum UserRoles {
  USER = "USER",
  ADMIN = "ADMIN",
  OWNER = "OWNER",
}

export interface UserDocument extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  role: UserRoles;
  isCorrectPassword(
    enteredPassword: string,
    userPassword: string
  ): Promise<boolean>;
}

const userSchema = new Schema<UserDocument>(
  {
    username: {
      type: String,
      trim: true,
      required: [true, "Username is required"],
      minlength: [3, "Username minimum length 3 characters"],
      maxlength: [30, "Username maximum length 30 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password is too short"],
      maxlength: [25, "Password is too long"],
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(UserRoles), // Use enum values as allowed values
      default: UserRoles.USER, // Set default role to "user"
    },
  },
  {timestamps: true}
);

userSchema.pre<UserDocument>("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.isCorrectPassword = async function (
  enteredPassword: string,
  userPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, userPassword);
};

const User = mongoose.model<UserDocument>("User", userSchema);

export default User;
