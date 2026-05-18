import { Button } from '@/components/ui/button';

import {
  Image,
  FileText,
  Table,
} from 'lucide-react';

interface Props {
  onPNG?: () => void;
  onSVG?: () => void;
  onCSV?: () => void;
}

export function ChartExportButtons({
  onPNG,
  onSVG,
  onCSV,
}: Props) {
  return (
    <div className="flex gap-2 flex-wrap">
      {onPNG && (
        <Button
          variant="outline"
          size="sm"
          onClick={onPNG}
        >
          <Image className="h-4 w-4 mr-1" />
          PNG
        </Button>
      )}

      {onSVG && (
        <Button
          variant="outline"
          size="sm"
          onClick={onSVG}
        >
          <FileText className="h-4 w-4 mr-1" />
          SVG
        </Button>
      )}

      {onCSV && (
        <Button
          variant="outline"
          size="sm"
          onClick={onCSV}
        >
          <Table className="h-4 w-4 mr-1" />
          CSV
        </Button>
      )}
    </div>
  );
}