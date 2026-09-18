import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Star } from "lucide-react";

const gadgets = [
  { name: "Razer Finger Sleeve", price: 290, img: "https://res.cloudinary.com/nooboss/image/upload/v1765274518/gamerz-prime/H9e727539111a480fa431c864cf0841ef2_73dcc59043.jpg", rating: 5, stock: true },
  { name: "Damile X11 RGB Magnetic Phone Cooler", price: 1800, img: "https://res.cloudinary.com/nooboss/image/upload/v1762790996/gamerz-prime/Product_Image_1_51b6fbe0ec.png", rating: 5, stock: false },
  { name: "Gaming Triggers Pro", price: 450, img: "https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=600", rating: 4.8, stock: true },
  { name: "RGB Mechanical Keyboard", price: 3200, img: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600", rating: 4.9, stock: true },
  { name: "Pro Gaming Mouse", price: 1450, img: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=600", rating: 4.7, stock: true },
  { name: "Wireless Gaming Headset", price: 2750, img: "https://images.unsplash.com/photo-1599669454699-248893623440?w=600", rating: 5, stock: true },
];

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "Gaming Gadgets — SKz Lab" },
      { name: "description", content: "Premium gaming accessories: phone coolers, finger sleeves, triggers, keyboards and more." },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="text-center">
          <h1 className="font-display text-4xl md:text-5xl font-black">Gaming <span className="text-gradient-primary">Gadgets</span></h1>
          <p className="mt-2 text-sm font-semibold uppercase tracking-[0.2em] text-primary">Check & Get Your Desired Product</p>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {gadgets.map((g) => (
            <div key={g.name} className="group overflow-hidden rounded-2xl border border-border bg-card hover:border-primary transition">
              <div className="relative aspect-square overflow-hidden bg-surface">
                <img src={g.img} alt={g.name} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
                {!g.stock && (
                  <span className="absolute top-3 left-3 rounded-full bg-destructive px-3 py-1 text-[10px] font-bold text-destructive-foreground">OUT OF STOCK</span>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-sm font-bold leading-snug line-clamp-2 min-h-[2.5rem]">{g.name}</h3>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-display text-lg font-black text-primary">৳{g.price.toLocaleString()}</span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="h-3.5 w-3.5 fill-primary text-primary" /> {g.rating}/5
                  </span>
                </div>
                <button
                  disabled={!g.stock}
                  className="mt-3 w-full rounded-lg bg-gradient-primary py-2 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  {g.stock ? "View Details" : "Out of Stock"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
