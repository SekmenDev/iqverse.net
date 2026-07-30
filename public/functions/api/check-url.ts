interface EventContext {
  request: Request;
}

type PagesFunction = (context: EventContext) => Promise<Response> | Response;

export const onRequestGet: PagesFunction = async ({ request }) => {
  const target = new URL(request.url).searchParams.get('url');
  if (!target) return new Response('missing url', { status: 400 });

  const t0 = Date.now();
  try {
    const res = await fetch(target, { method: 'GET', redirect: 'follow' });
    return Response.json({ status: res.status, time: Date.now() - t0 });
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    return Response.json({ status: 0, time: Date.now() - t0, error: errorMessage });
  }
};