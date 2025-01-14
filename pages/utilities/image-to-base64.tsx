import { useCallback, useState, useRef } from "react";
import { Textarea } from "@/components/ds/TextareaComponent";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ds/CardComponent";
import { Button } from "@/components/ds/ButtonComponent";
import { Label } from "@/components/ds/LabelComponent";
import Header from "@/components/Header";
import { CMDK } from "@/components/CMDK";
import { useCopyToClipboard } from "@/components/hooks/useCopyToClipboard";
import CallToActionGrid from "@/components/CallToActionGrid";
import Meta from "@/components/Meta";
import UploadIcon from "@/components/icons/UploadIcon";
import ImageToBase64SEO from "@/components/seo/ImageToBase64SEO";

const MAX_FILE_SIZE = 4 * 1024 * 1024;
type Status = "idle" | "loading" | "error" | "unsupported" | "hover";

export default function ImageToBase64() {
  const [status, setStatus] = useState<Status>("idle");
  const [base64, setBase64] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isDisabled = base64.length === 0;
  const copyHooks = [
    useCopyToClipboard(),
    useCopyToClipboard(),
    useCopyToClipboard(),
  ];
  const [
    { buttonText: buttonBase64, handleCopy: handleCopyBase64 },
    { buttonText: buttonImgTag, handleCopy: handleCopyImgTag },
    { buttonText: buttonCSS, handleCopy: handleCopyCSS },
  ] = copyHooks;

  const handleSelectFile = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] ?? null;
      validateImageFile(file, event);
    },
    []
  );

  const validateImageFile = (
    file: Blob | null,
    event: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>
  ) => {
    if (!file || !file.type.startsWith("image/")) {
      setStatus("unsupported");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setStatus("error");
      return;
    }

    setStatus("loading");
    const reader = new FileReader();
    reader.onload = () => {
      setBase64(reader.result as string);
      setStatus("idle");
      if (event.target instanceof HTMLInputElement) {
        event.target.value = "";
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    validateImageFile(file, event);
  }, []);

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setStatus("hover");
    },
    []
  );

  const handleDragLeave = useCallback(() => {
    setStatus("idle");
  }, []);

  return (
    <main>
      <Meta
        title="Image to Base64 Converter by Jam.dev | Free, Open Source & Ad-free"
        description="Convert images to Base64 format quickly and easily with Jam's free online image to Base64 converter. Just drag and drop your image and get the Base64 result. That's it."
      />
      <Header />
      <CMDK />

      <section className="container max-w-2xl mb-12">
        <PageHeader
          title="Image to Base64 Converter"
          description="Fast, free, open source, ad-free tools."
        />
      </section>

      <section className="container max-w-2xl mb-6">
        <Card className="flex flex-col p-6 hover:shadow-none shadow-none rounded-xl">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleSelectFile}
            className="flex flex-col cursor-pointer border border-dashed border-border p-6 text-center text-muted-foreground rounded-lg min-h-40 items-center justify-center bg-muted"
          >
            <input
              ref={fileInputRef}
              type="file"
              className="w-full h-full hidden"
              onChange={handleFileInputChange}
            />
            <UploadIcon />
            {statusComponents[status]}
          </div>
          <div></div>
          <div className="pt-8">
            <Label>Base64 Output</Label>
            <Textarea
              value={base64}
              rows={6}
              readOnly
              className="mb-4 overflow-x-hidden"
            />
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => handleCopyBase64(base64)}
                disabled={isDisabled}
              >
                {buttonBase64}
              </Button>
              <Button
                className="ml-2"
                variant="default"
                onClick={() => setBase64("")}
                disabled={isDisabled}
              >
                Clear
              </Button>
            </div>
            <Divider />

            <Label>Use in {"<img>"} tag:</Label>
            <Textarea
              value={truncate(`<img src="${base64}" alt="Base64 Image" />`, 60)}
              rows={1}
              readOnly
              className="min-h-0 mb-4 whitespace-nowrap overflow-hidden"
            />
            <Button
              variant="outline"
              onClick={() => {
                handleCopyImgTag(`<img src="${base64}" alt="Base64 Image" />`);
              }}
              disabled={isDisabled}
            >
              {buttonImgTag}
            </Button>

            <Divider />

            <Label>Use in CSS</Label>
            <Textarea
              value={truncate(`background-image: url(${base64});`, 60)}
              rows={1}
              readOnly
              className="min-h-0 mb-4 whitespace-nowrap overflow-hidden"
            />
            <Button
              variant="outline"
              onClick={() => {
                handleCopyCSS(`background-image: url(${base64});`);
              }}
              disabled={isDisabled}
            >
              {buttonCSS}
            </Button>
          </div>
        </Card>
      </section>

      <CallToActionGrid />

      <section className="container max-w-2xl">
        <ImageToBase64SEO />
      </section>
    </main>
  );
}

const StatusComponent = (props: StatusComponentProps) => (
  <div>
    <p>{props.title}</p>
    <p>{props.message || "\u00A0"}</p>
  </div>
);

const statusComponents: Record<Status, JSX.Element> = {
  idle: (
    <StatusComponent
      title="Drag and drop your image here"
      message="Max size 4MB"
    />
  ),
  loading: <StatusComponent title="Converting..." message="" />,
  error: <StatusComponent title="Image is too big!" message="4MB max" />,
  unsupported: (
    <StatusComponent title="Please provide a valid image" message="" />
  ),
  hover: <StatusComponent title="Drop it like it's hot! 🔥" message="" />,
};

const Divider = () => {
  return <div className="h-[1px] bg-border my-6"></div>;
};

interface StatusComponentProps {
  title: string;
  message: string;
}

const truncate = (input: string, maxLength: number) => {
  if (input.length <= maxLength) {
    return input;
  }

  return input.substring(0, maxLength) + "...";
};
