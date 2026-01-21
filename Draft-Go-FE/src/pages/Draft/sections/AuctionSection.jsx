import AuctionStage from "../components/AuctionStage";
import BidButton from "../components/BidButton";
import PlayerQueue from "../components/PlayerQueue";

export default function AuctionSection({
  player,
  currentBid,
  timeLeft,
  bidIncrement,
  onBid,
  queue,
  passedQueue,
}) {
  const nextBid = currentBid + bidIncrement;

  return (
    <section className="relative flex flex-1 flex-col overflow-hidden bg-background-dark p-6">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(200,155,60,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(200,155,60,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="z-10 mb-8 flex min-h-0 flex-1 flex-col items-center justify-center">
        <AuctionStage player={player} currentBid={currentBid} timeLeft={timeLeft} />
        <BidButton increment={bidIncrement} nextBid={nextBid} onBid={onBid} />
      </div>

      <PlayerQueue queue={queue} passedQueue={passedQueue} />
    </section>
  );
}
