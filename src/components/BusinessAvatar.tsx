const COLORS = [
  "bg-blue-100 text-blue-600",
  "bg-violet-100 text-violet-600",
  "bg-emerald-100 text-emerald-600",
  "bg-orange-100 text-orange-600",
  "bg-rose-100 text-rose-600",
  "bg-cyan-100 text-cyan-600",
  "bg-amber-100 text-amber-600",
  "bg-indigo-100 text-indigo-600",
];

function getColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

export default function BusinessAvatar({
  name,
  image,
  size = "md",
}: {
  name: string;
  image?: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass = size === "sm" ? "w-10 h-10 text-sm rounded-xl" : size === "lg" ? "w-16 h-16 text-xl rounded-2xl" : "w-12 h-12 text-base rounded-xl";

  if (image) {
    return <img src={image} alt={name} className={`${sizeClass} object-cover border border-slate-100 shrink-0`} />;
  }

  const initial = name.charAt(0);
  const color = getColor(name);

  return (
    <div className={`${sizeClass} ${color} flex items-center justify-center shrink-0 font-bold`}>
      {initial}
    </div>
  );
}