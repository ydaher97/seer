import { Id } from "@/convex/_generated/dataModel";

export type Location = {
  _id: Id<"locations">;
  _creationTime: number;
  radius?: number;
  name: string;
  coordinates: { lat: number; lng: number };
  border: { lat: number; lng: number }[];
};