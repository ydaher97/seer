import { AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Avatar } from "@radix-ui/react-avatar";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { CircleArrowLeft, Settings } from "lucide-react";
import Link from "next/link";
import React from "react";
import { getRandomAvatar, getAvatarFallback } from "@/lib/utils/avatar";

type Props = {
  imageUrl?: string;
  name: string;
  options?: {
    label: string;
    destructive: boolean;
    onClick: () => void;
  }[]
};

const Header = ({ imageUrl, name ,options}: Props) => {
  return (
    <Card className="w-full flex rounded-lg items-center p-2 justify-between">
      <div className="flex items-center gap-2">
        <Link href="/conversations" className="block lg:hidden">
          <CircleArrowLeft />
        </Link>
        <Avatar className="h-8 w-8">
          <AvatarImage src={getRandomAvatar(name)} />
          <AvatarFallback>{getAvatarFallback(name)}</AvatarFallback>
        </Avatar>
        <h2 className="font-semibold">{name}</h2>
      </div>
      {/* <div className="flex gap-2">
        {options ? 
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button size="icon" variant="secondary">
              <Settings />
            </Button>
            <DropdownMenuContent>
              {options.map((option,id) => (
                <DropdownMenuItem
                  key={id}
                  onClick={option.onClick}
                  className={cn("font-semibold",
                     {"text-destructive" : option.destructive}
                    )}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenuTrigger>
        </DropdownMenu> : null}
      </div> */}
    </Card>
  );
};

export default Header;
