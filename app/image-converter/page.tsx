import type { Metadata } from 'next';
import ToolLayout from '@/components/layout/ToolLayout';
import ImageFormatConverter from '@/components/tools/ImageFormatConverter';
import { getToolMetadata } from '@/lib/tools';

export const metadata: Metadata = getToolMetadata('image-converter') || {
  title: 'Image Format Converter | IQVerse',
  description: 'Convert PNG, JPEG, WebP and AVIF formats with canvas scaling and quality controls.',
};

export default function ImageFormatConverterPage() {
  return (
    <ToolLayout
      pill="DESIGN"
      title="Image Format Converter"
      subtitle="In-Browser Image Converter"
      description="Convert images between PNG, JPEG and WebP formats locally using browser-native Canvas API."
    >
      <ImageFormatConverter />
    </ToolLayout>
  );
}
