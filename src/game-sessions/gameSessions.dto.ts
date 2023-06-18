import {IsMongoId} from "class-validator";
import {validateReqParams, validateReqBody} from "../middlewares/validation";

// GAME_SESSION_ID
class GameSessionIdParamsDto {
  @IsMongoId({message: "Invalid id format"})
  id!: string;
}
const gameSessionIdValidation = validateReqParams(GameSessionIdParamsDto);

// UPDATE_GAME_SESSION
class UpdateGameSessionBodyDto {}
const updateGameSessionValidation = validateReqBody(UpdateGameSessionBodyDto);

export {
  GameSessionIdParamsDto,
  gameSessionIdValidation,
  UpdateGameSessionBodyDto,
  updateGameSessionValidation,
};
