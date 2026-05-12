export function QueueStatus({ tokenNumber = 1, status = "Pending" }) {
  return (
    <div className="rounded-2xl border border-violetSoft/25 bg-violet/10 px-4 py-3 text-sm">
      <span className="font-bold text-white">Token #{tokenNumber}</span>
      <span className="ml-2 text-slateText">Queue status: {status}</span>
    </div>
  );
}
