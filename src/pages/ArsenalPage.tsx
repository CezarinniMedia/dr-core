import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Input } from "@/shared/components/ui/input";
import { Crosshair, Fingerprint, Key, SearchIcon } from "lucide-react";
import { DorksTab } from "@/features/arsenal/components/DorksTab";
import { FootprintsTab } from "@/features/arsenal/components/FootprintsTab";
import { KeywordsTab } from "@/features/arsenal/components/KeywordsTab";

export default function ArsenalPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Crosshair className="h-6 w-6" /> Arsenal
          </h1>
          <p className="text-muted-foreground text-sm">
            Footprints, dorks e keywords para mineração de ofertas
          </p>
        </div>
        <div className="relative max-w-xs w-full">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar no arsenal..."
            className="pl-9"
          />
        </div>
      </div>

      <Tabs defaultValue="dorks">
        <TabsList>
          <TabsTrigger value="dorks" className="flex items-center gap-1.5">
            <SearchIcon className="h-4 w-4" /> Dorks
          </TabsTrigger>
          <TabsTrigger value="footprints" className="flex items-center gap-1.5">
            <Fingerprint className="h-4 w-4" /> Footprints
          </TabsTrigger>
          <TabsTrigger value="keywords" className="flex items-center gap-1.5">
            <Key className="h-4 w-4" /> Keywords
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dorks" className="mt-4">
          <DorksTab search={search} />
        </TabsContent>
        <TabsContent value="footprints" className="mt-4">
          <FootprintsTab search={search} />
        </TabsContent>
        <TabsContent value="keywords" className="mt-4">
          <KeywordsTab search={search} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
