export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }
    if (url.pathname !== "/okte" && url.pathname !== "/okte/") {
      return new Response("Not found", { status: 404 });
    }

    const upstream = new URL("https://isot.okte.sk/api/v1/dam/report/daily");
    upstream.search = url.search;

    const upstreamResponse = await fetch(upstream.toString(), {
      method: "GET",
      headers: {
        Accept: "text/csv,application/octet-stream,*/*"
      }
    });

    const headers = new Headers(upstreamResponse.headers);
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type");

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers
    });
  }
};
