// import { useState, useEffect } from 'react';
// import { useQuery } from "convex/react";
// import { api } from "@/convex/_generated/api";
// import { useAnonymousUser } from './useAnonymousUser';
// import { useMutatoinState } from "@/hooks/useMutationState";

// export const useLocationGroup = (locationId: string | null) => {
//   const anonymousId = useAnonymousUser();
//   const [isMember, setIsMember] = useState(false);
  
//   // Get group information
//   const group = useQuery(
//     api.groups.getByLocation,
//     locationId ? { locationId } : "skip"
//   );

//   // Get group members
//   const members = useQuery(
//     api.groups.getMembers,
//     locationId ? { locationId } : "skip"
//   );

//   const { mutate: joinGroup } = useMutatoinState(api.groups.join);
//   const { mutate: leaveGroup } = useMutatoinState(api.groups.leave);

//   useEffect(() => {
//     if (members && anonymousId) {
//       setIsMember(members.some(member => member.userId === anonymousId));
//     }
//   }, [members, anonymousId]);

//   const handleJoin = async () => {
//     if (!locationId || !anonymousId) return;
//     try {
//       await joinGroup({ locationId, userId: anonymousId });
//       setIsMember(true);
//     } catch (error) {
//       console.error('Failed to join group:', error);
//     }
//   };

//   const handleLeave = async () => {
//     if (!locationId || !anonymousId) return;
//     try {
//       await leaveGroup({ locationId, userId: anonymousId });
//       setIsMember(false);
//     } catch (error) {
//       console.error('Failed to leave group:', error);
//     }
//   };

//   return {
//     group,
//     members,
//     isMember,
//     joinGroup: handleJoin,
//     leaveGroup: handleLeave,
//   };
// }; 