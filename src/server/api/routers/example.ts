import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const exampleRouter = createTRPCRouter({
	//인증없이 호출 가능한 publicProcedure 
  hello: publicProcedure 
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
				//인사말 출력 
        greeting: `Hello ${input.text}`,
      };
    }),
	
	//인증없이 호출 가능한 publicProcedure를 플라즈마와 연결하는 절차의 예 
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.example.findMany();
  }),

	//메시지 호출 권한에 따라 호출 가능한 protectedProcedure( 로그인한 회원)
  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});