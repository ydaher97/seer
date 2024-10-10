"use client"

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { api } from '@/convex/_generated/api'
import { useMutatoinState } from '@/hooks/useMutationState'
import { zodResolver } from '@hookform/resolvers/zod'
import {  useQuery } from 'convex/react'
import { ConvexError } from 'convex/values'
import { CirclePlus, X } from 'lucide-react'
import React, { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

type Props = {

}


const createGroupFormSchema = z.object({
    name: z.string().min(1, { message: "this field cant be empty" }),
    members: z.string().array().min(1, { message: "this field cant be empty" }),
})

const CreateGroupDialog = ({}: Props) => {
    const friends = useQuery(api.friends.get)

    const {mutate: createGroup , pending} = useMutatoinState(api.conversation.createQroup)

    const form = useForm<z.infer<typeof createGroupFormSchema>>({
        resolver: zodResolver(createGroupFormSchema),
        defaultValues: {
            name: "",
            members: [],
        },
    })

    const members = form.watch("members", [])

    const unselectedFriends = useMemo(() => {
        return friends ? friends.filter((friend) => !members.includes(friend._id)) : []
    }, [members.length , friends?.length])


    const handleSubmit = async (values: z.infer<typeof createGroupFormSchema>) => {
        await createGroup({
            name: values.name,
            members: values.members
        }).then(() => {
            form.reset()
            toast.success("group created")
        }).catch((error) => {
            toast.error(error instanceof ConvexError ? error.data : "unexpected error")
        })
    }
    
  return (
    <Dialog>
        <Tooltip>
            <TooltipTrigger>
                <Button size="icon" variant="outline">
                    <DialogTrigger asChild>
                        <CirclePlus/>
                    </DialogTrigger>
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                <p>Create Group</p>
            </TooltipContent>
        </Tooltip>

        <DialogContent className='block'>
            <DialogHeader>
                <DialogTitle>
                    Create Group
                    </DialogTitle>
                    <DialogDescription>
                        add your friends to get started
                    </DialogDescription>
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-8'>
                <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    name
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Group Name"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage/>

                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="members"
                        render={() => (
                            <FormItem>
                                <FormLabel>
                                    Friends
                                </FormLabel>
                                <FormControl>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild disabled={unselectedFriends.length === 0}>
                                            <Button className='w-full' variant="outline"> 
                                                select
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            {unselectedFriends.map((friend) => (
                                                <DropdownMenuCheckboxItem
                                                    key={friend._id}
                                                    className='flex items-center gap-2 w-full p-2'
                                                    onCheckedChange={
                                                       checked => {
                                                           if(checked) {
                                                               form.setValue("members", [...members, friend._id])
                                                           }
                                                       }
                                                   }
                                                >
                                                    <Avatar className='w-8 h-8'>
                                                        <AvatarImage src={friend.imageUrl} />
                                                        <AvatarFallback>
                                                            {friend.username.substring(0, 1)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <h4 className='truncate'>
                                                        {friend.username}
                                                    </h4>
                                                </DropdownMenuCheckboxItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    {
                        members.length > 0 && members ?
                        <Card className='flex items-center gap-3 overflow-x-auto w-full h-24 p-2 no-scrollbar'>
                            {friends?.filter((friend) => members.includes(friend._id)).map(friend => {
                                return (
                                    <div key={friend._id} className='flex flex-col gap-1 items-center'>
                                        <div className='relative'>
                                            <Avatar className='w-12 h-12'>
                                                <AvatarImage src={friend.imageUrl} />
                                                <AvatarFallback>
                                                    {friend.username.substring(0, 1)}                                    </AvatarFallback>
                                            </Avatar>
                                            <X  className='text-muted-foreground w-4 h-4 absolute bottom-8 left-7 bg-muted rounded-full cursor-pointer'
                                            onClick={() => form.setValue("members", members.filter((id) => id !== friend._id))}/>
                                        </div>
                                        <p className='truncate text-sm'>
                                            {friend.username.split(" ")[0]}
                                        </p>
                                    </div>
                                )
                            })}
                        </Card>
                        : null
                    }
                    <DialogFooter>
                    <Button
                        type="submit"
                        disabled={pending}
                        >
                        Create
                    </Button>
                    </DialogFooter>
                    
                </form>
            </Form>
        </DialogContent>
    </Dialog>
  )
}

export default CreateGroupDialog
