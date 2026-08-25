export interface HttpStatusCodeItem {
  code: number;
  phrase: string;
  category: '1xx' | '2xx' | '3xx' | '4xx' | '5xx';
  spec: string;
  summary: string;
  details: string;
}

export const HTTP_STATUS_CODES: HttpStatusCodeItem[] = [
  // 1xx
  { code: 100, phrase: 'Continue', category: '1xx', spec: 'RFC 9110 §15.2.1', summary: 'Interim response indicating client should continue request or ignore if finished.', details: 'Used with Expect: 100-continue request header.' },
  { code: 101, phrase: 'Switching Protocols', category: '1xx', spec: 'RFC 9110 §15.2.2', summary: 'Server agrees to switch protocols specified in Upgrade header (e.g. WebSocket).', details: 'Sent in response to an Upgrade request header from the client.' },
  { code: 102, phrase: 'Processing', category: '1xx', spec: 'RFC 2518', summary: 'WebDAV server has received and is processing the request but no response is available yet.', details: 'Prevents client from timing out.' },
  { code: 103, phrase: 'Early Hints', category: '1xx', spec: 'RFC 8297', summary: 'Allows server to return response headers before final HTTP message for preload optimization.', details: 'Mainly used for Link header preload hints.' },

  // 2xx
  { code: 200, phrase: 'OK', category: '2xx', spec: 'RFC 9110 §15.3.1', summary: 'Standard successful HTTP response for GET, POST, PUT, DELETE requests.', details: 'The payload contains the requested resource representation.' },
  { code: 201, phrase: 'Created', category: '2xx', spec: 'RFC 9110 §15.3.2', summary: 'Request succeeded and a new resource was created.', details: 'Typically includes a Location header pointing to the new resource.' },
  { code: 202, phrase: 'Accepted', category: '2xx', spec: 'RFC 9110 §15.3.3', summary: 'Request accepted for background asynchronous processing but not yet completed.', details: 'Useful for queue jobs and batch tasks.' },
  { code: 203, phrase: 'Non-Authoritative Information', category: '2xx', spec: 'RFC 9110 §15.3.4', summary: 'Returned meta-information from a transforming proxy rather than the origin server.', details: 'Indicates proxy modified response payload.' },
  { code: 204, phrase: 'No Content', category: '2xx', spec: 'RFC 9110 §15.3.5', summary: 'Request succeeded but response body is intentionally empty.', details: 'Commonly returned after DELETE or preflight OPTIONS requests.' },
  { code: 205, phrase: 'Reset Content', category: '2xx', spec: 'RFC 9110 §15.3.6', summary: 'Tells the client to reset the document view (e.g. clear a form).', details: 'Directs the agent to reset input controls.' },
  { code: 206, phrase: 'Partial Content', category: '2xx', spec: 'RFC 9110 §15.3.7', summary: 'Server is delivering only part of the resource due to a Range header sent by the client.', details: 'Used for media streaming and resumed downloads.' },

  // 3xx
  { code: 300, phrase: 'Multiple Choices', category: '3xx', spec: 'RFC 9110 §15.4.1', summary: 'Indicates multiple options for the resource from which the client may choose.', details: 'Rarely used in practice.' },
  { code: 301, phrase: 'Moved Permanently', category: '3xx', spec: 'RFC 9110 §15.4.2', summary: 'Resource permanently moved to a new URI given in Location header.', details: 'Search engines transfer SEO rank to the target URL.' },
  { code: 302, phrase: 'Found (Temporary Redirect)', category: '3xx', spec: 'RFC 9110 §15.4.3', summary: 'Resource temporarily resides under a different URI.', details: 'Client should keep using the original URI for future requests.' },
  { code: 303, phrase: 'See Other', category: '3xx', spec: 'RFC 9110 §15.4.4', summary: 'Redirects client to a different resource using GET method.', details: 'Common pattern after POST form submissions (PRG pattern).' },
  { code: 304, phrase: 'Not Modified', category: '3xx', spec: 'RFC 9110 §15.4.5', summary: 'Resource unchanged since last fetch based on If-Modified-Since or If-None-Match headers.', details: 'Client should load representation from local browser cache.' },
  { code: 307, phrase: 'Temporary Redirect', category: '3xx', spec: 'RFC 9110 §15.4.8', summary: 'Temporary redirect preserving original HTTP method and body.', details: 'Unlike 302, guarantees POST requests will not be converted to GET.' },
  { code: 308, phrase: 'Permanent Redirect', category: '3xx', spec: 'RFC 9110 §15.4.9', summary: 'Permanent redirect preserving original HTTP method and body.', details: 'Guarantees POST method is preserved during permanent redirection.' },

  // 4xx
  { code: 400, phrase: 'Bad Request', category: '4xx', spec: 'RFC 9110 §15.5.1', summary: 'Server cannot process request due to malformed syntax or invalid payload.', details: 'Client must fix invalid body, parameters or headers before retrying.' },
  { code: 401, phrase: 'Unauthorized', category: '4xx', spec: 'RFC 9110 §15.5.2', summary: 'Authentication is required and has failed or not been provided.', details: 'Response includes WWW-Authenticate header with auth scheme.' },
  { code: 402, phrase: 'Payment Required', category: '4xx', spec: 'RFC 9110 §15.5.3', summary: 'Reserved for digital payment systems.', details: 'Occasionally used by paywalls and commercial APIs.' },
  { code: 403, phrase: 'Forbidden', category: '4xx', spec: 'RFC 9110 §15.5.4', summary: 'Server understands request but refuses to authorize access regardless of credentials.', details: 'Indicates insufficient permissions (e.g. role-based access control).' },
  { code: 404, phrase: 'Not Found', category: '4xx', spec: 'RFC 9110 §15.5.5', summary: 'Target resource does not exist on the server.', details: 'Can be returned to hide confidential resources from unauthorized users.' },
  { code: 405, phrase: 'Method Not Allowed', category: '4xx', spec: 'RFC 9110 §15.5.6', summary: 'HTTP method used is not supported for target resource.', details: 'Response must include Allow header specifying valid methods.' },
  { code: 408, phrase: 'Request Timeout', category: '4xx', spec: 'RFC 9110 §15.5.9', summary: 'Server closed connection because client took too long to send full request.', details: 'Client may repeat request at a later time.' },
  { code: 409, phrase: 'Conflict', category: '4xx', spec: 'RFC 9110 §15.5.10', summary: 'Request conflicts with current state of server resource (e.g. duplicate key).', details: 'Common in version control conflicts or unique constraint violations.' },
  { code: 418, phrase: "I'm a teapot", category: '4xx', spec: 'RFC 2324 §2.3.2', summary: 'Hyper Text Coffee Pot Control Protocol easter egg status code.', details: 'Defined in April Fools RFC 2324.' },
  { code: 422, phrase: 'Unprocessable Entity', category: '4xx', spec: 'RFC 9110 §15.5.21', summary: 'Server understands content type and syntax but cannot process semantic instructions.', details: 'Standard status code for API validation errors.' },
  { code: 429, phrase: 'Too Many Requests', category: '4xx', spec: 'RFC 6585 §4', summary: 'User sent too many requests in a given time window (Rate Limited).', details: 'Response often includes Retry-After header indicating wait duration.' },

  // 5xx
  { code: 500, phrase: 'Internal Server Error', category: '5xx', spec: 'RFC 9110 §15.6.1', summary: 'Server encountered an unexpected condition that prevented request completion.', details: 'Generic error code indicating unhandled server-side exceptions.' },
  { code: 501, phrase: 'Not Implemented', category: '5xx', spec: 'RFC 9110 §15.6.2', summary: 'Server does not support the functionality required to fulfill request.', details: 'Appropriate when server does not recognize request method.' },
  { code: 502, phrase: 'Bad Gateway', category: '5xx', spec: 'RFC 9110 §15.6.3', summary: 'Server acting as gateway/proxy received invalid response from upstream server.', details: 'Common with reverse proxies like Nginx or Cloudflare when backend fails.' },
  { code: 503, phrase: 'Service Unavailable', category: '5xx', spec: 'RFC 9110 §15.6.4', summary: 'Server temporarily unable to handle request due to overload or maintenance.', details: 'Includes optional Retry-After header indicating backoff estimate.' },
  { code: 504, phrase: 'Gateway Timeout', category: '5xx', spec: 'RFC 9110 §15.6.5', summary: 'Server acting as gateway did not receive timely response from upstream server.', details: 'Occurs when backend application takes longer to execute than proxy timeout.' },
];

export function filterHttpStatusCodes(
  arg1?: HttpStatusCodeItem[] | string,
  arg2?: string,
  arg3?: string
): HttpStatusCodeItem[] {
  let list = HTTP_STATUS_CODES;
  let category = 'all';
  let query = '';

  if (Array.isArray(arg1)) {
    list = arg1;
    category = arg2 || 'all';
    query = arg3 || '';
  } else {
    category = arg1 || 'all';
    query = arg2 || '';
  }

  const lq = query.toLowerCase().trim();

  return list.filter((item) => {
    const matchCat = category.toLowerCase() === 'all' || item.category.toLowerCase() === category.toLowerCase();
    const matchQuery =
      !lq ||
      item.code.toString().includes(lq) ||
      item.phrase.toLowerCase().includes(lq) ||
      item.summary.toLowerCase().includes(lq) ||
      item.details.toLowerCase().includes(lq);
    return matchCat && matchQuery;
  });
}
