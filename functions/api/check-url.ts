interface EventContext {
  request: Request;
}

type PagesFunction = (context: EventContext) => Promise<Response> | Response;

export const onRequestGet: PagesFunction = async ({ request }) => {
  const target = new URL(request.url).searchParams.get('url');
  if (!target) return new Response('missing url', { status: 400 });

  const t0 = Date.now();
  try {
    const res = await fetch(target, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; IQVerse/1.0; +https://iqverse.net)',
      },
    });

    const contentType = res.headers.get('content-type') || '';
    const isText =
      contentType.includes('text') ||
      contentType.includes('json') ||
      contentType.includes('xml') ||
      contentType.includes('javascript') ||
      contentType.includes('markdown') ||
      !contentType;

    const body = isText ? await res.text() : undefined;

    const headers: Record<string, string> = {};
    res.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });

    return Response.json({
      status: res.status,
      time: Date.now() - t0,
      html: body,
      body,
      headers,
    });
  } catch (e: any) {
    return Response.json({ status: 0, time: Date.now() - t0, error: e.message });
  }
};
