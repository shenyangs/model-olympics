export const nodeRange = '^22.12.0 || ^24.0.0 || >=26.0.0';
export function supportedNode(version) {
  const [major,minor] = version.split('.').map(Number);
  return (major === 22 && minor >= 12) || major === 24 || major >= 26;
}
