import { Session } from './session'
import { Meeting } from "./meeting"
import { Judge } from "./judge"

export class Model {
  static session = new Session()
  static meeting = new Meeting()
  static judge = new Judge()
}
