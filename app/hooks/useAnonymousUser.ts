// import { useState, useEffect } from 'react';
// import { useMutatoinState } from "@/hooks/useMutationState";
// import { api } from "@/convex/_generated/api";

// export const useAnonymousUser = () => {
//   const [anonymousId, setAnonymousId] = useState<string | null>(null);
//   const { mutate: createAnonymousUser } = useMutatoinState(api.users.createAnonymous);

//   useEffect(() => {
//     const getOrCreateAnonymousId = async () => {
//       // Check localStorage for existing anonymous ID
//       const storedId = localStorage.getItem('anonymousId');
      
//       if (storedId) {
//         setAnonymousId(storedId);
//         return;
//       }

//       // Create new anonymous user
//       try {
//         const newUser = await createAnonymousUser();
//         const newId = newUser._id;
//         localStorage.setItem('anonymousId', newId);
//         setAnonymousId(newId);
//       } catch (error) {
//         console.error('Failed to create anonymous user:', error);
//       }
//     };

//     getOrCreateAnonymousId();
//   }, [createAnonymousUser]);

//   return anonymousId;
// }; 