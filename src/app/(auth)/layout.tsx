import { Particles } from "@/components/magicui/particles";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-[#0a0a0a]">
      {/* Background Particles */}
      <Particles
        className="absolute inset-0"
        quantity={30}
        staticity={50}
        ease={50}
        color="#a855f7"
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
