export default function SkeletonCard() {
  return (
    <div className="bg-[#1f1f1f] animate-pulse">
      <div className="aspect-[3/4] bg-[#2a2a2a]" />
      <div className="p-3 space-y-2">
        <div className="h-2 bg-[#2a2a2a] w-1/2 mx-auto" />
        <div className="h-3 bg-[#2a2a2a] w-3/4 mx-auto" />
        <div className="h-4 bg-[#2a2a2a] w-1/3 mx-auto" />
      </div>
    </div>
  );
}
