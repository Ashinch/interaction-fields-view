import { Session } from './Session'
import { Meeting } from "./Meeting"

export class Model {
  static session = new Session()
  static meeting = new Meeting()
}
