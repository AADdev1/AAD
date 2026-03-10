import { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

export const metadata: Metadata = {
  title:
    "Hot Wheels Display Stands for Collectors in India | AllAboutDiecast",
  description:
    "Discover creative ways to display Hot Wheels and 1:64 diecast cars. Explore collector display stands, ramp displays and pegboard setups.",
}

export default function Page() {
  return (
    <main className="bg-white text-black">

      {/* HERO SECTION */}
      <section className="max-w-6xl mx-auto px-6 py-20">

        <h1 className="text-5xl font-bold mb-6">
          Display Your Hot Wheels Collection
        </h1>

        <p className="text-lg text-gray-700 max-w-3xl">
          Every diecast collector eventually faces the same challenge —
          where and how to display their collection. From small desk
          displays to full collector walls, the right display stand can
          transform a pile of cars into a showcase worth admiring.
        </p>

      </section>

      {/* LARGE FEATURE IMAGE */}
      <section className="max-w-6xl mx-auto px-6 pb-16">

        <div className="relative w-full h-[500px] rounded-lg overflow-hidden">
          <Image
            src="/pegmount-display-stand-2.jpg"
            alt="Hot wheels diecast display setup"
            fill
            className="object-cover"
          />
        </div>

      </section>

      {/* STORY SECTION */}
      <section className="max-w-4xl mx-auto px-6 py-16">

        <h2 className="text-3xl font-bold mb-6">
          A Display Made for Collectors
        </h2>

        <p className="text-gray-700 mb-4">
          Hot Wheels and Matchbox cars are more than toys for many
          collectors. Each car represents a piece of design history,
          motorsport inspiration, or childhood nostalgia.
        </p>

        <p className="text-gray-700">
          Dedicated display stands allow collectors to highlight
          individual models, organize large collections, and create
          visually satisfying displays for desks, shelves or walls.
        </p>

      </section>

      {/* PRODUCT INSPIRATION */}
      <section className="bg-gray-100 py-20">

        <div className="max-w-6xl mx-auto px-6">

          <h2 className="text-3xl font-bold mb-12">
            Display Ideas for 1:64 Diecast Cars
          </h2>

          <div className="grid md:grid-cols-3 gap-12">

            <Link href="/products/minicard-display-stand">

              <div className="space-y-4">

                <div className="relative h-[260px]">
                  <Image
                    src="/minicard-display-stand-1.jpg"
                    alt="Hot wheels blister card display stand"
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>

                <h3 className="text-xl font-semibold">
                  Card Display Stands
                </h3>

                <p className="text-gray-600">
                  Perfect for collectors who keep Hot Wheels
                  in their original blister packaging.
                </p>

              </div>

            </Link>

            <Link href="/products/rallystage-display-base">

              <div className="space-y-4">

                <div className="relative h-[260px]">
                  <Image
                    src="/rallystage-display-base-1.jpg"
                    alt="Hot wheels rally display stand"
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>

                <h3 className="text-xl font-semibold">
                  Rally Style Displays
                </h3>

                <p className="text-gray-600">
                  Showcase loose diecast cars with a racing
                  inspired display base.
                </p>

              </div>

            </Link>

            <Link href="/products/pegmount-display-stand">

              <div className="space-y-4">

                <div className="relative h-[260px]">
                  <Image
                    src="/pegmount-display-stand-1.jpg"
                    alt="Hot wheels pegboard display stand"
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>

                <h3 className="text-xl font-semibold">
                  Pegboard Wall Displays
                </h3>

                <p className="text-gray-600">
                  Turn a wall into a full Hot Wheels
                  collector gallery.
                </p>

              </div>

            </Link>

          </div>

        </div>

      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-6 py-20">

        <h2 className="text-3xl font-bold mb-8">
          Frequently Asked Questions
        </h2>

        <div className="space-y-6">

          <div>
            <h3 className="font-semibold">
              What scale are Hot Wheels cars?
            </h3>
            <p className="text-gray-600">
              Most Hot Wheels cars are produced in 1:64 scale,
              making them compatible with most diecast display stands.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">
              How do collectors display Hot Wheels cars?
            </h3>
            <p className="text-gray-600">
              Collectors typically use display stands, wall pegboards,
              or shelf setups designed specifically for 1:64 models.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">
              Where can I buy Hot Wheels display stands in India?
            </h3>
            <p className="text-gray-600">
              AllAboutDiecast designs display stands specifically
              for diecast collectors.
            </p>
          </div>

        </div>

      </section>

    </main>
  )
}