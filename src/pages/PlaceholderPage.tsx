import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Construction } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export default function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold tracking-tight mb-1">{title}</h1>
      {description && (
        <p className="text-muted-foreground mb-6">{description}</p>
      )}
      <Card className="border-dashed">
        <CardHeader className="text-center pb-2">
          <Construction className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
          <CardTitle className="text-lg text-muted-foreground">Em Construção</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          Este módulo será implementado nos próximos plans.
        </CardContent>
      </Card>
    </div>
  );
}
