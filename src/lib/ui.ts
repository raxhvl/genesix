import { usePathname } from "next/navigation";
/**
 * Checks if the current page is the root page ("/")
 *
 * Used by components to conditionally render content based on whether
 * the current route is the homepage/root path.
 *
 * @returns {boolean} True if current path is "/", false otherwise
 */

export function isRootPage(): boolean {
  return usePathname() === "/";
}
