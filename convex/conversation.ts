import { mutation, query } from "./_generated/server";
import { ConvexError, convexToJson, v } from "convex/values";
import { getUserByClerkId } from "./_utils";

export const get = query({
  args: {
    id: v.id("conversations"),
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

    const conversation = await ctx.db.get(args.id);

    if (!conversation) {
      throw new ConvexError("there are no conversation");
    }

    const membership = await ctx.db
      .query("conversationMembers")
      .withIndex("by_memberId_conversationId", (q) =>
        q.eq("memberId", currentUser._id).eq("conversationId", conversation._id)
      )
      .unique();

    if (!membership) {
      throw new ConvexError("you arent member of this conversation");
    }

    const allConversationMemberships = await ctx.db
      .query("conversationMembers")
      .withIndex("by_conversationId", (q) => q.eq("conversationId", args.id))
      .collect();

    if (!conversation.isGroup) {
      const otherMembership = allConversationMemberships.filter(
        (membership) => membership.memberId !== currentUser._id
      )[0];

      const otherMembershipDetailes = await ctx.db.get(
        otherMembership.memberId
      );

      return {
        ...conversation,
        otherMember: {
          ...otherMembershipDetailes,
          lastSeenMessageId: otherMembership.lastSeenMessage,
        },
        otherMembers: null,
      };
    }else{
      const otherMembers = (await Promise.all(
        allConversationMemberships.filter(
          (membership) => membership.memberId !== currentUser._id
        ).map(async (membership) => {
          const member = await ctx.db.get(membership.memberId);
  
          if (!member) {
            throw new ConvexError("member not found");
          }
  
          return{
            _id: member._id,
            username: member.username};
  
        })
      ))

      return {
        ...conversation,
        otherMembers,
        otherMember: null,
      }
    }
  },
});


export const createQroup = mutation({
  args: {
    members: v.array(v.id("users")),
    name: v.string(),
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


    const conversationId = await ctx.db.insert("conversations", {
      isGroup: true,
      name: args.name,
    });


    await Promise.all(
      [...args.members, currentUser._id].map(async (memberId) => {
          await ctx.db.insert("conversationMembers", {
            conversationId,
            memberId,
          })
      })
    );
}
}
)


export const removeGroup = mutation({
  args: {
    conversationId: v.id("conversations"),
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

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new ConvexError("conversation not found");
    }

    const memberships = await ctx.db
      .query("conversationMembers")
      .withIndex("by_conversationId", (q) =>
        q
          .eq("conversationId", args.conversationId)
      )
      .collect();

      if (!memberships || memberships.length <= 1) {
        throw new ConvexError("you are not part of this conversation");
      }

      

      const messages = await ctx.db
        .query("messages")
        .withIndex("by_conversationId", (q) =>
          q
            .eq("conversationId", args.conversationId)
        )
        .collect();

        await ctx.db.delete(args.conversationId);

        await Promise.all(memberships.map(async (membership) => {
          await ctx.db.delete(membership._id);
        }))

        await Promise.all(messages.map(async (message) => {
            await ctx.db.delete(message._id);
          }))

}
});


export const leaveGroup = mutation({
  args: {
    conversationId: v.id("conversations"),
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

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new ConvexError("conversation not found");
    }

    const membership = await ctx.db
      .query("conversationMembers")
      .withIndex("by_memberId_conversationId", (q) =>
        q
          .eq("memberId", currentUser._id).eq("conversationId", args.conversationId)
      )
      .unique();

      if (!membership ) {
        throw new ConvexError("you are not part of this conversation");
      }

      
      await ctx.db.delete(membership._id);
}
});


export const markRead = mutation({
  args: {
    conversationId: v.id("conversations"),
    messageId: v.id("messages"),
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
          .eq("memberId", currentUser._id).eq("conversationId", args.conversationId)
      )
      .unique();

      if (!membership ) {
        throw new ConvexError("you are not part of this conversation");
      }

      const lastMessage = await ctx.db.get(args.messageId);

      await ctx.db.patch(membership._id, {
        lastSeenMessage: lastMessage ? 
          lastMessage._id
          : undefined
      })
}
});


