import React from 'react'
import {format } from "date-fns"
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getRandomAvatar, getAvatarFallback } from '@/lib/utils/avatar';

type Props = {
    formCurrentUser: boolean;
    senderImage: string;
    senderName: string;
    lastByUser: boolean;
    content: string[];
    createdAt: number;
    seen?: React.ReactNode;
    type: string;
}

const Message = ({
    formCurrentUser,
    senderImage,
    senderName,
    lastByUser,
    content,
    createdAt,
    type,
    seen
}: Props) => {
    const formatTime = (timestamp: number) => {
        return format(timestamp, "HH:mm")
    }
  return (
    <div className={cn("flex item-end", {"justify-end": formCurrentUser})}>
      <div className={cn("flex flex-col w-full mx-2", {"order-1 items-end": formCurrentUser, "order-2 items-start":!formCurrentUser})}>
        <div className={cn("px-4 py-2 rounded-lg max-w-[70%]",{"bg-primary text-primary-foreground":formCurrentUser, "bg-secondary text-secondary-foreground":!formCurrentUser,
            "rounded-br-none": !lastByUser && formCurrentUser,
            "rounded-bl-none":!lastByUser && !formCurrentUser,
        })}>
            {type === "text" ? <p className='text-wrap break-words whitespace-pre-wrap break-all'>{content}</p> :null}
            <p className={cn("text-xs flex w-full my-1", {"text-primary-foreground justify-end": formCurrentUser, "text-secondary-foreground justify-start": !formCurrentUser})}>{formatTime(createdAt)}</p>
        </div>
        {seen}
      </div>
      <Avatar className={cn("relative w-8 h-8", {"order-2":formCurrentUser,
        "order-1":!formCurrentUser,
        "invisible": lastByUser
      })}>
        <AvatarImage src={getRandomAvatar(senderName)}/>
        <AvatarFallback>
            {getAvatarFallback(senderName)}
        </AvatarFallback>
      </Avatar>
    </div>
  )
}

export default Message
