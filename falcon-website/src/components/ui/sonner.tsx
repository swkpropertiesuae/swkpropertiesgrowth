import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = (props: ToasterProps) => (
  <Sonner
    theme="dark"
    position="bottom-right"
    toastOptions={{
      classNames: {
        toast: "!rounded-2xl !border-white/12 !bg-popover !text-foreground !shadow-2xl !font-sans",
        description: "!text-muted-foreground",
      },
    }}
    {...props}
  />
);

export { Toaster };
