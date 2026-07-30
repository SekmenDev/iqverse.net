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
    const contentType = res.headers.get('content-type') || '';
    const isHtml = contentType.includes('text/html');

    // Only read the body for HTML pages — skip it for images/scripts/etc,
    // both to save bandwidth and because you don't need the body for those.
    const html = isHtml ? await res.text() : undefined;

    return Response.json({
      status: res.status,
      time: Date.now() - t0,
      html,
    });
  } catch (e: any) {
    return Response.json({ status: 0, time: Date.now() - t0, error: e.message });
  }
};
