import { useState } from "react";
import { Icon, FilterButton, FilterButtonGroup, TournamentCard } from "../../../components/ui";

const filters = [
  { id: "all", label: "전체 보기" },
  { id: "recruiting", label: "모집중" },
  { id: "in-progress", label: "진행중" },
  { id: "my", label: "나의 참여" },
];

const tournaments = [
  {
    id: 1,
    title: "제 3회 사내 롤 대회",
    host: "페이커",
    status: "recruiting",
    icon: "esports",
    current: 12,
    total: 20,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCRoNyXEVKxe-O_O8Z8mxSOZzKuAzBzVj26mgxgQ7p0_J6p7yVia9MEqBw3_B0VAehDG6U9ufDvAKTV2fR63JEpXR9Z5WP_IIe1zdeX0Mq6k1O_AZ4EEWGNl8KCCUA_NiaD6pX1caZCAxTzuWLsG5RUl7jjQli0sU2OSqB0kS4ESAGgj8GtZEUriZXKlFfOQpIQmSRI1kOrFQ6HD77jYvFoc6bmEjhhNoVRMD_kECsBm4FrBoh9Py3a3EPQmTdmXsJU2OsyTRvVQwY",
  },
  {
    id: 2,
    title: "주말 랭크 내전",
    host: "쵸비",
    status: "in-progress",
    icon: "trophy",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDgv6uQcDhA23asNHKoZT1AbxN1VTlS2fFAcrxOBBstCccbU1IgqLP-CriVCzK79_b2CIvYFBaAJplS1vkGala9E-dYOogfFeHEOugTOJ87PmfvXVsyOGnuaIEMZ1OGSsQBEjt37LcVI7l618k_UXkOk6POKcyPAzBVIKXOq7bGGtPi89UwRr5RCzzza26ve0We5pxLFoy702fRdYgnXoKwHXcb6bFBggTZbE1SVGHfA4cnOBLyJz7wVon_VK20MlJQUO7M23Uoi8s",
  },
  {
    id: 3,
    title: "브실골 탈출 프로젝트",
    host: "앰비션",
    status: "recruiting",
    icon: "swords",
    current: 8,
    total: 10,
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDpRFdQG7jlWYmxEkLVs3gHLQ7KXFaOLQ_aCieOjLeFwoyB8bqQJ6W34sO6DQWtoyj7E9fpe9hq-VDfo6fygBiiW0JMwjx0OaW7OS4FuyN6cqRwstMTeM5m-BSlCUJnaW8hWEYuOX3rN-KcOoQXwuS4ctiI4EoocErceDMlajw5hyRBbVn-G8NQxQ8O7WpisQF4djVTP2OxVJ2JnUrrI-1uzvb3pVrxsmbSdxC3TpIVlnJOcuLh74ty9glFLFHbPMlpxBhYqOBGnGs",
  },
  {
    id: 4,
    title: "직장인 퇴근 컵",
    host: "클라우드템플러",
    status: "scheduled",
    icon: "calendar",
    startsIn: "02:30:00",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBypkmEeEtjuBf_DPc3X9gPTBo-qujZI_HWNZw_snuQXsVjmOu3ixXkJAjw1IWKNYUs0aODo4Ar50tjNFExu5lkiH5Q4YkBQ8YJ458vLoGDDwi36aDbp0q-Qqns6EbFgl2-D7IQMhj9eM1RgpRYe2WpoQGG_fVNR7ZGnFNR8IvAL60v6keX3GcEjvTvKUHVRv84uVAU7gzfY9vuJ7t1vQkyL6CcqwTlpfG1c4J6Uf4r0MF5lHsRk0RlisJhwY15SqLCNXJlyUDZHdw",
  },
];

export default function TournamentSection() {
  const [activeFilter, setActiveFilter] = useState("all");

  const handleJoin = (id) => {
    console.log("Join tournament:", id);
  };

  const handleSpectate = (id) => {
    console.log("Spectate tournament:", id);
  };

  const handleNotify = (id) => {
    console.log("Notify for tournament:", id);
  };

  return (
    <section className="mt-16 px-4 sm:mt-24 sm:px-6 md:mt-32">
      {/* 헤더 */}
      <div className="mb-6 flex flex-col justify-between gap-4 border-b border-primary/20 pb-6 sm:mb-10 sm:gap-6 sm:pb-8 md:flex-row md:items-end">
        <div className="space-y-2 sm:space-y-3">
          <h2 className="flex items-center gap-3 text-2xl font-black text-white sm:gap-4 sm:text-4xl">
            <Icon name="stadium" className="text-2xl text-primary sm:text-4xl" />
            진행 중인 대회
          </h2>
          <p className="text-sm text-slate-400 sm:text-lg">
            지금 바로 참여 가능한 전략 경매 방을 확인하세요.
          </p>
        </div>
        <FilterButtonGroup>
          {filters.map((filter) => (
            <FilterButton
              key={filter.id}
              active={activeFilter === filter.id}
              onClick={() => setActiveFilter(filter.id)}
            >
              {filter.label}
            </FilterButton>
          ))}
        </FilterButtonGroup>
      </div>

      {/* 카드 그리드 */}
      <div className="grid grid-cols-1 gap-4 pb-6 sm:grid-cols-2 sm:gap-6 sm:pb-10 lg:grid-cols-4 lg:gap-8">
        {tournaments.map((tournament) => (
          <TournamentCard
            key={tournament.id}
            title={tournament.title}
            host={tournament.host}
            imageUrl={tournament.imageUrl}
            status={tournament.status}
            icon={tournament.icon}
            current={tournament.current}
            total={tournament.total}
            startsIn={tournament.startsIn}
            onJoin={() => handleJoin(tournament.id)}
            onSpectate={() => handleSpectate(tournament.id)}
            onNotify={() => handleNotify(tournament.id)}
          />
        ))}
      </div>
    </section>
  );
}
