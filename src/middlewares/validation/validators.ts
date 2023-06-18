import {IsMongoId} from "class-validator";
import {validateReqParams} from ".";

// PARAMS_IS_MONGO_ID
class ParamIsMongoIdDto {
  @IsMongoId({message: "Invalid id format"})
  id!: string;
}
const paramIsMongoIdValidation = validateReqParams(ParamIsMongoIdDto);

export {ParamIsMongoIdDto, paramIsMongoIdValidation};
