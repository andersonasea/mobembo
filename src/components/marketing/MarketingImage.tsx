import Image from "next/image";
import { cn } from "@/lib/utils";

type MarketingImageProps = {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
};

export function MarketingImage({
  src,
  alt,
  className,
  imageClassName,
  priority = false,
}: MarketingImageProps) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(max-width: 768px) 100vw, 50vw"
        className={cn("object-cover", imageClassName)}
      />
    </div>
  );
}
