import { getMapKey } from '@/lib/map-config';
export async function GET() {
  // MapTiler browser keys are public and must be domain-restricted in the provider dashboard.
  return Response.json({key:getMapKey()},{headers:{'Cache-Control':'no-store'}});
}
