import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
} from "~/server/api/trpc";

//protectedProcedure를 활용해서 읽고 쓰는 기능 구현 
export const topicRouter = createTRPCRouter({
    getAll: protectedProcedure.query(({ ctx }) => {
        return ctx.prisma.topic.findMany({
            where: {
                userId: ctx.session.user.id,
            },
        });
    }),

    create: protectedProcedure.input(z.object({ title: z.string() })).mutation(({ ctx, input }) => {
        return ctx.prisma.topic.create({
            data: {
                title: input.title,
                userId: ctx.session.user.id,
            },
        });
    }),

    // **update-01 토픽 삭제 
    delete: protectedProcedure.input(z.object({ id: z.string()})).mutation(async ({ ctx, input }) => {
        return ctx.prisma.topic.delete({
            where: {
                id: input.id,
            },
        });
    }),
});