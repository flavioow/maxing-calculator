import { caucasianFemaleModel } from "./caucasian-female"
import { caucasianMaleModel } from "./caucasian-male"

export const models = {
  caucasian_male: caucasianMaleModel,
  caucasian_female: caucasianFemaleModel,
}

export type ModelId = keyof typeof models
