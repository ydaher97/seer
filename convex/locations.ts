import { v, ConvexError } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUserByClerkId } from "./_utils";

export const getLocations = query({
  args: {},
  handler: async (ctx) => {
    const id = await ctx.auth.getUserIdentity();
      if (!id) {
        throw new ConvexError("unauthorized");
      }
  
      const currentUser = await getUserByClerkId({ ctx, clerkId: id.subject });
  
      if (!currentUser) {
        throw new ConvexError("user not found");
      }
  
    const locations = await ctx.db.query("locations").collect();
    return locations;
  },
});

export const createLocationGroup = mutation({
    args: {
      locationId: v.id("locations"),
      name: v.string(),
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
  
      // Check if a conversation for this location already exists
      const existingConversation = await ctx.db
        .query("regionConversations")
        .withIndex("by_regionId", (q) => q.eq("regionId", args.locationId))
        .first();
  
      if (existingConversation) {
        return existingConversation
      }
  
      // Create a new group conversation for the location
      const conversationId = await ctx.db.insert("conversations", {
        isGroup: true,
        name: args.name,
        
      });

      const conversation = await ctx.db.insert("regionConversations", {
        regionId: args.locationId,
        conversationId,
      });
  
      // Add members to the conversation
      // await Promise.all(
      //   [...args.members, currentUser._id].map(async (memberId) => {
      //     await ctx.db.insert("conversationMembers", {
      //       conversationId,
      //       memberId,
      //     });
      //   })
      // );
  
      return conversationId; // Return the ID of the newly created conversation
    },
  });


  export const getConversationByLocationId = query({
    args: {
      locationId: v.id("locations"),
    },
    handler: async (ctx, args) => {
      const regionconversation = await ctx.db
        .query("regionConversations")
        .withIndex("by_regionId", (q) => q.eq("regionId", args.locationId))
        .first();

      if (!regionconversation) {
        throw new ConvexError("Conversation not found for this location.");
      }

      const conversation = await ctx.db
        .query("conversations")
        .withIndex("by_id", (q) => q.eq("_id", regionconversation.conversationId))
        .unique();

      return conversation;
    },
  });



export const updateLocation = mutation({
  args: {
    coordinates: v.object({
      lat: v.float64(),
      lng: v.float64(),
    }),
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

      if (
        args.coordinates.lat < -90 ||
        args.coordinates.lat > 90 ||
        args.coordinates.lng < -180 ||
        args.coordinates.lng > 180
      ) {
        throw new ConvexError("Invalid coordinates");
      }
  
    const userLocation = await ctx.db
      .query("userLocations")
      .withIndex("by_userId", (q) => q.eq("userId", currentUser._id))
      .first();


    if (userLocation) {
      await ctx.db.patch(userLocation._id, {
        coordinates: args.coordinates,
        lastUpdated: Date.now(),
      });
    } else {
      await ctx.db.insert("userLocations", {
        userId: currentUser._id,
        coordinates: args.coordinates,
        lastUpdated: Date.now(),
      });
    }
  },
});


export const updateConversationMembers = mutation({
  args: {
    conversationId: v.id("conversations"),
    locationId: v.id("locations"),
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

    // Get the region conversation for the current location
    const regionConversation = await ctx.db
      .query("regionConversations")
      .withIndex("by_regionId", (q) => q.eq("regionId", args.locationId))
      .first();

    if (!regionConversation) {
      throw new ConvexError("No conversation found for this location");
    }

    // Check if the user is already a member of the correct conversation
    const existingMembership = await ctx.db
      .query("conversationMembers")
      .withIndex("by_memberId_conversationId", (q) =>
        q.eq("memberId", currentUser._id).eq("conversationId", regionConversation.conversationId)
      )
      .first();

    if (existingMembership) {
      // User is already in the correct conversation
      return ctx.db.get(regionConversation.conversationId);
    }

    // Remove user from other group conversations
    const userGroupMemberships = await ctx.db
      .query("conversationMembers")
      .withIndex("by_memberId", (q) => q.eq("memberId", currentUser._id))
      .collect();

    for (const membership of userGroupMemberships) {
      const conversation = await ctx.db.get(membership.conversationId);
      if (conversation?.isGroup) {
        await ctx.db.delete(membership._id);
      }
    }

    // Add user to the new location-based conversation
    await ctx.db.insert("conversationMembers", {
      memberId: currentUser._id,
      conversationId: regionConversation.conversationId,
    });

    return ctx.db.get(regionConversation.conversationId);
  },
});

// export const updateConversationMembers = mutation({
//   args: {
//     conversationId: v.id("conversations"),
//     locationId: v.id("locations"),
//   },
//   handler: async (ctx, args) => {
//     const id = await ctx.auth.getUserIdentity();
//     if (!id) {
//       throw new ConvexError("unauthorized");
//     }

//     const currentUser = await getUserByClerkId({ ctx, clerkId: id.subject });

//     if (!currentUser) {
//       throw new ConvexError("user not found");
//     }

//     // Check if the user is already a member of the conversation
//     const conversationMemberExists = await ctx.db
//       .query("conversationMembers")
//       .withIndex("by_memberId_conversationId", (q) =>
//         q.eq("memberId", currentUser._id).eq("conversationId", args.conversationId)
//       )
//       .first();

//     if (!conversationMemberExists) {
//       throw new ConvexError("Conversation member record not found.");
//     }

//     // Fetch the region conversation related to the conversation ID
//     const regionConversation = await ctx.db
//       .query("regionConversations")
//       .withIndex("by_conversationId", (q) =>
//         q.eq("conversationId", args.conversationId)
//       )
//       .first();

//     // If the region conversation's regionId matches the passed locationId, update the conversation member
//     if (regionConversation?.regionId === args.locationId) {
//       // Update the existing conversation member record
//       return await ctx.db.patch(conversationMemberExists._id, {
//         conversationId: regionConversation?.conversationId, // Update to the new conversation if needed
//       });
//     }

//     // If the region conversation does not match the location, return the current conversation
//     return ctx.db.get(args.conversationId);
//   },
// });
