import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge } from '@/components/ui';

interface FeaturePlaceholderProps {
  title: string;
  description: string;
  plannedItems: string[];
  action?: { label: string; href: string };
  badge?: string;
}

export function FeaturePlaceholder({
  title,
  description,
  plannedItems,
  action,
  badge,
}: FeaturePlaceholderProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {badge && <Badge variant="secondary">{badge}</Badge>}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            {plannedItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          {action && (
            <Link href={action.href}>
              <Button>{action.label}</Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

