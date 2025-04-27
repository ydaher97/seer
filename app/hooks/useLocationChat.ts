// import { useState, useEffect } from 'react';
// import { useQuery} from "convex/react";
// import { api } from "@/convex/_generated/api";
// import { useAnonymousUser } from './useAnonymousUser';
// import { useMutatoinState } from "@/hooks/useMutationState";

// export const useLocationChat = (locationId: string | null) => {
//   const anonymousId = useAnonymousUser();
//   const [message, setMessage] = useState('');
  
//   // Get messages for the location
//   const messages = useQuery(
//     api.messages.getByLocation,
//     locationId ? { locationId } : "skip"
//   );

//   const { mutate: sendMessage } = useMutatoinState(api.messages.send);

//   const handleSendMessage = async () => {
//     if (!locationId || !anonymousId || !message.trim()) return;
    
//     try {
//       await sendMessage({
//         locationId,
//         userId: anonymousId,
//         content: message.trim(),
//       });
//       setMessage('');
//     } catch (error) {
//       console.error('Failed to send message:', error);
//     }
//   };

//   return {
//     messages,
//     message,
//     setMessage,
//     sendMessage: handleSendMessage,
//   };
// }; 