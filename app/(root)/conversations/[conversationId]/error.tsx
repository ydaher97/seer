"use client";

import ConversationFallback from "@/components/shared/conversation/ConversationFallback";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Error({ error }: { error: Error }) {
    const router = useRouter();

    useEffect(() => {
        router.push("/conversatoins");
    },[error, router]);

    return <ConversationFallback/>
}