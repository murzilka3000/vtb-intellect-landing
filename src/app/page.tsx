import About from "@/components/About/About";
import Final from "@/components/Final/Final";
import Hero from "@/components/Hero/Hero";
import Quiz from "@/components/Quiz/Quiz";
import Strategies from "@/components/Strategies/Strategies";

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <About />
        <Strategies />
        <Quiz />
      </main>
      <Final />
    </>
  );
}
