import { mutation, query } from "./_generated/server";
import { ConvexError, convexToJson, v } from "convex/values";
import { getUserByClerkId } from "./_utils";

export const create = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.auth.getUserIdentity();
    if (!id) {
      throw new ConvexError("unauthrized");
    }
    if (args.email === id.email) {
      throw new ConvexError("cant send req to yourself");
    }
    const currentUser = await getUserByClerkId({ ctx, clerkId: id.subject });

    if (!currentUser) {
      throw new ConvexError("user not found");
    }

    const receiver = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (!receiver) {
      throw new ConvexError("user is not found");
    }

    const requestAlreadySent = await ctx.db
      .query("requests")
      .withIndex("by_receiver_sender", (q) =>
        q.eq("receiver", receiver._id).eq("sender", currentUser._id)
      )
      .unique();

    if (requestAlreadySent) {
      throw new ConvexError("Request already sent");
    }

    const requestAlreadyReceived = await ctx.db
      .query("requests")
      .withIndex("by_receiver_sender", (q) =>
        q.eq("receiver", currentUser._id).eq("sender", receiver._id)
      )
      .unique();

    if (requestAlreadyReceived) {
      throw new ConvexError("this user already send you a request");
    }

    const friends1 = await ctx.db
      .query("friends")
      .withIndex("by_user1", (q) => q.eq("user1", currentUser._id))
      .collect();

    const friends2 = await ctx.db
      .query("friends")
      .withIndex("by_user2", (q) => q.eq("user2", currentUser._id))
      .collect();

    if (
      friends1.some((friend) => friend.user2 === receiver._id) ||
      friends2.some((friend) => friend.user1 === receiver._id)
    ) {
      throw new ConvexError("you already friends");
    }

    const request = await ctx.db.insert("requests", {
      sender: currentUser._id,
      receiver: receiver._id,
    });
    return request;
  },
});

export const deny = mutation({
  args: {
    id: v.id("requests"),
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

    const request = await ctx.db.get(args.id);

    if (!request || request.receiver !== currentUser._id) {
      throw new ConvexError("tere are no such request");
    }

    await ctx.db.delete(request._id);
  },
});

export const accept = mutation({
  args: {
    id: v.id("requests"),
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

    const request = await ctx.db.get(args.id);

    if (!request || request.receiver !== currentUser._id) {
      throw new ConvexError("tere are no such request");
    }

    const conversationId = await ctx.db.insert("conversations", {
      isGroup: false,
    });

    await ctx.db.insert("friends", {
      user1: currentUser._id,
      user2: request.sender,
      conversationId: conversationId,
    });

    await ctx.db.insert("conversationMembers", {
      memberId: currentUser._id,
      conversationId,
    });

    await ctx.db.insert("conversationMembers", {
      memberId: request.sender,
      conversationId,
    });

    await ctx.db.delete(request._id);
  },
});
