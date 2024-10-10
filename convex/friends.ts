import { mutation, MutationCtx, query, QueryCtx } from "./_generated/server";
import { ConvexError, convexToJson, v } from "convex/values";
import { getUserByClerkId } from "./_utils";
import { Id } from "./_generated/dataModel";

export const get = query({
  args: {},
  handler: async (ctx, args) => {
    const id = await ctx.auth.getUserIdentity();
    if (!id) {
      throw new ConvexError("unauthrized");
    }

    const currentUser = await getUserByClerkId({ ctx, clerkId: id.subject });

    if (!currentUser) {
      throw new ConvexError("user not found");
    }

    const friendships1 = await ctx.db
      .query("friends")
      .withIndex("by_user1",    (q) =>
            q
          .eq("user1", currentUser._id)
        ).collect()

        const friendships2 = await ctx.db
      .query("friends")
      .withIndex("by_user2",    (q) =>
            q
          .eq("user2", currentUser._id)
        ).collect()
        

        const friendships = [...friendships1, ...friendships2]

        const friends = await Promise.all(
          friendships.map(async (friendship) => {
            const friend = await ctx.db.get(friendship.user1 === currentUser._id ? friendship.user2 : friendship.user1)
            
            if (!friend) {
              throw new ConvexError("friend not found");
            }
            return friend
          })
        )

        return friends
    },
  },
);


