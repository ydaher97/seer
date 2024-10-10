"use client";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import React from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useMutatoinState } from "@/hooks/useMutationState";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { ConvexError } from "convex/values";

const addFriendFormSchema = z.object({
  email: z
    .string()
    .min(1, { message: "this field cant be empty" })
    .email("please enter a vaild email"),
});

const AddFriendDialog = () => {
  const { mutate: createRequest, pending } = useMutatoinState(
    api.request.create
  );

  const form = useForm<z.infer<typeof addFriendFormSchema>>({
    resolver: zodResolver(addFriendFormSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof addFriendFormSchema>) => {
    await createRequest({
      email: values.email,
    })
      .then(() => {
        form.reset();
        toast.success("friend request sent");
      })
      .catch((error) => {
        toast.error(
          error instanceof ConvexError ? error.data : "unexpected error"
        );
      });
  };
  return (
    <Dialog>
      <Tooltip>
        <TooltipTrigger>
          <Button size="icon" variant="outline">
            <DialogTrigger>
              <UserPlus />
            </DialogTrigger>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>add friend</p>
        </TooltipContent>
      </Tooltip>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>add friend</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-8"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>enter an email</FormLabel>
                  <FormControl>
                    <Input placeholder="email.." {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button disabled={pending} type="submit">
                send
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddFriendDialog;
