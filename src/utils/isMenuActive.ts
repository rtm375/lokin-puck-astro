export function isActive(currentPath: string, target: string) {
  return currentPath === target || currentPath.startsWith(target + "/");
}