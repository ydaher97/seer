import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    username: v.string(),
    imageUrl: v.string(),
    clerkId: v.string(),
    email: v.string(),
  })
    .index("by_email", ["email"])
    .index("by_clerkId", ["clerkId"]),
  requests: defineTable({
    sender: v.id("users"),
    receiver: v.id("users"),
  })
    .index("by_receiver", ["receiver"])
    .index("by_receiver_sender", ["receiver", "sender"]),
  friends: defineTable({
    user1: v.id("users"),
    user2: v.id("users"),
    conversationId: v.id("conversations"),
  })
    .index("by_user1", ["user1"])
    .index("by_user2", ["user2"])
    .index("by_conversationId", ["conversationId"]),
  conversations: defineTable({
    name: v.optional(v.string()),
    isGroup: v.optional(v.boolean()),
    lastMessageId: v.optional(v.id("messages")),
  }),
  conversationMembers: defineTable({
    memberId: v.id("users"),
    conversationId: v.id("conversations"),
    lastSeenMessage: v.optional(v.id("messages")),
  })
    .index("by_memberId", ["memberId"])
    .index("by_conversationId", ["conversationId"])
    .index("by_memberId_conversationId", ["memberId", "conversationId"]),
  messages: defineTable({
    senderId: v.id("users"),
    conversationId: v.id("conversations"),
    type: v.string(),
    content: v.array(v.string()),
  }).index("by_conversationId", ["conversationId"]),
  locations: defineTable({
    name: v.string(), 
    coordinates: v.object({ lat: v.float64(), lng: v.float64() }), 
     border: v.array(
    v.object({ lat: v.float64(), lng: v.float64() }) 
  ),
    radius: v.optional(v.float64()),
  }).index("by_coordinates", ["coordinates"]),
  regionConversations: defineTable({
    regionId: v.id("locations"),
    conversationId: v.id("conversations"),
  }).index("by_regionId", ["regionId"]).index("by_conversationId", ["conversationId"]),
  userLocations: defineTable({
    userId: v.id("users"),
    coordinates: v.object({ lat: v.float64(), lng: v.float64() }), 
    lastUpdated: v.number(),
  }).index("by_userId", ["userId"]),
    
});
