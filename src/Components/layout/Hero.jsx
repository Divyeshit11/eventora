import Button from "../common/Button";

function Hero() {
  return (
    <section className="flex min-h-[calc(100vh-64px)] items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold">
          Discover Amazing Events
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-lg text-slate-400">
          Find exciting events, book your tickets, and create unforgettable experiences with Eventora.
        </p>

        <div className="mt-8">
          <Button>
            Explore Events
          </Button>
        </div>
      </div>
    </section>
  );
}

export default Hero;