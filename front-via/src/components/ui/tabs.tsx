"use client"

import * as React from "react"
import { Tabs as TabsPrimitive } from "radix-ui"
import { cn } from "@/lib/utils"

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn(
        "w-full",
        className
      )}
      {...props}
    />
  )
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        `
        inline-flex
        flex-wrap
        items-center
        gap-2

        rounded-xl
        border
        border-border

        bg-muted/30

        p-2
        `,
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        `
        inline-flex
        items-center
        justify-center

        rounded-lg

        px-4
        py-2

        text-sm
        font-medium

        text-muted-foreground

        transition-all
        duration-200

        hover:bg-background
        hover:text-foreground

        data-[state=active]:bg-background
        data-[state=active]:text-foreground
        data-[state=active]:shadow-sm

        focus-visible:outline-none

        disabled:pointer-events-none
        disabled:opacity-50
        `,
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn(
        "mt-5 w-full outline-none",
        className
      )}
      {...props}
    />
  )
}

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
}