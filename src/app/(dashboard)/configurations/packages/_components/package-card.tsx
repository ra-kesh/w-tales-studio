import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash } from "lucide-react";

interface PackageCardProps {
  data: any; // Replace with proper type
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export function PackageCard({ data, onEdit, onDelete }: PackageCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{data.value}</CardTitle>
            <CardDescription>{data.key}</CardDescription>
          </div>
          {data.isSystem && (
            <Badge variant="secondary">System Package</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Duration</p>
            <p>{data.metadata.shootDuration} {data.metadata.durationUnit}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Delivery</p>
            <p>{data.metadata.deliveryTimeframe} {data.metadata.timeframeUnit}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Max Outfits</p>
            <p>{data.metadata.maxOutfits}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Max Locations</p>
            <p>{data.metadata.maxLocations}</p>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Deliverables</p>
          <ul className="space-y-1">
            {data.metadata.defaultDeliverables.map((deliverable: any, index: number) => (
              <li key={index} className="text-sm flex justify-between">
                <span>{deliverable.title}</span>
                <span>{deliverable.quantity}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(data.id)}
        >
          <Trash className="h-4 w-4 mr-2" />
          Delete
        </Button>
        <Button
          size="sm"
          onClick={() => onEdit(data.id)}
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </CardFooter>
    </Card>
  );
}