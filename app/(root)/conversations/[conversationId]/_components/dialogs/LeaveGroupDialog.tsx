"use client"
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel'
import { useMutatoinState } from '@/hooks/useMutationState';
import { AlertDialogAction } from '@radix-ui/react-alert-dialog';
import { ConvexError } from 'convex/values';
import { set } from 'date-fns';
import React, { Dispatch, SetStateAction } from 'react'
import { toast } from 'sonner';

type Props  ={
    conversationId: Id<"conversations">
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}
const LeaveGroupDialog = ({conversationId, open, setOpen} : Props) => {
    const {mutate: leaveGroup, pending} = useMutatoinState(api.conversation.leaveGroup);

    const handleLeave = async() => {
        leaveGroup({conversationId}).then(() => {
            toast.success("left group")
        }).catch((error) => {
            toast.error( error instanceof ConvexError ? error.data : "unexpected error")
        })
        setOpen(false)

    }


  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>
                    Are you sure you want to leave?
                </AlertDialogTitle>
                <AlertDialogDescription>
                    this action con not be undone
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel disabled={pending}>
                    Cancel
                </AlertDialogCancel>
                <AlertDialogAction disabled={pending} onClick={handleLeave}>
                    Leave
            </AlertDialogAction>
            </AlertDialogFooter>            
        </AlertDialogContent>
    </AlertDialog>
  )
}

export default LeaveGroupDialog
