import { Persona } from "./Persona";
import { DefaultPersona } from "./DefaultPersona";

export class PersonaManager {

    current(): Persona {

        return DefaultPersona;

    }

}