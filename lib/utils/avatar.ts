import { AvatarFallback } from "@/components/ui/avatar";

export const getRandomAvatar = (seed: string) => {
  // Using DiceBear API for random avatars
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
};

export const getAvatarFallback = (name: string) => {
  return name.substring(0, 1).toUpperCase();
}; 