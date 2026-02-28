import CreateTokenForm from "@/components/create/CreateTokenForm";

export const metadata = {
  title: "Create Token — QuickPump",
};

export default function CreatePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <CreateTokenForm />
    </div>
  );
}
