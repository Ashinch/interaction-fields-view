import { Session } from './session'
import { Meeting } from "./meeting"

export class Model {
  static session = new Session()
  static meeting = new Meeting()
}
