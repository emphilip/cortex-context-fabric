// Storybook stub for next/navigation. Only the hooks our components actually
// use need to be exported; everything else is a noop.

export function useRouter() {
  return {
    push: () => {},
    replace: () => {},
    refresh: () => {},
    back: () => {},
    forward: () => {},
  };
}

export function usePathname() {
  return "/";
}

export function useSearchParams() {
  return new URLSearchParams();
}

export function notFound(): never {
  throw new Error("notFound() called in Storybook stub");
}
