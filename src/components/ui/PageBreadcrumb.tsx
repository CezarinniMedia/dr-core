import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export interface BreadcrumbItemDef {
  label: string;
  href?: string;
  icon?: LucideIcon;
}

interface PageBreadcrumbProps {
  items: BreadcrumbItemDef[];
}

export function PageBreadcrumb({ items }: PageBreadcrumbProps) {
  if (items.length <= 1) return null;

  const parentItem = items[items.length - 2];

  return (
    <>
      {/* Mobile: compact "< Voltar para [Pai]" */}
      <div className="md:hidden">
        {parentItem.href ? (
          <Link
            to={parentItem.href}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Voltar para {parentItem.label}
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
            <ChevronLeft className="h-4 w-4" />
            {parentItem.label}
          </span>
        )}
      </div>

      {/* Desktop: full breadcrumb trail */}
      <Breadcrumb className="hidden md:block">
        <BreadcrumbList>
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            const Icon = item.icon;

            return (
              <span key={item.label} className="contents">
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage className="inline-flex items-center gap-1.5">
                      {Icon && <Icon className="h-3.5 w-3.5" />}
                      {item.label}
                    </BreadcrumbPage>
                  ) : item.href ? (
                    <BreadcrumbLink asChild>
                      <Link to={item.href} className="inline-flex items-center gap-1.5">
                        {Icon && <Icon className="h-3.5 w-3.5" />}
                        {item.label}
                      </Link>
                    </BreadcrumbLink>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                      {Icon && <Icon className="h-3.5 w-3.5" />}
                      {item.label}
                    </span>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator />}
              </span>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </>
  );
}
