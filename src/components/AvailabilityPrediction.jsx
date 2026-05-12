import { Sparkles } from "lucide-react";

export function AvailabilityPrediction({ faculty }) {
  const hour = 12 + (faculty.id % 5);
  const confidence = faculty.status === "Available" ? "High" : faculty.status === "Busy" ? "Medium" : "Low";
  return (
    <div className="rounded-2xl border border-cyan/20 bg-cyan/10 p-3 text-sm text-slateText">
      <div className="flex items-center gap-2 font-semibold text-cyan"><Sparkles className="h-4 w-4" />Availability Prediction</div>
      <p className="mt-2">Likely available after {hour}:30 PM · {confidence} confidence</p>
    </div>
  );
}
