import { mutation, query } from "./_generated/server";
import { ConvexError, convexToJson, v } from "convex/values";
import { getUserByClerkId } from "./_utils";

export const create = mutation({
  args: {
    conversationId: v.id("conversations"),
    type: v.string(),
    content: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.auth.getUserIdentity();
    if (!id) {
      throw new ConvexError("unauthrized");
    }

    const currentUser = await getUserByClerkId({ ctx, clerkId: id.subject });

    if (!currentUser) {
      throw new ConvexError("user not found");
    }

    const membership = await ctx.db
      .query("conversationMembers")
      .withIndex("by_memberId_conversationId", (q) =>
        q
          .eq("memberId", currentUser._id)
          .eq("conversationId", args.conversationId)
      )
      .unique();

    if (!membership) {
      throw new ConvexError("you are not part of this conversation");
    }

    const message = await ctx.db.insert("messages", {
      senderId: currentUser._id,
      ...args,
    });

    await ctx.db.patch(args.conversationId, { lastMessageId: message });

    return message;
  },
});
