import { z } from 'zod';
import { publicProcedure } from '../../middlewares/public';

export const google = publicProcedure.input(z.object({
  client_id: z.string(),
  credential: z.string()
})).mutation(async ({ input, ctx }) => {

  console.log("Google Sign-In Credential:", ctx.getCookie("auth_token"));
  // if (input.client_id !== ctx.env.CLIENT_ID) {
  //   throw new TRPCError({
  //     code: "BAD_REQUEST",
  //     message: "Invalid client ID"
  //   })
  // }

  ctx.setCookie("auth_token", "Hello World", {
    httpOnly: true,
    secure: false,
  })

})