import { Heart } from "lucide-react";
import { Button } from "./ui/Button";

export function FavoriteButton({ active, onClick, compact = false }) {
  return (
    <Button onClick={onClick} variant={active ? "primary" : "secondary"} className={compact ? "px-3 py-2" : ""}>
      <Heart className={`h-4 w-4 ${active ? "fill-current" : ""}`} />
      {active ? "Favorited" : "Favorite"}
    </Button>
  );
}
