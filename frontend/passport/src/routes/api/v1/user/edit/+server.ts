import { type RequestHandler } from "@sveltejs/kit"
import { GrpcClient } from "@makoto/grpc"
import { Routes } from "$lib/utils/typed-fetch"

export const POST: RequestHandler = async ({ request, cookies }) => {
  const [req, create_response] = await Routes["user/edit"].get_request_with_response_creator(request)

  await GrpcClient.editUser({
    languages: [],
    userId: req.userId,
    pseudonym: req.pseudonym,
    picture: req.picture,
    bio: req.bio,
    birthday: req.birthday,
    location: req.location,
  })

  return create_response({}, { status: 200 })
}
