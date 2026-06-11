import Link from "next/link";

export default function HomePage() {
  return (
    <section>
      <h1>Hive Mind admin</h1>
      <p>
        Thin MVP. <Link href="/queries">Review queries and audit records →</Link>
      </p>
    </section>
  );
}
