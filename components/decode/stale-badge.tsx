"use client";

import { motion } from "motion/react";
import { History } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function StaleBadge() {
    return (
        <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            role="status"
        >
            <Badge variant="warning" dot pulse>
                <History size={11} aria-hidden="true" />
                Results out of date
            </Badge>
        </motion.div>
    );
}