import { StatCard } from "../../../components/ui";

const stats = [
  { value: "1,240+", label: "Total Auctions" },
  { value: "8,500+", label: "Total Players" },
  { value: "452", label: "Tournaments" },
  { value: "99.9%", label: "Sync Rate" },
];

export default function StatsSection() {
  return (
    <section className="relative z-20 mx-auto -mt-12 grid max-w-[1200px] grid-cols-2 gap-3 px-4 sm:-mt-16 sm:gap-4 sm:px-6 md:-mt-24 md:grid-cols-4 md:gap-6">
      {stats.map((stat) => (
        <StatCard key={stat.label} value={stat.value} label={stat.label} />
      ))}
    </section>
  );
}
