import NotFoundPage from "@/components/ui/page-not-found";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 - Página Não Encontrada | NXTGEN",
  description: "A página que você está procurando não existe ou foi movida.",
};

export default function NotFound() {
  return <NotFoundPage />;
}
