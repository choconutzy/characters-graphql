"use client"
import { ICharacter, ILocationResp } from "@/types";
import { useQuery } from "@apollo/client/react";
import gql from "graphql-tag";
import { useParams } from "next/navigation";
import Image from "next/image";

const GET_BY_LOCATION = gql`
  query GetCharacterByLocation($id:ID!){
    location(id:$id) {
      id:id
      name
      type
      dimension
      residents {
        id
        image
        gender
        type
        status
        species
      }
      created
    }
  }
`

export default function Locations(){
  const params = useParams<{ id: string }>()
  const { data, loading, error } = useQuery<ILocationResp>(GET_BY_LOCATION, { 
    variables: { id: params.id },
  });

  return (
    <div>
      {loading && (
        <div>Loading...</div>
      )}
      {error && (
        <div>Terjadi kesalahan</div>
      )}
      <div className="grid">
        <p>{data?.location.name}</p>
        <p>{data?.location.dimension}</p>
        <p>{data?.location.type}</p>
        <div>
          <table>
            <thead>
              <tr>
                <td>
                  Name
                </td>
                <td>
                  Image
                </td>
                <td>
                  Gender
                </td>
                <td>
                  Spesies
                </td>
                <td>
                  Type
                </td>
              </tr>
            </thead>
            <tbody>
            {data?.location.residents?.map((char: ICharacter, idx: number) => {
              return (
                <tr key={idx}>
                  <td>{char.name}</td>
                  <td><Image loading="eager" src={char.image} alt={char.name} width={30} height={50} unoptimized fill/></td>
                  <td>{char.gender}</td>
                  <td>{char.species}</td>
                  <td>{char.type}</td>
                </tr>
              )
            })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}