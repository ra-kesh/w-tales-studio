"use client";

// import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/ui/image-upload";
import { ColorPicker } from "@/components/ui/color-picker";

const brandingSchema = z.object({
  logo: z.string().url(),
  watermark: z.string().url(),
  primaryColor: z.string(),
  secondaryColor: z.string(),
  watermarkOpacity: z.number().min(0).max(100),
  watermarkPosition: z.enum(["center", "bottomRight", "bottomLeft"]),
  enableWatermark: z.boolean(),
  enableCustomColors: z.boolean(),
});

export function BrandingSettings() {
  const form = useForm({
    // resolver: zodResolver(brandingSchema),
    defaultValues: {
      logo: "https://studio.com/logo.png",
      watermark: "https://studio.com/watermark.png",
      primaryColor: "#000000",
      secondaryColor: "#ffffff",
      watermarkOpacity: 50,
      watermarkPosition: "bottomRight",
      enableWatermark: true,
      enableCustomColors: true,
    },
  });

  const onSubmit = async (data: z.infer<typeof brandingSchema>) => {
    console.log(data);
    // TODO: Implement update logic
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Logo & Identity</CardTitle>
            <CardDescription>
              Customize your studio's visual identity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="logo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Studio Logo</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value}
                        onChange={field.onChange}
                        accept="image/*"
                        maxSize={5000000}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="watermark"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Watermark Image</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value}
                        onChange={field.onChange}
                        accept="image/*"
                        maxSize={5000000}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Colors & Theme</CardTitle>
            <CardDescription>
              Set your brand colors and theme preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="enableCustomColors"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <FormLabel>Custom Colors</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Enable custom brand colors
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="primaryColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Color</FormLabel>
                    <FormControl>
                      <ColorPicker
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="secondaryColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Secondary Color</FormLabel>
                    <FormControl>
                      <ColorPicker
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Watermark Settings</CardTitle>
            <CardDescription>
              Configure image watermark preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="enableWatermark"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <FormLabel>Enable Watermark</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Automatically add watermark to images
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="watermarkOpacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Watermark Opacity</FormLabel>
                  <FormControl>
                    <Slider
                      value={[field.value]}
                      onValueChange={([value]) => field.onChange(value)}
                      max={100}
                      step={1}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit">Save Branding</Button>
        </div>
      </form>
    </Form>
  );
}
