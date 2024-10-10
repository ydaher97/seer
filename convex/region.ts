import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// export const getRegion = query({
//     args: {
//       lat: v.float64(),
//       lng: v.float64(),
//     },
//     handler: async (ctx, args) => {
//       const regions = await ctx.db.query("locations").collect();
  
//       const region = regions.find(region => {
//         const distance = calculateDistance(args.lat, args.lng, region.coordinates.lat, region.coordinates.lng);
//         return distance <= region.radius;
//       });
  
//       return region || null;
//     },
//   });

//   export const getOrCreateRegionConversation = mutation({
//     args: {
//       regionId: v.id("locations"),
//     },
//     handler: async (ctx, args) => {
//       const conversation = await ctx.db
//         .query("regionConversations")
//         .withIndex("by_regionId", (q) => q.eq("regionId", args.regionId))
//         .first();
  
//       if (conversation) {
//         return conversation;
//       }
  
//       const newConversation = await ctx.db.insert("conversations", {
//         name: null,
//         isQroup: true,
//         lastMessageId: null,
//       });
  
//       await ctx.db.insert("regionConversations", {
//         regionId: args.regionId,
//         conversationId: newConversation._id,
//       });
  
//       return newConversation;
//     },
//   });
  