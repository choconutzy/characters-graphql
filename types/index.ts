interface ILocation {
    id: number;
    name: string;
    type: string;
    dimension?: string;
    created: string;
    residents?: ICharacter[]
}
interface ICharacter {
  id: number
  name: string
  status: string
  species: string
  type: string
  gender: 'Female' | 'Male' | 'Genderless' | 'unknown'
  image: string
  created: string
  origin: ILocation
  location: ILocation
}

interface IInfo {
  count: number
  pages: number
  next: number
  prev?: number
}

interface ICharactersResp {
  info: IInfo
  results: ICharacter[]
}

interface ICharResp {
  characters: ICharactersResp
}

interface ICharacterResp {
  character: ICharacter
}
interface ILocationResp {
  location: ILocation
}
export type {
  ICharResp,
  ICharactersResp,
  ICharacterResp,
  IInfo,
  ICharacter,
  ILocation,
  ILocationResp
}