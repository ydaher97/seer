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
      throw new ConvexError("unauthorized");
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

    // Get the current message count for this conversation
    const messageCount = await ctx.db
      .query("messages")
      .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
      .collect();

    // If we're at 100 messages, delete the oldest one
    if (messageCount.length >= 100) {
      const oldestMessage = await ctx.db
        .query("messages")
        .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
        .order("asc")
        .first();

      if (oldestMessage) {
        await ctx.db.delete(oldestMessage._id);
      }
    }

    // Insert the new message
    const message = await ctx.db.insert("messages", {
      senderId: currentUser._id,
      ...args,
    });

    // Update the conversation's lastMessageId
    await ctx.db.patch(args.conversationId, { lastMessageId: message });

    return message;
  },
});