import PublicFooter from "@/components/public/footer";

export default function ModelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <PublicFooter />
    </>
  );
}
