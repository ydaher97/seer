"use client";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Id } from "@/convex/_generated/dataModel";
import React from "react";
import { Check, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useMutatoinState } from "@/hooks/useMutationState";
import { toast } from "sonner";
import { error } from "console";
import { ConvexError } from "convex/values";

type Props = {
  id: Id<"requests">;
  imageUrl: string;
  username: string;
  email: string;
};

const Request = ({ id, imageUrl, username, email }: Props) => {
  const { mutate: denyRequest, pending: denyPending } = useMutatoinState(
    api.request.deny
  );
  const { mutate: acceptRequest, pending: acceptPending } = useMutatoinState(
    api.request.accept
  );
  return (
    <Card className="w-full p-2 flex flex-row items-center justify-between gap-2">
      <div className="flex items-center gap-4 truncate">
        <Avatar>
          <AvatarImage src={imageUrl} />
          <AvatarFallback>
            <User />
          </AvatarFallback>
        </Avatar>

        <div className="flex felx-col truncate">
          <h4 className="truncate">{username}</h4>

          <p className="text-xs text-muted-foreground truncate">{email}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="icon"
          disabled={denyPending || acceptPending}
          onClick={() => {
            acceptRequest({ id })
              .then(() => toast.success("request accepted successfuly"))
              .catch((error) =>
                toast.error(
                  error instanceof ConvexError
                    ? error.data
                    : "failed to deny request"
                )
              );
          }}
        >
          <Check />
        </Button>
        <Button
          size="icon"
          variant="destructive"
          disabled={denyPending || acceptPending}
          onClick={() => {
            denyRequest({ id })
              .then(() => {
                toast.success("deny successfuly");
              })
              .catch((error) => {
                toast.error(
                  error instanceof ConvexError
                    ? error.data
                    : "failed to deny request"
                );
              });
          }}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};

export default Request;
