import { StatCard } from "../UI";

const stats = [
  { value: "1,240+", label: "Total Auctions" },
  { value: "8,500+", label: "Total Players" },
  { value: "452", label: "Tournaments" },
  { value: "99.9%", label: "Sync Rate" },
];

export default function StatsSection() {
  return (
    <section className="relative z-20 mx-auto -mt-24 grid max-w-[1200px] grid-cols-2 gap-6 px-6 md:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.label} value={stat.value} label={stat.label} />
      ))}
    </section>
  );
}
