import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  href: string;
  size?: 'sm' | 'md' | 'lg';
  badge?: string;
  className?: string;
}

const sizeMap = {
  sm: { container: 'h-6 w-6', text: 'text-base' },
  md: { container: 'h-8 w-8', text: 'text-lg' },
  lg: { container: 'h-10 w-10', text: 'text-2xl' },
};

export function Logo({ href, size = 'md', badge, className }: LogoProps) {
  const sizes = sizeMap[size];

  return (
    <Link href={href} className={cn('flex items-center gap-2', className)}>
      <div className={cn('relative', sizes.container)}>
        <Image
          src="/logo.png"
          alt="CChatbot Logo"
          fill
          sizes={`${size === 'sm' ? '24px' : size === 'md' ? '32px' : '40px'}`}
          className="object-contain"
          priority={size === 'lg'}
        />
      </div>
      <div className="flex items-baseline gap-1">
        <span className={cn('font-bold text-primary', sizes.text)}>CChat</span>
        <span className={cn('font-bold text-gray-600', sizes.text)}>bot</span>
        {badge && (
          <span className="ml-2 text-sm text-muted-foreground">{badge}</span>
        )}
      </div>
    </Link>
  );
}

